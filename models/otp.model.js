const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
    otp: {
        type: String,
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    expiresAt: {
        type: Date,
        expires: 30,
    },
});

const OTP = mongoose.model('OTP', otpSchema);

module.exports = OTP;
