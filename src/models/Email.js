const { pool } = require("../config/database");
const EMAIL = require("../queries/emailQueries");
const logger = require("../utils/logger");
const { cacheHelpers, keyGenerators } = require("../config/redis");

class Email {
  static async createTable() {
    try {
      await pool.execute(EMAIL.CREATE_EMAILS_TABLE);
    } catch (error) {
      logger.error("Error creating emails table:", error);
      throw new Error(`Failed to create emails table: ${error.message}`);
    }
  }

  static async createEmail(
    recipient_email,
    subject,
    body,
    scheduled_for,
    email_type = "other"
  ) {
    try {
      const [result] = await pool.execute(EMAIL.CREATE_EMAIL, [
        recipient_email,
        subject,
        body,
        scheduled_for,
        email_type,
      ]);

      await cacheHelpers.del(keyGenerators.emails());

      return result.insertId;
    } catch (error) {
      logger.error("Error creating email:", error);
      throw new Error(`Failed to create email: ${error.message}`);
    }
  }

  static async updateEmailStatus(emailId, status) {
    try {
      // Validate status value
      const validStatuses = ["pending", "sent", "failed"];
      if (!validStatuses.includes(status)) {
        throw new Error(
          `Invalid status value. Must be one of: ${validStatuses.join(", ")}`
        );
      }

      await pool.execute(EMAIL.UPDATE_EMAIL_STATUS, [status, emailId]);

      await cacheHelpers.del(keyGenerators.emails());
    } catch (error) {
      logger.error("Error updating email status:", error);
      throw new Error(`Failed to update email status: ${error.message}`);
    }
  }

  static async deleteEmail(emailId) {
    try {
      await pool.execute(EMAIL.DELETE_EMAIL, [emailId]);
      await cacheHelpers.del(keyGenerators.emails());
    } catch (error) {
      logger.error("Error deleting email:", error);
      throw new Error(`Failed to delete email: ${error.message}`);
    }
  }

  static async getEmailById(emailId) {
    try {
      const [rows] = await pool.execute(EMAIL.GET_EMAIL_BY_ID, [emailId]);
      return rows[0];
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

      const [rows] = await pool.execute(EMAIL.GET_EMAILS_BY_STATUS, [status]);
      await cacheHelpers.set(cacheKey, rows);
      return rows;
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

      const [rows] = await pool.execute(EMAIL.GET_SCHEDULED_EMAILS);
      await cacheHelpers.set(cacheKey, rows);
      return rows;
    } catch (error) {
      logger.error("Error getting scheduled emails:", error);
      throw new Error(`Failed to get scheduled emails: ${error.message}`);
    }
  }
}

module.exports = Email;
