const STATUS = require("../utils/statusCodes");
const MSG = require("../utils/messages");
const crypto = require("crypto");
const logger = require("../utils/logger");
const config = require("../config/env");

const validateRequest = (req, res, next) => {
  const timestamp = req.headers["x-api-gateway-timestamp"];
  const signature = req.headers["x-api-gateway-signature"];

  // Verify timestamp is present and valid
  if (!timestamp) {
    logger.error("Missing gateway timestamp header");
    return res.error(MSG.FORBIDDEN, STATUS.FORBIDDEN);
  }

  // Verify request timestamp is recent (prevent replay attacks)
  const currentTime = Date.now();
  const fiveMinutes = 5 * 60 * 1000;
  if (currentTime - parseInt(timestamp) > fiveMinutes) {
    logger.error(
      `Request expired - Timestamp: ${timestamp}, Current: ${currentTime}`
    );
    return res.error(MSG.REQUEST_EXPIRED, STATUS.UNAUTHORIZED);
  }

  // Verify signature is present
  if (!signature) {
    logger.error("Missing gateway signature header");
    return res.error(MSG.FORBIDDEN, STATUS.FORBIDDEN);
  }

  // Verify request signature
  const expectedSignature = crypto
    .createHmac("sha256", config.API_GATEWAY_SIGNATURE)
    .update(`${timestamp}${req.originalUrl}`)
    .digest("hex");

  if (signature !== expectedSignature) {
    logger.error("Invalid request signature");
    console.log(`Expected: ${expectedSignature}, Received: ${signature}`);
    return res.error(MSG.FORBIDDEN, STATUS.FORBIDDEN);
  }

  logger.info(`Request validated for email`);

  next();
};

module.exports = { validateRequest };
