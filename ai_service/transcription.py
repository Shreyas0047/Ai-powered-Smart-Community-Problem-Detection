import base64
import os
import tempfile

from model_runtime import get_whisper_model


def compact_spaces(value):
    return " ".join(str(value or "").replace("\n", " ").split()).strip()


def decode_audio_payload(audio_base64):
    if not audio_base64:
        raise ValueError("Audio payload is empty.")

    encoded = audio_base64.split(",", 1)[1] if "," in audio_base64 else audio_base64
    return base64.b64decode(encoded)


def transcribe_audio_payload(payload):
    audio_base64 = payload.get("audioBase64")
    filename = str(payload.get("filename") or "complaint-audio").strip()
    audio_bytes = decode_audio_payload(audio_base64)
    suffix = os.path.splitext(filename)[1] or ".webm"
    model = get_whisper_model()

    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_audio:
        temp_audio.write(audio_bytes)
        temp_path = temp_audio.name

    try:
        segments, info = model.transcribe(temp_path, beam_size=5, vad_filter=True)
        transcript = " ".join(segment.text.strip() for segment in segments).strip()
        normalized = compact_spaces(transcript)
        return {
            "transcript": normalized,
            "normalizedTranscript": normalized[:1].upper() + normalized[1:] + ("." if normalized and normalized[-1] not in ".!?" else ""),
            "language": getattr(info, "language", "unknown"),
        }
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

