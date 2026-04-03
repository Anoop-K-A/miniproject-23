/**
 * @file Central export for utilities
 */

const {
  successResponse,
  errorResponse,
  sendSuccess,
  sendError,
} = require("./response");
const { AppError, AppErrorFactory } = require("./error");
const {
  getPaginationParams,
  getPaginationMeta,
  sanitizeUser,
  hasRole,
  buildQuery,
  isValidEmail,
  formatDate,
} = require("./helpers");

module.exports = {
  // Response utilities
  successResponse,
  errorResponse,
  sendSuccess,
  sendError,
  // Error handling
  AppError,
  AppErrorFactory,
  // Helper functions
  getPaginationParams,
  getPaginationMeta,
  sanitizeUser,
  hasRole,
  buildQuery,
  isValidEmail,
  formatDate,
};
