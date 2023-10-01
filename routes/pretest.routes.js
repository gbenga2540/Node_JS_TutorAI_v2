const router = require('express').Router();
const { getPreTestQuestions } = require('../controllers/pretest.controller');

router.get('/get-pre-test', getPreTestQuestions);

module.exports = router;
