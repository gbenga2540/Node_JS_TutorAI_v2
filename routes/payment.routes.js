const router = require('express').Router();
const {
    stripeIntent,
    paypalIntent,
    paypalCancel,
    paypalSuccess,
    planUpgradeStripeIntent,
    planUpgradePaypalIntent,
    updatePaymentHistory,
} = require('../controllers/payment.controller');
const auth = require('../middlewares/auth.middleware');

router.post('/stripe-intent', auth, stripeIntent);
router.post('/paypal-intent', auth, paypalIntent);
router.get('/paypal-cancel', paypalCancel);
router.get('/paypal-success', paypalSuccess);
router.post('/plan-upgrade-stripe-intent', auth, planUpgradeStripeIntent);
router.post('/plan-upgrade-paypal-intent', auth, planUpgradePaypalIntent);
router.patch('/update-payment-history', auth, updatePaymentHistory);

module.exports = router;
