const _ = require('lodash');
const NodeCache = require('node-cache');
const logger = require('../logger/logger.util');

const cacheData = new NodeCache();

const cache = async (key, value, ttl) => {
  if (value) {
    let filtered_value = value;
    if (_.isArray(value)) {
      filtered_value = value;
    } else if (_.isObject(value)) {
      filtered_value = _.omitBy(value, _.isNil);
    }
    cacheData.set(`${key}`, JSON.stringify(filtered_value), ttl);
    logger.info(`${key} saved in cache`);
  }
};

const getCache = async (key) => {
  let data = cacheData.get(key);
  if (data === undefined) {
    return {};
  }
  data = JSON.parse(data);
  logger.info(`${key} found in cache`);
  return data;
};

const deleteCache = async (key) => {
  let data = cacheData.del(key);
  logger.info(`${key} deleted from cache`);
  return data;
};

module.exports = { cache, getCache, deleteCache };
