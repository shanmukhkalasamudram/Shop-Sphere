const { models } = require('../../../mongo-models');

const get = async () => {
  const { itemSchema } = models;
  const data = await itemSchema.create({});
  return {
    data,
  };
};

const postItem = async (data) => {
  const { itemSchema } = models;
  const result = await itemSchema.create(data);
  return {
    result,
  };
};

module.exports = { get, postItem };
