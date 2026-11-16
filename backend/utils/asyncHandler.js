/**
 * Express 4 does not catch rejected promises from async handlers. Without this
 * wrapper a thrown DB error becomes an unhandledRejection, which in production
 * triggers gracefulShutdown and exits the process. Forward it to the global
 * error handler instead, which answers through buildPublicErrorPayload.
 */
const asyncHandler = (handler) => (req, res, next) =>
  Promise.resolve(handler(req, res, next)).catch(next);

module.exports = { asyncHandler };
