const jwt = require('jsonwebtoken');
const { Unauthorized } = require('../errors/httpErrors');

const auth = (req, res, next) => {
    const authHeader = req.headers['authorization'];

    if (authHeader) {
        jwt.verify(authHeader, process.env.JWT_SEC, (err, user) => {
            if (err) throw new Unauthorized('Token is not valid!');
            req.user = user;
            next();
        });
    } else throw new Unauthorized('You are not authenticated!');
};

module.exports = auth;
