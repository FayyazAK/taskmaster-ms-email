const express = require("express");
const router = express.Router();
const {
  sendEmail,
  getScheduledEmails,
} = require("../controllers/emailController");

router.post("/send", sendEmail);
router.get("/scheduled", getScheduledEmails);

module.exports = router;
