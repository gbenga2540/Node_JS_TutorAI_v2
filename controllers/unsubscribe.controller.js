const { ResourceNotFound } = require('../errors/httpErrors');
const User = require('../models/user.model');
const Unsubscribe = require('../models/unsubscribe.model');

const send_unsubscribe_reason = async (req, res) => {
    try {
        const { reason } = req.body;
        const user = await User.findById(req.user.id);
        if (!user) throw new ResourceNotFound('User does not exist');

        const unsubscribe = new Unsubscribe({
            ...user,
            reason: reason,
            password: '',
            parental_control: '1 1 1 1',
            dp: {
                public_id: '',
                url: '',
            },
        });

        await unsubscribe.save();
        res.status(200).json('Reason uploaded successfully!');
    } catch (err) {
        res.status(500).json(err?.message || 'An Error Occured!');
    }
};

module.exports = { send_unsubscribe_reason };
