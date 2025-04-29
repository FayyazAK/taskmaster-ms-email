const STATUS = require("../utils/statusCodes");
const MSG = require("../utils/messages");
const logger = require("../utils/logger");

const errorHandler = (err, req, res, next) => {
  logger.error("Error occurred:", {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    body: req.body,
    query: req.query,
  });

  // Handle specific error types
  if (err.name === "ValidationError") {
    return res.status(STATUS.UNPROCESSABLE_ENTITY).json({
      success: false,
      message: "Validation Error",
      errors: err.errors,
    });
  }

  if (err.name === "SequelizeDatabaseError") {
    return res.status(STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Database Error",
      error:
        process.env.NODE_ENV === "development"
          ? err.message
          : "Internal Server Error",
    });
  }

  if (err.name === "JsonWebTokenError") {
    return res.status(STATUS.UNAUTHORIZED).json({
      success: false,
      message: "Invalid Token",
    });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(STATUS.UNAUTHORIZED).json({
      success: false,
      message: "Token Expired",
    });
  }

  if (err.name === "RateLimitError") {
    return res.status(STATUS.TOO_MANY_REQUESTS).json({
      success: false,
      message: "Too Many Requests",
      retryAfter: err.retryAfter,
    });
  }

  // Default error response
  res.status(STATUS.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: MSG.INTERNAL_SERVER_ERROR,
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
};

module.exports = errorHandler;
