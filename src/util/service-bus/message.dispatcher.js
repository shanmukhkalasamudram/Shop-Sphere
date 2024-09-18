const boom = require('@hapi/boom');
const logger = require('../logger/logger.util');

async function messageHandler({ body, tag }) {
  try {
    logger.info(body);
    switch (tag) {
      default:
        break;
    }
  } catch (e) {
    throw boom.badData(e);
  }
}

module.exports = {
  messageHandler,
};
