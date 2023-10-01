const router = require('express').Router();
const { send_review } = require('../controllers/review.controller');
const auth = require('../middlewares/auth.middleware');

router.post('/send-review', auth, send_review);

module.exports = router;
