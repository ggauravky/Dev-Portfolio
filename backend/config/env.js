const { isCloudinaryConfigured } = require("./cloudinary");

const SMTP_REQUIRED_KEYS = ["BREVO_SMTP_USER", "BREVO_SMTP_PASS", "BREVO_SENDER_EMAIL"];
const CORE_REQUIRED_KEYS = ["GOOGLE_CLIENT_ID", "AUTH_JWT_SECRET", "FRONTEND_URL"];
const RAZORPAY_REQUIRED_KEYS = [
  "RAZORPAY_KEY_ID",
  "RAZORPAY_KEY_SECRET",
  "RAZORPAY_WEBHOOK_SECRET",
];
const PLACEHOLDER_SECRET_PATTERN =
  /^(?:replace(?:[_\s-]?with)?|change[_\s-]?me|changeme|example|default(?:[_\s-]?secret)?|secret123|dev-admin-key)/i;

const toBoolean = (value, fallback = false) => {
  const normalized = String(value || "").trim().toLowerCase();
  if (!normalized) return fallback;
  if (["1", "true", "yes", "on"].includes(normalized)) return true;
  if (["0", "false", "no", "off"].includes(normalized)) return false;
  return fallback;
};

const normalizeEnv = (value) => String(value || "").trim();
const hasValue = (value) => Boolean(normalizeEnv(value));
const isPlaceholderSecret = (value) => PLACEHOLDER_SECRET_PATTERN.test(normalizeEnv(value));

const getRazorpayKeyMode = (value) => {
  const keyId = normalizeEnv(value);
  if (keyId.startsWith("rzp_test_")) return "test";
  if (keyId.startsWith("rzp_live_")) return "live";
  return "invalid";
};

const buildMissingKeyReport = (keys) =>
  keys
    .filter((key) => !hasValue(process.env[key]))
    .sort((left, right) => left.localeCompare(right));

const validateEnvironment = ({ strict = true, environment = process.env.NODE_ENV } = {}) => {
  const normalizedEnvironment = normalizeEnv(environment).toLowerCase() || "development";
  const isProduction = normalizedEnvironment === "production";
  const emailEnabled = toBoolean(process.env.EMAIL_ENABLED, false);
  const razorpayEnabled = toBoolean(process.env.RAZORPAY_ENABLED, false);

  const requiredKeys = [...CORE_REQUIRED_KEYS];
  if (isProduction) requiredKeys.push("MONGODB_URI", "ADMIN_KEY");
  if (razorpayEnabled) requiredKeys.push(...RAZORPAY_REQUIRED_KEYS);
  if (isProduction && emailEnabled) requiredKeys.push(...SMTP_REQUIRED_KEYS);

  const missingKeys = new Set(buildMissingKeyReport(requiredKeys));
  const invalidKeys = new Set();
  const warnings = [];

  const authSecret = normalizeEnv(process.env.AUTH_JWT_SECRET);
  if (authSecret && (authSecret.length < 32 || (isProduction && isPlaceholderSecret(authSecret)))) {
    invalidKeys.add("AUTH_JWT_SECRET");
  }

  const adminKey = normalizeEnv(process.env.ADMIN_KEY);
  if (isProduction && adminKey && (adminKey.length < 32 || isPlaceholderSecret(adminKey))) {
    invalidKeys.add("ADMIN_KEY");
  }

  const razorpayMode = razorpayEnabled
    ? getRazorpayKeyMode(process.env.RAZORPAY_KEY_ID)
    : "disabled";
  if (razorpayEnabled && hasValue(process.env.RAZORPAY_KEY_ID)) {
    if (razorpayMode === "invalid") {
      invalidKeys.add("RAZORPAY_KEY_ID");
    } else if (normalizedEnvironment === "development" && razorpayMode === "live") {
      warnings.push("RAZORPAY_KEY_ID uses live mode while NODE_ENV is development");
    }
  }

  const emailMissingKeys = emailEnabled ? buildMissingKeyReport(SMTP_REQUIRED_KEYS) : [];
  if (emailMissingKeys.length && !isProduction) {
    warnings.push(
      `Transactional email is enabled but incomplete; missing: ${emailMissingKeys.join(", ")}`
    );
  }

  const smtpPort = Number(process.env.BREVO_SMTP_PORT || 587);
  const smtpPortValid = Number.isInteger(smtpPort) && smtpPort > 0 && smtpPort <= 65535;
  if (!smtpPortValid) {
    if (isProduction && emailEnabled) invalidKeys.add("BREVO_SMTP_PORT");
    else warnings.push("BREVO_SMTP_PORT is invalid; transactional email will be skipped");
  }

  const cookieSameSite = normalizeEnv(process.env.AUTH_COOKIE_SAME_SITE).toLowerCase();
  if (cookieSameSite && !["lax", "none", "strict"].includes(cookieSameSite)) {
    warnings.push("AUTH_COOKIE_SAME_SITE must be lax, none, or strict");
  }

  const sortedMissingKeys = [...missingKeys].sort((left, right) => left.localeCompare(right));
  const sortedInvalidKeys = [...invalidKeys].sort((left, right) => left.localeCompare(right));
  const emailConfigured = emailEnabled && emailMissingKeys.length === 0 && smtpPortValid;
  const authConfigured =
    CORE_REQUIRED_KEYS.every((key) => hasValue(process.env[key])) &&
    !invalidKeys.has("AUTH_JWT_SECRET");
  const adminConfigured =
    hasValue(process.env.ADMIN_KEY) &&
    adminKey.length >= 32 &&
    !isPlaceholderSecret(adminKey);

  const report = {
    ok: sortedMissingKeys.length === 0 && sortedInvalidKeys.length === 0,
    strict: Boolean(strict),
    environment: normalizedEnvironment,
    missingKeys: sortedMissingKeys,
    invalidKeys: sortedInvalidKeys,
    warnings,
    flags: {
      emailEnabled,
      emailConfigured,
      razorpayEnabled,
      razorpayMode,
      cloudinaryConfigured: isCloudinaryConfigured(),
      authConfigured,
      adminConfigured,
    },
  };

  if (!report.ok && strict) {
    const issues = [
      sortedMissingKeys.length ? `missing: ${sortedMissingKeys.join(", ")}` : "",
      sortedInvalidKeys.length ? `invalid or insecure: ${sortedInvalidKeys.join(", ")}` : "",
    ]
      .filter(Boolean)
      .join("; ");
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
  isPlaceholderSecret,
  toBoolean,
  validateEnvironment,
};
