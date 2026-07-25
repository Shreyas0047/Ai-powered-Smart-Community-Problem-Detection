import json
import logging
import random
import socket
import threading
import time
import urllib.error
import urllib.parse
import urllib.request
import uuid
from collections import OrderedDict

from ai_config import (
    FLORENCE_ALLOW_HTTP,
    FLORENCE_CACHE_SIZE,
    FLORENCE_CIRCUIT_COOLDOWN_SECONDS,
    FLORENCE_CIRCUIT_FAILURE_THRESHOLD,
    FLORENCE_JPEG_QUALITY,
    FLORENCE_MAX_RETRIES,
    FLORENCE_MAX_TRANSMIT_BYTES,
    FLORENCE_REMOTE_ENABLED,
    FLORENCE_REMOTE_MAX_IMAGE_DIMENSION,
    FLORENCE_SERVICE_TOKEN,
    FLORENCE_SERVICE_URL,
    FLORENCE_TIMEOUT_SECONDS,
)
from memory_runtime import trim_process_memory
from request_context import current_request_id
from vision_image_transport import prepare_jpeg
from vision_provider_contract import clean_text, provider_result

LOGGER = logging.getLogger("urban_pulse.vision")
MAX_RESPONSE_BYTES = 512_000
TRANSIENT_HTTP_CODES = {408, 500, 502, 503, 504}


