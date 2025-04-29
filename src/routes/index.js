const express = require("express");
const router = express.Router();
const emailRoutes = require("./emailRoutes");
const { validateRequest } = require("../middleware/auth");

router.use("/emails", validateRequest, emailRoutes);

module.exports = router;
