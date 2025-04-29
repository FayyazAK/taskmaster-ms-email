const config = require("./env");

const corsConfig = {
  origin: config.CORS.ALLOWED_ORIGINS,
  credentials: true,
  methods: config.CORS.ALLOWED_METHODS,
  allowedHeaders: config.CORS.ALLOWED_HEADERS,
};

module.exports = corsConfig;
