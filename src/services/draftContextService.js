const crypto = require("crypto");
const {
  buildExternalCacheKey,
  getCachedExternalContext,
  normalizeCachePart,
  setCachedExternalContext
} = require("./externalContextCacheService");

const DRAFT_CONTEXT_TTL_MS = 2 * 60 * 60 * 1000;
const ALLOWED_CONTEXT_TYPES = new Set(["image_analysis", "weather", "civic_evidence"]);

function normalizeOwnerId(auth = {}) {
  return String(auth.userId || auth.username || "").trim();
}

function locationFingerprint(location, mapLocation) {
  const normalizedLocation = normalizeCachePart(location)
    .replace(/\b(bengaluru|bangalore|karnataka|india)\b/g, " ")
    .replace(/[,\s]+/g, " ")
    .trim();
  const lat = Number(mapLocation?.lat);
  const lng = Number(mapLocation?.lng);
  if (normalizedLocation) return normalizedLocation;
  return [
    Number.isFinite(lat) ? lat.toFixed(3) : "",
    Number.isFinite(lng) ? lng.toFixed(3) : ""
  ].join("|");
}

async function issueDraftContext({ auth, type, location = "", mapLocation = null, payload }) {
  if (!ALLOWED_CONTEXT_TYPES.has(type) || !payload) return "";

  const token = crypto.randomBytes(24).toString("base64url");
  const stored = await setCachedExternalContext({
    provider: "draft_context",
    cacheKey: buildExternalCacheKey(["draft", token]),
    payload: {
      ownerId: normalizeOwnerId(auth),
      type,
      locationFingerprint: locationFingerprint(location, mapLocation),
      value: payload
    },
    ttlMs: DRAFT_CONTEXT_TTL_MS
  });

  return stored ? token : "";
}

async function readDraftContext({ auth, token, type, location = "", mapLocation = null }) {
  const normalizedToken = String(token || "").trim();
  if (!/^[A-Za-z0-9_-]{32}$/.test(normalizedToken) || !ALLOWED_CONTEXT_TYPES.has(type)) return null;

  const cached = await getCachedExternalContext({
    provider: "draft_context",
    cacheKey: buildExternalCacheKey(["draft", normalizedToken])
  });
  const record = cached?.payload;
  if (!record || record.type !== type || record.ownerId !== normalizeOwnerId(auth)) {
    return null;
  }

  if (
    type !== "image_analysis" &&
    record.locationFingerprint !== locationFingerprint(location, mapLocation)
  ) {
    return null;
  }

  return record.value || null;
}

module.exports = {
  issueDraftContext,
  locationFingerprint,
  readDraftContext
};
