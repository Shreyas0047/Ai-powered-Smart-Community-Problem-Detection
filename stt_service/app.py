import base64
import binascii
import os
import tempfile

from flask import Flask, jsonify, request
from flask_cors import CORS

try:
    from faster_whisper import WhisperModel
except ImportError:  # pragma: no cover
    WhisperModel = None


app = Flask(__name__)
CORS(app)

TRANSCRIPTION_MODEL = None
MAX_AUDIO_BYTES = int(os.getenv("STT_MAX_AUDIO_BYTES", str(20 * 1024 * 1024)))


def require_service_token():
    expected = os.getenv("STT_SERVICE_TOKEN", "").strip()
    if not expected:
        return None

    actual = request.headers.get("Authorization", "").strip()
    if actual == f"Bearer {expected}":
        return None

    return jsonify({"error": "Unauthorized speech service request."}), 401


def decode_audio_payload(audio_base64):
    if not audio_base64:
        raise ValueError("The speech service did not receive any audio data.")

    payload = str(audio_base64).strip()
    if "," in payload:
        payload = payload.split(",", 1)[1]

    try:
        audio_bytes = base64.b64decode(payload, validate=True)
    except (ValueError, binascii.Error) as error:
        raise ValueError("The uploaded audio is not valid base64 data.") from error

    if not audio_bytes:
        raise ValueError("The uploaded audio payload is empty.")

    if len(audio_bytes) > MAX_AUDIO_BYTES:
        raise ValueError("The uploaded audio file is too large for the speech service.")

    return audio_bytes


def get_transcription_model():
    global TRANSCRIPTION_MODEL

    if WhisperModel is None:
        raise RuntimeError("Speech recognition is unavailable because faster-whisper is not installed.")

    if TRANSCRIPTION_MODEL is None:
        model_size = os.getenv("STT_MODEL_SIZE", "base")
        compute_type = os.getenv("STT_COMPUTE_TYPE", "int8")
        device = os.getenv("STT_DEVICE", "cpu")
        TRANSCRIPTION_MODEL = WhisperModel(model_size, device=device, compute_type=compute_type)

    return TRANSCRIPTION_MODEL


def transcribe_audio_payload(payload):
    audio_bytes = decode_audio_payload(payload.get("audioBase64"))
    filename = str(payload.get("filename") or "complaint-audio").strip()
    suffix = os.path.splitext(filename)[1] or ".webm"
    beam_size = int(os.getenv("STT_BEAM_SIZE", "5"))
    model = get_transcription_model()

    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_audio:
        temp_audio.write(audio_bytes)
        temp_path = temp_audio.name

    try:
        segments, info = model.transcribe(temp_path, beam_size=beam_size, vad_filter=True)
        transcript = " ".join(segment.text.strip() for segment in segments).strip()
        return {
            "transcript": transcript,
            "language": getattr(info, "language", "unknown"),
            "model": os.getenv("STT_MODEL_SIZE", "base"),
        }
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)


@app.get("/health")
def health():
    return jsonify({"status": "ok"})


@app.post("/transcribe")
def transcribe():
    token_error = require_service_token()
    if token_error:
        return token_error

    payload = request.get_json(silent=True) or {}

    try:
        result = transcribe_audio_payload(payload)
        return jsonify(result)
    except ValueError as error:
        return jsonify({"error": str(error)}), 400
    except RuntimeError as error:
        return jsonify({"error": str(error)}), 503
    except Exception:
        return jsonify({"error": "Audio transcription failed inside the speech service."}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)
