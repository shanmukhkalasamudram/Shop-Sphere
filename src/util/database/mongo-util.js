const config = require('config');
const logger = require('../logger');
const mongoDb = require('./mongodb-handler');

let mongoConnection;

const connectDB = async () => {
  if (config.DB.MONGO) {
    mongoConnection = await mongoDb.connect();
  } else {
    logger.error('Mongo DB: Configuration not available in config.');
  }
};

const disconnectDB = async () => {
  if (mongoConnection) {
    await mongoConnection.close();
  } else {
    logger.info('Mongo DB: Configuration not available in config.');
  }
};

module.exports = { connectDB, disconnectDB };
