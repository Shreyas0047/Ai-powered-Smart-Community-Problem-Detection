const express = require("express");
const cors = require("cors");
const path = require("path");
const env = require("./config/env");
const apiRoutes = require("./routes/api");
const { setSecurityHeaders, createRateLimiter } = require("./middleware/security");

const app = express();
const allowedOrigins = new Set([`http://localhost:${env.port}`, `http://127.0.0.1:${env.port}`, ...env.corsOrigins]);

app.disable("x-powered-by");

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
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));
app.use("/api", createRateLimiter({ windowMs: 10 * 60 * 1000, max: 180, keyPrefix: "api", message: "Too many API requests. Please slow down and try again shortly." }));
app.use("/api/auth", createRateLimiter({ windowMs: 10 * 60 * 1000, max: 20, keyPrefix: "auth", message: "Too many authentication attempts. Please wait a few minutes and try again." }));

app.use("/api", apiRoutes);
app.use("/receipts", express.static(env.receiptsDir));
app.use(express.static(env.publicDir));

app.get("*", (_req, res) => {
  res.sendFile(path.join(env.publicDir, "index.html"));
});

app.use((error, _req, res, _next) => {
  res.status(error.statusCode || 400).json({
    error: error.message || "Unexpected server error"
  });
});

module.exports = app;
