const { ResourceNotFound } = require('../errors/httpErrors');
const { LessonTopic } = require('../models/lesson_topics.model');

const getLessonTopics = async (req, res) => {
    try {
        const lessonTopics = await LessonTopic.find();
        if (!lessonTopics) throw new ResourceNotFound('Topics Not Found!');
        res.status(200).json([...lessonTopics]);
    } catch (err) {
        res.status(500).json(err?.message || 'An Error Occured!');
    }
};

module.exports = { getLessonTopics };
