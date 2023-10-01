const router = require('express').Router();
const {
    setAdminVariables,
    getAdminVariables,
    getOnlyAdminVars,
    setPaymentMethodAdminVariables,
} = require('../controllers/admin_var.controller');
const auth = require('../middlewares/auth.middleware');

router.patch('/set-variables', auth, setAdminVariables);

router.patch('/set-pm-variables', auth, setPaymentMethodAdminVariables);

router.get('/get-variables', getAdminVariables);

router.get('/get-only-admin-vars', getOnlyAdminVars);

module.exports = router;
