const { ResourceNotFound, Forbidden } = require('../errors/httpErrors');
const { AdminVar } = require('../models/admin_var.model');

const setAdminVariables = async (req, res) => {
    try {
        const adminVar = await AdminVar.findById(process.env.ADMIN_VAR_ID);
        if (!adminVar) throw new ResourceNotFound('Admin Variables not found!');

        await AdminVar.findByIdAndUpdate(
            process.env.ADMIN_VAR_ID,
            {
                $set: req.body,
            },
            { new: true },
        );
        res.status(200).json({ message: 'Updated!' });
    } catch (err) {
        res.status(500).json(err?.message || 'An Error Occured!');
    }
};

const setPaymentMethodAdminVariables = async (req, res) => {
    try {
        const enable_paypal = req.body.enable_paypal;
        const enable_stripe = req.body.enable_stripe;
        const enable_flutterwave = req.body.enable_flutterwave;

        const adminVar = await AdminVar.findById(process.env.ADMIN_VAR_ID);
        if (!adminVar) throw new ResourceNotFound('Admin Variables not found!');

        if (
            !process.env.PAYPAL_CLIENT_ID &&
            !process.env.PAYPAL_CLIENT_SECRET &&
            enable_paypal
        ) {
            throw new Forbidden('Paypal key is missing in the Env Variables!');
        }

        if (
            !process.env.STRIPE_PUBLIC_KEY &&
            !process.env.STRIPE_SECRET_KEY &&
            enable_stripe
        ) {
            throw new Forbidden('Stripe key is missing in the Env Variables!');
        }

        if (!process.env.FLUTTER_WAVE_PUBLIC_KEY && enable_flutterwave) {
            throw new Forbidden(
                'Flutterwave key is missing in the Env Variables!',
            );
        }

        await AdminVar.findByIdAndUpdate(
            process.env.ADMIN_VAR_ID,
            {
                $set: req.body,
            },
            { new: true },
        );
        res.status(200).json({ message: 'Updated!' });
    } catch (err) {
        res.status(500).json(err?.message || 'An Error Occured!');
    }
};

const getAdminVariables = async (req, res) => {
    try {
        const adminVar = await AdminVar.findById(process.env.ADMIN_VAR_ID);
        if (!adminVar) {
            throw new ResourceNotFound('Admin Variables Data Not Found!');
        } else {
            res.status(200).json({
                ...adminVar?._doc,
                stripe_public_key: process.env.STRIPE_PUBLIC_KEY || '',
                flutterwave_public_key:
                    process.env.FLUTTER_WAVE_PUBLIC_KEY || '',
                google_cloud_key: process.env.GOOGLE_CLOUD_KEY || '',
            });
        }
    } catch (err) {
        res.status(500).json(err?.message || 'An Error Occured!');
    }
};

const getOnlyAdminVars = async (req, res) => {
    try {
        const adminVar = await AdminVar.findById(process.env.ADMIN_VAR_ID);
        if (!adminVar) {
            throw new ResourceNotFound('Admin Variables Data Not Found!');
        } else {
            res.status(200).json({
                ...adminVar?._doc,
                grammar_prompt: '',
                reading_prompt: '',
                writing_prompt: '',
                conversation_prompt: '',
            });
        }
    } catch (err) {
        res.status(500).json(err?.message || 'An Error Occured!');
    }
};

module.exports = {
    setAdminVariables,
    getAdminVariables,
    getOnlyAdminVars,
    setPaymentMethodAdminVariables,
};
