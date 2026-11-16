const Sentry = require("@sentry/node");
const { logger, redactSensitiveData } = require("./logger");

const sentryEnabled = Boolean(process.env.SENTRY_DSN);

/**
 * The SDK attaches incoming request bodies by default. Bodies here carry the
 * Google ID token (`credential`, which the SDK's key filter does not match),
 * contact messages, phone numbers and emails, so drop them along with cookies
 * and redact secret-like keys in the request headers and our own extras.
 *
 * Only these fields are touched, in place. The event also carries the SDK's
 * internal `sdkProcessingMetadata` (live Scope objects it reads after this hook);
 * walking or rebuilding it could throw, and Sentry drops events whose hook throws.
 */
const scrubEvent = (event) => {
  if (!event || typeof event !== "object") return event;
  try {
    if (event.request && typeof event.request === "object") {
      delete event.request.data;
      delete event.request.cookies;
      if (event.request.headers && typeof event.request.headers === "object") {
        event.request.headers = redactSensitiveData(event.request.headers);
      }
    }
    if (event.extra && typeof event.extra === "object") {
      event.extra = redactSensitiveData(event.extra);
    }
  } catch {
    // Never let scrubbing drop the event; the body was already removed above.
  }
  return event;
};

const initMonitoring = () => {
  if (!sentryEnabled) {
    logger.info("Sentry disabled (SENTRY_DSN not configured)");
    return;
  }

  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || "development",
    tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE || 0.1),
    sendDefaultPii: false,
    beforeSend: scrubEvent,
    beforeSendTransaction: scrubEvent,
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
  scrubEvent,
};
