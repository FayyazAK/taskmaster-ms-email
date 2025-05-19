const app = require("./src/app");
const config = require("./src/config/env");
const { sequelize } = require("./src/config/database");
const initializeDatabase = require("./src/config/db-init");
const createServers = require("./src/config/server");
const logger = require("./src/utils/logger");
const KafkaHandler = require("./src/services/kafkaHandler");

async function startServer() {
  try {
    // Test database connection
    await sequelize.authenticate();
    logger.info("Connected to Email database!");

    // Initialize database
    await initializeDatabase();

    // Initialize Kafka handler
    await KafkaHandler.initialize();

    // Create server based on SSL configuration
    const server = createServers(app);

    if (config.ssl.enabled) {
      logger.info(`Email service running on HTTPS port ${config.ssl.port}`);
    } else {
      logger.info(`Email service running on HTTP port ${config.server.port}`);
    }
  } catch (error) {
    logger.error("Failed to start Email service:", error);
    process.exit(1);
  }
}

startServer();
