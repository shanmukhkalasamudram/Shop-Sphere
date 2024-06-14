const _ = require('lodash');
// const { get, set } = require('../../../util/database/redis-wrapper');
const { getCache, cache } = require('../../../util/database/node-cache');
const { models } = require('../../../sql-models');

const getUser = async ({ user_id }) => {
  const { users } = models;
  // await get(`customer_${user_id}`);
  let data = {};
  if (_.isEmpty(data)) {
    data = await getCache(`customer_${user_id}`);
    if (_.isEmpty(data)) {
      data = await users.findOne({
        where: { user_id },
        raw: true,
      });
      cache(`customer_${user_id}`, data);
    }
    // set(`customer_${user_id}`, data, 1000);
  }
  return data;
};

module.exports = { getUser };
