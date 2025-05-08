const winston = require("winston");
const { format } = winston;
const DailyRotateFile = require("winston-daily-rotate-file");
const path = require("path");
const config = require("../config/env");

// Define log format
const logFormat = format.combine(
  format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  format.errors({ stack: true }),
  format.splat(),
  format.json()
);

// Create a logger instance
const logger = winston.createLogger({
  level: config.log.level,
  format: logFormat,
  defaultMeta: { service: config.log.service },
  transports: [
    // Console transport
    new winston.transports.Console({
      format: format.combine(
        format.colorize(),
        format.printf(
          (info) => `${info.timestamp} ${info.level}: ${info.message}`
        )
      ),
    }),
    // File transport for all logs
    new DailyRotateFile({
      filename: path.join(__dirname, config.log.dir, "combined-%DATE%.log"),
      datePattern: config.log.datePattern,
      maxSize: config.log.maxSize,
      maxFiles: config.log.maxFiles,
    }),
    // File transport for error logs
    new DailyRotateFile({
      filename: path.join(__dirname, config.log.dir, "error-%DATE%.log"),
      datePattern: config.log.datePattern,
      maxSize: config.log.maxSize,
      maxFiles: config.log.maxFiles,
      level: "error",
    }),
  ],
});

// Create a stream object for Morgan
logger.stream = {
  write: function (message) {
    logger.info(message.trim());
  },
};

module.exports = logger;
