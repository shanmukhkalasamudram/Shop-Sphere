const { Item } = require('../../../mongo-models');

const postItem = async (data) => {
  const result = await Item.create(data);
  return {
    result,
  };
};

module.exports = { postItem };
