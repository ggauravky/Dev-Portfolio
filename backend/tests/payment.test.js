const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
const test = require("node:test");

const PaymentTransaction = require("../models/PaymentTransaction");
const PaymentWebhookEvent = require("../models/PaymentWebhookEvent");
const { getServiceBySlug, listPaidServices } = require("../services/payment/serviceCatalog");
const gateway = require("../services/payment/razorpayGateway");
const { generatePaymentReceipt, _test: receiptTest } = require("../utils/paymentReceipt");
const { buildReceiptNumber } = require("../services/payment/paymentFinalizationService");
const paymentController = require("../controllers/paymentController");

const validUserId = "507f1f77bcf86cd799439011";
const validTransactionId = "507f191e810c19729de860ea";

const buildRequest = (overrides = {}) => ({
  ip: "127.0.0.1",
  headers: { "user-agent": "node-test" },
  ...overrides,
});

const buildBookingBody = (overrides = {}) => ({
  serviceSlug: "mentorship",
  name: "Test User",
  email: "spoofed@example.com",
  phone: "9876543210",
  preferredDate: "2026-10-10",
  preferredTime: "10:00",
  projectBrief: "Need a focused roadmap.",
  ...overrides,
});

const buildTransaction = (overrides = {}) => ({
  _id: validTransactionId,
  userId: validUserId,
  flowType: "service",
  serviceSlug: "mentorship",
  serviceName: "Mentorship",
  customerName: "Test User",
  email: "test@example.com",
  phone: "9876543210",
  preferredDate: new Date("2026-10-10T00:00:00.000Z"),
  preferredTime: "10:00",
  projectBrief: "Need a focused roadmap.",
  amount: 49,
  amountPaise: 4900,
  currency: "INR",
  provider: "razorpay",
  internalReference: "GKY-20260914-ABC123",
  razorpayOrderId: "order_1234567890",
  razorpayPaymentId: "pay_1234567890",
  status: "paid",
  receiptNumber: "GKY-2026-DE860EA",
  paidAt: new Date("2026-09-14T10:00:00.000Z"),
  createdAt: new Date("2026-09-14T09:59:00.000Z"),
  ...overrides,
});

test("catalogue contains all eight active paid services", () => {
  assert.equal(listPaidServices().length, 8);
  assert.ok(listPaidServices().every((service) => service.enabled && service.currency === "INR"));
});

test("catalogue slugs are unique", () => {
  const slugs = listPaidServices().map((service) => service.slug);
  assert.equal(new Set(slugs).size, slugs.length);
});

test("invalid service slug is rejected", () => {
  assert.equal(getServiceBySlug("not-a-service"), null);
});

test("valid service creates trusted transaction input", () => {
  const input = paymentController._test.buildTransactionInput({
    body: buildBookingBody(),
    authUser: { id: validUserId, email: "test@example.com" },
    req: buildRequest(),
  });
  assert.equal(input.serviceSlug, "mentorship");
  assert.equal(input.amount, 49);
  assert.equal(input.amountPaise, 4900);
});

test("frontend supplied amount cannot change server price", () => {
  const input = paymentController._test.buildTransactionInput({
    body: buildBookingBody({ amount: 1, amountPaise: 1 }),
    authUser: { id: validUserId, email: "test@example.com" },
    req: buildRequest(),
  });
  assert.equal(input.amount, 49);
  assert.equal(input.amountPaise, 4900);
});

test("authenticated email is authoritative", () => {
  const input = paymentController._test.buildTransactionInput({
    body: buildBookingBody(),
    authUser: { id: validUserId, email: "Owner@Example.com" },
    req: buildRequest(),
  });
  assert.equal(input.email, "owner@example.com");
  assert.equal(input.userId, validUserId);
});

test("amount converts from rupees to paise", () => assert.equal(gateway.toPaise(49), 4900));

test("invalid rupee amount cannot be converted", () => assert.throws(() => gateway.toPaise(49.5), TypeError));

test("valid Razorpay payment signature is accepted", () => {
  const secret = "test-secret";
  const signature = gateway.createHmacSignature("order_123|pay_123", secret);
  assert.equal(gateway.verifyPaymentSignature({ orderId: "order_123", paymentId: "pay_123", signature, secret }), true);
});

test("invalid Razorpay payment signature is rejected", () => {
  assert.equal(gateway.verifyPaymentSignature({ orderId: "order_123", paymentId: "pay_123", signature: "0".repeat(64), secret: "test-secret" }), false);
});

