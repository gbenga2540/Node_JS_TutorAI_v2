// Custom Error classes for http errors
class BaseError extends Error {
    constructor(message = 'Internal Server Error', statusCode = 500) {
        super(message);
        this.statusCode = statusCode;
    }
}

class ResourceNotFound extends BaseError {
    constructor(message = 'Resource Not Found') {
        super(message, 404);
    }
}

class BadRequest extends BaseError {
    constructor(message = 'Bad Request') {
        super(message, 400);
    }
}

class ServerError extends BaseError {
    // Default BaseError message is for internal server error
    constructor(message) {
        super(message);
    }
}

class Unauthorized extends BaseError {
    constructor(message = 'Unauthorized') {
        super(message, 401);
    }
}

class Forbidden extends BaseError {
    constructor(message = 'Forbidden') {
        super(message, 403);
    }
}

module.exports = {
    BaseError,
    ResourceNotFound,
    BadRequest,
    Unauthorized,
    Forbidden,
    ServerError,
};
