const { admin } = require("../config/firebase.config");
const User = require("../models/User");
const { isPrimaryAdminEmail } = require("../config/admin.config");
const { sendError } = require("../utils");
const { HTTP_STATUS, ERROR_CODES } = require("../constants");

function userHasAdminRole(user) {
  return user?.role === "admin" || user?.roles?.includes("admin");
}

function isPrimaryAdminUser(user) {
  return userHasAdminRole(user) && isPrimaryAdminEmail(user.email);
}

/**
 * Middleware to verify Firebase ID token and load user from MongoDB
 * Expects token in Authorization header: "Bearer <token>"
 */
async function verifyToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return sendError(
        res,
        "No authorization token provided",
        HTTP_STATUS.UNAUTHORIZED,
        ERROR_CODES.NO_TOKEN_PROVIDED,
      );
    }

    const token = authHeader.split("Bearer ")[1];

    // Verify the Firebase ID token
    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(token);
    } catch (firebaseError) {
      if (firebaseError.code === "auth/id-token-expired") {
        return sendError(
          res,
          "Authorization token has expired",
          HTTP_STATUS.UNAUTHORIZED,
          ERROR_CODES.TOKEN_EXPIRED,
        );
      }
      return sendError(
        res,
        "Invalid authorization token",
        HTTP_STATUS.UNAUTHORIZED,
        ERROR_CODES.INVALID_TOKEN,
      );
    }

    const firebaseUid = decodedToken.uid;

    // Fetch user data from MongoDB
    const user = await User.findOne({ firebaseUid }).select("+password");

    if (!user) {
      return sendError(
        res,
        "User not found",
        HTTP_STATUS.NOT_FOUND,
        ERROR_CODES.USER_NOT_FOUND,
      );
    }

    // Check if account is deleted
    if (user.deletedAt) {
      return sendError(
        res,
        "User account has been deleted",
        HTTP_STATUS.FORBIDDEN,
        ERROR_CODES.ACCOUNT_INACTIVE,
      );
    }

    // Check user status
    if (user.status === "inactive") {
      return sendError(
        res,
        "User account is inactive",
        HTTP_STATUS.FORBIDDEN,
        ERROR_CODES.ACCOUNT_INACTIVE,
      );
    }

    // Record successful login
    user.recordLogin(req.ip);
    await user.save();

    // Attach user to request
    req.user = user;
    req.firebaseUid = firebaseUid;

    next();
  } catch (error) {
    console.error("Token verification error:", error.message);
    return sendError(
      res,
      "Authentication failed",
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      ERROR_CODES.INTERNAL_ERROR,
      { originalError: error.message },
    );
  }
}

/**
 * Middleware to require admin role
 */
function requireAdmin(req, res, next) {
  if (!req.user) {
    return sendError(
      res,
      "Authentication required",
      HTTP_STATUS.UNAUTHORIZED,
      ERROR_CODES.INVALID_TOKEN,
    );
  }

  if (!userHasAdminRole(req.user)) {
    return sendError(
      res,
      "Admin access required",
      HTTP_STATUS.FORBIDDEN,
      ERROR_CODES.UNAUTHORIZED_ROLE,
    );
  }

  next();
}

/**
 * Middleware to require primary admin role
 */
function requirePrimaryAdmin(req, res, next) {
  if (!req.user) {
    return sendError(
      res,
      "Authentication required",
      HTTP_STATUS.UNAUTHORIZED,
      ERROR_CODES.INVALID_TOKEN,
    );
  }

  if (!isPrimaryAdminUser(req.user)) {
    return sendError(
      res,
      "Primary admin access required",
      HTTP_STATUS.FORBIDDEN,
      ERROR_CODES.UNAUTHORIZED_ROLE,
    );
  }

  next();
}

/**
 * Middleware to require specific role
 */
function requireRole(roleOrRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(
        res,
        "Authentication required",
        HTTP_STATUS.UNAUTHORIZED,
        ERROR_CODES.INVALID_TOKEN,
      );
    }

    const roles = Array.isArray(roleOrRoles) ? roleOrRoles : [roleOrRoles];
    const hasRequiredRole = roles.some(
      (role) => req.user.role === role || req.user.roles?.includes(role),
    );

    if (!hasRequiredRole) {
      return sendError(
        res,
        `Access denied. Required roles: ${roles.join(", ")}`,
        HTTP_STATUS.FORBIDDEN,
        ERROR_CODES.UNAUTHORIZED_ROLE,
      );
    }

    next();
  };
}

module.exports = {
  verifyToken,
  requireAdmin,
  requirePrimaryAdmin,
  requireRole,
  userHasAdminRole,
  isPrimaryAdminUser,
};
