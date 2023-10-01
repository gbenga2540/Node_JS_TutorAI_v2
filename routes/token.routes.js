const router = require('express').Router();
const {
    verifyOTP,
    resendOTP,
    parentalControl,
    deleteAccountOTP,
} = require('../controllers/token.controller');
const auth = require('../middlewares/auth.middleware');

router.post('/verify/:id', verifyOTP);

router.post('/resend/:id', resendOTP);

router.post('/control-pin', auth, parentalControl);

router.post('/del-acc-otp', auth, deleteAccountOTP);

module.exports = router;
