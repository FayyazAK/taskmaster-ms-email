const kafkaConsumer = require("./kafkaConsumer");
const emailQueue = require("../queues/emailQueue");
const templateService = require("./templateService");
const logger = require("../utils/logger");
const EmailService = require("./emailService");
const MSG = require("../utils/messages");

class KafkaHandler {
  static async handleSendEmail(payload) {
    try {
      const { recipientEmail, subject, emailType, templateData, scheduledFor } = payload;

      if (!recipientEmail || !subject || !emailType) {
        logger.error("Missing required fields for email:", { recipientEmail, subject, emailType });
        return;
      }

      // Validate emailType
      const validEmailTypes = [
        "registration",
        "verification",
        "password_reset",
        "other",
      ];
      if (!validEmailTypes.includes(emailType)) {
        logger.error(`Invalid emailType: ${emailType}`);
        return;
      }

      const templateMap = {
        verification: "userRegisteration",
      };

      const templateName = templateMap[emailType];
      if (!templateName) {
        logger.error(`No template mapping found for emailType: ${emailType}`);
        return;
      }

      // Validate template data
      try {
        templateService.validateTemplateData(templateName, templateData);
      } catch (error) {
        logger.error(`Template validation failed: ${error.message}`);
        return;
      }

      // Store email in database using Email Service
      const id = await EmailService.createEmail(
        recipientEmail,
        subject,
        JSON.stringify(templateData),
        scheduledFor || null,
        emailType
      );

      // build job payload
      const jobData = {
        id,
        to: recipientEmail,
        subject,
        template: templateName,
        templateData,
      };

      // if future-dated, schedule with a delay
      const opts = {};
      if (scheduledFor) {
        const delay = new Date(scheduledFor).getTime() - Date.now();
        if (delay > 0) opts.delay = delay;
      }

      // retries and backoff
      opts.attempts = 5;
      opts.backoff = { type: "exponential", delay: 60_000 };

      const job = await emailQueue.add("sendEmail", jobData, {
        ...opts,
        removeOnComplete: true,
        removeOnFail: true,
      });
      logger.info(
        `Enqueued email job ${job.id} (${opts.delay ? `scheduled` : `now`})`
      );
    } catch (err) {
      logger.error("Error in handleSendEmail:", err);
    }
  }

  static async initialize() {
    try {
      await kafkaConsumer.connect();
      await kafkaConsumer.subscribe("email.verification", async (payload) => {
        const templateData = {
          name: payload.name,
          verifyLink: payload.verifyLink,
        };
        await this.handleSendEmail({
          ...payload,
          templateData
        });
      });
      logger.info("Kafka consumer subscribed to email-verification topic");
      logger.info("Kafka handler initialized successfully");
    } catch (error) {
      logger.error(MSG.SERVICE_UNAVAILABLE, error);
    }
  }
}

module.exports = KafkaHandler;
