const EmailService = require("../services/emailService");
const STATUS = require("../utils/statusCodes");
const MSG = require("../utils/messages");
const emailQueue = require("../queues/emailQueue");
const templateService = require("../services/templateService");
const logger = require("../utils/logger");
const mongoose = require("mongoose");

const sendEmail = async (req, res) => {
  try {
    if (!req.body) {
      return res.error(MSG.MISSING_REQUIRED_FIELDS, STATUS.BAD_REQUEST);
    }

    const { recipientEmail, subject, emailType, templateData, scheduledFor } =
      req.body;

    if (!recipientEmail || !subject || !emailType) {
      return res.error(MSG.MISSING_REQUIRED_FIELDS, STATUS.BAD_REQUEST);
    }

    // Validate emailType
    const validEmailTypes = [
      "registration",
      "verification",
      "password_reset",
      "other",
    ];
    if (!validEmailTypes.includes(emailType)) {
      return res.error(
        `Invalid emailType. Must be one of: ${validEmailTypes.join(", ")}`,
        STATUS.BAD_REQUEST
      );
    }

    const templateMap = {
      registration: "userRegisteration",
    };

    const templateName = templateMap[emailType];
    if (!templateName) {
      return res.error(MSG.INVALID_EMAIL_TYPE, STATUS.BAD_REQUEST);
    }

    // Validate template data
    try {
      templateService.validateTemplateData(templateName, templateData);
    } catch (error) {
      return res.error(error.message, STATUS.BAD_REQUEST);
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
      id: id.toString(), // Convert MongoDB ObjectId to string
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

    return res.success(
      { id, jobId: job.id, scheduledFor: scheduledFor || null },
      scheduledFor ? MSG.EMAIL_SCHEDULED : MSG.EMAIL_SENT,
      STATUS.OK
    );
  } catch (err) {
    logger.error("Controller error:", err);
    return res.error(MSG.FAILED_TO_SEND_EMAIL, STATUS.INTERNAL_SERVER_ERROR);
  }
};

const getScheduledEmails = async (req, res) => {
  try {
    const scheduledEmails = await EmailService.getScheduledEmails();
    return res.success(
      scheduledEmails,
      MSG.SCHEDULED_EMAILS_RETRIEVED,
      STATUS.OK
    );
  } catch (error) {
    logger.error("Error getting scheduled emails:", error);
    return res.error(
      MSG.FAILED_TO_RETRIEVE_SCHEDULED_EMAILS,
      STATUS.INTERNAL_SERVER_ERROR
    );
  }
};

module.exports = { sendEmail, getScheduledEmails };
