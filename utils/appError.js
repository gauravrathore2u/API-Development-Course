
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith("4") ? 'failed' : "error";
        //operational error are those error which are done by the user
        this.isOperational = true;      //this property is used to saparate the error from user and error from program(compilation or runtime)

        Error.captureStackTrace(this, this.constructor);
    }
}
module.exports = AppError