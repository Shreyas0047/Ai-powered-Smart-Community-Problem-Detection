# AI Smart Community Problem Detection System

This project now follows the architecture you described:

- `Flask` AI microservice for text and image analysis
- `Node.js + Express` API for authentication, complaints, dashboard access, payments, and complaint status workflows
- `MongoDB Atlas` for complaint, payment, pending order, and user storage
- `Razorpay` for secure online maintenance payments with automatic receipt creation
- `SMTP email sending` for automatic BBMP complaint forwarding with PDF attachment
- `Deepgram Speech-to-Text API` for live voice complaint transcription

## Architecture

- `public/`
  Frontend dashboard, complaint form, JWT role UI, complaint status updates, alerts, sensors, and map UI
- `src/`
  Express backend with routes, controllers, models, middleware, and services
- `ai_service/`
  Flask microservice that analyzes complaint text, image-derived features, and uploaded audio transcription
- `receipts/`
  Auto-generated maintenance payment receipts after successful Razorpay verification

## Backend Stack

- `Express API`
  Handles JWT role tokens, complaint submission, dashboard data, payment order creation, payment verification, and static serving
- `Flask AI service`
  Exposes `/analyze` and `/health` endpoints for NLP and CV-style inference
- `MongoDB Atlas`
  Stores complaints, verified payments, pending Razorpay orders, and users through Mongoose models

## Environment Setup

Create a `.env` file from `.env.example` and set:

```bash
PORT=3000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/smart-community?retryWrites=true&w=majority
JWT_SECRET=replace-with-a-strong-secret
AI_SERVICE_URL=http://127.0.0.1:5000
DEEPGRAM_API_KEY=your_deepgram_api_key
DEEPGRAM_MODEL=nova-3
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=xxxxxxxx
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@example.com
SMTP_PASS=your_app_password
SMTP_FROM=your_email@example.com
BBMP_EMAIL_TO=comm@bbmp.gov.in
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

Note:
- Voice complaint recording is sent from the browser to the Node backend and then forwarded to Deepgram for transcription.
- If Deepgram is unavailable, the app falls back to browser-side transcription when available.

Seed MongoDB Atlas with demo complaints and users:

```bash
npm run seed
```

To wipe and reseed:

```bash
npm run seed:fresh
```

## Run

Start the Flask AI microservice:

```bash
npm run start:ai
```

Start the Express API:

```bash
npm start
```

Then open:

```bash
http://localhost:3000
```

## Deploy As A Web App

The simplest production setup for this project is:

- `MongoDB Atlas` for the database
- `Render web service` for the Node.js web app
- `Optional Render web service` for the Flask AI microservice
- `Deepgram API` for speech-to-text

Users should open the deployed `Node.js` service URL. The frontend is served by Express, so the app will be accessible from phones, tablets, and laptops through that single public URL.

### 1. Prepare MongoDB Atlas

- Create a cluster
- Create a database user
- Add a network access rule for your deployment
- Copy your `MONGODB_URI`

### 2. Deploy The Flask AI Service

Create a new `Python` web service on Render with:

- Root directory: `ai_service`
- Build command: `pip install -r requirements.txt`
- Start command: `gunicorn app:app`

### 3. Deploy The Node.js Web App

Create a new `Node` web service on Render with:

- Root directory: project root
- Build command: `npm install`
- Start command: `npm start`

Set these environment variables on the `Node` service:

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

Notes:

- Do not set `PORT` manually on Render. Render provides it automatically.
- If you want demo data in production, run `npm run seed` once against your Atlas database before or after deploy.
- If you use Gmail SMTP, use an app password instead of your normal Gmail password.
- If `AI_SERVICE_URL` is not set to a live service, complaint analysis falls back to the built-in Node analyzer.
- Speech transcription uses Deepgram directly from the Node backend, so you do not need a second speech service deployment.

## Key Files

- `src/server.js`
  Express bootstrap and MongoDB Atlas connection startup
- `src/routes/api.js`
  API routes for auth, dashboard, complaints, BBMP email sending, payments, and complaint status updates
- `src/controllers/complaintController.js`
  Sends complaint data to the Flask AI microservice, stores the result in MongoDB, and updates complaint statuses
- `src/controllers/paymentController.js`
  Creates Razorpay orders, verifies signatures, and saves receipts
- `src/controllers/emailController.js`
  Sends the formal complaint report PDF to BBMP through SMTP
- `ai_service/app.py`
  Flask microservice for complaint text and image analysis

## Notes

- The frontend contract was kept largely consistent, so the UI still works through `/api/*` routes.
- The AI stack is now fully local-only: Flask handles the main multimodal analysis and Express keeps an improved built-in fallback analyzer if Flask is unavailable.
- The local detector now uses richer text, image-feature, and location fusion rather than simple one-rule matching, so accuracy is improved without any paid API dependency.
- MongoDB Atlas is required for the new backend to start.
- The current role model is `Admin` and `Citizen`.
- Admins can update complaint statuses, manage alerts, reset dashboard data, and delete accounts through the dashboard.
- Automatic BBMP email sending requires SMTP credentials in `.env`.
