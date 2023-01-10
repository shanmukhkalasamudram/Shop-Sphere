const errorDecorator = require('../../../util/error-decorator/error-decorator.util');
const service = require('./test.service');

const get = errorDecorator(async (req, _res, next) => {
    const data = await service.get();
    next(data);
});

module.exports = {
    get,
};
