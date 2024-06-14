const joi = require('joi');

const get = joi.object({
  // params: joi.object().keys({
  //     test: joi.string().required(),
  // }),
  // body: joi.object().keys({
  //     name: joi.string().required(),
  //     title: joi.string().required(),
  //     is_private: joi.boolean().required(),
  //     date: joi.date().required(),
  //     end_date: joi.date().greater(joi.ref('start')).required(),
  //     target: joi
  //         .number()
  //         .min(1)
  //         .required(),
  //     array: joi.array().items(joi.string().min(1)),
  //     flag: joi.boolean().required().valid(0, 1),
  // }),
});

const postItem = joi
  .object({
    body: joi.object().keys({
      item_name: joi.string().required(),
      provider_id: joi.string().required(),
      price: joi.number().required(),
      list: joi.boolean().required(),
      quantity: joi.number().required(),
      tags: joi.object(),
    }),
  })
  .description('api');

module.exports = {
  get,
  postItem,
};
