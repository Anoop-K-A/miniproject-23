/**
 * @file Common utility functions
 */

const { PAGINATION } = require("../constants");

/**
 * Extract pagination parameters from query
 * @param {Object} query - Query object
 * @returns {Object} Pagination params { page, limit, skip }
 */
function getPaginationParams(query) {
  let page = parseInt(query.page) || PAGINATION.DEFAULT_PAGE;
  let limit = parseInt(query.limit) || PAGINATION.DEFAULT_LIMIT;

  // Validate bounds
  page = Math.max(1, page);
  limit = Math.min(PAGINATION.MAX_LIMIT, Math.max(1, limit));

  const skip = (page - 1) * limit;

  return { page, limit, skip };
}

/**
 * Build pagination metadata
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @param {number} total - Total items count
 * @returns {Object} Pagination metadata
 */
function getPaginationMeta(page, limit, total) {
  const totalPages = Math.ceil(total / limit);
  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
}

/**
 * Sanitize user object for response
 * @param {Object} user - User document
 * @returns {Object} Sanitized user
 */
function sanitizeUser(user) {
  if (!user) return null;

  const userObj = user.toObject ? user.toObject() : user;
  const { password, firebaseUid, __v, ...sanitized } = userObj;
  return sanitized;
}

/**
 * Check if user has required role
 * @param {Object} user - User object
 * @param {string|string[]} requiredRoles - Required role(s)
 * @returns {boolean}
 */
function hasRole(user, requiredRoles) {
  if (!user) return false;

  const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
  return roles.some((role) => user.role === role || user.roles?.includes(role));
}

/**
 * Build MongoDB query from filters
 * @param {Object} filters - Filter object
 * @param {string[]} allowedFields - Allowed field names
 * @returns {Object} MongoDB query
 */
function buildQuery(filters, allowedFields = []) {
  const query = {};

  Object.entries(filters).forEach(([key, value]) => {
    // Check if field is allowed
    if (allowedFields.length > 0 && !allowedFields.includes(key)) {
      return;
    }

    // Skip null or undefined values
    if (value === null || value === undefined) {
      return;
    }

    query[key] = value;
  });

  return query;
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean}
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Format date to ISO string
 * @param {Date|string} date - Date to format
 * @returns {string}
 */
function formatDate(date) {
  if (!date) return null;
  return new Date(date).toISOString();
}

module.exports = {
  getPaginationParams,
  getPaginationMeta,
  sanitizeUser,
  hasRole,
  buildQuery,
  isValidEmail,
  formatDate,
};
