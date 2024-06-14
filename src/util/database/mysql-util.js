const sql = require('./sql-handler');
const redis = require('./redis-handler');

let connection = {};

const connectDBSql = async () => {
  connection.redis = await redis.connect();
  connection.sql = await sql.connect();
  return connection;
};

const disconnectDB = async () => {
  // if (connection.mongo) {
  //   await connection.mongo.close();
  // } else {
  //   logger.info('Mongo DB: Configuration not available in config.');
  // }
};

module.exports = { connectDBSql, disconnectDB, connection };
