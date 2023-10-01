const mongoose = require('mongoose');

const defaultPricingData = [
    {
        id: 1,
        no_of_lessons: 8,
        price: 2,
        plan: 'plan_1',
        thirty_mins: false,
        discount: 0,
    },
    {
        id: 2,
        no_of_lessons: 24,
        price: 1.7,
        plan: 'plan_2',
        thirty_mins: false,
        discount: 0,
    },
    {
        id: 3,
        no_of_lessons: 48,
        price: 1.5,
        plan: 'plan_3',
        thirty_mins: false,
        discount: 0,
    },
    {
        id: 4,
        no_of_lessons: 8,
        price: 1,
        plan: 'plan_4',
        thirty_mins: true,
        discount: 0,
    },
    {
        id: 5,
        no_of_lessons: 24,
        price: 0.85,
        plan: 'plan_5',
        thirty_mins: true,
        discount: 0,
    },
    {
        id: 6,
        no_of_lessons: 48,
        price: 0.75,
        plan: 'plan_6',
        thirty_mins: true,
        discount: 0,
    },
];

const pricingSchema = new mongoose.Schema(
    {
        id: { type: Number },
        no_of_lessons: { type: Number },
        price: { type: Number },
        plan: { type: String },
        thirty_mins: { type: Boolean },
        discount: { type: Number },
    },
    { timestamps: false },
);

const Pricing = mongoose.model('Pricing', pricingSchema);

module.exports = { Pricing, defaultPricingData };
