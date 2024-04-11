const errorDecorator = require('../util/error-decorator/error-decorator.util');

function authenticationMiddleware({}) {
  return errorDecorator(async (req, _res, next) => {
    return next();
  });
}

module.exports = authenticationMiddleware;
