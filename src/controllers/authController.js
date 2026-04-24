const env = require("../config/env");
const { rolePermissions } = require("../config/roles");
const { issueRoleToken, hashPassword, verifyPassword, hashOneTimeCode, verifyOneTimeCode } = require("../utils/auth");
const User = require("../models/User");
const RegistrationOtp = require("../models/RegistrationOtp");
const { sendRegistrationOtpEmail } = require("../services/emailService");
const crypto = require("crypto");

const USERNAME_PATTERN = /^[A-Za-z0-9_.-]{3,32}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 128;
const OTP_TTL_MS = 10 * 60 * 1000;
const OTP_MAX_ATTEMPTS = 5;
const LOGIN_LOCK_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_LOCK_THRESHOLD = 6;
const loginFailureBuckets = new Map();

function createHttpError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function normalizeValue(value) {
  return String(value || "").trim();
}

function normalizeEmail(value) {
  return normalizeValue(value).toLowerCase();
}

function validateRole(role) {
  if (!rolePermissions[role]) {
    throw createHttpError("Invalid role selected.", 400);
  }
}

function validateUsername(username) {
  if (!USERNAME_PATTERN.test(username)) {
    throw createHttpError("Username must be 3-32 characters and use only letters, numbers, dot, underscore, or dash.", 400);
  }
}

function validatePassword(password) {
  if (typeof password !== "string") {
    throw createHttpError("Password is required.", 400);
  }

  if (password.length < PASSWORD_MIN_LENGTH || password.length > PASSWORD_MAX_LENGTH) {
    throw createHttpError(`Password must be between ${PASSWORD_MIN_LENGTH} and ${PASSWORD_MAX_LENGTH} characters.`, 400);
  }
}

function validateEmail(email) {
  if (!EMAIL_PATTERN.test(email)) {
    throw createHttpError("Enter a valid email address.", 400);
  }
}

function getLoginAttemptKey(req, username) {
  const forwarded = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim();
  const ip = forwarded || req.ip || req.socket?.remoteAddress || "unknown";
  return `${ip}:${username}`;
}

function assertLoginNotLocked(req, username) {
  const key = getLoginAttemptKey(req, username);
  const bucket = loginFailureBuckets.get(key);

  if (!bucket) {
    return;
  }

  if (Date.now() > bucket.lockUntil) {
    loginFailureBuckets.delete(key);
    return;
  }

  throw createHttpError("Too many failed login attempts. Please wait a few minutes and try again.", 429);
}

function recordLoginFailure(req, username) {
  const key = getLoginAttemptKey(req, username);
  const now = Date.now();
  const bucket = loginFailureBuckets.get(key);

  if (!bucket || now > bucket.lockUntil) {
    loginFailureBuckets.set(key, { count: 1, lockUntil: now + LOGIN_LOCK_WINDOW_MS });
    return;
  }

  bucket.count += 1;
  if (bucket.count >= LOGIN_LOCK_THRESHOLD) {
    bucket.lockUntil = now + LOGIN_LOCK_WINDOW_MS;
  }
}

function clearLoginFailures(req, username) {
  loginFailureBuckets.delete(getLoginAttemptKey(req, username));
}

function generateOtpCode() {
  return String(crypto.randomInt(100000, 1000000));
}

function formatAuthError(error) {
  if (error?.code === 11000) {
    if (error.keyPattern?.username || error.keyValue?.username) {
      return createHttpError("Username already exists.", 409);
    }

    if (error.keyPattern?.email || error.keyValue?.email || String(error.message || "").includes("email_1")) {
      return createHttpError("Email is already registered.", 409);
    }
  }

  return error;
}

async function getRoles(_req, res) {
  res.json({
    roles: Object.keys(rolePermissions),
    permissions: rolePermissions
  });
}

async function issueToken(req, res, next) {
  try {
    if (!env.allowRoleTokenIssue) {
      throw createHttpError("Direct token issuing is disabled for security.", 403);
    }

    const role = normalizeValue(req.body.role);
    const username = normalizeValue(req.body.username);
    validateRole(role);
    validateUsername(username);

    const token = issueRoleToken(role, username);
    res.json({
      token,
      role,
      username,
      permissions: rolePermissions[role],
      expiresInSeconds: env.tokenTtlSeconds
    });
  } catch (error) {
    next(formatAuthError(error));
  }
}

