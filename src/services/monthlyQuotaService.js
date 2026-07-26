const ExternalApiUsage = require("../models/ExternalApiUsage");
const mongoose = require("mongoose");

function getUtcMonthKey(date = new Date()) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

function buildQuotaSnapshot({ provider, month, limit, count }) {
  const safeLimit = Math.max(0, Number(limit || 0));
  const safeCount = Math.max(0, Number(count || 0));
  return {
    provider,
    month,
    limit: safeLimit,
    used: safeCount,
    remaining: Math.max(0, safeLimit - safeCount)
  };
}

async function reserveMonthlyQuota({ provider, limit }) {
  const safeProvider = String(provider || "").trim().toLowerCase();
  const safeLimit = Math.max(0, Number(limit || 0));
  const month = getUtcMonthKey();

  if (!safeProvider || safeLimit <= 0) {
    return {
      allowed: false,
      reason: "Monthly quota is not configured.",
      quota: buildQuotaSnapshot({ provider: safeProvider, month, limit: safeLimit, count: 0 })
    };
  }

  if (mongoose.connection.readyState !== 1) {
    return {
      allowed: false,
      reason: "Monthly quota could not be verified.",
      quota: buildQuotaSnapshot({ provider: safeProvider, month, limit: safeLimit, count: 0 })
    };
  }

  try {
    await ExternalApiUsage.updateOne(
      { provider: safeProvider, month },
      { $setOnInsert: { provider: safeProvider, month, count: 0, limit: safeLimit } },
      { upsert: true }
    );

    const usage = await ExternalApiUsage.findOneAndUpdate(
      {
        provider: safeProvider,
        month,
        count: { $lt: safeLimit }
      },
      {
        $inc: { count: 1 },
        $set: { limit: safeLimit, lastUsedAt: new Date() }
      },
      {
        new: true
      }
    ).lean();

    if (!usage) {
      const existing = await ExternalApiUsage.findOne({ provider: safeProvider, month }).lean();
      const quota = buildQuotaSnapshot({
        provider: safeProvider,
        month,
        limit: safeLimit,
        count: existing?.count || safeLimit
      });
      console.info(JSON.stringify({ event: "external_api_quota_skip", provider: safeProvider, month, used: quota.used, limit: quota.limit }));
      return {
        allowed: false,
        reason: "Monthly quota reached.",
        quota
      };
    }

    const quota = buildQuotaSnapshot({
      provider: safeProvider,
      month,
      limit: safeLimit,
      count: usage.count
    });
    console.info(JSON.stringify({ event: "external_api_quota_reserved", provider: safeProvider, month, used: quota.used, limit: quota.limit }));
    return {
      allowed: true,
      quota
    };
  } catch (error) {
    console.warn(
      JSON.stringify({
        event: "external_api_quota_unavailable",
        provider: safeProvider,
        month,
        reason: error.message || "unknown quota error"
      })
    );
    return {
      allowed: false,
      reason: "Monthly quota could not be verified.",
      quota: buildQuotaSnapshot({ provider: safeProvider, month, limit: safeLimit, count: 0 })
    };
  }
}

async function getMonthlyQuotaUsage({ provider, limit, date = new Date() }) {
  const safeProvider = String(provider || "").trim().toLowerCase();
  const safeLimit = Math.max(0, Number(limit || 0));
  const month = getUtcMonthKey(date);

  if (!safeProvider || safeLimit <= 0 || mongoose.connection.readyState !== 1) {
    return buildQuotaSnapshot({ provider: safeProvider, month, limit: safeLimit, count: 0 });
  }

  try {
    const usage = await ExternalApiUsage.findOne({ provider: safeProvider, month }).lean();
    return buildQuotaSnapshot({
      provider: safeProvider,
      month,
      limit: safeLimit,
      count: usage?.count || 0
    });
  } catch (error) {
    console.warn(JSON.stringify({
      event: "external_api_quota_read_failed",
      provider: safeProvider,
      month,
      reason: error.message || "unknown quota error"
    }));
    return buildQuotaSnapshot({ provider: safeProvider, month, limit: safeLimit, count: 0 });
  }
}

module.exports = {
  buildQuotaSnapshot,
  getMonthlyQuotaUsage,
  getUtcMonthKey,
  reserveMonthlyQuota
};
