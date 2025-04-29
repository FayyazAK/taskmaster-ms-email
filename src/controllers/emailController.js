const Email = require("../models/Email");
const STATUS = require("../utils/statusCodes");
const MSG = require("../utils/messages");
const emailQueue = require("../queues/emailQueue");
const templateService = require("../services/templateService");
const logger = require("../utils/logger");

const sendEmail = async (req, res) => {
  try {
    if (!req.body) {
      return res.error(MSG.MISSING_REQUIRED_FIELDS, STATUS.BAD_REQUEST);
    }

    const {
      recipient_email,
      subject,
      email_type,
      template_data,
      scheduled_for,
    } = req.body;

    if (!recipient_email || !subject || !email_type) {
      return res.error(MSG.MISSING_REQUIRED_FIELDS, STATUS.BAD_REQUEST);
    }

    // Validate email_type
    const validEmailTypes = [
      "registration",
      "verification",
      "password_reset",
      "other",
    ];
    if (!validEmailTypes.includes(email_type)) {
      return res.error(
        `Invalid email_type. Must be one of: ${validEmailTypes.join(", ")}`,
        STATUS.BAD_REQUEST
      );
    }

    const templateMap = {
      registration: "userRegisteration",
    };

    const templateName = templateMap[email_type];
    if (!templateName) {
      return res.error(MSG.INVALID_EMAIL_TYPE, STATUS.BAD_REQUEST);
    }

    // Validate template data
    try {
      templateService.validateTemplateData(templateName, template_data);
    } catch (error) {
      return res.error(error.message, STATUS.BAD_REQUEST);
    }

    // Store email in database
    const emailId = await Email.createEmail(
      recipient_email,
      subject,
      JSON.stringify(template_data),
      scheduled_for || null,
      email_type
    );

    // build job payload
    const jobData = {
      emailId,
      to: recipient_email,
      subject,
      template: templateName,
      templateData: template_data,
    };

    // if future-dated, schedule with a delay
    const opts = {};
    if (scheduled_for) {
      const delay = new Date(scheduled_for).getTime() - Date.now();
      if (delay > 0) opts.delay = delay;
    }

    // retries and backoff
    opts.attempts = 5;
    opts.backoff = { type: "exponential", delay: 60_000 };

    const job = await emailQueue.add("sendEmail", jobData, opts);
    logger.info(
      `Enqueued email job ${job.id} (${opts.delay ? `scheduled` : `now`})`
    );

    return res.success(
      { emailId, jobId: job.id, scheduled_for: scheduled_for || null },
      scheduled_for ? MSG.EMAIL_SCHEDULED : MSG.EMAIL_SENT,
      STATUS.OK
    );
  } catch (err) {
    logger.error("Controller error:", err);
    return res.error(MSG.FAILED_TO_SEND_EMAIL, STATUS.INTERNAL_SERVER_ERROR);
  }
};

const getScheduledEmails = async (req, res) => {
  try {
    const scheduledEmails = await Email.getScheduledEmails();
    return res.success(
      scheduledEmails,
      MSG.SCHEDULED_EMAILS_RETRIEVED,
      STATUS.OK
    );
  } catch (error) {
    return res.error(
      MSG.FAILED_TO_RETRIEVE_SCHEDULED_EMAILS,
      STATUS.INTERNAL_SERVER_ERROR
    );
  }
};

module.exports = { sendEmail, getScheduledEmails };
