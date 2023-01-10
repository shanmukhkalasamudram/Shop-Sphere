const { get, isNil, isArray, findIndex } = require('lodash');
const boom = require('@hapi/boom');
const errorDecorator = require('../util/error-decorator/error-decorator.util');

function authenticationMiddleware({ }) {
    return errorDecorator(async (req, _res, next) => {
        return next();
    });
}

module.exports = authenticationMiddleware;
