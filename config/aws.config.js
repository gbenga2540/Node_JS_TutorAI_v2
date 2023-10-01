const aws = require('aws-sdk');
aws.config.loadFromPath(__dirname + '../config.json');

const ses = new aws.SES();

module.exports = ses;
