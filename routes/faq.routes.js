const router = require('express').Router();
const {
    getFAQs,
    updateFAQ,
    deleteFAQs,
    createFAQ,
} = require('../controllers/faq.controller');
const auth = require('../middlewares/auth.middleware');

router.get('/get-faqs', getFAQs);

router.post('/create-faq', auth, createFAQ);

router.patch('/update-faq', auth, updateFAQ);

router.patch('/delete-faqs', auth, deleteFAQs);

module.exports = router;
