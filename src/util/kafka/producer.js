const _ = require('lodash');
const apm = require('elastic-apm-node');
const logger = require('../logger/logger.util');
const { createProducer } = require('./index');
const { attachSpan } = require('../logger/apm');

const handleError = async (err) => {
  logger.error(`Error in pushing messages to kafka: ${err}`);
};

const produceMessage = async ({ topic, key, value }) => {
  _.set(value, 'traceparent', apm ? apm.currentTraceparent : null);

  const produce = async () => {
    const producer = await createProducer();
    await producer.send({
      topic,
      messages: [
        {
          key,
          value: JSON.stringify(value),
        },
      ],
    });
  };

  const span_config = {
    span_name: `PHR-SERVICE-KAFKA-PUSH-${topic}`,
    span_type: 'PHR-SERVICE-KAFKA-PUSH',
    should_create_transaction: false,
    traceparent: apm.currentTraceparent,
    labels: [{ name: 'TOPIC', value: JSON.stringify(topic) }],
    contexts: [
      { key: JSON.stringify(key) },
      { message: JSON.stringify(value) },
    ],
  };

  attachSpan(produce, handleError, span_config);
};

module.exports = {
  produceMessage,
};
