const config = require('config');
const { connectDB } = require('./util/database/mongo-util');

process.env.TZ = 'Asia/Kolkata';

const logger = require('./util/logger/logger.util');
require('./util/axios');

async function bootstrap() {
  await connectDB();
  const app = require('./app');
  app.listen(config.APP.PORT, '0.0.0.0', () => {
    logger.info(`Running on port ${config.APP.PORT}`);
  });
}

bootstrap();
