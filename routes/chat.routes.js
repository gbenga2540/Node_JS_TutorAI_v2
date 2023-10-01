const router = require('express').Router();
const chat = require('../controllers/chat.controller');

router.post('/', chat);

module.exports = router;
