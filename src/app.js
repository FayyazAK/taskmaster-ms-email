const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const responseHandler = require("./middleware/responseHandler");
const errorHandler = require("./middleware/errorHandler");
const routes = require("./routes");
const logger = require("./utils/logger");
const corsConfig = require("./config/cors");
const app = express();

// Middleware
app.use(cors(corsConfig));
app.use(helmet());
app.use(morgan("combined", { stream: logger.stream }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Custom Response Handler
app.use(responseHandler);

// Routes
app.use("/api", routes);

// Health check endpoint
app.get("/health", (req, res) => {
  return res.success(null, "Email service is running", 200);
});

// Error handler Middleware
app.use((err, req, res, next) => {
  logger.error("Unhandled error:", {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });
  errorHandler(err, req, res, next);
});

module.exports = app;
