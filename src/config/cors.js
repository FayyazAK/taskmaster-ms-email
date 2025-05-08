const config = require("./env");

const corsConfig = {
  origin: config.cors.allowedOrigins,
  credentials: true,
  methods: config.cors.allowedMethods,
  allowedHeaders: config.cors.allowedHeaders,
};

module.exports = corsConfig;
