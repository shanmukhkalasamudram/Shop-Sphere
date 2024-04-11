const router = require('express').Router();
const authMiddleware = require('../../../middlewares/authentication.middleware');
const validationMiddleware = require('../../../middlewares/validation.middleware');
const controller = require('./provider.controller');
const schema = require('./provider.schema');

router.post(
  '/items',
  authMiddleware({}),
  validationMiddleware(schema.postItem),
  controller.get
);

module.exports = router;
