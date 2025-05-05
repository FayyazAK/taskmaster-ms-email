const { Sequelize, Op } = require("sequelize");
const config = require("./env");
const logger = require("../utils/logger");

const sequelize = new Sequelize(
  config.DB_NAME,
  config.DB_USER,
  config.DB_PASSWORD,
  {
    host: config.DB_HOST,
    port: config.DB_PORT,
    dialect: "mysql",
    logging: (msg) => logger.debug(msg),
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

module.exports = {
  sequelize,
  Op,
};
