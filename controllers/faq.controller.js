const { ResourceNotFound } = require('../errors/httpErrors');
const { FAQ } = require('../models/faq.model');
const ObjectId = require('mongodb').ObjectId;

const getFAQs = async (req, res) => {
    try {
        const faqs = await FAQ.find();
        if (!faqs) throw new ResourceNotFound('FAQs Data Not Found!');

        res.status(200).json(faqs);
    } catch (err) {
        res.status(500).json(err?.message || 'An Error Occured!');
    }
};

const createFAQ = async (req, res) => {
    try {
        const faq_title = req.body.faq_title;
        const faq_body = req.body.faq_body;
        const faq_type = req.body.faq_type;

        const faq = new FAQ({
            custom: false,
            faq_title: faq_title,
            faq_body: faq_body,
            faq_type: faq_type,
        });

        await faq.save();
        res.status(200).json({ message: 'Created!' });
    } catch (err) {
        res.status(500).json(err?.message || 'An Error Occured!');
    }
};

const updateFAQ = async (req, res) => {
    try {
        const faq_id = req.body.faq_id;

        const faq_title = req.body.faq_title;
        const faq_body = req.body.faq_body;
        const faq_type = req.body.faq_type;

        const faq = await FAQ.findById(faq_id);
        if (!faq) throw new ResourceNotFound('FAQ Data Not Found!');

        faq.faq_title = faq_title;
        faq.faq_body = faq_body;
        faq.faq_type = faq_type;

        await faq.save();

        res.status(200).json({ message: 'Updated!' });
    } catch (err) {
        res.status(500).json(err?.message || 'An Error Occured!');
    }
};

const deleteFAQs = async (req, res) => {
    const faqIDs = req.body.faqIDs;

    try {
        if (faqIDs?.length <= 0) throw new Forbidden('FAQs List Empty!');
        const objectIdsToDelete = faqIDs.map(id => new ObjectId(id));
        await FAQ.deleteMany({ _id: { $in: objectIdsToDelete } });

        res.status(200).json({ message: 'FAQs deleted!' });
    } catch (err) {
        res.status(500).json(err?.message || 'An Error Occured!');
    }
};

module.exports = { getFAQs, updateFAQ, deleteFAQs, createFAQ };
