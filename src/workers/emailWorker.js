const emailQueue = require("../queues/emailQueue");
const emailService = require("../services/emailService");
const mailingService = require("../services/mailingService");
const logger = require("../utils/logger");
const mongoose = require("mongoose");
const { connectDB } = require("../config/database");

// Initialize database connection for the worker process
(async () => {
  try {
    await connectDB();
    logger.info("Email Worker: Connected to MongoDB!");
  } catch (error) {
    logger.error("Email Worker: Failed to connect to MongoDB:", error);
    process.exit(1);
  }
})();

// process up to 10 jobs in parallel
emailQueue.process("sendEmail", 10, async (job) => {
  const { id, to, subject, template, templateData } = job.data;
  logger.info("Processing email job with ID:", id);
  
  try {
    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error(`Invalid email ID format: ${id}`);
    }

    // Send email using mailing service
    await mailingService.sendEmail({ to, subject, template, templateData });
    logger.info(`Email with subject ${subject} sent successfully to ${to}`);

    // Update email status using email service
    const updatedEmail = await emailService.updateEmailStatus(id, "sent");
    if (!updatedEmail) {
      logger.error(`Email with id ${id} not found or not updated`);
      throw new Error(`Email with id ${id} not found or not updated`);
    }

    return Promise.resolve();
  } catch (err) {
    // Update email status to failed if sending fails
    if (mongoose.Types.ObjectId.isValid(id)) {
      await emailService.updateEmailStatus(id, "failed");
    }
    logger.error(`Worker failed job ${job.id}:`, err);
    throw err;
  }
});

// handle graceful shutdown
process.on("SIGINT", async () => {
  logger.info("Email Worker: Shutting down gracefully...");
  await emailQueue.close();
  await mongoose.connection.close();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  logger.info("Email Worker: Shutting down gracefully...");
  await emailQueue.close();
  await mongoose.connection.close();
  process.exit(0);
});
