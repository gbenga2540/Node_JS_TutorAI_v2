const router = require('express').Router();
const {
    send_unsubscribe_reason,
} = require('../controllers/unsubscribe.controller');
const auth = require('../middlewares/auth.middleware');

router.post('/send-reason', auth, send_unsubscribe_reason);

module.exports = router;
