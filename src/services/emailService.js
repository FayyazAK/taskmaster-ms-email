const { sequelize, Op } = require("../config/database");
const EMAIL = require("../models/EmailModel");
const logger = require("../utils/logger");
const { cacheHelpers, keyGenerators } = require("../config/redis");

class Email {
  static async createEmail(
    recipientEmail,
    subject,
    body,
    scheduledFor,
    emailType = "other"
  ) {
    try {
      const email = await EMAIL.create({
        recipientEmail,
        subject,
        body,
        scheduledFor,
        emailType,
      });

      await cacheHelpers.del(keyGenerators.emails());

      return email.id;
    } catch (error) {
      logger.error("Error creating email:", error);
      throw new Error(`Failed to create email: ${error.message}`);
    }
  }

  static async updateEmailStatus(id, status) {
    try {
      const email = await EMAIL.findByPk(id);
      if (!email) {
        throw new Error("Email not found");
      }

      email.status = status;
      await email.save();

      await cacheHelpers.del(keyGenerators.emails());

      return email.id;
    } catch (error) {
      logger.error("Error updating email status:", error);
      throw new Error(`Failed to update email status: ${error.message}`);
    }
  }

  static async deleteEmail(id) {
    try {
      await EMAIL.destroy({ where: { id } });
      await cacheHelpers.del(keyGenerators.emails());
    } catch (error) {
      logger.error("Error deleting email:", error);
      throw new Error(`Failed to delete email: ${error.message}`);
    }
  }

  static async getEmailById(id) {
    try {
      const email = await EMAIL.findByPk(id);
      if (!email) {
        throw new Error("Email not found");
      }
      return email;
    } catch (error) {
      logger.error("Error getting email by ID:", error);
      throw new Error(`Failed to get email by ID: ${error.message}`);
    }
  }

  static async getEmailsByStatus(status) {
    try {
      const cacheKey = keyGenerators.emailsByStatus(status);
      const cached = await cacheHelpers.get(cacheKey);
      if (cached) return cached;

      // Validate status value
      const validStatuses = ["pending", "sent", "failed"];
      if (!validStatuses.includes(status)) {
        throw new Error(
          `Invalid status value. Must be one of: ${validStatuses.join(", ")}`
        );
      }

      const emails = await EMAIL.findAll({ where: { status } });
      await cacheHelpers.set(cacheKey, emails);
      return emails;
    } catch (error) {
      logger.error("Error getting emails by status:", error);
      throw new Error(`Failed to get emails by status: ${error.message}`);
    }
  }

  static async getScheduledEmails() {
    try {
      const cacheKey = keyGenerators.scheduledEmails();
      const cached = await cacheHelpers.get(cacheKey);
      if (cached) return cached;

      const emails = await EMAIL.findAll({
        where: { scheduledFor: { [Op.lte]: new Date() } },
      });
      await cacheHelpers.set(cacheKey, emails);
      return emails;
    } catch (error) {
      logger.error("Error getting scheduled emails:", error);
      throw new Error(`Failed to get scheduled emails: ${error.message}`);
    }
  }
}

module.exports = Email;
