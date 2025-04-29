const https = require("https");
const http = require("http");
const fs = require("fs");
const path = require("path");
const config = require("./env");
const logger = require("../utils/logger");

function createServers(app) {
  if (config.SSL.enabled) {
    try {
      const httpsOptions = {
        key: fs.readFileSync(path.join(__dirname, "..", config.SSL.key)),
        cert: fs.readFileSync(path.join(__dirname, "..", config.SSL.cert)),
      };

      const server = https.createServer(httpsOptions, app);
      server.listen(config.SSL.port);
      logger.info(`HTTPS server running on port ${config.SSL.port}`);
      return server;
    } catch (error) {
      logger.error(`Failed to start HTTPS server: ${error.message}`);
      throw error;
    }
  } else {
    const server = http.createServer(app);
    server.listen(config.PORT);
    logger.info(`HTTP server running on port ${config.PORT}`);
    return server;
  }
}

module.exports = createServers;