test("duplicate verification of an already paid transaction is idempotent", async () => {
  const originalFindOne = PaymentTransaction.findOne;
  const originalSecret = process.env.RAZORPAY_KEY_SECRET;
  const transaction = buildTransaction();
  PaymentTransaction.findOne = async () => transaction;
  process.env.RAZORPAY_KEY_SECRET = "test-secret";
  const signature = gateway.createHmacSignature(
    `${transaction.razorpayOrderId}|${transaction.razorpayPaymentId}`,
    process.env.RAZORPAY_KEY_SECRET
  );
  const req = {
    body: {
      transactionId: validTransactionId,
      razorpay_order_id: transaction.razorpayOrderId,
      razorpay_payment_id: transaction.razorpayPaymentId,
      razorpay_signature: signature,
    },
    authUser: { id: validUserId },
    log: { info() {}, error() {} },
  };
  let statusCode = 0;
  let payload;
  const res = {
    status(code) { statusCode = code; return this; },
    json(value) { payload = value; return value; },
  };
  try {
    await paymentController.verifyPayment(req, res);
    await paymentController.verifyPayment(req, res);
    assert.equal(statusCode, 200);
    assert.equal(payload.data.status, "paid");
  } finally {
    PaymentTransaction.findOne = originalFindOne;
    if (originalSecret === undefined) delete process.env.RAZORPAY_KEY_SECRET;
    else process.env.RAZORPAY_KEY_SECRET = originalSecret;
  }
});

test("malformed signatures fail safely", () => assert.equal(gateway.timingSafeHexEqual("bad", "also-bad"), false));

test("valid raw-body webhook signature is accepted", () => {
  const rawBody = Buffer.from('{"event":"payment.captured"}');
  const signature = crypto.createHmac("sha256", "webhook-secret").update(rawBody).digest("hex");
  assert.equal(gateway.verifyWebhookSignature({ rawBody, signature, secret: "webhook-secret" }), true);
});

test("invalid webhook signature is rejected", () => {
  assert.equal(gateway.verifyWebhookSignature({ rawBody: Buffer.from("{}"), signature: "0".repeat(64), secret: "webhook-secret" }), false);
});

test("matching Razorpay order response passes provider checks", () => {
  assert.equal(
    gateway.assertOrderMatchesRequest(
      { id: "order_1234567890", amount: 4900, currency: "INR" },
      { amountPaise: 4900, currency: "INR" }
    ),
    true
  );
});

test("malformed Razorpay order response is rejected", () => {
  assert.throws(
    () => gateway.assertOrderMatchesRequest({ id: "", amount: 4900, currency: "INR" }, { amountPaise: 4900, currency: "INR" }),
    { code: "INVALID_GATEWAY_ORDER" }
  );
});

test("wrong Razorpay order amount is rejected", () => {
  assert.throws(
    () => gateway.assertOrderMatchesRequest({ id: "order_1234567890", amount: 100, currency: "INR" }, { amountPaise: 4900, currency: "INR" }),
    { code: "GATEWAY_ORDER_AMOUNT_MISMATCH" }
  );
});

test("wrong Razorpay order currency is rejected", () => {
  assert.throws(
    () => gateway.assertOrderMatchesRequest({ id: "order_1234567890", amount: 4900, currency: "USD" }, { amountPaise: 4900, currency: "INR" }),
    { code: "GATEWAY_ORDER_CURRENCY_MISMATCH" }
  );
});

test("mismatched Razorpay order is rejected", () => {
  assert.throws(
    () => gateway.assertPaymentMatchesTransaction({ order_id: "order_other", amount: 4900, currency: "INR" }, buildTransaction()),
    { code: "PAYMENT_ORDER_MISMATCH" }
  );
});

test("wrong payment amount is rejected", () => {
  assert.throws(
    () => gateway.assertPaymentMatchesTransaction({ order_id: "order_1234567890", amount: 100, currency: "INR" }, buildTransaction()),
    { code: "PAYMENT_AMOUNT_MISMATCH" }
  );
});

test("wrong payment currency is rejected", () => {
  assert.throws(
    () => gateway.assertPaymentMatchesTransaction({ order_id: "order_1234567890", amount: 4900, currency: "USD" }, buildTransaction()),
    { code: "PAYMENT_CURRENCY_MISMATCH" }
  );
});

test("matching captured payment passes provider checks", () => {
  assert.equal(gateway.assertPaymentMatchesTransaction({ order_id: "order_1234567890", amount: 4900, currency: "INR", status: "captured" }, buildTransaction()), true);
});

