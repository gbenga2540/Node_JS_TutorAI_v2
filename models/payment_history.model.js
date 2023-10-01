const mongoose = require('mongoose');

const paymentHistorySchema = new mongoose.Schema(
    {
        email: {
            type: String,
        },
        fullName: {
            type: String,
        },
        method: {
            type: String,
            enum: ['Paypal', 'Stripe'],
            default: 'Paypal',
        },
        lessons: {
            type: Number,
        },
        price: {
            type: Number,
        },
        status: {
            type: String,
            enum: ['Completed', 'Failed', 'Pending'],
            default: 'Pending',
        },
        description: {
            type: String,
        },
    },
    { timestamps: true },
);

const PaymentHistory = mongoose.model('PaymentHistory', paymentHistorySchema);

module.exports = PaymentHistory;
