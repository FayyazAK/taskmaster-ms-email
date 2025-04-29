module.exports = {
  CREATE_EMAILS_TABLE: `
        CREATE TABLE IF NOT EXISTS emails (
            email_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
            recipient_email VARCHAR(255) NOT NULL,
            subject VARCHAR(255) NOT NULL,
            body TEXT NOT NULL,
            status ENUM('pending', 'sent', 'failed') NULL DEFAULT 'pending',
            email_type ENUM('registration', 'verification', 'password_reset', 'other') NULL DEFAULT 'other',
            scheduled_for TIMESTAMP NULL,
            sent_at TIMESTAMP NULL,
            error_message TEXT NULL,
            created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_recipient_email (recipient_email),
            INDEX idx_status (status),
            INDEX idx_scheduled_for (scheduled_for)
        )
    `,

  CREATE_EMAIL: `
        INSERT INTO emails (recipient_email, subject, body, scheduled_for, email_type)
        VALUES (?, ?, ?, ?, ?)
    `,

  GET_PENDING_EMAILS: ` 
    SELECT * FROM emails WHERE status = 'pending' AND scheduled_for <= NOW()
  `,

  UPDATE_EMAIL_STATUS: `
    UPDATE emails SET status = ? WHERE email_id = ?
  `,

  DELETE_EMAIL: `
    DELETE FROM emails WHERE email_id = ?
  `,

  GET_EMAIL_BY_ID: `
    SELECT * FROM emails WHERE email_id = ?
  `,
  GET_EMAILS_BY_STATUS: `
    SELECT * FROM emails WHERE status = ?
  `,
  GET_SCHEDULED_EMAILS: `
    SELECT * FROM emails WHERE scheduled_for > NOW()
  `,
};
