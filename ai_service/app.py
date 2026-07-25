import hmac
import json
import logging
import os
import time
import uuid

from flask import Flask, g, jsonify, request
from flask_cors import CORS
from werkzeug.exceptions import HTTPException

from category_catalog import COMPLAINT_CATEGORIES
from chat_logic import classify_chat_intent
from model_runtime import runtime_status
from florence_runtime import florence_runtime
from ai_config import FLORENCE_ENABLED, FLORENCE_WARMUP
from pipeline import run_hybrid_pipeline
from resolution_analysis import compare_resolution_evidence
from request_context import reset_request_id, set_request_id

MAX_TEXT_CHARS = 3500
MAX_LOCATION_CHARS = 500
MAX_IMAGE_BASE64_CHARS = 3_000_000
MAX_CONTEXT_ITEMS = 12
ALLOWED_IMAGE_MIME_TYPES = {"image/jpeg", "image/png", "image/webp", ""}


def compact_spaces(value):
    return " ".join(str(value or "").replace("\n", " ").split()).strip()


def truncate_text(value, max_chars):
    cleaned = compact_spaces(value)
    if len(cleaned) <= max_chars:
        return cleaned, False
    return cleaned[:max_chars].rsplit(" ", 1)[0].strip(), True


def sanitize_context_items(items):
    if not isinstance(items, list):
        return [], bool(items)

    sanitized = []
    truncated = len(items) > MAX_CONTEXT_ITEMS
    for item in items[:MAX_CONTEXT_ITEMS]:
        if not isinstance(item, dict):
            continue
        location, location_truncated = truncate_text(item.get("location"), 180)
        description, description_truncated = truncate_text(item.get("description"), 240)
        sanitized.append(
            {
                "_id": compact_spaces(item.get("_id") or item.get("id"))[:80],
                "id": compact_spaces(item.get("id") or item.get("_id"))[:80],
                "type": compact_spaces(item.get("type"))[:120],
                "description": description,
                "location": location,
                "createdAt": compact_spaces(item.get("createdAt"))[:80],
                "categoryId": compact_spaces(item.get("categoryId"))[:80],
                "imageFingerprint": compact_spaces(item.get("imageFingerprint"))[:160],
                "dHash": compact_spaces(item.get("dHash"))[:32],
            }
        )
        truncated = truncated or location_truncated or description_truncated

    return sanitized, truncated


def sanitize_image_features(features):
    if not isinstance(features, dict):
        return None, bool(features)

    sanitized = {}
    changed = False
    allowed_keys = {
        "width",
        "height",
        "averageBrightness",
        "averageSaturation",
        "edgeDensity",
        "redHeatRatio",
        "smokeLikeRatio",
        "darkRatio",
        "greenRatio",
        "blueRatio",
        "hotspotRatio",
        "neutralRatio",
        "contrast",
    }

    for key in allowed_keys:
        if key not in features:
            continue
        try:
            value = float(features.get(key) or 0)
        except (TypeError, ValueError):
            value = 0.0
            changed = True

        if key in {"width", "height"}:
            bounded = int(max(0, min(12000, value)))
        else:
            bounded = max(0.0, min(1.0, value))
        changed = changed or bounded != features.get(key)
        sanitized[key] = bounded

    return sanitized, changed


def sanitize_analyze_payload(payload):
    if not isinstance(payload, dict):
        return {}, {"sanitized": True, "reason": "Payload was not a JSON object."}

    diagnostics = {
        "sanitized": False,
        "truncatedFields": [],
        "droppedFields": [],
    }
    sanitized = {}

    for key in ["textComplaint", "voiceTranscript"]:
        value, truncated = truncate_text(payload.get(key), MAX_TEXT_CHARS)
        sanitized[key] = value
        if truncated:
            diagnostics["sanitized"] = True
            diagnostics["truncatedFields"].append(key)

    location, location_truncated = truncate_text(payload.get("location"), MAX_LOCATION_CHARS)
    sanitized["location"] = location
    if location_truncated:
        diagnostics["sanitized"] = True
        diagnostics["truncatedFields"].append("location")

    image_base64 = compact_spaces(payload.get("imageBase64"))
    if len(image_base64) > MAX_IMAGE_BASE64_CHARS:
        image_base64 = ""
        diagnostics["sanitized"] = True
        diagnostics["droppedFields"].append("imageBase64")
    sanitized["imageBase64"] = image_base64

    image_mime_type = compact_spaces(payload.get("imageMimeType")).lower().split(";")[0]
    if image_mime_type not in ALLOWED_IMAGE_MIME_TYPES:
        image_mime_type = ""
        diagnostics["sanitized"] = True
        diagnostics["droppedFields"].append("imageMimeType")
    sanitized["imageMimeType"] = image_mime_type

    image_features, features_changed = sanitize_image_features(payload.get("imageFeatures"))
    sanitized["imageFeatures"] = image_features
    if features_changed:
        diagnostics["sanitized"] = True
        diagnostics["truncatedFields"].append("imageFeatures")

    previous, previous_changed = sanitize_context_items(payload.get("previousComplaints"))
    recent, recent_changed = sanitize_context_items(payload.get("recentAreaComplaints"))
    sanitized["previousComplaints"] = previous
    sanitized["recentAreaComplaints"] = recent
    if previous_changed:
        diagnostics["sanitized"] = True
        diagnostics["truncatedFields"].append("previousComplaints")
    if recent_changed:
        diagnostics["sanitized"] = True
        diagnostics["truncatedFields"].append("recentAreaComplaints")

    return sanitized, diagnostics


