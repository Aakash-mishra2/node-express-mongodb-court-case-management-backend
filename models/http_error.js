class HttpError extends Error {
    constructor(message, errorCode) {
        super(this.message);
        this.errorCode = errorCode;
    }
};

module.exports = HttpError;