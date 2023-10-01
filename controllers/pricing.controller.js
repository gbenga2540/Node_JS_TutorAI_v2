const { ResourceNotFound } = require('../errors/httpErrors');
const { Pricing } = require('../models/pricing.model');

const getSubscriptions = async (req, res) => {
    try {
        const pricing = await Pricing.find();
        if (!pricing) {
            throw new ResourceNotFound('Subscription Data Not Found!');
        } else {
            res.status(200).json(pricing);
        }
    } catch (err) {
        res.status(500).json(err?.message || 'An Error Occured!');
    }
};

module.exports = { getSubscriptions };
