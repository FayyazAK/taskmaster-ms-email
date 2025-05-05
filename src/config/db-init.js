const { sequelize } = require("./database");
const logger = require("../utils/logger");

async function initializeDatabase() {
  try {
    // Create tables
    await sequelize.sync({ alter: true });

    logger.info("Database initialization completed successfully");
  } catch (error) {
    logger.error("Error initializing database:", error);
    throw error;
  }
}

module.exports = initializeDatabase;
