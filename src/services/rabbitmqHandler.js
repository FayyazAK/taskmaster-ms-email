const rabbitConsumer = require('./rabbitmqConsumer');
const emailQueue = require('../queues/emailQueue');
const templateService = require('./templateService');
const logger = require('../utils/logger');
const EmailService = require('./emailService');
const MSG = require('../utils/messages');

class RabbitMQHandler {
  static async handleSendEmail(payload) {
    try {
      const { recipientEmail, subject, emailType, templateData, scheduledFor } = payload;

      if (!recipientEmail || !subject || !emailType) {
        logger.error('Missing required fields for email:', { recipientEmail, subject, emailType });
        return;
      }

      const validEmailTypes = ['registration', 'verification', 'password_reset', 'other'];
      if (!validEmailTypes.includes(emailType)) {
        logger.error(`Invalid emailType: ${emailType}`);
        return;
      }

      const templateMap = { verification: 'userRegisteration' };
      const templateName = templateMap[emailType];
      if (!templateName) {
        logger.error(`No template mapping found for emailType: ${emailType}`);
        return;
      }

      try {
        templateService.validateTemplateData(templateName, templateData);
      } catch (err) {
        logger.error(`Template validation failed: ${err.message}`);
        return;
      }

      const id = await EmailService.createEmail(
        recipientEmail,
        subject,
        JSON.stringify(templateData),
        scheduledFor || null,
        emailType
      );

      const jobData = { id, to: recipientEmail, subject, template: templateName, templateData };
      const opts = { attempts: 5, backoff: { type: 'exponential', delay: 60_000 } };
      if (scheduledFor) {
        const delay = new Date(scheduledFor).getTime() - Date.now();
        if (delay > 0) opts.delay = delay;
      }

      const job = await emailQueue.add('sendEmail', jobData, {
        ...opts,
        removeOnComplete: true,
        removeOnFail: true,
      });
      logger.info(`Enqueued email job ${job.id} (${opts.delay ? 'scheduled' : 'now'})`);
    } catch (err) {
      logger.error('Error in handleSendEmail:', err);
    }
  }

  static async initialize() {
    try {
      await rabbitConsumer.connect();
      await rabbitConsumer.subscribe('email.verification', async (payload) => {
        const { name, verifyLink } = payload;
        await this.handleSendEmail({
          ...payload,
          templateData: { name, verifyLink },
        });
      });
      logger.info('RabbitMQ handler initialized and subscribed to "email.verification"');
    } catch (error) {
      logger.error(MSG.SERVICE_UNAVAILABLE, error);
    }
  }

  static async shutdown() {
    try {
      await rabbitConsumer.disconnect();
      logger.info('RabbitMQ handler shutdown complete');
    } catch (error) {
      logger.error('Error during RabbitMQ handler shutdown:', error);
    }
  }
}

module.exports = RabbitMQHandler;