/**
 * @file Error handling middleware
 * Centralized error handling for all routes
 */

const { sendError } = require("../utils");
const { HTTP_STATUS, ERROR_CODES } = require("../constants");
const { AppError } = require("../utils");

/**
 * Global error handler middleware
 * Should be the last middleware in the stack
 */
function errorHandler(err, req, res, next) {
  // Set default error status and code
  let statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR;
  let message = "Internal server error";
  let code = ERROR_CODES.INTERNAL_ERROR;
  let details = null;

  // Handle AppError instances
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    code = err.code;
    details = err.details;
  }
  // Handle Mongoose validation errors
  else if (err.name === "ValidationError") {
    statusCode = HTTP_STATUS.UNPROCESSABLE_ENTITY;
    message = "Validation error";
    code = ERROR_CODES.VALIDATION_ERROR;
    details = Object.entries(err.errors).map(([field, error]) => ({
      field,
      message: error.message,
    }));
  }
  // Handle Mongoose cast errors
  else if (err.name === "CastError") {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    message = `Invalid ${err.path}: ${err.value}`;
    code = ERROR_CODES.INVALID_INPUT;
  }
  // Handle Mongoose duplicate key error
  else if (err.code === 11000) {
    statusCode = HTTP_STATUS.CONFLICT;
    message = `Duplicate field value entered`;
    code = ERROR_CODES.CONFLICT_ERROR;
    const field = Object.keys(err.keyPattern)[0];
    details = { field, value: err.keyValue[field] };
  }
  // Handle JWT errors
  else if (err.name === "JsonWebTokenError") {
    statusCode = HTTP_STATUS.UNAUTHORIZED;
    message = "Invalid token";
    code = ERROR_CODES.INVALID_TOKEN;
  }
  // Handle JWT expiry
  else if (err.name === "TokenExpiredError") {
    statusCode = HTTP_STATUS.UNAUTHORIZED;
    message = "Token expired";
    code = ERROR_CODES.TOKEN_EXPIRED;
  }

  // Log error details
  console.error("[ERROR]", {
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.path,
    statusCode,
    message,
    code,
    error: err.message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });

  // Send error response
  return sendError(res, message, statusCode, code, details);
}

/**
 * 404 Not Found middleware
 */
function notFoundHandler(req, res, next) {
  const message = `Route ${req.method} ${req.path} not found`;
  return sendError(
    res,
    message,
    HTTP_STATUS.NOT_FOUND,
    ERROR_CODES.RESOURCE_NOT_FOUND,
  );
}

module.exports = {
  errorHandler,
  notFoundHandler,
};
