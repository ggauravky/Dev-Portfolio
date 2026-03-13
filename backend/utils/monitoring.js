const Sentry = require("@sentry/node");
const { logger } = require("./logger");

const sentryEnabled = Boolean(process.env.SENTRY_DSN);

const initMonitoring = () => {
  if (!sentryEnabled) {
    logger.info("Sentry disabled (SENTRY_DSN not configured)");
    return;
  }

  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || "development",
    tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE || 0.1),
  });

  logger.info("Sentry monitoring initialized");
};

const captureException = (error, context = {}) => {
  if (!sentryEnabled) return;
  Sentry.withScope((scope) => {
    Object.entries(context).forEach(([key, value]) => {
      scope.setExtra(key, value);
    });
    Sentry.captureException(error);
  });
};

module.exports = {
  initMonitoring,
  captureException,
};
