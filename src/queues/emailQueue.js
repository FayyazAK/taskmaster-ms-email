const Bull = require("bull");
const { redisConfig } = require("../config/redis");
const logger = require("../utils/logger");

const emailQueue = new Bull("email", {
  redis: redisConfig,
});

emailQueue.on("error", (err) => logger.error("Email Queue Error", err));
emailQueue.on("completed", (job) =>
  logger.info(`Job ${job.id} (${job.name}) completed`)
);
emailQueue.on("failed", (job, err) =>
  logger.error(`Job ${job.id} (${job.name}) failed:`, err)
);

module.exports = emailQueue;
