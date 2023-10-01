const paypal = require('paypal-rest-sdk');

paypal.configure({
    mode: 'live', // Set to 'live' for production
    client_id: process.env.PAYPAL_CLIENT_ID,
    client_secret: process.env.PAYPAL_CLIENT_SECRET,
});

module.exports = paypal;
