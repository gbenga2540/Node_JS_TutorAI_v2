const { ResourceNotFound } = require('../errors/httpErrors');
const User = require('../models/user.model');
const Unsubscribe = require('../models/unsubscribe.model');

const send_unsubscribe_reason = async (req, res) => {
    try {
        const { reason } = req.body;
        const user = await User.findById(req.user.id);
        if (!user) throw new ResourceNotFound('User does not exist');

        const unsubscribe = new Unsubscribe({
            fullname: user.fullname,
            mobile: user.mobile,
            email: user.email,
            dateOfBirth: user.dateOfBirth,
            level: user.level,
            initialLevel: user.initialLevel,
            interests: user.interests,
            language: user.language,
            study_target: user.study_target,
            payment: user.payment,
            lessons: user.lessons,
            exams: user.exams,
            dp: {
                public_id: '',
                url: '',
            },
            parental_control: '1 1 1 1',
            delete_otp: user.delete_otp,
            password: '',
            verified: user.verified,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            reason: reason,
        });

        await unsubscribe.save();
        res.status(200).json('Reason uploaded successfully!');
    } catch (err) {
        res.status(500).json(err?.message || 'An Error Occured!');
    }
};

module.exports = { send_unsubscribe_reason };
