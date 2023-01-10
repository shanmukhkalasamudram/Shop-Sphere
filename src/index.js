const config = require('config');

process.env.TZ = 'Asia/Kolkata';

const logger = require('./util/logger/logger.util');
require('./util/axios');

async function bootstrap() {

    const app = require('./app');
    app.listen(config.APP.PORT, () =>
        logger.info(`server running on port ${config.APP.PORT}`)
    );
}

bootstrap();
