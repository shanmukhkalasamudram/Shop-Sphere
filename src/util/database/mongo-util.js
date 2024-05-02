const mongoose = require('mongoose');
const config = require('config');
const logger = require('../logger/logger.util');
// const { setUpModels } = require('../../mongo-models');

let mongoConnection;

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  connectTimeoutMS: config.MONGO.MONGO_CONNECT_TIMEOUT,
  serverSelectionTimeoutMS: 180000,
  keepAlive: true,
};

const connectDB = async () => {
  if (config.MONGO) {
    await mongoose.connect(config.MONGO.url, options);
    // await setUpModels();
    logger.info('Database Connected and Models Loaded');
  } else {
    logger.error('Error');
  }
};

const disconnectDB = async () => {
  if (mongoConnection) {
    await mongoConnection.close();
  } else {
    logger.info('Error');
  }
};

module.exports = { connectDB, disconnectDB };
