/**
 * @file Response wrapper for standardized API responses
 */

const { HTTP_STATUS } = require("../constants/http-status");

/**
 * Standardized success response
 * @param {Object} data - Response data
 * @param {string} message - Response message
 * @returns {Object}
 */
function successResponse(data = null, message = "Success") {
  return {
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Standardized error response
 * @param {string} message - Error message
 * @param {string} code - Error code
 * @param {*} details - Error details
 * @returns {Object}
 */
function errorResponse(
  message = "An error occurred",
  code = "INTERNAL_ERROR",
  details = null,
) {
  return {
    success: false,
    message,
    code,
    details,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Send standardized success response
 * @param {Object} res - Express response object
 * @param {*} data - Response data
 * @param {string} message - Response message
 * @param {number} statusCode - HTTP status code
 */
function sendSuccess(
  res,
  data = null,
  message = "Success",
  statusCode = HTTP_STATUS.OK,
) {
  return res.status(statusCode).json(successResponse(data, message));
}

/**
 * Send standardized error response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code
 * @param {string} code - Error code
 * @param {*} details - Error details
 */
function sendError(
  res,
  message = "An error occurred",
  statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR,
  code = "INTERNAL_ERROR",
  details = null,
) {
  return res.status(statusCode).json(errorResponse(message, code, details));
}

module.exports = {
  successResponse,
  errorResponse,
  sendSuccess,
  sendError,
};
