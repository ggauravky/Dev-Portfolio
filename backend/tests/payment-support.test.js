const assert = require("node:assert/strict");
const test = require("node:test");

const PaymentTransaction = require("../models/PaymentTransaction");
const gateway = require("../services/payment/razorpayGateway");
const paymentController = require("../controllers/paymentController");
const authMiddleware = require("../middleware/auth");
const { getRazorpayKeyMode, validateEnvironment } = require("../config/env");
const { generatePaymentReceipt } = require("../utils/paymentReceipt");

const validUserId = "507f1f77bcf86cd799439011";
const validTransactionId = "507f191e810c19729de860ea";

const withPaymentEnvironment = (values, run) => {
  const keys = [
    "AUTH_JWT_SECRET",
    "FRONTEND_URL",
    "GOOGLE_CLIENT_ID",
    "NODE_ENV",
    "PAYMENT_GATEWAY_ENABLED",
    "RAZORPAY_ENABLED",
    "RAZORPAY_KEY_ID",
    "RAZORPAY_KEY_SECRET",
    "RAZORPAY_WEBHOOK_SECRET",
  ];
  const original = Object.fromEntries(keys.map((key) => [key, process.env[key]]));
  Object.entries(values).forEach(([key, value]) => {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  });
  try {
    return run();
  } finally {
    keys.forEach((key) => {
      if (original[key] === undefined) delete process.env[key];
      else process.env[key] = original[key];
    });
  }
};

const buildSupportInput = (overrides = {}) => paymentController._test.buildSupportTransactionInput({
  body: {
    name: "Test Supporter",
    phone: "9876543210",
    message: "Keep building useful things.",
    amount: 199,
    ...overrides,
  },
  authUser: { id: validUserId, email: "Owner@Example.com" },
  req: { ip: "127.0.0.1", headers: { "user-agent": "node-test" } },
});

const buildSupportTransaction = (overrides = {}) => ({
  _id: validTransactionId,
  userId: validUserId,
  flowType: "support",
  serviceSlug: "support",
  serviceName: "Support Contribution",
  customerName: "Test Supporter",
  contributorName: "Test Supporter",
  email: "owner@example.com",
  phone: "9876543210",
  message: "Keep building useful things.",
  amount: 199,
  amountPaise: 19900,
  currency: "INR",
  provider: "razorpay",
  internalReference: "GKY-20260915-SUPPORT",
  razorpayOrderId: "order_1234567890",
  razorpayPaymentId: "pay_1234567890",
  status: "paid",
  receiptNumber: "GKY-2026-DE860EA",
  receiptEmailSentAt: new Date(),
  adminEmailSentAt: new Date(),
  paidAt: new Date("2026-09-15T10:00:00.000Z"),
  createdAt: new Date("2026-09-15T09:59:00.000Z"),
  ...overrides,
});

test("missing Razorpay key ID fails before an API request", () => {
  withPaymentEnvironment({ RAZORPAY_ENABLED: "true", RAZORPAY_KEY_ID: undefined, RAZORPAY_KEY_SECRET: "secret" }, () => {
    assert.throws(() => gateway.requireGatewayConfig(), { code: "PAYMENT_GATEWAY_NOT_CONFIGURED", status: 503 });
  });
});

test("missing Razorpay key secret fails before an API request", () => {
  withPaymentEnvironment({ RAZORPAY_ENABLED: "true", RAZORPAY_KEY_ID: "rzp_test_example", RAZORPAY_KEY_SECRET: undefined }, () => {
    assert.throws(() => gateway.requireGatewayConfig(), { code: "PAYMENT_GATEWAY_NOT_CONFIGURED", status: 503 });
  });
});

test("Razorpay API credentials are trimmed without modification", () => {
  withPaymentEnvironment({ RAZORPAY_ENABLED: "true", RAZORPAY_KEY_ID: "  rzp_test_example  ", RAZORPAY_KEY_SECRET: "  exact-secret  " }, () => {
    assert.deepEqual(gateway.requireGatewayConfig(), { keyId: "rzp_test_example", keySecret: "exact-secret" });
  });
});

test("Razorpay key mode is derived from its public prefix", () => {
  assert.equal(getRazorpayKeyMode("rzp_test_example"), "test");
  assert.equal(getRazorpayKeyMode("rzp_live_example"), "live");
  assert.equal(getRazorpayKeyMode("example"), "invalid");
});

