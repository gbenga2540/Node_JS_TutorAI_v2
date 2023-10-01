const { ResourceNotFound } = require('../errors/httpErrors');
const OTP = require('../models/otp.model');
const User = require('../models/user.model');
const {
    signupEmail,
    parentalControlEmail,
    deleteOTPEmail,
} = require('../services/email.service');

const verifyOTP = async (req, res) => {
    try {
        const { otp } = req.body;

        const otpDoc = await OTP.findOne({ otp, user: req.params.id });

        if (!otpDoc) throw new ResourceNotFound('Wrong Code');

        const user = await User.findById(req.params.id);
        if (!user) throw new ResourceNotFound('User not found!');

        user.verified = true;

        await user.save();

        await otpDoc.deleteOne();
        res.status(200).json('Successful');
    } catch (err) {
        res.status(500).json(err?.message || 'An Error Occured!');
    }
};

const resendOTP = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) throw new ResourceNotFound('User not found!');

        const latestOTP = await OTP.findOne({ user: user._id }).sort({
            createdAt: -1,
        });

        if (latestOTP) {
            // Generate new OTP
            const newOTP = generateOTP();
            latestOTP.otp = newOTP;
            latestOTP.expiresAt = new Date(new Date().getTime() + 30 * 1000);
            await latestOTP.save();

            await signupEmail(user.email, newOTP);
            res.status(200).json('Resend OTP successful..');
        } else {
            const otp = generateOTP();
            const otpDoc = new OTP({ otp, user: user._id });
            await otpDoc.save();

            await signupEmail(user.email, otp);
            res.status(200).json('New OTP generated successfully');
        }
    } catch (err) {
        res.status(500).json(err?.message || 'An Error Occured!');
    }
};

const parentalControl = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) throw new ResourceNotFound('User not found');
        const pc = generateOTP();
        user.parental_control = pc;
        await parentalControlEmail(user.email, pc);
        await user.save();
        res.status(200).json({ message: 'Pin sent successfully', pc_pin: pc });
    } catch (err) {
        res.status(500).json(err?.message || 'An Error Occured!');
    }
};

const deleteAccountOTP = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) throw new ResourceNotFound('User not found');
        const del_PIN = generateOTP();
        user.delete_otp = del_PIN;
        await deleteOTPEmail(user.email, del_PIN);
        await user.save();
        res.status(200).json({
            message: 'Pin sent successfully',
            del_PIN: del_PIN,
        });
    } catch (err) {
        res.status(500).json(err?.message || 'An Error Occured!');
    }
};

const generateOTP = () => {
    return `${Math.floor(Math.random() * 10)} ${Math.floor(
        Math.random() * 10,
    )} ${Math.floor(Math.random() * 10)} ${Math.floor(Math.random() * 10)}`;
};

module.exports = {
    verifyOTP,
    resendOTP,
    parentalControl,
    deleteAccountOTP,
};
