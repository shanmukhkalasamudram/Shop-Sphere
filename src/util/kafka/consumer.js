const apm = require('elastic-apm-node');
const logger = require('../logger/logger.util');
const { createConsumer } = require('./index');
const { pushToElastic } = require('../../modules/v1/provider/provider.util');
const { attachSpan } = require('../logger/apm');
const constants = require('../constants');

const messageHandler = async ({ topic, value }) => {
  switch (topic) {
    case constants.KAFKA_TOPICS.PUSH_TO_ELASTIC:
      await pushToElastic(value);
      break;
    default:
      logger.info(`No Handler specified for topic ${topic} ${value}`);
  }
};

const handleError = async (err) => {
  logger.error(err);
};

let TOPICS = ['push_to_elastic'];

const subscribeKafka = async () => {
  const consumer = await createConsumer();

  logger.info(`subscribing to topics: ${TOPICS}`);

  consumer.subscribe({ topics: TOPICS });

  consumer.run({
    eachMessage: async ({ topic = '', partition = '', message = {} }) => {
      const key = message?.key ? Buffer.from(message?.key).toString() : '';
      const value = message?.value
        ? JSON.parse(message?.value?.toString())
        : '';

      logger.info(`KAFKA: ${topic} : ${partition} : ${key}`);

      const processMessage = async () => {
        await messageHandler({ topic, value });
      };

      const span_config = {
        span_name: `PHR-SERVICE-KAFKA-MESSAGE-${topic}`,
        span_type: 'PHR-SERVICE-KAFKA-MESSAGE',
        should_create_transaction: true,
        transaction_name: `KAFKA-MESSAGE-${topic}`,
        transaction_type: 'KAFKA-MESSAGE',
        traceparent: value?.traceparent || apm.currentTraceparent,
        labels: [{ name: 'TOPIC', value: JSON.stringify(topic) }],
        contexts: [{ message: JSON.stringify(value) }],
      };

      attachSpan(processMessage, handleError, span_config);
    },
  });
};

module.exports = {
  subscribeKafka,
};