test("enabled payment environment rejects an invalid Razorpay key prefix", () => {
  withPaymentEnvironment({
    GOOGLE_CLIENT_ID: "client-id",
    AUTH_JWT_SECRET: "a-valid-auth-secret-with-at-least-32-characters",
    FRONTEND_URL: "http://localhost:5173",
    RAZORPAY_ENABLED: "true",
    RAZORPAY_KEY_ID: "invalid-key",
    RAZORPAY_KEY_SECRET: "secret",
    RAZORPAY_WEBHOOK_SECRET: "webhook-secret",
  }, () => {
    const report = validateEnvironment({ strict: false });
    assert.equal(report.ok, false);
    assert.deepEqual(report.invalidKeys, ["RAZORPAY_KEY_ID"]);
  });
});

test("Razorpay 401 is classified as a safe service-unavailable error", () => {
  const secret = "must-never-appear";
  const error = gateway.mapGatewayError({
    statusCode: 401,
    error: { code: "BAD_REQUEST_ERROR", description: `Authentication failed ${secret}` },
  });
  assert.equal(error.code, "PAYMENT_GATEWAY_AUTH_FAILED");
  assert.equal(error.status, 503);
  assert.equal(error.failureCategory, "authentication");
  assert.equal(error.providerCode, "BAD_REQUEST_ERROR");
  assert.equal(error.message.includes(secret), false);
});

test("Razorpay 401 API response does not expose provider credentials", () => {
  const error = gateway.mapGatewayError({
    statusCode: 401,
    error: { code: "BAD_REQUEST_ERROR", description: "Authentication failed secret-value" },
  });
  let statusCode;
  let payload;
  const res = {
    status(code) { statusCode = code; return this; },
    json(value) { payload = value; return value; },
  };
  paymentController._test.sendError(res, error, "Unable to start payment");
  assert.equal(statusCode, 503);
  assert.equal(payload.code, "PAYMENT_GATEWAY_AUTH_FAILED");
  assert.equal(JSON.stringify(payload).includes("secret-value"), false);
});

test("failed order creation produces safe persistent failure metadata", () => {
  const error = gateway.mapGatewayError({ statusCode: 401, error: { code: "BAD_REQUEST_ERROR", description: "Authentication failed" } });
  const update = paymentController._test.buildOrderFailureUpdate(error);
  assert.equal(update.status, "failed");
  assert.equal(update.providerStatus, 401);
  assert.equal(update.providerErrorCode, "BAD_REQUEST_ERROR");
  assert.equal(update.failureCategory, "authentication");
  assert.ok(update.failedAt instanceof Date);
  assert.equal("keySecret" in update, false);
});

test("fresh payment attempts receive unique internal references", () => {
  assert.notEqual(paymentController._test.buildInternalReference(), paymentController._test.buildInternalReference());
});

test("unauthenticated support requests are rejected by the shared auth middleware", async () => {
  let statusCode;
  let payload;
  let nextCalled = false;
  const req = { cookies: {} };
  const res = {
    status(code) { statusCode = code; return this; },
    json(value) { payload = value; return value; },
  };
  await authMiddleware.requireAuth(req, res, () => { nextCalled = true; });
  assert.equal(statusCode, 401);
  assert.equal(payload.success, false);
  assert.equal(nextCalled, false);
});

test("support amount below INR 49 is rejected", () => {
  assert.throws(() => buildSupportInput({ amount: 48 }), { code: "INVALID_SUPPORT_AMOUNT", status: 400 });
});

test("support amount above INR 100000 is rejected", () => {
  assert.throws(() => buildSupportInput({ amount: 100001 }), { code: "INVALID_SUPPORT_AMOUNT", status: 400 });
});

test("support transaction uses authenticated ownership and integer paise", () => {
  const input = buildSupportInput({ amount: 499, email: "spoofed@example.com", userId: "spoofed" });
  assert.equal(input.flowType, "support");
  assert.equal(input.amount, 499);
  assert.equal(input.amountPaise, 49900);
  assert.equal(input.userId, validUserId);
  assert.equal(input.email, "owner@example.com");
});

