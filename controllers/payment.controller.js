require('dotenv').config();
const { STRIPE_SECRET_KEY } = process.env;
const stripe = require('stripe')(STRIPE_SECRET_KEY);
const User = require('../models/user.model');
const { AdminVar } = require('../models/admin_var.model');
const { Pricing } = require('../models/pricing.model');
const paypal = require('../config/paypal.config');

const stripeIntent = async (req, res) => {
    const { userPlan } = req.body;

    try {
        const user_plan = await calculatePlanPrice(userPlan);
        const generate_payment_intent = async ({ user, customer }) => {
            const payment_intent = await stripe.paymentIntents.create({
                amount: user_plan?.stripe,
                currency: 'usd',
                automatic_payment_methods: {
                    enabled: true,
                },
                customer: customer?.id,
                metadata: {
                    customerName: user?.fullname,
                    customerEmail: user?.email,
                },
                description: `$${user_plan?.raw} paid by ${user?.fullname} for ${user_plan?.no_of_lessons} TutorAI Lessons.`,
            });
            res.status(200).json(payment_intent?.client_secret);
        };

        const user = await User.findById(req.user.id);
        if (!user) throw new ResourceNotFound('User account not found!');

        const existingCustomers = await stripe.customers.list({
            email: user?.email,
        });

        if (existingCustomers.data.length > 0) {
            const customer = existingCustomers.data[0];
            generate_payment_intent({ user: user, customer: customer });
        } else {
            const customer = await stripe.customers.create({
                name: user?.fullname,
                email: user?.email,
            });
            generate_payment_intent({ user: user, customer: customer });
        }
    } catch (err) {
        res.status(500).json(err?.message || 'An Error Occured!');
    }
};

const paypalIntent = async (req, res) => {
    const { userPlan } = req.body;

    const server_url = `${req.protocol}://${req.get('host')}`;
    try {
        const user_plan = await calculatePlanPrice(userPlan);

        const user = await User.findById(req.user.id);
        if (!user) throw new ResourceNotFound('User account not found');

        const create_payment_json = {
            intent: 'sale',
            payer: {
                payment_method: 'paypal',
            },
            redirect_urls: {
                return_url: `${server_url}/api/payment/paypal-success`,
                cancel_url: `${server_url}/api/payment/paypal-cancel`,
            },
            transactions: [
                {
                    item_list: {
                        items: [
                            {
                                name: `TutorAI ${user_plan?.no_of_lessons} Lessons Plan.`,
                                sku: `TutorAI ${user_plan?.no_of_lessons} Lessons Plan.`,
                                price: user_plan?.raw,
                                currency: 'USD',
                                quantity: 1,
                            },
                        ],
                    },
                    amount: {
                        currency: 'USD',
                        total: user_plan?.raw,
                    },
                    description: `$${user_plan?.raw} paid by ${user?.fullname} for ${user_plan?.no_of_lessons} TutorAI Lessons.`,
                },
            ],
        };

        paypal.payment.create(create_payment_json, (error, payment) => {
            if (error) {
                res.status(500).json(
                    error?.response?.message || 'An Error Occured',
                );
            } else {
                res.status(200).json(
                    payment.links.find(link => link.rel === 'approval_url')
                        .href,
                );
            }
        });
    } catch (err) {
        res.status(500).json(err?.message || 'An Error Occured!');
    }
};

const paypalSuccess = async (req, res) => {
    const payerID = req.query?.PayerID;
    const paymentId = req.query?.paymentId;

    const executePayment = {
        payer_id: payerID,
    };

    try {
        paypal.payment.execute(paymentId, executePayment, (error, payment) => {
            if (error) {
                res.status(500).json(
                    error?.response?.message || 'An Error Occured',
                );
            } else {
                res.render('PaypalSuccess');
            }
        });
    } catch (error) {
        res.status(500).json(err?.message || 'An Error Occured!');
    }
};

const paypalCancel = (req, res) => {
    res.render('PaypalCancel');
};

