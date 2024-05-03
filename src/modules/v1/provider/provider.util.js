const config = require('config');
const { Client } = require('@elastic/elasticsearch');

const elasticClient = new Client(config.ELASTIC_SEARCH);

const pushToElastic = async (data) => {
  let result = await elasticClient.index({
    index: 'items',
    body: data,
  });
  return {
    result,
  };
};

module.exports = { pushToElastic };
