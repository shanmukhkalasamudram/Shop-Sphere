const config = require('config');
const mongoose = require('mongoose');

process.env.TZ = 'Asia/Kolkata';

const logger = require('./util/logger/logger.util');
require('./util/axios');

async function bootstrap() {

    const app = require('./app');
    mongoose.connect(config.mongoose.url, config.mongoose.options).then(() => {
        logger.info('Connected to MongoDB');
        app.listen(config.APP.PORT, '0.0.0.0', () => {
            logger.info(`Listening to port ${config.APP.PORT}`);
        });
    });
}

bootstrap();
