const assert = require("node:assert/strict");
const test = require("node:test");

const { isCloudinaryConfigured } = require("../config/cloudinary");
const { validateEnvironment } = require("../config/env");
const { getTrustedOrigins } = require("../config/trustedOrigins");
const { getSessionCookieOptions } = require("../utils/authSession");
const { redactSensitiveData, redactStringSecrets } = require("../utils/logger");
const { buildPublicErrorPayload } = require("../utils/publicError");
const { uploadAvatar } = require("../services/auth/avatarService");
const gateway = require("../services/payment/razorpayGateway");

const ENV_KEYS = [
  "ADMIN_KEY",
  "AUTH_ALLOWED_ORIGINS",
  "AUTH_COOKIE_SAME_SITE",
  "AUTH_JWT_SECRET",
  "BREVO_API_KEY",
  "BREVO_SENDER_EMAIL",
  "BREVO_SMTP_PASS",
  "BREVO_SMTP_PORT",
  "BREVO_SMTP_USER",
  "CASHFREE_APP_ID",
  "CASHFREE_ENV",
  "CASHFREE_SECRET_KEY",
  "CASHFREE_WEBHOOK_SECRET",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
  "CLOUDINARY_CLOUD_NAME",
  "EMAIL_ENABLED",
  "FRONTEND_URL",
  "GOOGLE_CLIENT_ID",
  "MONGODB_URI",
  "NODE_ENV",
  "PAYMENT_GATEWAY_ENABLED",
  "PAYMENT_QUEUE_REDIS_URL",
  "RAZORPAY_ENABLED",
  "RAZORPAY_KEY_ID",
  "RAZORPAY_KEY_SECRET",
  "RAZORPAY_WEBHOOK_SECRET",
  "REDIS_URL",
];

const VALID_PRODUCTION_ENV = {
  NODE_ENV: "production",
  MONGODB_URI: "mongodb://database.example.test/portfolio",
  FRONTEND_URL: "https://portfolio.example.test",
  GOOGLE_CLIENT_ID: "123456.apps.googleusercontent.com",
  AUTH_JWT_SECRET: "jwt_9Dk4pL2xQ7mN8vR5sT1yW6zB3cF0hJ",
  ADMIN_KEY: "admin_7Qx4mN9pR2vT8yK5sD1hF6cL3wB0",
  AUTH_COOKIE_SAME_SITE: "none",
  RAZORPAY_ENABLED: "true",
  RAZORPAY_KEY_ID: "rzp_test_regression",
  RAZORPAY_KEY_SECRET: "razorpay-test-secret",
  RAZORPAY_WEBHOOK_SECRET: "razorpay-webhook-secret",
  EMAIL_ENABLED: "true",
  BREVO_SMTP_PORT: "587",
  BREVO_SMTP_USER: "smtp-user@example.test",
  BREVO_SMTP_PASS: "smtp-test-secret",
  BREVO_SENDER_EMAIL: "sender@example.test",
};

const withEnvironment = (values, run) => {
  const original = Object.fromEntries(ENV_KEYS.map((key) => [key, process.env[key]]));
  ENV_KEYS.forEach((key) => delete process.env[key]);
  Object.entries(values).forEach(([key, value]) => {
    if (value !== undefined) process.env[key] = value;
  });
  try {
    return run();
  } finally {
    ENV_KEYS.forEach((key) => {
      if (original[key] === undefined) delete process.env[key];
      else process.env[key] = original[key];
    });
  }
};

const productionReport = (overrides = {}) =>
  withEnvironment({ ...VALID_PRODUCTION_ENV, ...overrides }, () =>
    validateEnvironment({ strict: false, environment: "production" })
  );

test("valid Razorpay and SMTP production environment passes", () => {
  const report = withEnvironment(VALID_PRODUCTION_ENV, () =>
    validateEnvironment({ strict: true, environment: "production" })
  );
  assert.equal(report.ok, true);
  assert.deepEqual(report.missingKeys, []);
  assert.deepEqual(report.invalidKeys, []);
  assert.equal(report.flags.razorpayMode, "test");
  assert.equal(report.flags.emailConfigured, true);
});

for (const key of ["GOOGLE_CLIENT_ID", "AUTH_JWT_SECRET", "FRONTEND_URL"]) {
  test(`missing ${key} fails environment validation`, () => {
    const report = productionReport({ [key]: undefined });
    assert.equal(report.ok, false);
    assert.ok(report.missingKeys.includes(key));
  });
}

for (const key of ["RAZORPAY_KEY_ID", "RAZORPAY_KEY_SECRET", "RAZORPAY_WEBHOOK_SECRET"]) {
  test(`enabled Razorpay requires ${key}`, () => {
    const report = productionReport({ [key]: undefined });
    assert.equal(report.ok, false);
    assert.ok(report.missingKeys.includes(key));
  });
}

test("valid Razorpay test key is accepted and an invalid prefix is rejected", () => {
  assert.equal(productionReport().flags.razorpayMode, "test");
  const invalid = productionReport({ RAZORPAY_KEY_ID: "invalid-key" });
  assert.ok(invalid.invalidKeys.includes("RAZORPAY_KEY_ID"));
});

