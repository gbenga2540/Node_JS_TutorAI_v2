const router = require('express').Router();
const { getLessonTopics } = require('../controllers/lesson_topics.controller');

router.get('/get-lesson-topics', getLessonTopics);

module.exports = router;
