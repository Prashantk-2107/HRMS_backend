class ApiError extends Error {
  constructor(statusCode, message, error = [], stack = "") {
    super(message);
    this.statusCode = statusCode;
    this.error = error;
    this.stack = stack;
    this.success = false;
  }
}

export { ApiError };
