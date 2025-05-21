const app = require("./src/app");
const config = require("./src/config/env");
const { sequelize } = require("./src/config/database");
const initializeDatabase = require("./src/config/db-init");
const createServers = require("./src/config/server");
const logger = require("./src/utils/logger");
const RabbitMQHandler = require("./src/services/rabbitmqHandler");
const emailQueue = require("./src/queues/emailQueue");

let server;

async function startServer() {
  try {
    // Test database connection
    await sequelize.authenticate();
    logger.info("Connected to Email database!");

    // Initialize database
    await initializeDatabase();

    // Initialize RabbitMQ handler
    await RabbitMQHandler.initialize();

    // Create server based on SSL configuration
    server = createServers(app);

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

async function shutdown(signal) {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);
  
  try {
    // Close HTTP/HTTPS server
    if (server) {
      await new Promise((resolve, reject) => {
        server.close((err) => {
          if (err) {
            logger.error("Error closing server:", err);
            reject(err);
          } else {
            logger.info("Server closed successfully");
            resolve();
          }
        });
      });
    }

    // Close RabbitMQ connections
    await RabbitMQHandler.shutdown();
    
    // Close Bull queue connections
    if (emailQueue) {
      await emailQueue.close();
      logger.info("Email queue closed successfully");
    }

    // Close database connection
    if (sequelize) {
      await sequelize.close();
      logger.info("Database connection closed successfully");
    }

    logger.info("Graceful shutdown completed");
    process.exit(0);
  } catch (error) {
    logger.error("Error during graceful shutdown:", error);
    process.exit(1);
  }
}

// Handle termination signals
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('uncaughtException', (err) => {
  logger.error('Uncaught exception:', err);
  shutdown('uncaughtException');
});
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled rejection at:', promise, 'reason:', reason);
  shutdown('unhandledRejection');
});

startServer();
