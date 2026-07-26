const crypto = require("crypto");
const mongoose = require("mongoose");
const ExternalContextCache = require("../models/ExternalContextCache");

function normalizeCachePart(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9.,_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function buildExternalCacheKey(parts = []) {
  const normalized = parts.map(normalizeCachePart).filter(Boolean).join("|");
  return crypto.createHash("sha256").update(normalized || "empty").digest("hex");
}

async function getCachedExternalContext({ provider, cacheKey, now = new Date() }) {
  if (mongoose.connection.readyState !== 1 || !provider || !cacheKey) {
    return null;
  }

  try {
    const record = await ExternalContextCache.findOne({
      provider: String(provider).toLowerCase(),
      cacheKey,
      expiresAt: { $gt: now }
    }).lean();

    return record
      ? {
          payload: record.payload,
          cachedAt: record.updatedAt || record.createdAt,
          expiresAt: record.expiresAt
        }
      : null;
  } catch (error) {
    console.warn(JSON.stringify({
      event: "external_context_cache_read_failed",
      provider,
      reason: error.message || "unknown cache error"
    }));
    return null;
  }
}

async function setCachedExternalContext({ provider, cacheKey, payload, ttlMs }) {
  if (mongoose.connection.readyState !== 1 || !provider || !cacheKey || !payload || Number(ttlMs) <= 0) {
    return false;
  }

  try {
    await ExternalContextCache.findOneAndUpdate(
      { provider: String(provider).toLowerCase(), cacheKey },
      {
        $set: {
          payload,
          expiresAt: new Date(Date.now() + Number(ttlMs))
        }
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    return true;
  } catch (error) {
    console.warn(JSON.stringify({
      event: "external_context_cache_write_failed",
      provider,
      reason: error.message || "unknown cache error"
    }));
    return false;
  }
}

module.exports = {
  buildExternalCacheKey,
  getCachedExternalContext,
  normalizeCachePart,
  setCachedExternalContext
};
