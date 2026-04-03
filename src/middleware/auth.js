const { verifyToken } = require("../utils/auth");

function authenticate(req, _res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    if (!authHeader.startsWith("Bearer ")) {
      const error = new Error("Missing bearer token");
      error.statusCode = 401;
      throw error;
    }

    req.auth = verifyToken(authHeader.slice("Bearer ".length));
    next();
  } catch (error) {
    error.statusCode = error.statusCode || 401;
    next(error);
  }
}

function requirePermission(permission) {
  return (req, _res, next) => {
    try {
      if (!req.auth?.permissions?.includes(permission)) {
        const error = new Error("Permission denied");
        error.statusCode = 403;
        throw error;
      }
      next();
    } catch (error) {
      next(error);
    }
  };
}

module.exports = {
  authenticate,
  requirePermission
};
