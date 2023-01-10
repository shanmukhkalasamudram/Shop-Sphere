const HTTP_STATUS_CODES = require('http-status-codes');
const logger = require('../logger/logger.util');
const constant = require('../constants');

const errorDecorator = (fn) => async (req, res, next) => {
    try {
        return await fn(req, res, next);
    } catch (err) {
        if (err.isBoom && err.output.statusCode < 500) {
            return res.status(err.output.statusCode).send({
                error: { message: err.message },
                is_success: false,
            });
        }
        logger.error(`Error occurred: ${err.message}`);
        logger.error(err.stack);
        return res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({
            error: { message: constant.messages.INTERNAL_SERVER_ERROR },
            is_success: false,
        });
    }
};
module.exports = errorDecorator;
