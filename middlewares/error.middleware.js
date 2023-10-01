const { BaseError } = require('../errors/httpErrors');

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
    if (err instanceof BaseError)
        return res.status(err.statusCode).json(formatError(err.message));

    res.status(500).json(formatError('Internal Server Error'));
}

function formatError(message) {
    return { message, sucess: false };
}

module.exports = { errorHandler, formatError };