FILLER_PHRASES = [
    "um",
    "uh",
    "please note that",
    "i want to say",
    "i would like to report",
    "i want to report",
    "this is a complaint about",
]


TRANSCRIPT_REPLACEMENTS = {
    "water logging": "waterlogging",
    "street light": "streetlight",
    "garbage bin": "garbage bin",
    "bbmp": "BBMP",
}


def normalize_complaint_transcript(transcript):
    cleaned = compact_spaces(transcript)
    lowered = cleaned.lower()

    for phrase in FILLER_PHRASES:
        lowered = lowered.replace(phrase, " ")

    lowered = compact_spaces(lowered)
    for source, target in TRANSCRIPT_REPLACEMENTS.items():
        lowered = lowered.replace(source, target)

    if not lowered:
        return "", ""

    normalized = lowered[:1].upper() + lowered[1:]
    if normalized and normalized[-1] not in ".!?":
        normalized = f"{normalized}."

    summary = normalized
    if len(summary) > 420:
        summary = summary[:417].rsplit(" ", 1)[0].rstrip(".,;:") + "..."

    return normalized, summary

app = Flask(__name__)
logging.basicConfig(level=os.getenv("AI_LOG_LEVEL", "INFO").upper())
app.config["MAX_CONTENT_LENGTH"] = int(os.getenv("AI_MAX_REQUEST_BYTES", str(4 * 1024 * 1024)))
CORS(app)

AI_SERVICE_TOKEN = os.getenv("AI_SERVICE_TOKEN", "").strip()
AI_SERVICE_REQUIRE_TOKEN = os.getenv("AI_SERVICE_REQUIRE_TOKEN", "false").lower() == "true"
if AI_SERVICE_REQUIRE_TOKEN and len(AI_SERVICE_TOKEN) < 32:
    raise RuntimeError("AI_SERVICE_TOKEN must contain at least 32 characters when service authentication is required.")


def service_token_matches(supplied, expected):
    try:
        return hmac.compare_digest(str(supplied or "").encode("utf-8"), str(expected or "").encode("utf-8"))
    except (UnicodeEncodeError, TypeError):
        return False


def normalized_request_id(value):
    candidate = "".join(character for character in str(value or "") if character.isalnum() or character in "._-")[:80]
    return candidate if len(candidate) >= 8 else uuid.uuid4().hex


def log_request_event(event, **details):
    logging.getLogger("urban_pulse.requests").info(
        json.dumps({"event": event, **details}, sort_keys=True, default=str)
    )


@app.before_request
def require_service_token():
    g.request_id = normalized_request_id(request.headers.get("X-Request-ID"))
    g.request_started = time.monotonic()
    g.request_context_token = set_request_id(g.request_id)
    if request.method == "POST":
        log_request_event("ai_request_started", requestId=g.request_id, path=request.path)
    if request.method == "POST" and AI_SERVICE_REQUIRE_TOKEN:
        supplied = request.headers.get("X-Urban-Pulse-Service-Token", "")
        if not service_token_matches(supplied, AI_SERVICE_TOKEN):
            log_request_event(
                "ai_request_rejected",
                requestId=g.request_id,
                path=request.path,
                failureStage="ai_service_auth",
                statusCode=401,
            )
            return jsonify(
                {
                    "error": "Service authentication required.",
                    "requestId": g.request_id,
                    "failureStage": "ai_service_auth",
                }
            ), 401
    return None


@app.after_request
def complete_request(response):
    request_id = getattr(g, "request_id", normalized_request_id(""))
    response.headers["X-Request-ID"] = request_id
    if request.method == "POST":
        started = getattr(g, "request_started", time.monotonic())
        log_request_event(
            "ai_request_completed",
            requestId=request_id,
            path=request.path,
            statusCode=response.status_code,
            durationMs=int((time.monotonic() - started) * 1000),
        )
    context_token = getattr(g, "request_context_token", None)
    if context_token is not None:
        reset_request_id(context_token)
        g.request_context_token = None
    return response


@app.errorhandler(413)
def request_too_large(_error):
    return jsonify(
        {
            "error": "AI request payload is too large.",
            "requestId": getattr(g, "request_id", ""),
            "failureStage": "ai_payload_validation",
        }
    ), 413


