/**
 * @file Request logging middleware
 * Logs all incoming requests
 */

/**
 * Request logging middleware
 */
function requestLogger(req, res, next) {
  const startTime = Date.now();

  // Log request
  console.log("[REQUEST]", {
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.path,
    query: Object.keys(req.query).length > 0 ? req.query : undefined,
    body:
      req.body && Object.keys(req.body).length > 0
        ? sanitizeBody(req.body)
        : undefined,
    ip: req.ip,
    userAgent: req.get("user-agent"),
  });

  // Hook into response.json() to log response
  const originalJson = res.json;
  res.json = function (data) {
    const duration = Date.now() - startTime;
    console.log("[RESPONSE]", {
      timestamp: new Date().toISOString(),
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      success: data?.success ?? true,
    });

    return originalJson.call(this, data);
  };

  next();
}

/**
 * Sanitize body to remove sensitive fields from logs
 */
function sanitizeBody(body) {
  const sanitized = { ...body };
  const sensitiveFields = [
    "password",
    "token",
    "authorization",
    "secret",
    "apiKey",
    "firebaseUid",
  ];

  sensitiveFields.forEach((field) => {
    if (sanitized[field]) {
      sanitized[field] = "***REDACTED***";
    }
  });

  return sanitized;
}

module.exports = {
  requestLogger,
};
