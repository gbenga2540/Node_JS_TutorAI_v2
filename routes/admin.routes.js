const router = require('express').Router();
const {
    create,
    login,
    getAUser,
    newSignup,
    subscribers,
    listInvoice,
    sendInvoice,
    getAllAdmins,
    toggleAdminStatus,
    deleteAdmins,
    getAllDashboardInfo,
    getAllReviews,
    changePassword,
    unSubscribers,
    updateALesson,
    addALesson,
    deleteALesson,
    deleteUsers,
    createSubscription,
    updateSubscription,
    deleteSubscriptions,
} = require('../controllers/admin.controller');
const { statistics } = require('../controllers/statistics.controller');
const auth = require('../middlewares/auth.middleware');

router.post('/create-admin', auth, create);

router.post('/admin-login', login);

router.get('/get-all-admins', auth, getAllAdmins);

router.patch('/update-admin-status', auth, toggleAdminStatus);

router.patch('/delete-admins', auth, deleteAdmins);

router.get('/get-dashb-info', auth, getAllDashboardInfo);

router.get('/get-all-reviews', auth, getAllReviews);

router.patch('/change-pwd', auth, changePassword);

router.get('/get-all-subscribers', auth, subscribers);

router.get('/new-signups', auth, newSignup);

router.get('/get-invoice-data', listInvoice);

router.post('/send-invoice', sendInvoice);

router.get('/get-all-unsubscribers', auth, unSubscribers);

router.patch('/update-a-lesson', auth, updateALesson);

router.post('/add-a-lesson', auth, addALesson);

router.patch('/delete-a-lesson', auth, deleteALesson);

router.patch('/delete-users', auth, deleteUsers);

router.post('/create-subscription', auth, createSubscription);

router.patch('/update-subscription', auth, updateSubscription);

router.patch('/delete-subscriptions', auth, deleteSubscriptions);

router.get('/statistics', auth, statistics);

router.get('/get-a-user', auth, getAUser);

module.exports = router;
