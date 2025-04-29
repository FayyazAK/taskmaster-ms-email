const mysql = require("mysql2");
const config = require("./env");
const logger = require("../utils/logger");

// Retry configuration
const MAX_RETRIES = 5;
const RETRY_DELAY = 5000; // 5 seconds

// MYSQL DATABASE CONNECTION POOL
const pool = mysql.createPool({
  host: config.DB_HOST,
  user: config.DB_USER,
  password: config.DB_PASSWORD,
  database: config.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

// MYSQL DATABASE CONNECTION POOL PROMISE
const promisePool = pool.promise();

// Test connection with retries
async function testConnection(retries = MAX_RETRIES) {
  try {
    const connection = await promisePool.getConnection();
    connection.release();
    logger.info("Database connection successful!");
    return true;
  } catch (error) {
    if (retries > 0) {
      logger.warn(
        `Database connection failed. Retrying in ${
          RETRY_DELAY / 1000
        } seconds... (${retries} attempts remaining)`
      );
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
      return testConnection(retries - 1);
    }
    logger.error(
      "Failed to connect to database after multiple attempts:",
      error
    );
    throw error;
  }
}

// Handle pool errors
pool.on("error", (err) => {
  logger.error("Database pool error:", err);
  if (err.code === "PROTOCOL_CONNECTION_LOST") {
    logger.warn("Database connection was closed. Attempting to reconnect...");
    testConnection();
  }
});

// Handle pool connection
pool.on("connection", (connection) => {
  logger.info("New database connection established");
  connection.on("error", (err) => {
    logger.error("Connection error:", err);
  });
});

module.exports = {
  pool: promisePool,
  testConnection,
};