test("receipt number remains stable for repeated generation", () => {
  const transaction = buildTransaction({ receiptNumber: "" });
  assert.equal(buildReceiptNumber(transaction), buildReceiptNumber(transaction));
});

test("different transactions receive different receipt numbers", () => {
  const first = buildReceiptNumber(buildTransaction({ _id: "507f191e810c19729de860ea", receiptNumber: "" }));
  const second = buildReceiptNumber(buildTransaction({ _id: "507f191e810c19729de860eb", receiptNumber: "" }));
  assert.notEqual(first, second);
});

test("public transaction response excludes secrets and raw metadata", () => {
  const output = paymentController._test.toPublicTransaction(buildTransaction({ metadata: { private: true } }));
  assert.equal(output.serviceName, "Mentorship");
  assert.equal("metadata" in output, false);
  assert.equal("razorpayKeySecret" in output, false);
});

test("owned transaction lookup includes authenticated user ID", async () => {
  const original = PaymentTransaction.findOne;
  let receivedQuery;
  PaymentTransaction.findOne = async (query) => { receivedQuery = query; return buildTransaction(); };
  try {
    await paymentController._test.findOwnedTransaction({ transactionId: validTransactionId, authUser: { id: validUserId } });
    assert.deepEqual(receivedQuery, { _id: validTransactionId, userId: validUserId });
  } finally {
    PaymentTransaction.findOne = original;
  }
});

test("another user cannot match the owned transaction query", async () => {
  const original = PaymentTransaction.findOne;
  PaymentTransaction.findOne = async (query) => query.userId === validUserId ? buildTransaction() : null;
  try {
    const result = await paymentController._test.findOwnedTransaction({ transactionId: validTransactionId, authUser: { id: "507f1f77bcf86cd799439012" } });
    assert.equal(result, null);
  } finally {
    PaymentTransaction.findOne = original;
  }
});

test("processed webhook event is idempotently ignored", async () => {
  const original = PaymentWebhookEvent.findOne;
  PaymentWebhookEvent.findOne = async () => ({ status: "processed" });
  try {
    const result = await paymentController._test.claimWebhookEvent({ eventId: "evt_1", eventType: "payment.captured" });
    assert.equal(result.duplicate, true);
  } finally {
    PaymentWebhookEvent.findOne = original;
  }
});

test("new webhook event is claimed once", async () => {
  const originalFind = PaymentWebhookEvent.findOne;
  const originalCreate = PaymentWebhookEvent.create;
  PaymentWebhookEvent.findOne = async () => null;
  PaymentWebhookEvent.create = async (value) => value;
  try {
    const result = await paymentController._test.claimWebhookEvent({ eventId: "evt_2", eventType: "payment.captured" });
    assert.equal(result.duplicate, false);
    assert.equal(result.event.status, "processing");
  } finally {
    PaymentWebhookEvent.findOne = originalFind;
    PaymentWebhookEvent.create = originalCreate;
  }
});

test("receipt is generated only for paid transaction", async () => {
  await assert.rejects(() => generatePaymentReceipt(buildTransaction({ status: "pending" })), { code: "RECEIPT_NOT_AVAILABLE" });
});

test("paid transaction generates a valid PDF buffer", async () => {
  const receipt = await generatePaymentReceipt(buildTransaction());
  assert.ok(Buffer.isBuffer(receipt));
  assert.equal(receipt.subarray(0, 4).toString(), "%PDF");
});

test("support transaction generates a valid PDF buffer", async () => {
  const receipt = await generatePaymentReceipt(buildTransaction({
    flowType: "support",
    serviceName: "Support Contribution",
    amount: 199,
  }));
  assert.ok(receipt.length > 1000);
  assert.equal(receipt.subarray(0, 4).toString(), "%PDF");
});

test("receipt view model includes the correct amount and receipt number", () => {
  const data = receiptTest.buildReceiptData(buildTransaction({ amount: 499, receiptNumber: "GKY-2026-499" }));
  assert.equal(data.amount, "INR 499.00");
  assert.equal(data.receiptNumber, "GKY-2026-499");
});

test("receipt safely handles long customer names", async () => {
  const receipt = await generatePaymentReceipt(buildTransaction({ customerName: "Very Long Customer Name ".repeat(20) }));
  assert.ok(receipt.length > 1000);
});

test("receipt safely handles long customer emails", async () => {
  const receipt = await generatePaymentReceipt(buildTransaction({ email: `${"long".repeat(70)}@example.test` }));
  assert.ok(receipt.length > 1000);
});

