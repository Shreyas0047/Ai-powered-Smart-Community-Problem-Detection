const mongoose = require("mongoose");

const registrationOtpSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    role: { type: String, required: true, enum: ["Admin", "Citizen"] },
    passwordHash: { type: String, required: true },
    otpHash: { type: String, required: true },
    attempts: { type: Number, default: 0 },
    expiresAt: { type: Date, required: true, index: { expires: 0 } }
  },
  {
    timestamps: true
  }
);

registrationOtpSchema.index({ username: 1 }, { unique: true });
registrationOtpSchema.index({ email: 1 }, { unique: true });

module.exports = mongoose.model("RegistrationOtp", registrationOtpSchema);
