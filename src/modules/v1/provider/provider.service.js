const { models } = require('../../../mongo-models');

const get = async () => {
  const { itemSchema } = models;
  const data = await itemSchema.create({});
  return {
    data,
  };
};

module.exports = { get };
