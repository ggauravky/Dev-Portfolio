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

const getRazorpayKeyMode = (value) => {
  const keyId = normalizeEnv(value);
  if (keyId.startsWith("rzp_test_")) return "test";
  if (keyId.startsWith("rzp_live_")) return "live";
  return "invalid";
};

const buildMissingKeyReport = (keys) =>
  keys
    .filter((key) => !hasValue(process.env[key]))
    .map((key) => key)
    .sort((left, right) => left.localeCompare(right));

const validateEnvironment = ({ strict = true } = {}) => {
  const emailEnabled = toBoolean(process.env.EMAIL_ENABLED, false);
  const razorpayEnabled = toBoolean(
    process.env.RAZORPAY_ENABLED || process.env.PAYMENT_GATEWAY_ENABLED,
    false
  );

  const requiredKeys = ["GOOGLE_CLIENT_ID", "AUTH_JWT_SECRET", "FRONTEND_URL"];

  if (razorpayEnabled) {
    requiredKeys.push("RAZORPAY_KEY_ID", "RAZORPAY_KEY_SECRET", "RAZORPAY_WEBHOOK_SECRET");
  }

  const missingKeys = buildMissingKeyReport(requiredKeys);
  const emailMissingKeys = emailEnabled
    ? buildMissingKeyReport(["BREVO_SMTP_USER", "BREVO_SMTP_PASS", "BREVO_SENDER_EMAIL"])
    : [];
  const smtpPort = Number(process.env.BREVO_SMTP_PORT || 587);
  const warnings = [];
  const invalidKeys = [];

  if (razorpayEnabled && hasValue(process.env.RAZORPAY_KEY_ID)) {
    const keyMode = getRazorpayKeyMode(process.env.RAZORPAY_KEY_ID);
    if (keyMode === "invalid") {
      invalidKeys.push("RAZORPAY_KEY_ID");
    } else if (process.env.NODE_ENV === "development" && keyMode === "live") {
      warnings.push("RAZORPAY_KEY_ID uses live mode while NODE_ENV is development");
    }
  }

  if (emailMissingKeys.length) {
    warnings.push(
      `Transactional email is enabled but incomplete; missing: ${emailMissingKeys.join(", ")}`
    );
  }
  if (!Number.isInteger(smtpPort) || smtpPort <= 0 || smtpPort > 65535) {
    warnings.push("BREVO_SMTP_PORT is invalid; transactional email will be skipped");
  }

  const authSecret = normalizeEnv(process.env.AUTH_JWT_SECRET);
  if (authSecret && authSecret.length < 32) {
    warnings.push("AUTH_JWT_SECRET should contain at least 32 characters");
  }

  const cookieSameSite = normalizeEnv(process.env.AUTH_COOKIE_SAME_SITE).toLowerCase();
  if (cookieSameSite && !["lax", "none", "strict"].includes(cookieSameSite)) {
    warnings.push("AUTH_COOKIE_SAME_SITE must be lax, none, or strict");
  }

  const report = {
    ok: missingKeys.length === 0 && invalidKeys.length === 0,
    strict: Boolean(strict),
    missingKeys,
    invalidKeys,
    warnings,
    flags: {
      emailEnabled,
      razorpayEnabled,
    },
  };

  if (!report.ok && strict) {
    const issues = [
      missingKeys.length ? `missing: ${missingKeys.join(", ")}` : "",
      invalidKeys.length ? `invalid: ${invalidKeys.join(", ")}` : "",
    ].filter(Boolean).join("; ");
    const error = new Error(
      `Environment validation failed (${issues}). Fix backend environment configuration before starting the server.`
    );
    error.code = "ENV_VALIDATION_FAILED";
    error.details = report;
    throw error;
  }

  return report;
};

module.exports = {
  getRazorpayKeyMode,
  toBoolean,
  validateEnvironment,
};
