const router = require('express').Router();
const { getSubscriptions } = require('../controllers/pricing.controller');

router.get('/get-subscriptions', getSubscriptions);

module.exports = router;
