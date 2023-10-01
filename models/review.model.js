const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
    {
        fullname: {
            type: String,
            required: false,
        },
        mobile: {
            type: String,
            required: false,
        },
        email: {
            type: String,
            required: false,
        },
        review: {
            type: String,
            required: true,
        },
    },
    { timestamps: true },
);

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
