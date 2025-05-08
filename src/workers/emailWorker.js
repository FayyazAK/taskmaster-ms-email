const emailQueue = require("../queues/emailQueue");
const emailService = require("../services/emailService");
const mailingService = require("../services/mailingService");
const logger = require("../utils/logger");

// process up to 10 jobs in parallel
emailQueue.process("sendEmail", 10, async (job) => {
  const { id, to, subject, template, templateData } = job.data;
  console.log("emailId: ", id);
  try {
    // Send email using mailing service
    await mailingService.sendEmail({ to, subject, template, templateData });
    logger.info(`Email with subject ${subject} sent successfully to ${to}`);

    // Update email status using email service
    const updatedEmail = await emailService.updateEmailStatus(id, "sent");
    if (!updatedEmail) {
      logger.error(`Email with id ${id} not updated`);
      throw new Error(`Email with id ${id} not updated`);
    }

    return Promise.resolve();
  } catch (err) {
    // Update email status to failed if sending fails
    await emailService.updateEmailStatus(id, "failed");
    logger.error(`Worker failed job ${job.id}:`, err);
    throw err;
  }
});

// handle graceful shutdown
process.on("SIGINT", () => emailQueue.close().then(() => process.exit(0)));
process.on("SIGTERM", () => emailQueue.close().then(() => process.exit(0)));
