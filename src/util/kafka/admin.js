const config = require('config');
const logger = require('../logger/logger.util');
const { createAdmin, disconnectAdmin } = require('./index');
const { subscribeKafka } = require('./consumer');

const fetchTopics = async (admin) => {
  logger.info('Kafka : Fetching topics list');
  const topics = await admin.listTopics();
  return topics;
};

const createTopics = async (admin, topic_list = []) => {
  logger.info(`Kafka: Creating Topics - ${JSON.stringify(topic_list)}`);

  const topics = topic_list?.map((topic) => ({
    topic,
    numPartitions: config.KAFKA.PARTITION_COUNT,
    replicationFactor: config.KAFKA.REPLICA_COUNT,
  }));

  try {
    await admin.createTopics({
      topics,
    });
  } catch (err) {
    logger.error(err);
  }
};

const topics = {
  push_to_elastic: 'push_to_elastic_database',
};
const filterTopics = (topic_list = []) => {
  const values = Object.values(topics);
  return values?.filter((topic) => !topic_list.includes(topic));
};

const fetchAndCreateTopics = async () => {
  const admin = await createAdmin();

  const topic_list = await fetchTopics(admin);

  try {
    await createTopics(admin, filterTopics(topic_list));
  } catch (err) {
    logger.error(err);
  }

  await disconnectAdmin();
};

const setupKafka = async () => {
  await fetchAndCreateTopics();
  await subscribeKafka();
};

module.exports = {
  setupKafka,
};
