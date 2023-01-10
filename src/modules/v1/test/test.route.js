const router = require('express').Router();
const authMiddleware = require('../../../middlewares/authentication.middleware');
const validationMiddleware = require('../../../middlewares/validation.middleware');
const controller = require('./test.controller');
const schema = require('./test.schema');

router.get(
    '/',
    authMiddleware({}),
    validationMiddleware(schema.get),
    controller.get
);

module.exports = router;
