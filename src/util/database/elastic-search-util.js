const { Client } = require('@elastic/elasticsearch');
const config = require('config');
const logger = require('../logger/logger.util');

const elasticDB = async () => {
  const elasticClient = new Client(config.ELASTIC_SEARCH);

  elasticClient
    .info()
    .then((response) => logger.info(response))
    .catch((error) => logger.info(error));
};

module.exports = { elasticDB };
