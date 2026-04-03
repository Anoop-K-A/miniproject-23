/**
 * @file Custom error class for consistent error handling
 */

const { ERROR_CODES, HTTP_STATUS } = require("../constants");

class AppError extends Error {
  constructor(
    message,
    statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR,
    code = ERROR_CODES.INTERNAL_ERROR,
    details = null,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.timestamp = new Date().toISOString();

    // Maintain proper stack trace
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Returns error object for response
   */
  toJSON() {
    return {
      success: false,
      message: this.message,
      code: this.code,
      details: this.details,
      timestamp: this.timestamp,
    };
  }
}

// Common error factories
const AppErrorFactory = {
  badRequest: (message, code = ERROR_CODES.VALIDATION_ERROR, details = null) =>
    new AppError(message, HTTP_STATUS.BAD_REQUEST, code, details),

  unauthorized: (
    message = "Unauthorized",
    code = ERROR_CODES.INVALID_TOKEN,
    details = null,
  ) => new AppError(message, HTTP_STATUS.UNAUTHORIZED, code, details),

  forbidden: (
    message = "Forbidden",
    code = ERROR_CODES.UNAUTHORIZED_ROLE,
    details = null,
  ) => new AppError(message, HTTP_STATUS.FORBIDDEN, code, details),

  notFound: (
    message = "Resource not found",
    code = ERROR_CODES.RESOURCE_NOT_FOUND,
    details = null,
  ) => new AppError(message, HTTP_STATUS.NOT_FOUND, code, details),

  conflict: (
    message = "Conflict",
    code = ERROR_CODES.CONFLICT_ERROR,
    details = null,
  ) => new AppError(message, HTTP_STATUS.CONFLICT, code, details),

  unprocessableEntity: (
    message = "Invalid input",
    code = ERROR_CODES.VALIDATION_ERROR,
    details = null,
  ) => new AppError(message, HTTP_STATUS.UNPROCESSABLE_ENTITY, code, details),

  internal: (
    message = "Internal server error",
    code = ERROR_CODES.INTERNAL_ERROR,
    details = null,
  ) => new AppError(message, HTTP_STATUS.INTERNAL_SERVER_ERROR, code, details),

  databaseError: (message = "Database operation failed", details = null) =>
    new AppError(
      message,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      ERROR_CODES.DATABASE_ERROR,
      details,
    ),

  validationError: (message = "Validation failed", details = null) =>
    new AppError(
      message,
      HTTP_STATUS.UNPROCESSABLE_ENTITY,
      ERROR_CODES.VALIDATION_ERROR,
      details,
    ),
};

module.exports = {
  AppError,
  AppErrorFactory,
};
