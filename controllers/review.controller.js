const { ResourceNotFound } = require('../errors/httpErrors');
const User = require('../models/user.model');
const Review = require('../models/review.model');

const send_review = async (req, res) => {
    try {
        const { review } = req.body;
        const user = await User.findById(req.user.id);
        if (!user) throw new ResourceNotFound('User does not exist');

        const save_review = new Review({
            fullname: user.fullname,
            email: user.email,
            mobile: user.mobile,
            review: review,
        });

        await save_review.save();
        res.status(200).json('Review uploaded successfully!');
    } catch (err) {
        res.status(500).json(err?.message || 'An Error Occured!');
    }
};

module.exports = { send_review };
