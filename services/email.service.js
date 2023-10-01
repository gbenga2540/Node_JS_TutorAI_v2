const { sendMail } = require('../utils/emailHelpers');

async function signupEmail(email, code) {
    const options = {
        to: email,
        subject: 'Your one time password for Tutor AI',
        template: 'signup',
        variables: {
            code,
        },
    };

    await sendMail(options);
}

async function resetPasswordEmail(email, token) {
    const options = {
        to: email,
        subject: 'Reset Password',
        template: 'forgot-password',
        variables: {
            token,
        },
    };
    await sendMail(options);
}

async function parentalControlEmail(email, pin) {
    const options = {
        to: email,
        subject: 'Parental Control Pin',
        template: 'parent-control',
        variables: {
            pin,
        },
    };

    await sendMail(options);
}

async function deleteOTPEmail(email, pin) {
    const options = {
        to: email,
        subject: 'Delete Account Pin',
        template: 'delete',
        variables: {
            pin,
        },
    };

    await sendMail(options);
}

module.exports = {
    signupEmail,
    resetPasswordEmail,
    parentalControlEmail,
    deleteOTPEmail,
};
