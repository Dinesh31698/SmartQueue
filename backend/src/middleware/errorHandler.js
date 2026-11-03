/**
 * Centralized Application Error Handler Middleware
 */
const notFoundHandler = (req, res, next) => {
  const error = new Error(`Endpoint not found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// eslint-disable-next-line no-unused-vars
const globalErrorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  const isProduction = process.env.NODE_ENV === 'production';

  console.error(`[Error] ${req.method} ${req.originalUrl}:`, err.message);

  res.status(statusCode).json({
    success: false,
    error: err.message || 'Internal Server Error',
    ...(isProduction ? {} : { stack: err.stack }),
  });
};

module.exports = {
  notFoundHandler,
  globalErrorHandler,
};
