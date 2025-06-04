const mongoose = require("mongoose");

const emailSchema = new mongoose.Schema({
  recipientEmail: {
    type: String,
    required: true,
    index: true,
  },
  subject: {
    type: String,
    required: true,
  },
  body: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "sent", "failed"],
    default: "pending",
    index: true,
  },
  emailType: {
    type: String,
    enum: ["registration", "verification", "password_reset", "other"],
    default: "other",
  },
  scheduledFor: {
    type: Date,
    index: true,
  },
  sentAt: {
    type: Date,
  },
  errorMessage: {
    type: String,
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("Email", emailSchema);
