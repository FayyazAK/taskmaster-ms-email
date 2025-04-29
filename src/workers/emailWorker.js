const emailQueue = require("../queues/emailQueue");
const emailService = require("../services/emailService");
const Email = require("../models/Email");
const logger = require("../utils/logger");

// process up to 10 jobs in parallel
emailQueue.process("sendEmail", 10, async (job) => {
  const { emailId, to, subject, template, templateData } = job.data;
  try {
    await emailService.sendEmail({ to, subject, template, templateData });
    await Email.updateEmailStatus(emailId, "sent");
    logger.info(`Email with subject ${subject} sent successfully to ${to}`);
    return Promise.resolve();
  } catch (err) {
    await Email.updateEmailStatus(emailId, "failed");
    logger.error(`Worker failed job ${job.id}:`, err);
    throw err;
  }
});

// handle graceful shutdown
process.on("SIGINT", () => emailQueue.close().then(() => process.exit(0)));
process.on("SIGTERM", () => emailQueue.close().then(() => process.exit(0)));
