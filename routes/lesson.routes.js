const router = require('express').Router();
const {
    activate_lesson,
    set_homework_score,
    set_exam_score,
} = require('../controllers/lesson.controller');
const auth = require('../middlewares/auth.middleware');

router.patch('/activate', activate_lesson);

router.patch('/hw-score', auth, set_homework_score);

router.patch('/exam-score', auth, set_exam_score);

module.exports = router;
