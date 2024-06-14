// const _ = require('lodash');
const { connection } = require('./mysql-util');
const logger = require('../logger/logger.util');

module.exports = {
  async get(key) {
    return await new Promise((resolve) => {
      connection.redis.getAsync(key, (err, response) => {
        if (err) {
          logger.error(err);
          resolve('');
        } else {
          resolve(response);
        }
      });
    });
  },

  async set(key, value, timeout = 60 * 60) {
    return await new Promise((resolve) => {
      connection.redis.setAsync(key, value, 'EX', timeout, (err, response) => {
        if (err) {
          logger.err(err);
          resolve('');
        } else {
          resolve(response);
        }
      });
    });
  },

  async addToSortedSet(key, value, user, ttl = 14400) {
    return await new Promise((resolve) => {
      const script = `
        local key_exists = redis.call('EXISTS', KEYS[1])
        if key_exists == 1 then
          redis.call('ZADD', KEYS[1], ARGV[1], ARGV[2])
          redis.call('EXPIRE', KEYS[1], ARGV[3])
        end
      `;
      connection.redis.eval(
        script,
        1,
        key,
        value,
        user,
        ttl,
        (err, response) => {
          if (err) {
            logger.error(err);
            resolve(0);
          } else {
            resolve(response);
          }
        }
      );
    });
  },

  /**
   *
   * data = [value1,user1,value2,user2]
   *
   */
  async addToSortedSetBulk(key, data = [], ttl = 14400) {
    return await new Promise((resolve) => {
      const pipeline = connection.redis.batch();
      pipeline.zadd(key, data);
      pipeline.EXPIRE(key, ttl);
      pipeline.exec((err, response) => {
        if (err) {
          logger.error(err);
          resolve(0);
        } else {
          resolve(response);
        }
      });
    });
  },
  async rankFromSet(key, member) {
    return new Promise((resolve) => {
      connection.redis.zrevrank(key, member, (err, rank) => {
        if (err) {
          logger.error(err);
          resolve(0);
        } else {
          resolve(rank !== null ? rank + 1 : 0);
        }
      });
    });
  },

  async countFromSet(key) {
    return new Promise((resolve) => {
      connection.redis.ZCARD(key, (err, count) => {
        if (err) {
          logger.error(err);
          resolve(0);
        } else {
          resolve(count);
        }
      });
    });
  },

  async paginatedDataFromSet(key, start = 0, end = -1) {
    let result = await new Promise((resolve) => {
      connection.redis.zrevrange(
        key,
        start,
        end - 1,
        'WITHSCORES',
        (err, response) => {
          if (err) {
            logger.error(err);
            resolve([]);
          } else {
            resolve(response);
          }
        }
      );
    });
    return result;
  },

  async scoreFromSet(key, member) {
    return await new Promise((resolve) => {
      connection.redis.ZSCORE(key, member, (err, response) => {
        if (err) {
          logger.error(err);
          resolve(0);
        } else {
          resolve(response);
        }
      });
    });
  },

  async deleteFromSet(key) {
    return await new Promise((resolve) => {
      connection.redis.DEL(key, (err, response) => {
        if (err) {
          logger.error(err);
          resolve(0);
        } else {
          resolve(response);
        }
      });
    });
  },
  async keyExists(key) {
    return await new Promise((resolve) => {
      connection.redis.EXISTS(key, (err, response) => {
        if (err) {
          logger.error(err);
          resolve(0);
        } else {
          resolve(response);
        }
      });
    });
  },
};
