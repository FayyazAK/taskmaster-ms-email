const kafka = require("../config/kafka");
const logger = require("../utils/logger");

class KafkaConsumer {
  constructor() {
    this.consumer = kafka.consumer({ groupId: "email-service-group" });
  }

  async connect() {
    try {
      await this.consumer.connect();
      logger.info("Kafka consumer connected successfully");
    } catch (error) {
      logger.error("Error connecting to Kafka:", error);
      throw error;
    }
  }

  async subscribe(topic, handler) {
    try {
      await this.consumer.subscribe({ topic, fromBeginning: true });

      await this.consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
          try {
            const value = JSON.parse(message.value.toString());
            await handler(value);
          } catch (error) {
            logger.error(
              `Error processing message from topic ${topic}:`,
              error
            );
          }
        },
      });

      logger.info(`Subscribed to topic: ${topic}`);
    } catch (error) {
      logger.error(`Error subscribing to topic ${topic}:`, error);
      throw error;
    }
  }

  async disconnect() {
    try {
      await this.consumer.disconnect();
      logger.info("Kafka consumer disconnected successfully");
    } catch (error) {
      logger.error("Error disconnecting from Kafka:", error);
      throw error;
    }
  }
}

module.exports = new KafkaConsumer();
