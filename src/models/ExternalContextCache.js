const mongoose = require("mongoose");

const externalContextCacheSchema = new mongoose.Schema(
  {
    provider: { type: String, required: true, trim: true, lowercase: true },
    cacheKey: { type: String, required: true, trim: true },
    payload: { type: mongoose.Schema.Types.Mixed, required: true },
    expiresAt: { type: Date, required: true }
  },
  {
    timestamps: true
  }
);

externalContextCacheSchema.index({ provider: 1, cacheKey: 1 }, { unique: true });
externalContextCacheSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("ExternalContextCache", externalContextCacheSchema);
