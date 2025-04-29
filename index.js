const app = require("./src/app");
const config = require("./src/config/env");
const db = require("./src/config/database");
const initializeDatabase = require("./src/config/db-init");
const createServers = require("./src/config/server");
const logger = require("./src/utils/logger");

async function startServer() {
  try {
    // Test database connection
    await db.testConnection();
    logger.info("Connected to Email database!");

    // Initialize database
    await initializeDatabase();

    // Create server based on SSL configuration
    const server = createServers(app);

    if (config.SSL.enabled) {
      logger.info(`Email service running on HTTPS port ${config.SSL.port}`);
    } else {
      logger.info(`Email service running on HTTP port ${config.PORT}`);
    }
  } catch (error) {
    logger.error("Failed to start Email service:", error);
    process.exit(1);
  }
}

startServer();
