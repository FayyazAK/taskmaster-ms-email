// config/redis.js
const Redis = require("ioredis");
const config = require("./env");

const redisClient = new Redis({
  host: config.REDIS.HOST || "localhost",
  port: config.REDIS.PORT || 6379,
  password: config.REDIS.PASSWORD || "",
  db: config.REDIS.DB || 0,
  keyPrefix: "emailService:",
  // Reconnect strategy
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

redisClient.on("connect", () => {
  console.log("Connected to Redis server");
});

redisClient.on("error", (err) => {
  console.error("Redis connection error:", err);
});

// Cache helper functions
const cacheHelpers = {
  async get(key) {
    try {
      const data = await redisClient.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  },

  async set(key, data) {
    try {
      await redisClient.set(key, JSON.stringify(data), "EX", config.REDIS.TTL);
    } catch (error) {
      console.error(`Cache set error for key ${key}:`, error);
    }
  },

  async del(key) {
    try {
      await redisClient.del(key);
    } catch (error) {
      console.error(`Cache delete error for key ${key}:`, error);
    }
  },

  async deleteByPattern(pattern) {
    try {
      // Add the keyPrefix to the pattern
      const fullPattern = `${redisClient.options.keyPrefix}${pattern}`;
      const keys = await redisClient.keys(fullPattern);
      if (keys.length > 0) {
        // Remove the keyPrefix from keys before deleting
        const keysWithoutPrefix = keys.map((key) =>
          key.replace(redisClient.options.keyPrefix, "")
        );
        await redisClient.del(keysWithoutPrefix);
      }
    } catch (error) {
      console.error(
        `Cache delete by pattern error for pattern ${pattern}:`,
        error
      );
    }
  },

  async clear() {
    try {
      await redisClient.flushdb();
    } catch (error) {
      console.error("Cache clear error:", error);
    }
  },
};

const keyGenerators = {
  emails: () => `emails`,
  scheduledEmails: () => `emails:scheduled`,
  emailsByStatus: (status) => `emails:status:${status}`,
};

module.exports = {
  redisClient,
  cacheHelpers,
  keyGenerators,
};