test("valid support payment signature is verified by the shared verifier", () => {
  const signature = gateway.createHmacSignature("order_support|pay_support", "support-secret");
  assert.equal(gateway.verifyPaymentSignature({ orderId: "order_support", paymentId: "pay_support", signature, secret: "support-secret" }), true);
});

test("wrong support payment signature is rejected", () => {
  assert.equal(gateway.verifyPaymentSignature({ orderId: "order_support", paymentId: "pay_support", signature: "0".repeat(64), secret: "support-secret" }), false);
});

test("support payment amount mismatch is rejected", () => {
  assert.throws(
    () => gateway.assertPaymentMatchesTransaction(
      { order_id: "order_1234567890", amount: 4900, currency: "INR" },
      buildSupportTransaction()
    ),
    { code: "PAYMENT_AMOUNT_MISMATCH" }
  );
});

test("paid support contribution generates a PDF receipt", async () => {
  const receipt = await generatePaymentReceipt(buildSupportTransaction());
  assert.ok(Buffer.isBuffer(receipt));
  assert.equal(receipt.subarray(0, 4).toString(), "%PDF");
});

test("unpaid support contribution cannot generate a receipt", async () => {
  await assert.rejects(() => generatePaymentReceipt(buildSupportTransaction({ status: "pending" })), { code: "RECEIPT_NOT_AVAILABLE" });
});

test("support receipt lookup is restricted to the authenticated owner", async () => {
  const original = PaymentTransaction.findOne;
  let query;
  PaymentTransaction.findOne = async (value) => { query = value; return null; };
  try {
    await paymentController._test.findOwnedTransaction({ transactionId: validTransactionId, authUser: { id: validUserId } });
    assert.deepEqual(query, { _id: validTransactionId, userId: validUserId });
  } finally {
    PaymentTransaction.findOne = original;
  }
});

test("support finalization skips Booking and records an idempotent activity key", async () => {
  const Booking = require("../models/Booking");
  const emailModule = require("../utils/email");
  const activityModule = require("../services/activityService");
  const finalizerPath = require.resolve("../services/payment/paymentFinalizationService");
  const originals = {
    findOneAndUpdate: PaymentTransaction.findOneAndUpdate,
    findById: PaymentTransaction.findById,
    booking: Booking.findOneAndUpdate,
    receiptEmail: emailModule.sendPaymentReceiptEmail,
    adminEmail: emailModule.sendAdminPaymentEmail,
    activity: activityModule.recordActivityEvent,
  };
  const state = buildSupportTransaction({ status: "created", razorpayPaymentId: "", paidAt: null });
  let bookingCalls = 0;
  const activities = [];

  PaymentTransaction.findOneAndUpdate = async (query, update) => {
    if (query.receiptEmailSentAt === null || query.adminEmailSentAt === null) return null;
    Object.assign(state, update.$set || {});
    return state;
  };
  PaymentTransaction.findById = async () => state;
  Booking.findOneAndUpdate = async () => { bookingCalls += 1; return {}; };
  emailModule.sendPaymentReceiptEmail = async () => ({ sent: false, skipped: true });
  emailModule.sendAdminPaymentEmail = async () => ({ sent: false, skipped: true });
  activityModule.recordActivityEvent = async (event) => { activities.push(event); return event; };
  delete require.cache[finalizerPath];

  try {
    const finalizer = require(finalizerPath);
    const result = await finalizer.finalizeSuccessfulPayment({
      transaction: state,
      payment: { id: "pay_support123", status: "captured", captured: true },
      source: "webhook",
    });
    await finalizer._test.waitForPendingEmailJobs();
    assert.equal(result.status, "paid");
    assert.equal(bookingCalls, 0);
    assert.equal(activities.length, 1);
    assert.equal(activities[0].eventKey, `payment-success:${validTransactionId}`);
    assert.equal(activities[0].metadata.flow, "support");
    assert.equal(activities[0].title, "Support payment completed");
  } finally {
    PaymentTransaction.findOneAndUpdate = originals.findOneAndUpdate;
    PaymentTransaction.findById = originals.findById;
    Booking.findOneAndUpdate = originals.booking;
    emailModule.sendPaymentReceiptEmail = originals.receiptEmail;
    emailModule.sendAdminPaymentEmail = originals.adminEmail;
    activityModule.recordActivityEvent = originals.activity;
    delete require.cache[finalizerPath];
  }
});
