const STATUS = require("../utils/statusCodes");

const responseHandler = (req, res, next) => {
  // Success response handler
  res.success = (data = null, message, statusCode = STATUS.OK) => {
    res.status(statusCode).json({ success: true, message, data });
  };

  // Error response handler
  res.error = (message, statusCode = STATUS.BAD_REQUEST) => {
    res.status(statusCode).json({ success: false, message });
  };

  next();
};

module.exports = responseHandler;