test("legacy provider and queue variables are not required", () => {
  const report = withEnvironment(
    {
      ...VALID_PRODUCTION_ENV,
      BREVO_API_KEY: undefined,
      CASHFREE_APP_ID: undefined,
      CASHFREE_ENV: undefined,
      CASHFREE_SECRET_KEY: undefined,
      CASHFREE_WEBHOOK_SECRET: undefined,
      PAYMENT_QUEUE_REDIS_URL: undefined,
      REDIS_URL: undefined,
    },
    () => validateEnvironment({ strict: true, environment: "production" })
  );
  assert.equal(report.ok, true);
});

test("PAYMENT_GATEWAY_ENABLED no longer enables Razorpay", () => {
  withEnvironment({ PAYMENT_GATEWAY_ENABLED: "true", RAZORPAY_ENABLED: undefined }, () => {
    assert.equal(gateway.isRazorpayEnabled(), false);
  });
});

for (const key of ["BREVO_SMTP_USER", "BREVO_SMTP_PASS", "BREVO_SENDER_EMAIL"]) {
  test(`production email requires ${key}`, () => {
    const report = productionReport({ [key]: undefined });
    assert.equal(report.ok, false);
    assert.ok(report.missingKeys.includes(key));
  });
}

test("development can warn instead of failing for incomplete SMTP", () => {
  withEnvironment(
    {
      NODE_ENV: "development",
      FRONTEND_URL: "http://localhost:5173",
      GOOGLE_CLIENT_ID: "123456.apps.googleusercontent.com",
      AUTH_JWT_SECRET: VALID_PRODUCTION_ENV.AUTH_JWT_SECRET,
      EMAIL_ENABLED: "true",
    },
    () => {
      const report = validateEnvironment({ strict: false });
      assert.equal(report.ok, true);
      assert.match(report.warnings.join(" "), /Transactional email is enabled but incomplete/);
    }
  );
});

test("production rejects missing, short, and placeholder admin keys", () => {
  assert.ok(productionReport({ ADMIN_KEY: undefined }).missingKeys.includes("ADMIN_KEY"));
  assert.ok(productionReport({ ADMIN_KEY: "too-short" }).invalidKeys.includes("ADMIN_KEY"));
  assert.ok(
    productionReport({ ADMIN_KEY: "REPLACE_WITH_A_REAL_ADMIN_KEY_123456789" }).invalidKeys.includes(
      "ADMIN_KEY"
    )
  );
});

test("production rejects short and placeholder JWT secrets", () => {
  assert.ok(
    productionReport({ AUTH_JWT_SECRET: "short-secret" }).invalidKeys.includes("AUTH_JWT_SECRET")
  );
  assert.ok(
    productionReport({ AUTH_JWT_SECRET: "default-secret-that-is-long-but-insecure" }).invalidKeys.includes(
      "AUTH_JWT_SECRET"
    )
  );
});

test("Cloudinary readiness requires all three credentials but remains optional", () => {
  withEnvironment({}, () => assert.equal(isCloudinaryConfigured(), false));
  withEnvironment(
    {
      CLOUDINARY_CLOUD_NAME: "cloud",
      CLOUDINARY_API_KEY: "key",
      CLOUDINARY_API_SECRET: "secret",
    },
    () => assert.equal(isCloudinaryConfigured(), true)
  );
  const report = productionReport({
    CLOUDINARY_CLOUD_NAME: undefined,
    CLOUDINARY_API_KEY: undefined,
    CLOUDINARY_API_SECRET: undefined,
  });
  assert.equal(report.ok, true);
  assert.equal(report.flags.cloudinaryConfigured, false);
});

test("avatar upload fails cleanly with 503 when Cloudinary is unavailable", () => {
  withEnvironment({}, () => {
    assert.throws(
      () => uploadAvatar({ buffer: Buffer.from("image"), userId: "user-1" }),
      { code: "CLOUDINARY_NOT_CONFIGURED", status: 503 }
    );
  });
});

test("empty AUTH_ALLOWED_ORIGINS still trusts only FRONTEND_URL in production", () => {
  withEnvironment(
    {
      NODE_ENV: "production",
      FRONTEND_URL: "https://ggauravky.vercel.app",
      AUTH_ALLOWED_ORIGINS: "",
    },
    () => {
      assert.deepEqual(getTrustedOrigins(), ["https://ggauravky.vercel.app"]);
    }
  );
});

test("production cookie remains HttpOnly, Secure, and SameSite=None", () => {
  withEnvironment({ NODE_ENV: "production", AUTH_COOKIE_SAME_SITE: "none" }, () => {
    const options = getSessionCookieOptions();
    assert.equal(options.httpOnly, true);
    assert.equal(options.secure, true);
    assert.equal(options.sameSite, "none");
  });
});

test("production 5xx errors return a safe public message", () => {
  const result = buildPublicErrorPayload(new Error("provider leaked an internal response"), {
    production: true,
    requestId: "request-1",
  });
  assert.equal(result.status, 500);
  assert.equal(result.payload.message, "Internal server error");
  assert.equal("stack" in result.payload, false);
});

test("logger redaction removes secret fields and values embedded in text", () => {
  withEnvironment({ AUTH_JWT_SECRET: "sensitive-jwt-value" }, () => {
    const redacted = redactSensitiveData({
      nested: { password: "sensitive-password", note: "token sensitive-jwt-value" },
    });
    assert.equal(redacted.nested.password, "[REDACTED]");
    assert.equal(redacted.nested.note.includes("sensitive-jwt-value"), false);
    assert.equal(
      redactStringSecrets("failure sensitive-jwt-value").includes("sensitive-jwt-value"),
      false
    );
  });
});
