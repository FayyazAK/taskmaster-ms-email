const express = require("express");
const router = express.Router();
const emailRoutes = require("./emailRoutes");
const { validateRequest, authorizeAdmin } = require("../middleware/auth");
const utilsController = require("../controllers/utilsController");

router.use("/emails", validateRequest, emailRoutes);
router.get(
  "/admin/emails/backup",
  validateRequest,
  authorizeAdmin,
  utilsController.backupDatabase
);

module.exports = router;
