/**
 * Global error handler middleware.
 * Attach to the end of the Express app (after all routes).
 */
const errorHandler = (err, req, res, next) => {
  // Determine the correct status code based on the error type
  let statusCode = res.statusCode !== 200 ? res.statusCode : 500;

  // BUG-2: Mongoose ValidationError should be 400, not 500
  if (err.name === 'ValidationError') {
    statusCode = 400;
  }

  // BUG-3: Mongoose CastError (e.g. malformed ObjectId) should be 400
  if (err.name === 'CastError') {
    statusCode = 400;
    err.message = `Invalid ${err.path}: ${err.value}`;
  }

  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

module.exports = errorHandler;
