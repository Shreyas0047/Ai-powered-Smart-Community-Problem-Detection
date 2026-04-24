# Speech-to-Text Service

This service is a dedicated `faster-whisper` microservice for audio transcription.

## Endpoints

- `GET /health`
- `POST /transcribe`

## Environment

```bash
STT_SERVICE_TOKEN=replace-with-a-shared-secret
STT_MODEL_SIZE=base
STT_COMPUTE_TYPE=int8
STT_DEVICE=cpu
STT_BEAM_SIZE=5
STT_MAX_AUDIO_BYTES=20971520
```

## Local run

```bash
pip install -r stt_service/requirements.txt
python stt_service/app.py
```

The main app should then use:

```bash
STT_SERVICE_URL=http://127.0.0.1:5001
STT_SERVICE_TOKEN=replace-with-a-shared-secret
```
