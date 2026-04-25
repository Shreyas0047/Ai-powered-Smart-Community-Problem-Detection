from flask import Flask, jsonify, request
from flask_cors import CORS

from chat_logic import classify_chat_intent
from pipeline import run_hybrid_pipeline
from transcription import compact_spaces, transcribe_audio_payload

app = Flask(__name__)
CORS(app)


@app.get("/health")
def health():
    return jsonify({"status": "ok"})


@app.post("/analyze")
def analyze():
    payload = request.get_json(silent=True) or {}
    return jsonify(run_hybrid_pipeline(payload))


@app.post("/transcribe")
def transcribe():
    payload = request.get_json(silent=True) or {}

    try:
        result = transcribe_audio_payload(payload)
        return jsonify(result)
    except ValueError as error:
        return jsonify({"error": str(error)}), 400
    except RuntimeError as error:
        return jsonify({"error": str(error)}), 503
    except Exception:
        return jsonify({"error": "Audio transcription failed inside the AI service."}), 500


@app.post("/transcript/process")
def process_transcript():
    payload = request.get_json(silent=True) or {}
    transcript = compact_spaces(payload.get("transcript"))

    if not transcript:
        return jsonify({"error": "Transcript text is required."}), 400

    normalized = transcript[:1].upper() + transcript[1:] if transcript else transcript
    if normalized and normalized[-1] not in ".!?":
        normalized = f"{normalized}."

    return jsonify(
        {
            "transcript": transcript,
            "normalizedTranscript": normalized,
            "summary": normalized,
            "language": payload.get("language") or "unknown",
        }
    )


@app.post("/chat")
def chat():
    payload = request.get_json(silent=True) or {}
    message = compact_spaces(payload.get("message"))

    if not message:
        return jsonify({"error": "Message is required."}), 400

    result = classify_chat_intent(message, payload.get("history") or [])
    return jsonify(result)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