test("receipt safely handles long service names and identifiers", async () => {
  const receipt = await generatePaymentReceipt(buildTransaction({
    serviceName: "A detailed full-stack product engineering consultation ".repeat(8),
    razorpayPaymentId: `pay_${"x".repeat(180)}`,
    razorpayOrderId: `order_${"y".repeat(180)}`,
  }));
  assert.ok(receipt.length > 1000);
});

test("support receipt uses contribution wording without restricted claims", () => {
  const data = receiptTest.buildReceiptData(buildTransaction({ flowType: "support", serviceName: "Support Contribution" }));
  const serialized = JSON.stringify(data);
  assert.match(serialized, /Support Contribution/);
  assert.doesNotMatch(serialized, /Donation|Tax Invoice/i);
});

test("disabled payment gateway returns a service-unavailable error", () => {
  const original = process.env.RAZORPAY_ENABLED;
  process.env.RAZORPAY_ENABLED = "false";
  try {
    assert.throws(() => gateway.requireGatewayConfig(), { code: "PAYMENT_GATEWAY_DISABLED", status: 503 });
  } finally {
    if (original === undefined) delete process.env.RAZORPAY_ENABLED;
    else process.env.RAZORPAY_ENABLED = original;
  }
});

test("every frontend paid service has matching backend pricing", async () => {
  const frontendPath = pathToFileURL(path.resolve(__dirname, "../../src/data/servicesData.js")).href;
  const { servicesData } = await import(frontendPath);
  assert.equal(servicesData.length, listPaidServices().length);
  servicesData.forEach((service) => {
    const backendService = getServiceBySlug(service.slug);
    assert.ok(backendService, `Missing backend pricing for ${service.slug}`);
    assert.equal(backendService.amount, service.amount, `Price mismatch for ${service.slug}`);
  });
});

const withMockedFinalizer = async ({
  receiptEmail,
  adminEmail = async () => ({ sent: false, skipped: true, reason: "admin_email_not_configured" }),
  run,
}) => {
  const Booking = require("../models/Booking");
  const emailModule = require("../utils/email");
  const receiptModule = require("../utils/paymentReceipt");
  const activityModule = require("../services/activityService");
  const finalizerPath = require.resolve("../services/payment/paymentFinalizationService");
  const originalMaxAttempts = process.env.PAYMENT_EMAIL_MAX_ATTEMPTS;
  const originalRetryBaseMs = process.env.PAYMENT_EMAIL_RETRY_BASE_MS;
  const originals = {
    transactionFindOneAndUpdate: PaymentTransaction.findOneAndUpdate,
    transactionFindById: PaymentTransaction.findById,
    transactionUpdateOne: PaymentTransaction.updateOne,
    bookingFindOneAndUpdate: Booking.findOneAndUpdate,
    receiptEmail: emailModule.sendPaymentReceiptEmail,
    adminEmail: emailModule.sendAdminPaymentEmail,
    receipt: receiptModule.generatePaymentReceipt,
    activity: activityModule.recordActivityEvent,
  };

  emailModule.sendPaymentReceiptEmail = receiptEmail;
  emailModule.sendAdminPaymentEmail = adminEmail;
  receiptModule.generatePaymentReceipt = async () => Buffer.from("%PDF-test");
  activityModule.recordActivityEvent = async () => ({});
  process.env.PAYMENT_EMAIL_MAX_ATTEMPTS = "1";
  process.env.PAYMENT_EMAIL_RETRY_BASE_MS = "0";
  delete require.cache[finalizerPath];

  try {
    await run({ Booking, finalizer: require(finalizerPath) });
  } finally {
    PaymentTransaction.findOneAndUpdate = originals.transactionFindOneAndUpdate;
    PaymentTransaction.findById = originals.transactionFindById;
    PaymentTransaction.updateOne = originals.transactionUpdateOne;
    Booking.findOneAndUpdate = originals.bookingFindOneAndUpdate;
    emailModule.sendPaymentReceiptEmail = originals.receiptEmail;
    emailModule.sendAdminPaymentEmail = originals.adminEmail;
    receiptModule.generatePaymentReceipt = originals.receipt;
    activityModule.recordActivityEvent = originals.activity;
    if (originalMaxAttempts === undefined) delete process.env.PAYMENT_EMAIL_MAX_ATTEMPTS;
    else process.env.PAYMENT_EMAIL_MAX_ATTEMPTS = originalMaxAttempts;
    if (originalRetryBaseMs === undefined) delete process.env.PAYMENT_EMAIL_RETRY_BASE_MS;
    else process.env.PAYMENT_EMAIL_RETRY_BASE_MS = originalRetryBaseMs;
    delete require.cache[finalizerPath];
  }
};

