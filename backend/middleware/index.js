/**
 * @file Central export for all middleware
 */

const {
  verifyToken,
  requireAdmin,
  requirePrimaryAdmin,
  requireRole,
  userHasAdminRole,
  isPrimaryAdminUser,
} = require("./auth.middleware");
const { errorHandler, notFoundHandler } = require("./error.middleware");
const { requestLogger } = require("./request-logger.middleware");
const { upload } = require("./upload.middleware");

module.exports = {
  // Auth middleware
  verifyToken,
  requireAdmin,
  requirePrimaryAdmin,
  requireRole,
  userHasAdminRole,
  isPrimaryAdminUser,
  // Error & logging
  errorHandler,
  notFoundHandler,
  requestLogger,
  // File upload
  upload,
};
