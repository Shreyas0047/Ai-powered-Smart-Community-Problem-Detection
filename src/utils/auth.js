const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const env = require("../config/env");
const { rolePermissions } = require("../config/roles");
const tokenIssuer = "ai-smart-community-system";

function issueRoleToken(role, username) {
  const permissions = rolePermissions[role];
  if (!permissions) {
    throw new Error("Unsupported role");
  }

  return jwt.sign(
    {
      role,
      username,
      permissions
    },
    env.jwtSecret,
    {
      issuer: tokenIssuer,
      audience: "smart-community-users",
      algorithm: "HS256",
      expiresIn: env.tokenTtlSeconds
    }
  );
}

function verifyToken(token) {
  return jwt.verify(token, env.jwtSecret, {
    issuer: tokenIssuer,
    audience: "smart-community-users",
    algorithms: ["HS256"]
  });
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password, storedHash) {
  const [salt, hash] = String(storedHash || "").split(":");
  if (!salt || !hash) {
    return false;
  }

  try {
    const storedBuffer = Buffer.from(hash, "hex");
    const derivedBuffer = Buffer.from(crypto.scryptSync(password, salt, 64).toString("hex"), "hex");
    if (storedBuffer.length !== derivedBuffer.length) {
      return false;
    }
    return crypto.timingSafeEqual(storedBuffer, derivedBuffer);
  } catch (_error) {
    return false;
  }
}

function hashOneTimeCode(code) {
  return crypto.createHash("sha256").update(String(code || "")).digest("hex");
}

function verifyOneTimeCode(code, storedHash) {
  const provided = hashOneTimeCode(code);

  try {
    const left = Buffer.from(provided, "hex");
    const right = Buffer.from(String(storedHash || ""), "hex");

    if (left.length !== right.length) {
      return false;
    }

    return crypto.timingSafeEqual(left, right);
  } catch (_error) {
    return false;
  }
}

module.exports = {
  issueRoleToken,
  verifyToken,
  hashPassword,
  verifyPassword,
  hashOneTimeCode,
  verifyOneTimeCode
};