class FlorenceRemoteProvider:
    name = "florence-cloud-run"

    def __init__(self, opener=None, sleep=None, clock=None):
        self._opener = opener or urllib.request.urlopen
        self._sleep = sleep or time.sleep
        self._clock = clock or time.monotonic
        self._cache = OrderedDict()
        self._cache_lock = threading.Lock()
        self._state_lock = threading.Lock()
        self._consecutive_failures = 0
        self._circuit_opened_at = None
        self._last_status = "not_called"
        self._last_error = ""
        self._last_called_at = None
        self._last_request_id = ""

    @property
    def configured(self):
        endpoint = urllib.parse.urlparse(FLORENCE_SERVICE_URL)
        secure = endpoint.scheme == "https"
        explicit_http = FLORENCE_ALLOW_HTTP and endpoint.scheme == "http"
        return bool(
            FLORENCE_REMOTE_ENABLED
            and FLORENCE_SERVICE_TOKEN
            and endpoint.hostname
            and (secure or explicit_http)
        )

    def _log(self, event, **details):
        request_id = current_request_id()
        LOGGER.info(
            json.dumps(
                {
                    "event": event,
                    "provider": self.name,
                    **({"requestId": request_id} if request_id else {}),
                    **details,
                },
                sort_keys=True,
                default=str,
            )
        )

    def _set_status(self, status, error=""):
        with self._state_lock:
            self._last_status = status
            self._last_error = clean_text(error, 180)
            self._last_called_at = time.time()
            self._last_request_id = current_request_id()

    def _record_success(self):
        with self._state_lock:
            self._consecutive_failures = 0
            self._circuit_opened_at = None

    def _record_failure(self):
        with self._state_lock:
            self._consecutive_failures += 1
            if self._consecutive_failures >= FLORENCE_CIRCUIT_FAILURE_THRESHOLD:
                self._circuit_opened_at = self._clock()

    def _circuit_is_open(self):
        with self._state_lock:
            if self._circuit_opened_at is None:
                return False
            if self._clock() - self._circuit_opened_at >= FLORENCE_CIRCUIT_COOLDOWN_SECONDS:
                self._circuit_opened_at = None
                self._consecutive_failures = 0
                return False
            return True

    def _cache_get(self, image_hash):
        if not image_hash or FLORENCE_CACHE_SIZE <= 0:
            return None
        with self._cache_lock:
            item = self._cache.pop(image_hash, None)
            if item is not None:
                self._cache[image_hash] = item
            return item

    def _cache_put(self, image_hash, value):
        if not image_hash or FLORENCE_CACHE_SIZE <= 0:
            return
        with self._cache_lock:
            self._cache.pop(image_hash, None)
            self._cache[image_hash] = value
            while len(self._cache) > FLORENCE_CACHE_SIZE:
                self._cache.popitem(last=False)

    @staticmethod
    def _multipart(image_bytes, request_id):
        boundary = f"urban-pulse-{uuid.uuid4().hex}"
        delimiter = f"--{boundary}\r\n".encode("ascii")
        body = bytearray()
        body.extend(delimiter)
        body.extend(b'Content-Disposition: form-data; name="image"; filename="evidence.jpg"\r\n')
        body.extend(b"Content-Type: image/jpeg\r\n\r\n")
        body.extend(image_bytes)
        body.extend(b"\r\n")
        body.extend(delimiter)
        body.extend(b'Content-Disposition: form-data; name="requestId"\r\n\r\n')
        body.extend(request_id.encode("ascii"))
        body.extend(f"\r\n--{boundary}--\r\n".encode("ascii"))
        return bytes(body), boundary

    @staticmethod
    def _extract(payload):
        if not isinstance(payload, dict):
            raise ValueError("Remote Florence response was not an object")
        status = payload.get("status")
        if status and status != "available":
            raise ValueError("Remote Florence response was not available")
        observations = payload.get("structuredObservations") or payload.get("observations")
        if not isinstance(observations, dict):
            raise ValueError("Remote Florence response omitted observations")
        return provider_result(
            "florence-cloud-run",
            payload.get("model") or "microsoft/Florence-2-base-ft",
            observations,
            inferenceMs=max(0, int(payload.get("inferenceMs") or 0)),
            cacheHit=False,
        )

    def analyze(self, image, image_hash):
        if not FLORENCE_REMOTE_ENABLED:
            return {"status": "disabled", "reason": "Remote visual analysis is disabled.", "provider": self.name, "cacheHit": False}
        if not self.configured:
            return {"status": "unavailable", "reason": "Remote visual analysis is not configured.", "provider": self.name, "cacheHit": False}
        if self._circuit_is_open():
            self._log("florence_remote_circuit_skip")
            return {"status": "circuit_open", "reason": "Remote visual analysis is recovering.", "provider": self.name, "cacheHit": False}

        cached = self._cache_get(image_hash)
        if cached is not None:
            self._log("florence_remote_cache_hit", hashPrefix=image_hash[:10])
            return {**cached, "cacheHit": True}

        try:
            image_bytes = prepare_jpeg(
                image,
                FLORENCE_REMOTE_MAX_IMAGE_DIMENSION,
                FLORENCE_JPEG_QUALITY,
                FLORENCE_MAX_TRANSMIT_BYTES,
            )
            request_id = current_request_id() or uuid.uuid4().hex
            body, boundary = self._multipart(image_bytes, request_id)
        except (OSError, ValueError) as error:
            self._set_status("invalid_image", str(error))
            return {"status": "invalid_image", "reason": "The image could not be prepared for visual analysis.", "provider": self.name, "cacheHit": False}

        endpoint = f"{FLORENCE_SERVICE_URL}/v1/analyze"
        max_attempts = FLORENCE_MAX_RETRIES + 1
        try:
            for attempt in range(max_attempts):
                started = self._clock()
                request = urllib.request.Request(
                    endpoint,
                    data=body,
                    method="POST",
                    headers={
                        "Content-Type": f"multipart/form-data; boundary={boundary}",
                        "X-Urban-Pulse-Vision-Token": FLORENCE_SERVICE_TOKEN,
                        "X-Request-ID": request_id,
                    },
                )
                try:
                    with self._opener(request, timeout=FLORENCE_TIMEOUT_SECONDS) as response:
                        raw = response.read(MAX_RESPONSE_BYTES + 1)
                    if len(raw) > MAX_RESPONSE_BYTES:
                        raise ValueError("Remote Florence response exceeded the safe limit")
                    result = self._extract(json.loads(raw.decode("utf-8")))
                    result["networkMs"] = int((self._clock() - started) * 1000)
                    self._cache_put(image_hash, result)
                    self._record_success()
                    self._set_status("available")
                    self._log("florence_remote_succeeded", attempt=attempt + 1, durationMs=result["networkMs"], hashPrefix=image_hash[:10])
                    return result
                except urllib.error.HTTPError as error:
                    code = int(error.code or 0)
                    status = "quota_exceeded" if code == 429 else "provider_error"
                    self._set_status(status, f"HTTP {code}")
                    self._log("florence_remote_http_error", statusCode=code, attempt=attempt + 1)
                    if code in {401, 403}:
                        self._record_failure()
                        return {"status": "unauthorized", "reason": "Remote visual analysis rejected service authentication.", "provider": self.name, "cacheHit": False}
                    if code == 429:
                        return {"status": "quota_exceeded", "reason": "Remote visual-analysis capacity is unavailable.", "provider": self.name, "cacheHit": False}
                    if code not in TRANSIENT_HTTP_CODES or attempt + 1 >= max_attempts:
                        self._record_failure()
                        return {"status": "unavailable", "reason": "Remote visual analysis is temporarily unavailable.", "provider": self.name, "cacheHit": False}
                except (TimeoutError, socket.timeout, urllib.error.URLError) as error:
                    self._set_status("timeout", type(error).__name__)
                    self._log("florence_remote_timeout", attempt=attempt + 1)
                    if attempt + 1 >= max_attempts:
                        self._record_failure()
                        return {"status": "timeout", "reason": "Remote visual analysis timed out.", "provider": self.name, "cacheHit": False}
                except (UnicodeDecodeError, json.JSONDecodeError, ValueError) as error:
                    self._set_status("invalid_response", type(error).__name__)
                    self._record_failure()
                    self._log("florence_remote_invalid_response", attempt=attempt + 1)
                    return {"status": "invalid_response", "reason": "Remote visual analysis returned an invalid response.", "provider": self.name, "cacheHit": False}

                self._sleep(min(2.0, 0.5 * (2 ** attempt)) + random.uniform(0, 0.2))
        finally:
            del body
            del image_bytes
            trim_process_memory()

    def status_payload(self):
        with self._cache_lock:
            cache_entries = len(self._cache)
        with self._state_lock:
            circuit_open = self._circuit_opened_at is not None and (
                self._clock() - self._circuit_opened_at < FLORENCE_CIRCUIT_COOLDOWN_SECONDS
            )
            state = {
                "lastStatus": self._last_status,
                "lastError": self._last_error,
                "lastCalledAt": self._last_called_at,
                "lastRequestId": self._last_request_id,
                "consecutiveFailures": self._consecutive_failures,
                "circuitOpen": circuit_open,
            }
        return {
            "enabled": FLORENCE_REMOTE_ENABLED,
            "configured": self.configured,
            "provider": self.name,
            "serviceHost": urllib.parse.urlparse(FLORENCE_SERVICE_URL).hostname or "",
            "cacheEntries": cache_entries,
            **state,
        }


florence_remote_provider = FlorenceRemoteProvider()
