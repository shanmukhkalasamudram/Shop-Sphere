const _ = require('lodash');
const config = require('config');
const { Kafka, Partitioners, logLevel } = require('kafkajs');
const logger = require('../logger/logger.util');

let kafkaClient = {};

function createClient() {
  if (_.get(kafkaClient, 'client')) {
    return kafkaClient?.client;
  }

  const client = new Kafka({
    clientId: config.KAFKA.CLIENT_ID,
    brokers: config.KAFKA.BROKERS,
    logLevel: logLevel.INFO,
    connectionTimeout: 3000,
    requestTimeout: 25000,
    retry: {
      retries: 3,
    },
    ...(config.KAFKA.SASL.MECHANISM !== 'plain'
      ? {}
      : {
          sasl: {
            mechanism: config.KAFKA.SASL.MECHANISM,
            username: config.KAFKA.SASL.USERNAME,
            password: config.KAFKA.SASL.PASSWORD,
          },
        }),
  });

  logger.info('Kafka Client Created');

  kafkaClient.client = client;

  return client;
}

async function createProducer() {
  if (_.get(kafkaClient, 'producer')) {
    return kafkaClient?.producer;
  }

  const producer = createClient().producer({
    createPartitioner: Partitioners.LegacyPartitioner,
  });

  logger.info('Kafka Producer Created');

  await producer.connect();

  logger.info('Kafka Producer Connected');

  kafkaClient.producer = producer;

  return producer;
}

async function disconnectProducer() {
  if (!_.get(kafkaClient, 'producer')) {
    return false;
  }

  await kafkaClient.producer.disconnect();

  logger.info('Kafka Producer Disconnected');

  _.unset(kafkaClient, 'producer');

  return true;
}

async function createConsumer() {
  if (_.get(kafkaClient, 'consumer')) {
    return kafkaClient?.consumer;
  }

  const consumer = createClient().consumer({
    groupId: config.KAFKA.CONSUMER.GROUP,
  });

  logger.info('Kafka Consumer Created');

  kafkaClient.consumer = consumer;

  return consumer;
}

async function createAdmin() {
  if (_.get(kafkaClient, 'admin')) {
    return kafkaClient?.admin;
  }

  const admin = createClient().admin();

  logger.info('Kafka Admin Created');

  await admin.connect();

  logger.info('Kafka Admin Connected');

  kafkaClient.admin = admin;

  return admin;
}

async function disconnectAdmin() {
  if (!_.get(kafkaClient, 'admin')) {
    return false;
  }

  await kafkaClient.admin.disconnect();

  logger.info('Kafka Admin Disconnected');

  _.unset(kafkaClient, 'admin');

  return true;
}

module.exports = {
  createAdmin,
  disconnectAdmin,
  createProducer,
  disconnectProducer,
  createConsumer,
};