async function register(req, res, next) {
  try {
    const username = normalizeValue(req.body.username);
    const email = normalizeEmail(req.body.email);
    const password = req.body.password;
    const role = normalizeValue(req.body.role);
    const otp = normalizeValue(req.body.otp);

    if (!username || !email || !password || !role || !otp) {
      throw createHttpError("Username, email, password, role, and OTP are required.", 400);
    }

    validateRole(role);
    validateUsername(username);
    validateEmail(email);
    validatePassword(password);

    const [existingUsername, existingEmail] = await Promise.all([
      User.findOne({ username }),
      User.findOne({ email })
    ]);

    if (existingUsername) {
      throw createHttpError("Username already exists.", 409);
    }

    if (existingEmail) {
      throw createHttpError("Email is already registered.", 409);
    }

    const pendingRegistration = await RegistrationOtp.findOne({ username, email, role });
    if (!pendingRegistration) {
      throw createHttpError("Request an OTP before completing registration.", 400);
    }

    if (pendingRegistration.expiresAt.getTime() < Date.now()) {
      await RegistrationOtp.deleteOne({ _id: pendingRegistration._id });
      throw createHttpError("The OTP has expired. Request a new OTP and try again.", 400);
    }

    if (!verifyPassword(password, pendingRegistration.passwordHash)) {
      throw createHttpError("The password does not match the one used when requesting the OTP.", 400);
    }

    if (!verifyOneTimeCode(otp, pendingRegistration.otpHash)) {
      pendingRegistration.attempts += 1;
      if (pendingRegistration.attempts >= OTP_MAX_ATTEMPTS) {
        await RegistrationOtp.deleteOne({ _id: pendingRegistration._id });
        throw createHttpError("Too many incorrect OTP attempts. Request a new OTP and try again.", 429);
      }

      await pendingRegistration.save();
      throw createHttpError("Incorrect OTP. Check the email and try again.", 400);
    }

    await User.create({
      username,
      email,
      passwordHash: pendingRegistration.passwordHash,
      role
    });
    await RegistrationOtp.deleteOne({ _id: pendingRegistration._id });

    const token = issueRoleToken(role, username);
    res.json({
      token,
      role,
      username,
      permissions: rolePermissions[role],
      expiresInSeconds: env.tokenTtlSeconds
    });
  } catch (error) {
    next(formatAuthError(error));
  }
}

async function requestRegistrationOtp(req, res, next) {
  try {
    const username = normalizeValue(req.body.username);
    const email = normalizeEmail(req.body.email);
    const password = req.body.password;
    const role = normalizeValue(req.body.role);

    if (!username || !email || !password || !role) {
      throw createHttpError("Username, email, password, and role are required.", 400);
    }

    validateRole(role);
    validateUsername(username);
    validateEmail(email);
    validatePassword(password);

    const [existingUsername, existingEmail] = await Promise.all([
      User.findOne({ username }),
      User.findOne({ email })
    ]);

    if (existingUsername) {
      throw createHttpError("Username already exists.", 409);
    }

    if (existingEmail) {
      throw createHttpError("Email is already registered.", 409);
    }

    const otp = generateOtpCode();
    const expiresAt = new Date(Date.now() + OTP_TTL_MS);

    await RegistrationOtp.findOneAndUpdate(
      { $or: [{ username }, { email }] },
      {
        username,
        email,
        role,
        passwordHash: hashPassword(password),
        otpHash: hashOneTimeCode(otp),
        attempts: 0,
        expiresAt
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    await sendRegistrationOtpEmail({
      email,
      otp,
      username
    });

    res.json({
      message: `An OTP has been sent to ${email}. Enter it to complete registration.`,
      expiresInMinutes: OTP_TTL_MS / 60000
    });
  } catch (error) {
    next(formatAuthError(error));
  }
}

async function login(req, res, next) {
  try {
    const username = normalizeValue(req.body.username);
    const password = req.body.password;
    const role = normalizeValue(req.body.role);

    if (!username || !password || !role) {
      throw createHttpError("Username, password, and role are required.", 400);
    }

    validateRole(role);
    validateUsername(username);
    validatePassword(password);
    assertLoginNotLocked(req, username);

    const user = await User.findOne({ username, role });
    if (!user || !verifyPassword(password, user.passwordHash)) {
      recordLoginFailure(req, username);
      throw createHttpError("Invalid username, password, or role.", 401);
    }
    clearLoginFailures(req, username);

    const token = issueRoleToken(user.role, user.username);
    res.json({
      token,
      role: user.role,
      username: user.username,
      permissions: rolePermissions[user.role],
      expiresInSeconds: env.tokenTtlSeconds
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getRoles,
  issueToken,
  requestRegistrationOtp,
  register,
  login
};
