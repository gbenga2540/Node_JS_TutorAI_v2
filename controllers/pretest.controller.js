const { ResourceNotFound } = require('../errors/httpErrors');
const { ProficiencyQ } = require('../models/proficiencyQ.model');
const { ListeningQ } = require('../models/listeningQ.model');
const { WritingQ } = require('../models/writingQ.model');

const getPreTestQuestions = async (req, res) => {
    try {
        const proficiency_q = await ProficiencyQ.find();
        const listening_q = await ListeningQ.find();
        const writing_q = await WritingQ.find();
        if (proficiency_q?.length && listening_q?.length && writing_q?.length) {
            res.status(200).json({
                proficiency: proficiency_q,
                listening: listening_q,
                writing: writing_q,
            });
        } else {
            throw new ResourceNotFound('PreTest Data Not Found!');
        }
    } catch (err) {
        res.status(500).json(err?.message || 'An Error Occured!');
    }
};

module.exports = { getPreTestQuestions };