const planUpgradeStripeIntent = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) throw new ResourceNotFound('User account not found!');

        const adminVar = await AdminVar.findById(process.env.ADMIN_VAR_ID);
        if (!adminVar) throw new ResourceNotFound('An Error Occured!');

        if (user.payment <= 0 || adminVar.price_for_plan_conversion <= 0) {
            throw new ResourceNotFound('An Error Occured!');
        }
        const amountToPay = user.payment * adminVar.price_for_plan_conversion;

        const generate_payment_intent = async ({ user, customer }) => {
            const payment_intent = await stripe.paymentIntents.create({
                amount: Math.floor(amountToPay * 100),
                currency: 'usd',
                automatic_payment_methods: {
                    enabled: true,
                },
                customer: customer?.id,
                metadata: {
                    customerName: user?.fullname,
                    customerEmail: user?.email,
                },
                description: `$${amountToPay} paid by ${user?.fullname} for Study Plan Upgrade (60-minute plan).`,
            });
            res.status(200).json(payment_intent?.client_secret);
        };

        const existingCustomers = await stripe.customers.list({
            email: user?.email,
        });

        if (existingCustomers.data.length > 0) {
            const customer = existingCustomers.data[0];
            generate_payment_intent({ user: user, customer: customer });
        } else {
            const customer = await stripe.customers.create({
                name: user?.fullname,
                email: user?.email,
            });
            generate_payment_intent({ user: user, customer: customer });
        }
    } catch (err) {
        res.status(500).json(err?.message || 'An Error Occured!');
    }
};

const planUpgradePaypalIntent = async (req, res) => {
    const server_url = `${req.protocol}://${req.get('host')}`;
    try {
        const user = await User.findById(req.user.id);
        if (!user) throw new ResourceNotFound('User account not found!');

        const adminVar = await AdminVar.findById(process.env.ADMIN_VAR_ID);
        if (!adminVar) throw new ResourceNotFound('An Error Occured!');

        if (user.payment <= 0 || adminVar.price_for_plan_conversion <= 0) {
            throw new ResourceNotFound('An Error Occured!');
        }
        const amountToPay = (
            user.payment * adminVar.price_for_plan_conversion
        )?.toFixed(2);

        const create_payment_json = {
            intent: 'sale',
            payer: {
                payment_method: 'paypal',
            },
            redirect_urls: {
                return_url: `${server_url}/api/payment/paypal-success`,
                cancel_url: `${server_url}/api/payment/paypal-cancel`,
            },
            transactions: [
                {
                    item_list: {
                        items: [
                            {
                                name: 'TutorAI 60-minute Plan Upgrade.',
                                sku: 'TutorAI 60-minute Plan Upgrade.',
                                price: amountToPay,
                                currency: 'USD',
                                quantity: 1,
                            },
                        ],
                    },
                    amount: {
                        currency: 'USD',
                        total: amountToPay,
                    },
                    description: `$${amountToPay} paid by ${user?.fullname} for Study Plan Upgrade (60-minute plan).`,
                },
            ],
        };

        paypal.payment.create(create_payment_json, (error, payment) => {
            if (error) {
                res.status(500).json(
                    error?.response?.message || 'An Error Occured',
                );
            } else {
                res.status(200).json(
                    payment.links.find(link => link.rel === 'approval_url')
                        .href,
                );
            }
        });
    } catch (err) {
        res.status(500).json(err?.message || 'An Error Occured!');
    }
};

const calculatePlanPrice = async plan => {
    const pricingData = await Pricing.find();
    if (!pricingData) throw new Error('Invalid plan!');

    const convertToPlanPrices = pricingData => {
        const planPrices = {};
        pricingData.forEach(plan => {
            const totalPrice =
                ((100 - (plan.discount || 0)) / 100) *
                plan.no_of_lessons *
                plan.price;
            planPrices[plan.plan] = totalPrice;
        });
        return planPrices;
    };
    const convertToNoOfLessons = pricingData => {
        const planLesson = {};
        pricingData.forEach(plan => {
            planLesson[plan.plan] = plan.no_of_lessons;
        });
        return planLesson;
    };

    const pricing = pricingData;

    const planPrices = convertToPlanPrices([...pricing]);
    const noOfLessons = convertToNoOfLessons([...pricing]);

    const price = planPrices[plan];

    if (price) {
        return {
            stripe: Math.floor(price * 100),
            raw: price.toFixed(2),
            no_of_lessons: noOfLessons[plan],
        };
    } else {
        throw new Error('Invalid plan selection');
    }
};

module.exports = {
    stripeIntent,
    paypalIntent,
    paypalCancel,
    paypalSuccess,
    planUpgradePaypalIntent,
    planUpgradeStripeIntent,
};
