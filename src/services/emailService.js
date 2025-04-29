const nodemailer = require("nodemailer");
const handlebars = require("handlebars");
const fs = require("fs");
const path = require("path");
const config = require("../config/env");
const logger = require("../utils/logger");

// Create a transporter object using Gmail SMTP
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: config.GMAIL_USER,
    pass: config.GMAIL_APP_PASSWORD,
  },
});

const compileTemplate = (templateName, data) => {
  const templatePath = path.join(
    __dirname,
    "../emailTempelates",
    `${templateName}.hbs`
  );
  const template = fs.readFileSync(templatePath, "utf8");
  const compiledTemplate = handlebars.compile(template);
  return compiledTemplate(data);
};

const sendEmail = async ({
  to,
  subject,
  text,
  html,
  template,
  templateData,
}) => {
  try {
    let finalHtml = html;
    if (template) {
      finalHtml = compileTemplate(template, templateData);
    }

    const mailOptions = {
      from: config.GMAIL_USER,
      to,
      subject,
      text: text || "Please view this email in an HTML-enabled email client.",
      html: finalHtml,
    };

    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error) {
    logger.error("Error sending email:", error);
    throw error;
  }
};

module.exports = {
  sendEmail,
};
