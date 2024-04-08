const mongoose = require('mongoose');
const itemSchema = require('./provider');

const models = {};

const setUpModels = async () => {
  models.itemSchema = mongoose.model('item', itemSchema);
  return models;
};

module.exports = {
  setUpModels,
  models,
};