@app.errorhandler(Exception)
def unexpected_error(error):
    if isinstance(error, HTTPException):
        status_code = int(error.code or 500)
        message = error.description or "AI service request failed."
    else:
        status_code = 500
        message = "AI service request failed."
        logging.getLogger("urban_pulse.requests").exception("Unhandled AI service error")
    log_request_event(
        "ai_request_failed",
        requestId=getattr(g, "request_id", ""),
        path=request.path,
        failureStage="ai_service",
        statusCode=status_code,
        errorType=type(error).__name__,
    )
    return jsonify(
        {
            "error": message,
            "requestId": getattr(g, "request_id", ""),
            "failureStage": "ai_service",
        }
    ), status_code


@app.get("/health")
def health():
    models = runtime_status()
    providers = models.get("visionProviders", {})
    florence = providers.get("florenceRemote", {})
    gemini = providers.get("gemini", {})
    local = providers.get("localLegacy", {})
    return jsonify(
        {
            "status": "ok",
            "service": "urban-pulse-ai-service",
            "engine": "ai-service-decision-engine-v5",
            "categoryCount": len(COMPLAINT_CATEGORIES),
            "models": models,
            "capabilities": {
                "semanticTextClassification": True,
                "imageClassification": True,
                "sceneUnderstanding": bool(
                    florence.get("configured")
                    or gemini.get("configured")
                    or local.get("enabled")
                ),
                "confidenceCalibration": True,
                "textImageConflictDetection": True,
                "structuredExplainability": True,
                "transcriptNormalization": True,
                "threatDetection": True,
            },
        }
    )


@app.get("/ready")
def readiness():
    models = runtime_status()
    scene = models.get("sceneUnderstanding", {})
    providers = models.get("visionProviders", {})
    florence = providers.get("florenceRemote", {})
    gemini = providers.get("gemini", {})
    provider_ready = (
        bool(florence.get("enabled") and florence.get("configured"))
        or bool(gemini.get("enabled") and gemini.get("configured"))
        or bool(scene.get("ready"))
    )
    if provider_ready or (
        not florence.get("enabled")
        and not gemini.get("enabled")
        and not scene.get("enabled")
    ):
        status = "ready"
    elif scene.get("state") == "loading":
        status = "warming_up"
    else:
        status = "degraded"
    # HTTP stays healthy because deterministic safety paths remain available in degraded mode.
    return jsonify({"status": status, "visualProviderReady": provider_ready, "sceneUnderstandingReady": bool(scene.get("ready")), "models": models})


@app.post("/auth/probe")
def auth_probe():
    """Verify service-to-service authentication without invoking the AI pipeline."""
    return jsonify(
        {
            "status": "ok",
            "service": "urban-pulse-ai-service",
            "authenticated": True,
            "requestId": g.request_id,
        }
    )


@app.post("/analyze")
def analyze():
    payload = request.get_json(silent=True) or {}
    sanitized_payload, input_diagnostics = sanitize_analyze_payload(payload)
    result = run_hybrid_pipeline(sanitized_payload)
    result["inputDiagnostics"] = input_diagnostics
    result.setdefault("aiMeta", {})["inputSanitized"] = bool(input_diagnostics.get("sanitized"))
    result["aiMeta"]["requestId"] = g.request_id
    return jsonify(result)


@app.post("/transcript/process")
def process_transcript():
    payload = request.get_json(silent=True) or {}
    transcript = compact_spaces(payload.get("transcript"))

    if not transcript:
        return jsonify({"error": "Transcript text is required."}), 400

    normalized, summary = normalize_complaint_transcript(transcript)

    return jsonify(
        {
            "transcript": transcript,
            "normalizedTranscript": normalized,
            "summary": summary,
            "language": payload.get("language") or "unknown",
            "provider": "flask-transcript-normalizer-v2",
        }
    )


@app.post("/compare-resolution")
def compare_resolution():
    payload = request.get_json(silent=True) or {}
    sanitized_payload, input_diagnostics = sanitize_analyze_payload(payload)
    for key, max_chars in {
        "originalCategoryId": 80,
        "originalType": 180,
        "originalPriority": 30,
        "vote": 40,
        "note": 1200,
    }.items():
        sanitized_payload[key] = compact_spaces(payload.get(key))[:max_chars]

    result = compare_resolution_evidence(sanitized_payload)
    result["inputDiagnostics"] = input_diagnostics
    return jsonify(result)


@app.post("/chat")
def chat():
    payload = request.get_json(silent=True) or {}
    message = compact_spaces(payload.get("message"))

    if not message:
        return jsonify({"error": "Message is required."}), 400

    result = classify_chat_intent(message, payload.get("history") or [])
    return jsonify(result)


if FLORENCE_WARMUP:
    florence_runtime.request_load(background=True)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=os.getenv("FLASK_DEBUG") == "true")
