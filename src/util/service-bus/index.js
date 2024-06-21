/* eslint-disable no-unused-expressions */
const { ServiceBusClient } = require('@azure/service-bus');
const config = require('config');
const apm = require('elastic-apm-node');
const _ = require('lodash');
const logger = require('../logger/logger.util');
const { messageHandler } = require('./message.dispatcher');

let connection;

async function connect() {
  try {
    connection = new ServiceBusClient(config.AZURE.CONNECTION_STRING);
    logger.info('Service Bus Client: Connected');
  } catch (err) {
    logger.error(err);
  }
}

async function sendMessageBus({ body, properties = { is_scheduled: false } }) {
  const sender = connection.createSender(config.AZURE.QUEUE_NAME);
  const span = apm
    ? apm.startSpan('Logging', {
        exitSpan: true,
        childOf: apm.currentTraceparent,
      })
    : null;
  span ? span.setType('Messafe') : null;
  try {
    apm.setLabel('Queue-body', JSON.stringify(body));
    if (_.get(properties, 'is_scheduled')) {
      await sender.scheduleMessages(
        [
          {
            body,
            contentType: 'application/json',
            applicationProperties: {
              traceparent: apm ? apm.currentTraceparent : null,
              ...properties,
            },
          },
        ],
        _.get(properties, 'scheduled_time')
      );
    } else {
      await sender.sendMessages([
        {
          body,
          contentType: 'application/json',
          applicationProperties: {
            traceparent: apm ? apm.currentTraceparent : null,
            ...properties,
          },
        },
      ]);
    }
    span ? span.setOutcome('success') : null;
    span ? span.end() : null;
    await sender.close();
  } catch (err) {
    logger.error(`Error in pushing messages to queue: ${err}`);
    span ? span.setOutcome('failure') : null;
    span ? span.end() : null;
  }
}

async function receiveMessageBus() {
  const receiver = connection.createReceiver(config.AZURE.QUEUE_NAME);

  const processMessage = async (message) => {
    const { body, applicationProperties } = message;
    const traceparent =
      applicationProperties?.traceparent || apm.currentTraceparent;
    logger.info(`Message traceparent -- ${traceparent}`);
    const transaction = apm.startTransaction(
      `ASB_CALLBACK-${config.AZURE.QUEUE_NAME}`,
      'Callback',
      {
        childOf: traceparent?.toString(),
      }
    );
    const span = transaction?.startSpan(
      `Azure Service Bus - ${config.AZURE.QUEUE_NAME}`
    );
    try {
      apm.setLabel('Message Consumed', JSON.stringify(body));
      await messageHandler({ body, tag: _.get(applicationProperties, 'tag') });
      await receiver.completeMessage(message);
    } catch (err) {
      logger.info('Error in processing ASB Messages');
    } finally {
      if (span) {
        span.end();
        transaction.end();
      }
    }
  };

  const processError = async (args) => {
    logger.error(
      `Error from error source ${args.errorSource} occurred: `,
      args.error
    );
  };

  receiver.subscribe({
    processMessage,
    processError,
  });
}

const connectBus = async () => {
  await connect();
  receiveMessageBus();
};

module.exports = {
  sendMessageBus,
  connectBus,
};
