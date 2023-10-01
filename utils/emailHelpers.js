const emailClient = require('../config/mailgun.config');
const moment = require('moment');
require('dotenv').config();
const domain = process.env.MAILGUN_DOMAIN || 'mail.tutorai-app.com';
const sender = `Tutor AI <${process.env.MAILGUN_SENDER_EMAIL}>`;

async function sendMail({ to, template, subject, variables = {} }) {
    const messageData = {
        from: sender,
        to,
        subject,
        template,
        't:variables': JSON.stringify(variables),
    };

    return emailClient.messages.create(domain, messageData);
}

async function scheduleMail({ to, template, subject, variables = {}, time }) {
    const messageData = {
        from: sender,
        to,
        subject,
        template,
        'o:deliverytime': moment(time).toDate.toUTCString(),
        't:variables': JSON.stringify(variables),
    };

    return emailClient.messages.create(domain, messageData);
}

async function addToMailingList({ email, listName, name }) {
    const listAddress = `${listName}@${domain}`;

    const newMember = await emailClient.lists.members.createMember(
        listAddress,
        {
            address: email,
            name,
            subscribed: true,
            upsert: 'yes',
        },
    );

    return newMember;
}

async function removeFromMailingList({ email, listName }) {
    const listAddress = `${listName}@${domain}`;

    const deletedMember = await emailClient.lists.members.destroyMember(
        listAddress,
        email,
    );

    return deletedMember;
}

module.exports = {
    sendMail,
    scheduleMail,
    addToMailingList,
    removeFromMailingList,
};
