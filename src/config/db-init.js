const logger = require("../utils/logger");

async function initializeDatabase() {
  try {
    // No need to sync tables with Mongoose
    logger.info("Database initialization completed successfully");
  } catch (error) {
    logger.error("Error initializing database:", error);
    throw error;
  }
}

module.exports = initializeDatabase;
