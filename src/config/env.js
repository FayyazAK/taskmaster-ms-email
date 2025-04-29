require("dotenv").config();

module.exports = {
  // NODE ENV
  NODE_ENV: process.env.NODE_ENV || "development",

  // SERVER CONFIG
  PORT: process.env.PORT || 3002,

  // GATEWAY CONFIG
  API_GATEWAY_SIGNATURE:
    process.env.API_GATEWAY_SIGNATURE || "taskmaster@gateway",

  // CORS CONFIG
  CORS: {
    ALLOWED_ORIGINS: process.env.CORS_ALLOWED_ORIGINS
      ? process.env.CORS_ALLOWED_ORIGINS.split(",")
      : ["http://localhost:3000"],
    ALLOWED_METHODS: process.env.CORS_ALLOWED_METHODS
      ? process.env.CORS_ALLOWED_METHODS.split(",")
      : ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    ALLOWED_HEADERS: process.env.CORS_ALLOWED_HEADERS
      ? process.env.CORS_ALLOWED_HEADERS.split(",")
      : ["Content-Type", "Authorization"],
  },
  // SSL CONFIG
  SSL: {
    enabled: process.env.SSL_ENABLED === "true",
    key: process.env.SSL_KEY_PATH || "ssl/key.pem",
    cert: process.env.SSL_CERT_PATH || "ssl/cert.pem",
    port: process.env.SSL_PORT || 3443,
  },

  // DATABASE CONFIG
  DB_HOST: process.env.DB_HOST || "localhost",
  DB_USER: process.env.DB_USER || "root",
  DB_PASSWORD: process.env.DB_PASSWORD || "",
  DB_NAME: process.env.EMAIL_DB_NAME || "taskmaster-email-db",

  // REDIS CONFIG
  REDIS: {
    HOST: process.env.REDIS_HOST || "localhost",
    PORT: process.env.REDIS_PORT || 6379,
    TTL: process.env.REDIS_TTL || 3600,
    PASSWORD: process.env.REDIS_PASSWORD || "",
    DB: process.env.REDIS_DB || 0,
  },

  CLEAR_CACHE_ON_START: process.env.CLEAR_CACHE_ON_START === "true",

  // EMAIL CONFIG
  GMAIL_USER: process.env.GMAIL_USER,
  GMAIL_APP_PASSWORD: process.env.GMAIL_APP_PASSWORD,
};
