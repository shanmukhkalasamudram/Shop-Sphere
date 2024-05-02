const mongoose = require('mongoose');
const schemaOptionsPlugin = require('../plugins/schema-options.plugin');

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

schema.post('save', async (doc) => {});

schema.plugin(schemaOptionsPlugin);

const model = mongoose.model('items', schema);
module.exports = model;
