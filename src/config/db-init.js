const { sequelize } = require("./database");
const logger = require("../utils/logger");

async function initializeDatabase() {
  try {
    // Create tables
    await sequelize.sync({ alter: false, force: false });

    logger.info("Database initialization completed successfully");
  } catch (error) {
    logger.error("Error initializing database:", error);
    throw error;
  }
}

module.exports = initializeDatabase;
