const config = {
  APP: {
    MORGAN_LOG_LEVEL: process.env.MORGAN_LOG_LEVEL || 'combined',
    NODE_ENV: process.env.NODE_ENV || 'test',
    PORT: process.env.PORT || 5000,
  },
  LOGGER: {
    LOG_LEVEL: process.env.LOG_LEVEL || 'debug',
    MORGAN_LOG_LEVEL: process.env.MORGAN_LOG_LEVEL || 'combined',
    SILENT_LOGGER: process.env.SILENT_LOGGER || false,
  },
  MONGO: {
    url: process.env.MONGO_URL,
    MONGO_CONNECT_TIMEOUT: 10000,
  },
  ELASTIC_SEARCH: {
    node: process.env.ELASTIC_SEARCH_URL,
  },
  DB: {
    SQL: {
      NAME: process.env.DATABASE_NAME,
      USERNAME: process.env.DATABASE_USERNAME,
      PASSWORD: process.env.DATABASE_PASSWORD,
      HOST: process.env.DATABASE_HOST,
      PORT: process.env.DATABASE_PORT,
    },
  },
  KAFKA: {
    CLIENT_ID: process.env.KAFKA_CLIENT_ID,
    BROKERS: process.env.KAFKA_BROKERS.split(','),
    SASL: {
      MECHANISM: process.env.KAFKA_SASL_MECHANISM,
      USERNAME: process.env.KAFKA_USERNAME,
      PASSWORD: process.env.KAFKA_PASSWORD,
    },
    CONSUMER: {
      GROUP: process.env.KAFKA_CONSUMER_GROUP,
    },
    PARTITION_COUNT: Number(process.env.KAFKA_TOPIC_PARTITION_COUNT),
    REPLICA_COUNT: Number(process.env.KAFKA_TOPIC_REPLICA_COUNT),
  },
};
module.exports = config;
