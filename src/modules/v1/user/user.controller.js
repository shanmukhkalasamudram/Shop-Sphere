const _ = require('lodash');
const errorDecorator = require('../../../util/error-decorator/error-decorator.util');
const service = require('./user.service');

const get = errorDecorator(async (req, _res, next) => {
  const user_id = _.get(req, 'headers.user_id');
  const data = await service.getUser({ user_id });
  next(data);
});

module.exports = {
  get,
};
