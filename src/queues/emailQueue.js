const Bull = require("bull");
const logger = require("../utils/logger");
const config = require("../config/env")
const emailQueue = new Bull("email", {
  redis: {
    host: config.redis.host,
    port: config.redis.port,
    password: config.redis.password,
    db: config.redis.db,
    keyPrefix: "emailService",
    // Reconnect strategy
    retryStrategy(times) {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
  },
});

emailQueue.on("error", (err) => logger.error("Email Queue Error", err));
emailQueue.on("completed", (job) =>
  logger.info(`Job ${job.id} (${job.name}) completed`)
);
emailQueue.on("failed", (job, err) =>
  logger.error(`Job ${job.id} (${job.name}) failed:`, err)
);

module.exports = emailQueue;
