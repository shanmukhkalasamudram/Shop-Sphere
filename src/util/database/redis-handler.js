const bluebird = require('bluebird');
const redis = require('redis');
const redisMock = require('redis-mock');
const _ = require('lodash');
const config = require('config');
const logger = require('../logger/logger.util');

let connectionOptions = {
  host: '127.0.0.1',
  port: '6379',
  password: 'password',
  retry_strategy: () => 500,
  enable_offline_queue: false,
};
connectionOptions = _.omitBy(connectionOptions, _.isNil);

_.set(connectionOptions, 'db', 0);

let redisClient;

const connect = async () => {
  bluebird.promisifyAll(redis.RedisClient.prototype);
  bluebird.promisifyAll(redis.Multi.prototype);
  if (config.APP.NODE_ENV === 'test') {
    bluebird.promisifyAll(redisMock.RedisClient.prototype);
    bluebird.promisifyAll(redisMock.Multi.prototype);
    redisClient = redisMock.createClient();
  }
  if (!redisClient) {
    redisClient = await redis.createClient(connectionOptions);
  }

  redisClient.on('connect', () => {
    logger.info(
      'Redis connection state changed to connect: (stream connected to server).'
    );
  });

  redisClient.on('ready', () => {
    logger.info(
      'Redis connection state changed to ready: (connection established).'
    );
    redisClient.ready = true;
  });

  redisClient.on('reconnecting', (reconnectionInfo) => {
    logger.info(
      `Redis connection state changed to reconnecting: (delay=${reconnectionInfo.delay}, attempt=${reconnectionInfo.attempt}).`
    );
    redisClient.ready = false;
  });

  redisClient.on('error', (error) => {
    logger.error(`Redis error: (${error}).`);
    redisClient.ready = false;
  });

  redisClient.on('end', () => {
    logger.info('Redis connection state changed to end: (connection closed).');
    redisClient.ready = false;
  });

  redisClient.on('warning', (warning) => {
    logger.info(`Redis warning: ${warning}.`);
  });

  return redisClient;
};

module.exports = { connect };
