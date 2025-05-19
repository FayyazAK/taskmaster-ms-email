const { Kafka, logLevel } = require("kafkajs");

const kafka = new Kafka({
  clientId: "taskmaster-ms-email",
  brokers: process.env.KAFKA_BROKERS
    ? process.env.KAFKA_BROKERS.split(",")
    : ["localhost:9092"],
  retry: {
    initialRetryTime: 100,
    retries: 8,
  },
  connectionTimeout: 3000,
  authenticationTimeout: 3000,
  logLevel: logLevel.NOTHING,
});

module.exports = kafka;
