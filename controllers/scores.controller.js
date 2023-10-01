const { ResourceNotFound } = require('../errors/httpErrors');
const User = require('../models/user.model');

const updateLevel = async (req, res) => {
    try {
        const { level } = req.body;
        const user = await User.findById(req.params.id);
        if (!user) throw new ResourceNotFound('User does not exist');

        if (user.initialLevel === null || !user.initialLevel) {
            user.initialLevel = level;
        }
        user.level = level;
        await user.save();
        res.status(200).json('User Level updated successfully');
    } catch (err) {
        res.status(500).json(err?.message || 'An Error Occured!');
    }
};

module.exports = { updateLevel };
