import hmac
import json
import logging
import os
import time
import uuid

from flask import Flask, jsonify, request
from werkzeug.exceptions import RequestEntityTooLarge

from app.config import MAX_IMAGE_BYTES, MODEL_DISPLAY_NAME, REQUIRE_SERVICE_TOKEN, SERVICE_TOKEN, WARMUP
from app.contract import SCHEMA_VERSION
from app.image_validation import decode_image
from app.model_runtime import florence_runtime
from app.observation_builder import build_observations
from app.quality import assess_image_quality

logging.basicConfig(level=os.getenv("LOG_LEVEL", "INFO"), format="%(message)s")
LOGGER = logging.getLogger("urban_pulse.florence")

app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = MAX_IMAGE_BYTES + 128_000


def log_event(event, **details):
    LOGGER.info(json.dumps({"event": event, **details}, sort_keys=True, default=str))


def authenticated():
    if not REQUIRE_SERVICE_TOKEN:
        return True
    supplied = request.headers.get("X-Urban-Pulse-Vision-Token", "")
    try:
        return bool(
            SERVICE_TOKEN
            and supplied
            and hmac.compare_digest(supplied.encode("utf-8"), SERVICE_TOKEN.encode("utf-8"))
        )
    except (UnicodeEncodeError, TypeError):
        return False


@app.after_request
def security_headers(response):
    response.headers["Cache-Control"] = "no-store"
    response.headers["X-Content-Type-Options"] = "nosniff"
    return response


@app.errorhandler(RequestEntityTooLarge)
def payload_too_large(_error):
    return jsonify({"status": "invalid_image", "reason": "Image exceeds the upload limit."}), 413


@app.get("/health")
def health():
    return jsonify({"status": "ok", "service": "urban-pulse-florence", "modelRuntime": florence_runtime.status_payload()})


@app.get("/ready")
def ready():
    runtime = florence_runtime.status_payload()
    return jsonify({"status": "ready" if runtime["ready"] else "loading", "modelRuntime": runtime}), 200 if runtime["ready"] else 503


@app.post("/v1/analyze")
def analyze():
    request_id = request.headers.get("X-Request-ID") or request.form.get("requestId") or uuid.uuid4().hex
    request_id = "".join(character for character in request_id if character.isalnum() or character in "-_")[:64]
    if not authenticated():
        log_event("request_rejected", requestId=request_id, reason="authentication")
        return jsonify({"status": "unauthorized", "reason": "Service authentication failed.", "requestId": request_id}), 401

    uploaded = request.files.get("image")
    if uploaded is None:
        return jsonify({"status": "invalid_image", "reason": "Multipart image field is required.", "requestId": request_id}), 400
    payload = uploaded.read(MAX_IMAGE_BYTES + 1)
    if len(payload) > MAX_IMAGE_BYTES:
        return jsonify({"status": "invalid_image", "reason": "Image exceeds the upload limit.", "requestId": request_id}), 413

    image = None
    started = time.monotonic()
    try:
        image = decode_image(payload)
        quality = assess_image_quality(image)
        caption, inference_ms = florence_runtime.analyze(image)
        observations = build_observations(caption, quality)
        result = {
            "schemaVersion": SCHEMA_VERSION,
            "status": "available",
            "provider": "florence-cloud-run",
            "model": MODEL_DISPLAY_NAME,
            "description": observations["sceneDescription"],
            "structuredObservations": observations,
            "inferenceMs": inference_ms,
            "reason": "",
            "requestId": request_id,
        }
        log_event(
            "analysis_succeeded",
            requestId=request_id,
            durationMs=int((time.monotonic() - started) * 1000),
            issueCount=len(observations["visibleCivicIssues"]),
            reviewRecommended=observations["humanReviewRecommended"],
        )
        return jsonify(result)
    except ValueError as error:
        log_event("analysis_rejected", requestId=request_id, errorType=type(error).__name__)
        return jsonify({"status": "invalid_image", "reason": str(error), "requestId": request_id}), 400
    except Exception as error:
        log_event("analysis_failed", requestId=request_id, errorType=type(error).__name__)
        LOGGER.exception("Visual analysis failed")
        return jsonify({"status": "unavailable", "reason": "Visual analysis is temporarily unavailable.", "requestId": request_id}), 503
    finally:
        if image is not None:
            image.close()
        del payload


def warm_model():
    try:
        florence_runtime.load()
    except Exception:
        pass


if REQUIRE_SERVICE_TOKEN and not SERVICE_TOKEN:
    LOGGER.warning("FLORENCE_SERVICE_TOKEN is missing; protected analysis requests will be rejected")
if WARMUP:
    # Preload synchronously so a worker never advertises readiness while its
    # model is still loading.
    warm_model()
