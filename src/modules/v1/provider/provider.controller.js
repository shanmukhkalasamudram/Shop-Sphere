const errorDecorator = require('../../../util/error-decorator/error-decorator.util');
const service = require('./provider.service');

const get = errorDecorator(async (req, _res, next) => {
  const data = await service.get();
  next(data);
});

const postItem = errorDecorator(async (req, _res, next) => {
  const data = await service.postItem(req.body);
  next(data);
});

module.exports = {
  get,
  postItem,
};
