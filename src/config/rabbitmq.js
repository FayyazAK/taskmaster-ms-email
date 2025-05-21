const amqp = require('amqplib');
const logger = require('../utils/logger');
const config = require('./env');
const url = config.rabbitMQ.url;

let connection;
let channel;

async function connect() {
  try {
    connection = await amqp.connect(url);
    channel = await connection.createChannel();
    logger.info('🐇 RabbitMQ connected successfully');
  } catch (error) {
    logger.error('🐇 Error connecting to RabbitMQ:', error);
    throw error;
  }
}

async function disconnect() {
  try {
    await channel.close();
    await connection.close();
    logger.info('🐇 RabbitMQ disconnected successfully');
  } catch (error) {
    logger.error('🐇 Error disconnecting RabbitMQ:', error);
    throw error;
  }
}

async function publish(queue, message) {
  try {
    await channel.assertQueue(queue, { durable: true });
    channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), { persistent: true });
    logger.info(`🐇 Message published to queue "${queue}"`);
  } catch (error) {
    logger.error(`🐇 Error publishing message to queue "${queue}":`, error);
    throw error;
  }
}

async function subscribe(queue, handler) {
  try {
    await channel.assertQueue(queue, { durable: true });
    await channel.consume(queue, async (msg) => {
      if (!msg) return;
      let data;
      try {
        data = JSON.parse(msg.content.toString());
      } catch (err) {
        logger.error('🐇 Invalid message content:', err);
        channel.nack(msg, false, false);
        return;
      }
      try {
        await handler(data);
        channel.ack(msg);
      } catch (handlerErr) {
        logger.error(`🐇 Handler error for queue "${queue}":`, handlerErr);
        channel.nack(msg, false, false);
      }
    });
    logger.info(`🐇 Subscribed to queue "${queue}"`);
  } catch (error) {
    logger.error(`🐇 Error subscribing to queue "${queue}":`, error);
    throw error;
  }
}

module.exports = {
  connect,
  disconnect,
  publish,
  subscribe,
};