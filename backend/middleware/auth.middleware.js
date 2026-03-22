const { admin } = require("../config/firebase.config");
const User = require("../models/User");
const { isPrimaryAdminEmail } = require("../config/admin.config");

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
      return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.split("Bearer ")[1];

    // Verify the Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(token);
    const firebaseUid = decodedToken.uid;

    // Fetch user data from MongoDB
    const user = await User.findOne({ firebaseUid });

    if (!user) {
      return res.status(404).json({ error: "User not found in database" });
    }

    // Check user status
    if (user.status === "inactive") {
      return res.status(403).json({ error: "User account is inactive" });
    }

    // Attach user to request
    req.user = user;
    req.firebaseUid = firebaseUid;

    next();
  } catch (error) {
    console.error("Token verification error:", error.message);
    return res.status(401).json({
      error: "Invalid or expired token",
      details: error.message,
    });
  }
}

/**
 * Middleware to check if user is admin
 */
async function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: "No user in request" });
  }

  if (!isPrimaryAdminUser(req.user)) {
    return res.status(403).json({ error: "Admin access required" });
  }

  next();
}

/**
 * Middleware to check if user has specified role(s)
 */
function requireRole(allowedRoles) {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "No user in request" });
    }

    const normalizedUserRoles = new Set(
      [req.user.role, ...(req.user.roles || [])].filter(Boolean),
    );

    if (
      normalizedUserRoles.has("admin") &&
      !isPrimaryAdminEmail(req.user.email)
    ) {
      normalizedUserRoles.delete("admin");
    }

    const hasRole = allowedRoles.some((role) => normalizedUserRoles.has(role));

    if (!hasRole) {
      return res.status(403).json({
        error: `Access required. Allowed roles: ${allowedRoles.join(", ")}`,
      });
    }

    next();
  };
}

/**
 * Optional authentication middleware - doesn't fail if no token
 */
async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next();
    }

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await admin.auth().verifyIdToken(token);

    const user = await User.findOne({ firebaseUid: decodedToken.uid });

    if (user) {
      req.user = user;
      req.firebaseUid = decodedToken.uid;
    }

    next();
  } catch (error) {
    // Silently fail, continue without user
    next();
  }
}

module.exports = {
  verifyToken,
  requireAdmin,
  requireRole,
  optionalAuth,
};