test("receipt email is claimed and sent only once", async () => {
  let sendCount = 0;
  await withMockedFinalizer({
    receiptEmail: async () => {
      sendCount += 1;
      return { sent: true, messageId: "brevo-message-1" };
    },
    run: async ({ finalizer }) => {
      const state = buildTransaction({ receiptEmailSentAt: null, receiptEmailClaimedAt: null });
      PaymentTransaction.findOneAndUpdate = async (query, update) => {
        if (query.receiptEmailSentAt === null && state.receiptEmailSentAt) return null;
        Object.assign(state, update.$set || {});
        return state;
      };
      PaymentTransaction.updateOne = async (query, update) => {
        Object.assign(state, update.$set || {});
        return { acknowledged: true };
      };

      await finalizer.deliverReceiptEmailOnce(state);
      await finalizer.deliverReceiptEmailOnce(state);
      assert.equal(sendCount, 1);
      assert.ok(state.receiptEmailSentAt instanceof Date);
    },
  });
});

test("receipt email failure never changes a paid transaction to failed", async () => {
  await withMockedFinalizer({
    receiptEmail: async () => { throw new Error("SMTP unavailable"); },
    run: async ({ Booking, finalizer }) => {
      const state = buildTransaction({
        status: "created",
        razorpayPaymentId: "",
        receiptNumber: "",
        paidAt: null,
        receiptEmailSentAt: null,
        receiptEmailClaimedAt: null,
        adminEmailSentAt: null,
        adminEmailClaimedAt: null,
      });

      PaymentTransaction.findOneAndUpdate = async (query, update) => {
        if (query.receiptNumber === "" && state.receiptNumber) return null;
        if (query.receiptEmailSentAt === null && state.receiptEmailSentAt) return null;
        if (query.adminEmailSentAt === null && state.adminEmailSentAt) return null;
        Object.assign(state, update.$set || {});
        return state;
      };
      PaymentTransaction.findById = async () => state;
      PaymentTransaction.updateOne = async (query, update) => {
        Object.assign(state, update.$set || {});
        return { acknowledged: true };
      };
      Booking.findOneAndUpdate = async () => ({ _id: "507f191e810c19729de860ff" });

      const finalized = await finalizer.finalizeSuccessfulPayment({
        transaction: state,
        payment: { id: "pay_1234567890", status: "captured", captured: true },
        source: "verification",
      });
      await finalizer._test.waitForPendingEmailJobs();
      assert.equal(finalized.status, "paid");
      assert.equal(finalized.failureReason, "");
      assert.match(finalized.receiptEmailError, /SMTP unavailable/);
    },
  });
});

test("verification and webhook retries do not duplicate customer or admin email", async () => {
  let receiptSendCount = 0;
  let adminSendCount = 0;
  await withMockedFinalizer({
    receiptEmail: async () => {
      receiptSendCount += 1;
      return { sent: true, messageId: "receipt-message-1" };
    },
    adminEmail: async () => {
      adminSendCount += 1;
      return { sent: true, messageId: "admin-message-1" };
    },
    run: async ({ Booking, finalizer }) => {
      const state = buildTransaction({
        receiptEmailSentAt: null,
        receiptEmailClaimedAt: null,
        adminEmailSentAt: null,
        adminEmailClaimedAt: null,
      });

      PaymentTransaction.findOneAndUpdate = async (query, update) => {
        if (query.receiptEmailSentAt === null && state.receiptEmailSentAt) return null;
        if (query.adminEmailSentAt === null && state.adminEmailSentAt) return null;
        Object.assign(state, update.$set || {});
        return state;
      };
      PaymentTransaction.findById = async () => state;
      PaymentTransaction.updateOne = async (query, update) => {
        Object.assign(state, update.$set || {});
        return { acknowledged: true };
      };
      Booking.findOneAndUpdate = async () => ({ _id: "507f191e810c19729de860ff" });

      await finalizer.finalizeSuccessfulPayment({
        transaction: state,
        payment: { id: state.razorpayPaymentId, status: "captured", captured: true },
        source: "verification",
      });
      await finalizer._test.waitForPendingEmailJobs();
      await finalizer.finalizeSuccessfulPayment({
        transaction: state,
        payment: { id: state.razorpayPaymentId, status: "captured", captured: true },
        source: "webhook",
      });
      await finalizer._test.waitForPendingEmailJobs();

      assert.equal(receiptSendCount, 1);
      assert.equal(adminSendCount, 1);
    },
  });
});
