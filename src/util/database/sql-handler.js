const { Sequelize } = require('sequelize');
const config = require('config');
const _ = require('lodash');
const boom = require('@hapi/boom');
const logger = require('../logger/logger.util');
const { setupModels } = require('../../sql-models');

const connect = async () => {
  let sequelize;

  sequelize = new Sequelize(
    _.get(config, 'DB.SQL.NAME'),
    _.get(config, 'DB.SQL.USERNAME'),
    _.get(config, 'DB.SQL.PASSWORD'),
    {
      host: _.get(config, 'DB.SQL.HOST'),
      port: _.get(config, 'DB.SQL.PORT'),
      dialect: 'mysql',
      timezone: '+05:30',
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
      logging: false,
    }
  );

  try {
    await sequelize.authenticate();
    logger.info('SQL Connection has been established successfully.');
  } catch (error) {
    logger.error(error);
    throw new boom.internal(error);
  }

  try {
    setupModels(sequelize);
  } catch (error) {
    throw new boom.internal(error);
  }
  sequelize.sync();
  return sequelize;
};

module.exports = { connect };
