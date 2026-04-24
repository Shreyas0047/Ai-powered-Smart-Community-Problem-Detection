const crypto = require("crypto");

const otpSessions = new Map();
const OTP_TTL_MS = 5 * 60 * 1000;
const OTP_MAX_ATTEMPTS = 5;

function hashOtp(code) {
  return crypto.createHash("sha256").update(String(code)).digest("hex");
}

function cleanupExpiredSessions() {
  const now = Date.now();
  for (const [sessionId, session] of otpSessions.entries()) {
    if (session.expiresAt <= now) {
      otpSessions.delete(sessionId);
    }
  }
}

function createRegistrationOtpSession({ mobileNumber, username, role }) {
  cleanupExpiredSessions();

  const sessionId = crypto.randomBytes(18).toString("hex");
  const otpCode = String(crypto.randomInt(100000, 1000000));

  otpSessions.set(sessionId, {
    mobileNumber,
    username,
    role,
    hashedOtp: hashOtp(otpCode),
    attemptsRemaining: OTP_MAX_ATTEMPTS,
    expiresAt: Date.now() + OTP_TTL_MS
  });

  return {
    sessionId,
    otpCode,
    expiresInSeconds: Math.floor(OTP_TTL_MS / 1000)
  };
}

function verifyRegistrationOtpSession({ sessionId, mobileNumber, username, role, otpCode }) {
  cleanupExpiredSessions();

  const session = otpSessions.get(sessionId);
  if (!session) {
    throw new Error("The OTP session is missing or has expired. Request a new OTP.");
  }

  if (session.expiresAt <= Date.now()) {
    otpSessions.delete(sessionId);
    throw new Error("The OTP has expired. Request a new OTP.");
  }

  if (
    session.mobileNumber !== mobileNumber ||
    session.username !== username ||
    session.role !== role
  ) {
    throw new Error("The registration details do not match the OTP request. Request a new OTP.");
  }

  if (session.attemptsRemaining <= 0) {
    otpSessions.delete(sessionId);
    throw new Error("Too many invalid OTP attempts. Request a new OTP.");
  }

  const isValid = hashOtp(otpCode) === session.hashedOtp;
  if (!isValid) {
    session.attemptsRemaining -= 1;
    if (session.attemptsRemaining <= 0) {
      otpSessions.delete(sessionId);
      throw new Error("Too many invalid OTP attempts. Request a new OTP.");
    }
    throw new Error("Invalid OTP. Check the code and try again.");
  }

  otpSessions.delete(sessionId);
}

module.exports = {
  createRegistrationOtpSession,
  verifyRegistrationOtpSession
};
