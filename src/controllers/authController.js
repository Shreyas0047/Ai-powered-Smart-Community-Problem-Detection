const env = require("../config/env");
const { rolePermissions } = require("../config/roles");
const { issueRoleToken, hashPassword, verifyPassword } = require("../utils/auth");
const User = require("../models/User");

const USERNAME_PATTERN = /^[A-Za-z0-9_.-]{3,32}$/;
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 128;

function createHttpError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function normalizeValue(value) {
  return String(value || "").trim();
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

function formatAuthError(error) {
  if (error?.code === 11000) {
    if (error.keyPattern?.username || error.keyValue?.username) {
      return createHttpError("Username already exists.", 409);
    }

    if (error.keyPattern?.email || String(error.message || "").includes("email_1")) {
      return createHttpError("A legacy email index was detected in MongoDB. Restart the server once and try registering again.", 409);
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
    const password = req.body.password;
    const role = normalizeValue(req.body.role);

    if (!username || !password || !role) {
      throw createHttpError("Username, password, and role are required.", 400);
    }

    validateRole(role);
    validateUsername(username);
    validatePassword(password);

    const exists = await User.findOne({ username });
    if (exists) {
      throw createHttpError("Username already exists.", 409);
    }

    await User.create({
      username,
      passwordHash: hashPassword(password),
      role
    });

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

    const user = await User.findOne({ username, role });
    if (!user || !verifyPassword(password, user.passwordHash)) {
      throw createHttpError("Invalid username, password, or role.", 401);
    }

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
  register,
  login
};
