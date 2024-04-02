const config = require('config');
const mongoose = require('mongoose');

process.env.TZ = 'Asia/Kolkata';

const logger = require('./util/logger/logger.util');
require('./util/axios');

async function bootstrap() {
  mongoose.connect(config.mongoose.url, config.mongoose.options).then(() => {
    logger.info('Connected to MongoDB');
  });
  const app = require('./app');
  app.listen(config.APP.PORT, '0.0.0.0', () => {
    logger.info(`Running on port ${config.APP.PORT}`);
  });
}

bootstrap();
