const https = require("https");
const http = require("http");
const fs = require("fs");
const path = require("path");
const config = require("./env");
const logger = require("../utils/logger");

function createServers(app) {
  if (config.ssl.enabled) {
    try {
      const httpsOptions = {
        key: fs.readFileSync(path.join(__dirname, "..", config.ssl.key)),
        cert: fs.readFileSync(path.join(__dirname, "..", config.ssl.cert)),
      };

      const server = https.createServer(httpsOptions, app);
      server.listen(config.ssl.port);
      logger.info(`HTTPS server running on port ${config.ssl.port}`);
      return server;
    } catch (error) {
      logger.error(`Failed to start HTTPS server: ${error.message}`);
      throw error;
    }
  } else {
    const server = http.createServer(app);
    server.listen(config.server.port);
    logger.info(`HTTP server running on port ${config.server.port}`);
    return server;
  }
}

module.exports = createServers;
