const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
const env = require("./config/env");
const apiRoutes = require("./routes/api");
const { setSecurityHeaders, setNoStoreHeaders, createRateLimiter } = require("./middleware/security");
const { refreshAiServiceConnectionStatus } = require("./services/aiClient");

const app = express();
const allowedOrigins = new Set([`http://localhost:${env.port}`, `http://127.0.0.1:${env.port}`, ...env.corsOrigins]);

app.disable("x-powered-by");
app.set("trust proxy", 1);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) {
        return callback(null, true);
      }

      return callback(new Error("CORS blocked for this origin."));
    }
  })
);
app.use(setSecurityHeaders);
app.use(express.json({ limit: "12mb" }));
app.use(express.urlencoded({ extended: true, limit: "12mb" }));
app.use("/api/auth", setNoStoreHeaders);
app.use("/api/transcribe-audio", setNoStoreHeaders);
app.use("/api/chatbot", setNoStoreHeaders);
app.use("/api/context", setNoStoreHeaders);
app.use("/api/analyze-image", setNoStoreHeaders);
app.use("/api", createRateLimiter({ windowMs: 10 * 60 * 1000, max: 180, keyPrefix: "api", message: "Too many API requests. Please slow down and try again shortly." }));
app.use("/api/auth", createRateLimiter({ windowMs: 10 * 60 * 1000, max: 20, keyPrefix: "auth", message: "Too many authentication attempts. Please wait a few minutes and try again." }));
app.use("/api/auth/register/request-otp", createRateLimiter({ windowMs: 10 * 60 * 1000, max: 6, keyPrefix: "otp", message: "Too many OTP requests. Please wait before requesting another code." }));
app.use("/api/auth/password-reset/request-otp", createRateLimiter({ windowMs: 10 * 60 * 1000, max: 6, keyPrefix: "password-reset-otp", message: "Too many password reset OTP requests. Please wait before requesting another code." }));
app.use("/api/transcribe-audio", createRateLimiter({ windowMs: 10 * 60 * 1000, max: 25, keyPrefix: "stt", message: "Too many transcription requests. Please wait and try again." }));
app.use("/api/chatbot", createRateLimiter({ windowMs: 10 * 60 * 1000, max: 40, keyPrefix: "chatbot", message: "Too many chatbot requests. Please wait and try again." }));
app.use("/api/context/weather-preview", createRateLimiter({ windowMs: 10 * 60 * 1000, max: 15, keyPrefix: "weather-preview", message: "Too many local condition checks. Please wait before trying again." }));
app.use("/api/context/civic-preview", createRateLimiter({ windowMs: 10 * 60 * 1000, max: 10, keyPrefix: "civic-preview", message: "Too many civic context checks. Please wait before trying again." }));
app.use("/api/complaints", createRateLimiter({ windowMs: 10 * 60 * 1000, max: 45, keyPrefix: "complaint-actions", message: "Too many complaint actions. Please wait and try again." }));

app.use("/api", apiRoutes);
app.use(express.static(env.publicDir));

app.get("/health", async (_req, res) => {
  const databaseReady = mongoose.connection.readyState === 1;
  const aiService = await refreshAiServiceConnectionStatus();
  res.status(databaseReady ? 200 : 503).json({
    status: databaseReady ? "ok" : "degraded",
    service: "urban-pulse-web",
    database: databaseReady ? "connected" : "disconnected",
    aiService
  });
});

app.get("/health/live", (_req, res) => {
  res.json({ status: "ok", service: "urban-pulse-web", check: "liveness" });
});

app.get("/health/ready", (_req, res) => {
  const databaseReady = mongoose.connection.readyState === 1;
  res.status(databaseReady ? 200 : 503).json({ status: databaseReady ? "ready" : "not_ready", service: "urban-pulse-web", database: databaseReady ? "connected" : "disconnected" });
});

app.get("*", (_req, res) => {
  res.sendFile(path.join(env.publicDir, "index.html"));
});

app.use((error, _req, res, _next) => {
  const statusCode = Number(error.statusCode || 500);
  const safeMessage =
    statusCode >= 500 && process.env.NODE_ENV === "production" && !error.userMessage
      ? "Unexpected server error"
      : error.userMessage || error.message || "Unexpected server error";
  res.status(statusCode).json({
    error: safeMessage,
    requestId: _req.requestId || undefined,
    failureStage: error.failureStage || (statusCode >= 500 ? "web_api" : undefined),
    code: error.code || undefined,
    deliveryStatus: error.deliveryStatus || undefined,
    retryable: typeof error.retryable === "boolean" ? error.retryable : undefined
  });
});

module.exports = app;
