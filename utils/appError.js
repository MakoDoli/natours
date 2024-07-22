class appError extends Error {
  constructor(message, statusCode) {
    super(message); // here 'message is set to parent class, thats why we don't need to set this.message
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = appError;
