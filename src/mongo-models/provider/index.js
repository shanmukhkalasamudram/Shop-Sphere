const mongoose = require('mongoose');
const { v4 } = require('uuid');
const constants = require('../../util/constants');
const schemaOptionsPlugin = require('../plugins/schema-options.plugin');
const { produceMessage } = require('../../util/kafka/producer');

const schema = mongoose.Schema({
  provider_id: {
    type: mongoose.Schema.Types.ObjectId,
  },
  price: {
    type: Number,
    default: 0,
  },
  quantity: {
    type: Number,
    default: 0,
  },
  list: {
    type: Boolean,
    default: false,
  },
  tags: {
    type: Object,
    default: {},
  },
  item_name: {
    type: String,
    default: '',
  },
  image: {
    type: String,
    default: '',
  },
});

schema.pre('save', async () => {});

schema.post('save', async (doc) => {
  await produceMessage({
    topic: constants.KAFKA_TOPICS.PUSH_TO_ELASTIC,
    key: v4(),
    value: doc,
  });
});

schema.plugin(schemaOptionsPlugin);

const model = mongoose.model('items', schema);
module.exports = model;
