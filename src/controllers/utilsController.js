const { backupDatabase } = require("../services/backupDb");

const utilsController = {
  backupDatabase: async (req, res) => {
    try {
      const backupPath = await backupDatabase();
      return res.success(
        backupPath,
        "Database backup completed successfully",
        200
      );
    } catch (error) {
      console.error("Backup failed:", error);
      return res.error(
        "Failed to create database backup: " + error.message,
        500
      );
    }
  },
};

module.exports = utilsController;
