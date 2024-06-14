const _ = require('lodash');
const logger = require('../util/logger/logger.util');
const constants = require('../util/constants');

/* eslint-disable no-control-regex */
function hasSqlInjection(value) {
  const filtered_value = _.difference(value.split(' '), constants.EXCLUDE).join(
    ' '
  );
  const sqlMeta = new RegExp("(%27)|(')|(--)|(%23)|(#)", 'i');
  if (sqlMeta.test(filtered_value)) {
    return true;
  }

  const sqlMeta2 = new RegExp(
    "((%3D)|(=))[^\n]*((%27)|(')|(--)|(%3B)|(;))",
    'i'
  );
  if (sqlMeta2.test(filtered_value)) {
    return true;
  }

  const sqlTypical = new RegExp(
    "w*((%27)|('))((%6F)|o|(%4F))((%72)|r|(%52))",
    'i'
  );
  if (sqlTypical.test(filtered_value)) {
    return true;
  }

  const sqlUnion = new RegExp("((%27)|('))union", 'i');
  if (sqlUnion.test(filtered_value)) {
    return true;
  }
  return false;
}

function middleware(req, _res, next) {
  let containsSql = false;
  if (req.originalUrl !== null && req.originalUrl !== undefined) {
    if (hasSqlInjection(req.originalUrl) === true) {
      containsSql = true;
    }
  }

  if (containsSql === false) {
    let { body, query, params } = req;
    if (!_.isNil(body)) {
      if (typeof body !== 'string') {
        body = JSON.stringify(body);
      }
      if (hasSqlInjection(body) === true) {
        containsSql = true;
      }
    }
    if (!_.isNil(query)) {
      if (typeof query !== 'string') {
        query = JSON.stringify(query);
      }
      if (hasSqlInjection(query) === true) {
        containsSql = true;
      }
    }
    if (!_.isNil(params)) {
      if (typeof params !== 'string') {
        params = JSON.stringify(params);
      }
      if (hasSqlInjection(params) === true) {
        containsSql = true;
      }
    }

    if (containsSql === true) {
      logger.warn('SQL injection detected!');
      next();
    } else {
      next();
    }
  } else {
    logger.warn('SQL injection detected!');
    next();
  }
}

module.exports = middleware;
