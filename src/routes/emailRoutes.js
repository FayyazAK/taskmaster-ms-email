const express = require("express");
const router = express.Router();
const Email = require("../models/Email");
const {
  sendEmail,
  getScheduledEmails,
} = require("../controllers/emailController");

router.post("/send", sendEmail);
router.get("/scheduled", getScheduledEmails);

module.exports = router;
