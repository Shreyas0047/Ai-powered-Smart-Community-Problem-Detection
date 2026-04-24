const path = require("path");
const dotenv = require("dotenv");

dotenv.config();

module.exports = {
  port: Number(process.env.PORT || 3000),
  publicDir: path.join(__dirname, "..", "..", "public"),
  receiptsDir: path.join(__dirname, "..", "..", "receipts"),
  mongoUri: process.env.MONGODB_URI || "",
  jwtSecret: process.env.JWT_SECRET || "smart-community-demo-secret",
  tokenTtlSeconds: 60 * 60 * 8,
  aiServiceUrl: process.env.AI_SERVICE_URL || "http://127.0.0.1:5000",
  deepgramApiKey: process.env.DEEPGRAM_API_KEY || "",
  deepgramModel: process.env.DEEPGRAM_MODEL || "nova-3",
  twilioAccountSid: process.env.TWILIO_ACCOUNT_SID || "",
  twilioAuthToken: process.env.TWILIO_AUTH_TOKEN || "",
  twilioFromNumber: process.env.TWILIO_FROM_NUMBER || "",
  allowDemoOtp: process.env.ALLOW_DEMO_OTP === "true",
  razorpayKeyId: process.env.RAZORPAY_KEY_ID || "",
  razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET || "",
  smtpHost: process.env.SMTP_HOST || "",
  smtpPort: Number(process.env.SMTP_PORT || 587),
  smtpSecure: process.env.SMTP_SECURE === "true",
  smtpUser: process.env.SMTP_USER || "",
  smtpPass: process.env.SMTP_PASS || "",
  smtpFrom: process.env.SMTP_FROM || process.env.SMTP_USER || "",
  bbmpEmailTo: process.env.BBMP_EMAIL_TO || "comm@bbmp.gov.in",
  corsOrigins: String(process.env.CORS_ORIGIN || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
  allowRoleTokenIssue: process.env.ALLOW_ROLE_TOKEN_ISSUE === "true"
};
