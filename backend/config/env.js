const toBoolean = (value, fallback = false) => {
  const normalized = String(value || "").trim().toLowerCase();
  if (!normalized) {
    return fallback;
  }

  if (["1", "true", "yes", "on"].includes(normalized)) {
    return true;
  }

  if (["0", "false", "no", "off"].includes(normalized)) {
    return false;
  }

  return fallback;
};

const normalizeEnv = (value) => String(value || "").trim();

const hasValue = (value) => Boolean(normalizeEnv(value));

const buildMissingKeyReport = (keys) =>
  keys
    .filter((key) => !hasValue(process.env[key]))
    .map((key) => key)
    .sort((left, right) => left.localeCompare(right));

const validateEnvironment = ({ strict = true } = {}) => {
  const paymentGatewayEnabled = toBoolean(process.env.PAYMENT_GATEWAY_ENABLED, true);
  const brevoEnabled = toBoolean(process.env.BREVO_ENABLED, true);

  const requiredKeys = ["GOOGLE_CLIENT_ID", "AUTH_JWT_SECRET", "FRONTEND_URL"];

  if (paymentGatewayEnabled) {
    requiredKeys.push(
      "CASHFREE_APP_ID",
      "CASHFREE_SECRET_KEY",
      "CASHFREE_WEBHOOK_SECRET",
      "CASHFREE_ENV"
    );
  }

  if (brevoEnabled) {
    requiredKeys.push(
      "BREVO_API_KEY",
      "BREVO_SENDER_EMAIL",
      "BREVO_ADMIN_NOTIFICATION_EMAIL"
    );
  }

  const missingKeys = buildMissingKeyReport(requiredKeys);

  const warnings = [];

  const queueEnabled = toBoolean(process.env.PAYMENT_QUEUE_ENABLED, true);
  const hasQueueUrl = hasValue(process.env.PAYMENT_QUEUE_REDIS_URL) || hasValue(process.env.REDIS_URL);

  if (queueEnabled && !hasQueueUrl) {
    warnings.push(
      "PAYMENT_QUEUE_ENABLED is true but PAYMENT_QUEUE_REDIS_URL/REDIS_URL is missing. " +
        "Payment reconciliation will fallback to in-process scheduling."
    );
  }

  const cashfreeEnv = normalizeEnv(process.env.CASHFREE_ENV).toUpperCase();
  if (paymentGatewayEnabled && !["SANDBOX", "PRODUCTION"].includes(cashfreeEnv)) {
    warnings.push(
      "CASHFREE_ENV should be SANDBOX or PRODUCTION. Current value may route requests incorrectly."
    );
  }

  const report = {
    ok: missingKeys.length === 0,
    strict: Boolean(strict),
    missingKeys,
    warnings,
    flags: {
      paymentGatewayEnabled,
      brevoEnabled,
      queueEnabled,
    },
  };

  if (!report.ok && strict) {
    const error = new Error(
      `Missing required environment variables: ${missingKeys.join(", ")}. ` +
        "Fix backend environment configuration before starting the server."
    );
    error.code = "ENV_VALIDATION_FAILED";
    error.details = report;
    throw error;
  }

  return report;
};

module.exports = {
  toBoolean,
  validateEnvironment,
};
