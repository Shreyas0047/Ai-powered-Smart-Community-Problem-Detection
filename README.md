# Urban Pulse Ai

Urban Pulse Ai is an AI-powered smart community complaint detection and escalation system.

Current stack:

- `Node.js + Express` for the main web app, auth, complaint APIs, dashboard, and email
- `Flask` AI microservice for complaint understanding, transcript post-processing, and chatbot intent handling
- `MongoDB Atlas` for users, complaints, chat sessions, and pending OTP registrations
- `Deepgram` for speech-to-text
- `SMTP` for OTP and BBMP email delivery

## Core Features

- text, image, and voice complaint submission
- Deepgram-based live voice transcription
- AI-assisted complaint categorization, sentiment, severity, and priority analysis
- chatbot with complaint status lookup, complaint creation assistance, FAQ help, and navigation help
- theme-matched floating AI helper bot with context-aware tips and voice/chat state animations
- PDF complaint report generation
- BBMP email forwarding with attachment
- Admin dashboard for alerts, status updates, resets, and account management

## Project Structure

- `public/`
  Frontend dashboard, complaint form, chatbot UI, and static assets
- `src/`
  Express backend with routes, controllers, models, middleware, and services
- `ai_service/`
  Flask AI service for `/analyze`, `/transcript/process`, `/chat`, and `/health`

## Current AI Flow

Complaint flow:

1. Frontend collects text, image-derived hints/features, and optional voice transcript
2. Express enriches the request with prior complaints from the same user and recent complaints in the same area
3. Flask runs a hybrid AI pipeline:
   - preprocessing and normalization
   - semantic similarity using `sentence-transformers`
   - keyword extraction with n-gram support
   - multi-label category scoring
   - sentiment and severity analysis
   - context-aware repeat complaint analysis
   - image-text fusion
   - explainable priority reasoning
4. Express stores the result in MongoDB

Voice flow:

1. Frontend records audio
2. Express sends audio to Deepgram
3. Deepgram returns transcript text
4. Express sends transcript to Flask `/transcript/process`
5. Flask normalizes the transcript
6. Frontend fills the voice complaint summary box

Chatbot flow:

1. Frontend sends user message and userId to Express
2. Express forwards the message/history to Flask `/chat`
3. Flask returns intent + response suggestion
4. Express resolves complaint status or complaint creation when needed
5. Frontend renders chat history and assistant messages

## Environment Variables

Create a `.env` file from `.env.example` and set:

```bash
PORT=3000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/smart-community?retryWrites=true&w=majority
JWT_SECRET=replace-with-a-strong-secret
AI_SERVICE_URL=http://127.0.0.1:5000
DEEPGRAM_API_KEY=your_deepgram_api_key
DEEPGRAM_MODEL=nova-3
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@example.com
SMTP_PASS=your_app_password
SMTP_FROM=your_email@example.com
BBMP_EMAIL_TO=comm@bbmp.gov.in
CORS_ORIGIN=http://localhost:3000
ALLOW_ROLE_TOKEN_ISSUE=false
```

Flask AI environment variables:

```bash
EMBEDDING_MODEL_NAME=sentence-transformers/all-MiniLM-L6-v2
VISION_IMAGE_WEIGHT=0.38
TEXT_CONFIDENCE_THRESHOLD=0.26
CONTEXT_REPEAT_HIGH=5
CONTEXT_REPEAT_MEDIUM=3
MAX_EXPLANATION_KEYWORDS=4
```

## Install

Node dependencies:

```bash
npm install
```

Python dependencies:

```bash
pip install -r ai_service/requirements.txt
```

Seed demo data:

```bash
npm run seed
```

Wipe and reseed:

```bash
npm run seed:fresh
```

## Run Locally

Start the Flask AI service:

```bash
npm run start:ai
```

Start the Express app:

```bash
npm start
```

Open:

```bash
http://localhost:3000
```

## Deploy

Recommended production layout:

- `MongoDB Atlas` for the database
- `Render` Node web service for the main app
- `Render` Python web service for the Flask AI service
- `Deepgram` for STT

### 1. Deploy the Flask AI Service on Render

Create a Python web service with:

- Root Directory: `ai_service`
- Build Command:

```bash
pip install -r requirements.txt
```

- Start Command:

```bash
gunicorn app:app
```

Recommended Render env vars:

```bash
PYTHON_VERSION=3.11.11
EMBEDDING_MODEL_NAME=sentence-transformers/all-MiniLM-L6-v2
VISION_IMAGE_WEIGHT=0.38
TEXT_CONFIDENCE_THRESHOLD=0.26
CONTEXT_REPEAT_HIGH=5
CONTEXT_REPEAT_MEDIUM=3
MAX_EXPLANATION_KEYWORDS=4
```

### 2. Deploy the Node App on Render

Create a Node web service with:

- Root Directory: project root
- Build Command:

```bash
npm install
```

- Start Command:

```bash
npm start
```

Recommended Node env vars:

```bash
MONGODB_URI=your_atlas_uri
JWT_SECRET=your_strong_secret
AI_SERVICE_URL=https://your-flask-service.onrender.com
DEEPGRAM_API_KEY=your_deepgram_api_key
DEEPGRAM_MODEL=nova-3
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@example.com
SMTP_PASS=your_app_password
SMTP_FROM=your_email@example.com
BBMP_EMAIL_TO=comm@bbmp.gov.in
CORS_ORIGIN=https://your-node-service.onrender.com
ALLOW_ROLE_TOKEN_ISSUE=false
```

### 3. Important Deployment Notes

- Deploy the Flask AI service first, then the Node service
- Re-login after deployment because JWT payloads now include `userId`
- Do not set `PORT` manually on Render
- Use `Clear build cache & deploy` on the Flask service when Python dependencies change
- Speech-to-text is handled by Deepgram from the Node service, not by Flask

## Main API Surface

Express:

- `/api/auth/register/request-otp`
- `/api/auth/register`
- `/api/auth/login`
- `/api/dashboard`
- `/api/analyze-complaint`
- `/api/transcribe-audio`
- `/api/chatbot/history`
- `/api/chatbot/message`
- `/api/email-bbmp`

Flask:

- `/health`
- `/analyze`
- `/transcript/process`
- `/chat`

## Important Files

- `src/server.js`
  Express bootstrap and MongoDB startup
- `src/routes/api.js`
  Main API routing
- `src/controllers/complaintController.js`
  Complaint submission and transcription endpoints
- `public/chatbot.js`
  Chatbot panel behavior and state events
- `public/ai-helper-bot.js`
  Theme-aware assistant robot behavior and contextual UI tips
- `src/controllers/chatbotController.js`
  Chat history, chat actions, and complaint creation through chat
- `src/services/complaintService.js`
  Shared complaint creation pipeline used by form and chatbot
- `src/services/aiClient.js`
  Node -> Flask and Node -> Deepgram integration
- `ai_service/app.py`
  Flask entrypoint
- `ai_service/pipeline.py`
  Hybrid complaint analysis pipeline
- `public/chatbot.js`
  Floating chatbot UI

## Notes

- The frontend is served by Express; there is no separate frontend deployment requirement.
- Complaint analysis still has a Node-side fallback path if Flask is unavailable, but the primary path is Flask.
- Chatbot history is stored per user in MongoDB.
- OTP verification is required only for registration, not login.
- SMTP sends both OTP messages and BBMP complaint emails.
