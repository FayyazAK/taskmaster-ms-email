const path = require("path");
const dotenv = require("dotenv");
const validateEnv = require("./validateEnv");

dotenv.config({
  path: path.resolve(
    process.cwd(),
    `.env.${process.env.NODE_ENV || "development"}`
  ),
});

// Validate and sanitize environment variables
const env = validateEnv(process.env);

module.exports = {
  nodeEnv: env.NODE_ENV,

  server: {
    port: env.PORT,
  },

  gateway: {
    signature: env.API_GATEWAY_SIGNATURE,
    systemToken: env.SYSTEM_TOKEN,
    url: env.GATEWAY_URL,
  },

  cors: {
    allowedOrigins: env.CORS_ALLOWED_ORIGINS.split(","),
    allowedMethods: env.CORS_ALLOWED_METHODS.split(","),
    allowedHeaders: env.CORS_ALLOWED_HEADERS.split(","),
  },

  ssl: {
    enabled: env.SSL_ENABLED,
    keyPath: env.SSL_KEY_PATH,
    certPath: env.SSL_CERT_PATH,
    port: env.SSL_PORT,
  },

  db: {
    host: env.DB_HOST,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    name: env.AUTH_DB_NAME,
    port: env.DB_PORT,
  },

  backup: {
    dir: env.BACKUP_DIR,
    retentionDays: env.RETENTION_DAYS,
  },

  redis: {
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
    ttl: env.REDIS_TTL,
    password: env.REDIS_PASSWORD,
    db: env.REDIS_DB,
    clearOnStart: env.CLEAR_CACHE_ON_START,
  },

  log: {
    level: env.LOG_LEVEL,
    dir: env.LOG_DIR,
    datePattern: env.LOG_DATE_PATTERN,
    maxSize: env.LOG_MAX_SIZE,
    maxFiles: env.LOG_MAX_FILES,
    service: env.LOG_SERVICE_NAME,
  },

  // EMAIL CONFIG
  email: {
    user: env.GMAIL_USER,
    appPassword: env.GMAIL_APP_PASSWORD,
    tlsRejectUnauthorized: env.EMAIL_TLS_REJECT_UNAUTHORIZED,
  },

  kafka: {
    brokers: env.KAFKA_BROKERS.split(","),
  },
};
