const path = require("path");
const dotenv = require("dotenv");

dotenv.config();

function numericEnv(name, fallback, { min = -Infinity, max = Infinity, integer = false } = {}) {
  const raw = process.env[name];
  const value = raw === undefined || raw === "" ? fallback : Number(raw);
  if (!Number.isFinite(value) || value < min || value > max || (integer && !Number.isInteger(value))) {
    throw new Error(`${name} must be ${integer ? "an integer" : "a number"} between ${min} and ${max}.`);
  }
  return value;
}

function assertUrl(name, value, { allowHttp = false } = {}) {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" && !(allowHttp && url.protocol === "http:")) throw new Error("invalid protocol");
  } catch (_error) {
    throw new Error(`${name} must be a valid ${allowHttp ? "HTTP or HTTPS" : "HTTPS"} URL.`);
  }
}

const jwtSecret = process.env.JWT_SECRET || "smart-community-demo-secret";
if (process.env.NODE_ENV === "production" && jwtSecret === "smart-community-demo-secret") {
  throw new Error("JWT_SECRET must be set to a strong secret in production.");
}

const config = {
  port: numericEnv("PORT", 3000, { min: 1, max: 65535, integer: true }),
  publicDir: path.join(__dirname, "..", "..", "public"),
  mongoUri: process.env.MONGODB_URI || "",
  jwtSecret,
  tokenTtlSeconds: 60 * 60 * 8,
  aiServiceUrl: String(process.env.AI_SERVICE_URL || "http://127.0.0.1:5000").trim(),
  aiServiceToken: String(process.env.AI_SERVICE_TOKEN || "").trim(),
  aiServiceTimeoutMs: numericEnv("AI_SERVICE_TIMEOUT_MS", 30000, { min: 3000, max: 120000, integer: true }),
  deepgramApiKey: String(process.env.DEEPGRAM_API_KEY || "").trim(),
  deepgramModel: String(process.env.DEEPGRAM_MODEL || "nova-3").trim(),
  weatherstackApiKey: String(process.env.WEATHERSTACK_API_KEY || "").trim(),
  weatherstackBaseUrl: String(process.env.WEATHERSTACK_BASE_URL || "http://api.weatherstack.com").trim(),
  weatherstackEnabled: process.env.WEATHERSTACK_ENABLED !== "false",
  weatherstackMonthlyLimit: numericEnv("WEATHERSTACK_MONTHLY_LIMIT", 90, { min: 1, max: 100000, integer: true }),
  weatherCacheTtlMinutes: numericEnv("WEATHER_CACHE_TTL_MINUTES", 45, { min: 5, max: 1440, integer: true }),
  zenserpApiKey: String(process.env.ZENSERP_API_KEY || "").trim(),
  zenserpBaseUrl: String(process.env.ZENSERP_BASE_URL || "https://app.zenserp.com/api/v2/search").trim(),
  zenserpEnabled: process.env.ZENSERP_ENABLED !== "false",
  zenserpMonthlyLimit: numericEnv("ZENSERP_MONTHLY_LIMIT", 48, { min: 1, max: 100000, integer: true }),
  zenserpPublicCacheHours: numericEnv("ZENSERP_PUBLIC_CACHE_HOURS", 6, { min: 1, max: 72, integer: true }),
  smtpHost: process.env.SMTP_HOST || "",
  smtpPort: numericEnv("SMTP_PORT", 587, { min: 1, max: 65535, integer: true }),
  smtpSecure: process.env.SMTP_SECURE === "true",
  smtpFamily: numericEnv("SMTP_FAMILY", 4, { min: 4, max: 6, integer: true }),
  smtpUser: process.env.SMTP_USER || "",
  smtpPass: process.env.SMTP_PASS || "",
  smtpFrom: process.env.SMTP_FROM || process.env.SMTP_USER || "",
  bbmpEmailTo: process.env.BBMP_EMAIL_TO || "comm@bbmp.gov.in",
  authorityAdapter: String(process.env.AUTHORITY_ADAPTER || "disabled").trim().toLowerCase(),
  authorityWebhookUrl: String(process.env.AUTHORITY_WEBHOOK_URL || "").trim(),
  authorityWebhookToken: String(process.env.AUTHORITY_WEBHOOK_TOKEN || "").trim(),
  authorityTicketEmail: String(process.env.AUTHORITY_TICKET_EMAIL || process.env.BBMP_EMAIL_TO || "").trim(),
  authorityTimeoutMs: numericEnv("AUTHORITY_TIMEOUT_MS", 8000, { min: 1000, max: 120000, integer: true }),
  authorityMaxAttempts: numericEnv("AUTHORITY_MAX_ATTEMPTS", 3, { min: 1, max: 10, integer: true }),
  corsOrigins: String(process.env.CORS_ORIGIN || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
  allowRoleTokenIssue: process.env.ALLOW_ROLE_TOKEN_ISSUE === "true"
};

function validateConfiguration(env = config) {
  if (![4, 6].includes(env.smtpFamily)) throw new Error("SMTP_FAMILY must be 4 or 6.");
  if (!new Set(["disabled", "email", "webhook"]).has(env.authorityAdapter)) {
    throw new Error("AUTHORITY_ADAPTER must be disabled, email, or webhook.");
  }
  assertUrl("AI_SERVICE_URL", env.aiServiceUrl, { allowHttp: process.env.NODE_ENV !== "production" });
  assertUrl("WEATHERSTACK_BASE_URL", env.weatherstackBaseUrl, { allowHttp: true });
  assertUrl("ZENSERP_BASE_URL", env.zenserpBaseUrl);
  if (env.authorityAdapter === "webhook") assertUrl("AUTHORITY_WEBHOOK_URL", env.authorityWebhookUrl);
  if (env.authorityAdapter === "email" && !/@/.test(env.authorityTicketEmail)) {
    throw new Error("AUTHORITY_TICKET_EMAIL must be configured when AUTHORITY_ADAPTER=email.");
  }
  if (process.env.NODE_ENV === "production") {
    if (String(env.jwtSecret).length < 32) throw new Error("JWT_SECRET must contain at least 32 characters in production.");
    if (!env.mongoUri) throw new Error("MONGODB_URI must be configured in production.");
    if (!process.env.AI_SERVICE_URL) throw new Error("AI_SERVICE_URL must be configured in production.");
    if (env.aiServiceToken.length < 32) throw new Error("AI_SERVICE_TOKEN must contain at least 32 characters in production.");
    if (![env.smtpHost, env.smtpUser, env.smtpPass, env.smtpFrom].every(Boolean)) {
      throw new Error("SMTP_HOST, SMTP_USER, SMTP_PASS, and SMTP_FROM must be configured in production for OTP delivery.");
    }
    if (env.allowRoleTokenIssue) throw new Error("ALLOW_ROLE_TOKEN_ISSUE must remain false in production.");
  }
  return true;
}

validateConfiguration();

module.exports = config;
module.exports.validateConfiguration = validateConfiguration;
