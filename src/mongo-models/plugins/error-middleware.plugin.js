const boom = require('@hapi/boom');

const errorHandling = function (schema) {
  const handleError = function (err, res, next) {
    if (err.name === 'ValidationError') {
      throw boom.badRequest(err.message);
    }
    if (err.name === 'MongoError' && err.code === 11000) {
      throw boom.badRequest(err.message);
    }
    return next();
  };
  schema.post('save', handleError);
  schema.post('insertMany', handleError);
  schema.post('update', handleError);
  schema.post('findOneAndUpdate', handleError);
};

module.exports = errorHandling;
