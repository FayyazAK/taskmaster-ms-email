const { redisClient } = require("../config/redis");
const Email = require("../models/Email");
const { pool } = require("./database");

async function initializeDatabase() {
  try {
    await Email.createTable();

    // Test Redis connection
    await redisClient.ping();
    console.log("Redis connection successful!");
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  }
}

module.exports = initializeDatabase;
