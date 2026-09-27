const crypto = require("node:crypto");
const mongoose = require("mongoose");
const PaymentTransaction = require("../models/PaymentTransaction");
const PaymentWebhookEvent = require("../models/PaymentWebhookEvent");
const { getServiceBySlug } = require("../services/payment/serviceCatalog");
const {
  assertOrderMatchesRequest,
  assertPaymentMatchesTransaction,
  createGatewayOrder,
  fetchCapturedPaymentForOrder,
  fetchGatewayPayment,
  isRazorpayEnabled,
  toPaise,
  verifyPaymentSignature,
  verifyWebhookSignature,
} = require("../services/payment/razorpayGateway");
const { finalizeSuccessfulPayment } = require("../services/payment/paymentFinalizationService");
const { generatePaymentReceipt } = require("../utils/paymentReceipt");
const { recordActivityEvent } = require("../services/activityService");
const { logger } = require("../utils/logger");
const { parseSupportAmountInr } = require("../config/payment");

const normalize = (value, maxLength = 300) => String(value || "").trim().slice(0, maxLength);
const normalizeEmail = (value) => normalize(value, 320).toLowerCase();

const buildInternalReference = () => {
  const date = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  const entropy = crypto.randomBytes(5).toString("hex").toUpperCase();
  return `GKY-${date}-${entropy}`;
};

const buildTransactionInput = ({ body, authUser, req }) => {
  const service = getServiceBySlug(body?.serviceSlug);
  if (!service) {
    const error = new Error("Selected service is unavailable");
    error.status = 400;
    error.code = "INVALID_SERVICE";
    throw error;
  }

  return {
    userId: authUser.id,
    flowType: "service",
    serviceSlug: service.slug,
    serviceName: service.name,
    customerName: normalize(body?.name, 80),
    email: normalizeEmail(authUser.email),
    phone: normalize(body?.phone, 20),
    preferredDate: new Date(body?.preferredDate),
    preferredTime: normalize(body?.preferredTime, 5),
    projectBrief: normalize(body?.projectBrief, 1200),
    amount: service.amount,
    amountPaise: service.amountPaise,
    currency: service.currency,
    provider: "razorpay",
    internalReference: buildInternalReference(),
    status: "created",
    ipAddress: normalize(req?.ip, 80) || "unknown",
    userAgent: normalize(req?.headers?.["user-agent"], 300) || "unknown",
    metadata: { pricingVersion: "2026-09" },
  };
};

const buildSupportTransactionInput = ({ body, authUser, req }) => {
  const amount = parseSupportAmountInr(body?.amount);

  const contributorName = normalize(body?.name, 80);
  return {
    userId: authUser.id,
    flowType: "support",
    serviceSlug: "support",
    serviceName: "Support Contribution",
    customerName: contributorName,
    contributorName,
    email: normalizeEmail(authUser.email),
    phone: normalize(body?.phone, 20),
    projectBrief: "",
    message: normalize(body?.message, 300),
    amount,
    amountPaise: toPaise(amount),
    currency: "INR",
    provider: "razorpay",
    internalReference: buildInternalReference(),
    status: "created",
    ipAddress: normalize(req?.ip, 80) || "unknown",
    userAgent: normalize(req?.headers?.["user-agent"], 300) || "unknown",
    metadata: { pricingVersion: "support-2026-09" },
  };
};

const toPublicTransaction = (transaction) => ({
  transactionId: String(transaction._id),
  flowType: transaction.flowType,
  serviceSlug: transaction.serviceSlug,
  serviceName: transaction.serviceName,
  customerName: transaction.customerName,
  contributorName: transaction.contributorName,
  email: transaction.email,
  phone: transaction.phone,
  preferredDate: transaction.preferredDate,
  preferredTime: transaction.preferredTime,
  projectBrief: transaction.projectBrief,
  message: transaction.message,
  amount: transaction.amount,
  amountPaise: transaction.amountPaise,
  currency: transaction.currency,
  provider: transaction.provider,
  razorpayOrderId: transaction.razorpayOrderId,
  razorpayPaymentId: transaction.razorpayPaymentId,
  status: transaction.status,
  receiptNumber: transaction.receiptNumber,
  receiptEmailSent: Boolean(transaction.receiptEmailSentAt),
  paidAt: transaction.paidAt,
  createdAt: transaction.createdAt,
});

const findOwnedTransaction = async ({ transactionId, authUser }) => {
  if (!mongoose.isValidObjectId(transactionId)) return null;
  return PaymentTransaction.findOne({ _id: transactionId, userId: authUser.id });
};

const sendError = (res, error, fallbackMessage) => {
  const status = Number(error?.status) || 500;
  const code = normalize(error?.code, 80) || "PAYMENT_REQUEST_FAILED";
  const canUseErrorMessage = status < 500 || code === "PAYMENT_GATEWAY_AUTH_FAILED";
  return res.status(status).json({
    success: false,
    code,
    message: canUseErrorMessage
      ? normalize(error?.message, 200) || fallbackMessage
      : fallbackMessage,
  });
};

const buildOrderFailureUpdate = (error) => ({
  status: "failed",
  failedAt: new Date(),
  failureCode: normalize(error?.code || "ORDER_CREATION_FAILED", 80),
  failureReason: normalize(error?.message || "Gateway order creation failed", 200),
  providerErrorCode: normalize(error?.providerCode, 80),
  providerStatus: Number(error?.providerStatus) || 0,
  failureCategory: normalize(error?.failureCategory || "order_creation", 40),
});

const createTransactionOrder = async ({ req, res, buildInput }) => {
  const reqLogger = req.log || logger;
  let transaction;
  try {
    if (!isRazorpayEnabled()) {
      return res.status(503).json({
        success: false,
        code: "PAYMENT_GATEWAY_DISABLED",
        message: "Payments are temporarily unavailable.",
      });
    }

    const transactionInput = buildInput({ body: req.body, authUser: req.authUser, req });
    transaction = await PaymentTransaction.create(transactionInput);
    const order = await createGatewayOrder({
      amountPaise: transaction.amountPaise,
      currency: transaction.currency,
      receipt: transaction.internalReference,
      notes: {
        transactionId: String(transaction._id),
        serviceSlug: transaction.serviceSlug,
        flowType: transaction.flowType,
        userId: String(transaction.userId),
      },
    });
    assertOrderMatchesRequest(order, {
      amountPaise: transaction.amountPaise,
      currency: transaction.currency,
    });

    transaction.razorpayOrderId = normalize(order.id, 120);
    transaction.status = "pending";
    await transaction.save();
    reqLogger.info(
      { transactionId: String(transaction._id), razorpayOrderId: transaction.razorpayOrderId, state: "pending" },
      "Razorpay order created"
    );

    return res.status(201).json({
      success: true,
      data: {
        transactionId: String(transaction._id),
        keyId: normalize(process.env.RAZORPAY_KEY_ID),
        razorpayOrderId: transaction.razorpayOrderId,
        amount: transaction.amount,
        amountPaise: transaction.amountPaise,
        currency: transaction.currency,
        serviceName: transaction.serviceName,
        flowType: transaction.flowType,
        prefill: { name: transaction.customerName, email: transaction.email, contact: transaction.phone },
      },
    });
  } catch (error) {
    if (transaction?._id && !transaction.razorpayOrderId) {
      await PaymentTransaction.updateOne(
        { _id: transaction._id, status: { $nin: ["paid", "refunded"] }, razorpayOrderId: "" },
        { $set: buildOrderFailureUpdate(error) }
      ).catch(() => undefined);
    }
    reqLogger.error(
      {
        transactionId: transaction?._id ? String(transaction._id) : undefined,
        provider: "razorpay",
        providerStatus: Number(error?.providerStatus) || undefined,
        providerCode: normalize(error?.providerCode, 80) || undefined,
        category: normalize(error?.failureCategory || error?.code, 80) || "order_creation",
      },
      "Razorpay order creation failed"
    );
    return sendError(res, error, "Payment gateway is temporarily unavailable. Please try again shortly.");
  }
};

exports.createOrder = async (req, res) =>
  createTransactionOrder({ req, res, buildInput: buildTransactionInput });

exports.createSupportOrder = async (req, res) =>
  createTransactionOrder({ req, res, buildInput: buildSupportTransactionInput });

exports.verifyPayment = async (req, res) => {
  const reqLogger = req.log || logger;
  const transactionId = normalize(req.body?.transactionId, 80);
  try {
    const transaction = await findOwnedTransaction({ transactionId, authUser: req.authUser });
    if (!transaction) return res.status(404).json({ success: false, message: "Payment transaction not found" });

    const returnedOrderId = normalize(req.body?.razorpay_order_id, 120);
    const paymentId = normalize(req.body?.razorpay_payment_id, 120);
    if (!transaction.razorpayOrderId || transaction.razorpayOrderId !== returnedOrderId) {
      return res.status(422).json({ success: false, message: "Payment order verification failed" });
    }

    const signatureValid = verifyPaymentSignature({
      orderId: transaction.razorpayOrderId,
      paymentId,
      signature: req.body?.razorpay_signature,
      secret: process.env.RAZORPAY_KEY_SECRET,
    });
    if (!signatureValid) return res.status(422).json({ success: false, message: "Payment signature verification failed" });

    if (transaction.status === "paid" && transaction.razorpayPaymentId === paymentId) {
      return res.status(200).json({ success: true, data: toPublicTransaction(transaction) });
    }

    const payment = await fetchGatewayPayment(paymentId);
    assertPaymentMatchesTransaction(payment, transaction);
    const isCaptured = payment?.captured === true || payment?.status === "captured";
    if (!isCaptured) {
      const status = payment?.status === "authorized" ? "authorized" : "pending";
      await PaymentTransaction.updateOne(
        { _id: transaction._id, status: { $ne: "paid" } },
        { $set: { status, razorpayPaymentId: paymentId, verificationAcceptedAt: new Date() } }
      );
      const pending = await PaymentTransaction.findById(transaction._id);
      return res.status(202).json({ success: true, data: toPublicTransaction(pending) });
    }

    const finalized = await finalizeSuccessfulPayment({ transaction, payment, source: "verification" });
    reqLogger.info({ transactionId, razorpayOrderId: transaction.razorpayOrderId, state: "paid" }, "Razorpay payment verified");
    return res.status(200).json({ success: true, data: toPublicTransaction(finalized) });
  } catch (error) {
    const verificationError = ["PAYMENT_ORDER_MISMATCH", "PAYMENT_AMOUNT_MISMATCH", "PAYMENT_CURRENCY_MISMATCH"].includes(error?.code);
    if (verificationError) error.status = 422;
    reqLogger.error({ err: error, transactionId }, "Razorpay payment verification failed");
    return sendError(res, error, "Unable to verify payment securely");
  }
};

exports.recordPaymentFailure = async (req, res) => {
  const transactionId = normalize(req.body?.transactionId, 80);
  try {
    const transaction = await findOwnedTransaction({ transactionId, authUser: req.authUser });
    if (!transaction) return res.status(404).json({ success: false, message: "Payment transaction not found" });
    if (transaction.status !== "paid") {
      transaction.status = "failed";
      transaction.failedAt = new Date();
      transaction.failureCode = normalize(req.body?.code, 80);
      transaction.failureReason = normalize(req.body?.reason, 200);
      await transaction.save();
      await recordActivityEvent({
        eventKey: `payment-failed:${transaction._id}`,
        userId: transaction.userId,
        userEmail: transaction.email,
        actionType: "payment_failed",
        domain: "payment",
        title: transaction.flowType === "support"
          ? "Support payment failed"
          : `${transaction.serviceName} payment failed`,
        status: "failed",
        amount: transaction.amount,
        orderId: transaction.razorpayOrderId,
        transactionId: String(transaction._id),
        metadata: { flow: transaction.flowType, provider: "razorpay", serviceSlug: transaction.serviceSlug },
      });
    }
    return res.status(200).json({ success: true, data: toPublicTransaction(transaction) });
  } catch (error) {
    return sendError(res, error, "Unable to update payment state");
  }
};

exports.getTransaction = async (req, res) => {
  try {
    const transaction = await findOwnedTransaction({ transactionId: req.params.transactionId, authUser: req.authUser });
    if (!transaction) return res.status(404).json({ success: false, message: "Payment transaction not found" });
    return res.status(200).json({ success: true, data: toPublicTransaction(transaction) });
  } catch (error) {
    return sendError(res, error, "Unable to load payment transaction");
  }
};

exports.downloadReceipt = async (req, res) => {
  const transactionId = normalize(req.params.transactionId, 80);
  try {
    const transaction = await findOwnedTransaction({ transactionId, authUser: req.authUser });
    if (!transaction) return res.status(404).json({ success: false, message: "Payment transaction not found" });
    if (transaction.status !== "paid" || !transaction.receiptNumber) {
      return res.status(409).json({ success: false, message: "Receipt is available after payment is confirmed" });
    }
    const receipt = await generatePaymentReceipt(transaction);
    await recordActivityEvent({
      eventKey: `receipt-downloaded:${transaction._id}`,
      userId: transaction.userId,
      userEmail: transaction.email,
      actionType: "receipt_downloaded",
      domain: "payment",
      title: "Payment receipt downloaded",
      status: "success",
      orderId: transaction.razorpayOrderId,
      paymentId: transaction.razorpayPaymentId,
      transactionId: String(transaction._id),
      metadata: {
        flow: transaction.flowType,
        provider: "razorpay",
        receiptNumber: transaction.receiptNumber,
        serviceSlug: transaction.serviceSlug,
      },
    });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="payment-receipt-${transaction.receiptNumber}.pdf"`);
    res.setHeader("Cache-Control", "private, no-store");
    return res.status(200).send(receipt);
  } catch (error) {
    return sendError(res, error, "Unable to generate payment receipt");
  }
};

const claimWebhookEvent = async ({ eventId, eventType }) => {
  const existing = await PaymentWebhookEvent.findOne({ eventId });
  const updatedAt = existing?.updatedAt ? new Date(existing.updatedAt).getTime() : 0;
  const isActiveClaim = existing?.status === "processing" && Date.now() - updatedAt < 5 * 60 * 1000;
  if (existing?.status === "processed" || existing?.status === "ignored" || isActiveClaim) {
    return { duplicate: true, event: existing };
  }
  if (existing) {
    existing.status = "processing";
    existing.attempts += 1;
    existing.error = "";
    await existing.save();
    return { duplicate: false, event: existing };
  }
  try {
    const event = await PaymentWebhookEvent.create({ eventId, eventType, status: "processing" });
    return { duplicate: false, event };
  } catch (error) {
    if (error?.code === 11000) return { duplicate: true, event: null };
    throw error;
  }
};

const getWebhookPayment = async (payload) => {
  const embedded = payload?.payload?.payment?.entity;
  if (embedded?.id) return embedded;
  const orderId = normalize(payload?.payload?.order?.entity?.id, 120);
  return orderId ? fetchCapturedPaymentForOrder(orderId) : null;
};

exports.handleRazorpayWebhook = async (req, res) => {
  const reqLogger = req.log || logger;
  const rawBody = req.rawBody;
  const signature = req.headers["x-razorpay-signature"];
  if (!isRazorpayEnabled() || !normalize(process.env.RAZORPAY_WEBHOOK_SECRET)) {
    return res.status(503).json({ success: false, message: "Payment webhook is unavailable" });
  }
  if (!rawBody || !verifyWebhookSignature({ rawBody, signature, secret: process.env.RAZORPAY_WEBHOOK_SECRET })) {
    return res.status(401).json({ success: false, message: "Webhook signature verification failed" });
  }

  const eventType = normalize(req.body?.event, 80);
  const eventId = normalize(req.headers["x-razorpay-event-id"], 160) || crypto.createHash("sha256").update(rawBody).digest("hex");
  let claimed;
  try {
    claimed = await claimWebhookEvent({ eventId, eventType });
    if (claimed.duplicate) return res.status(200).json({ success: true, duplicate: true });

    if (!["payment.captured", "payment.failed", "order.paid"].includes(eventType)) {
      claimed.event.status = "ignored";
      claimed.event.processedAt = new Date();
      await claimed.event.save();
      return res.status(200).json({ success: true, ignored: true });
    }

    const payment = await getWebhookPayment(req.body);
    const orderId = normalize(payment?.order_id || req.body?.payload?.order?.entity?.id, 120);
    const transaction = orderId ? await PaymentTransaction.findOne({ razorpayOrderId: orderId }) : null;
    if (!transaction) throw new Error("Webhook transaction was not found");
    claimed.event.transactionId = transaction._id;

    if (eventType === "payment.failed") {
      if (transaction.status !== "paid") {
        transaction.status = "failed";
        transaction.failedAt = new Date();
        transaction.failureCode = normalize(payment?.error_code, 80);
        transaction.failureReason = normalize(payment?.error_reason || payment?.error_description, 200);
        transaction.webhookReceivedAt = new Date();
        await transaction.save();
        await recordActivityEvent({
          eventKey: `payment-failed:${transaction._id}`,
          userId: transaction.userId,
          userEmail: transaction.email,
          actionType: "payment_failed",
          domain: "payment",
          title: transaction.flowType === "support"
            ? "Support payment failed"
            : `${transaction.serviceName} payment failed`,
          status: "failed",
          amount: transaction.amount,
          orderId: transaction.razorpayOrderId,
          paymentId: normalize(payment?.id, 120),
          transactionId: String(transaction._id),
          metadata: { flow: transaction.flowType, provider: "razorpay", serviceSlug: transaction.serviceSlug },
        });
      }
    } else {
      if (!payment?.id) throw new Error("Captured payment was missing from webhook payload");
      assertPaymentMatchesTransaction(payment, transaction);
      if (!(payment.captured === true || payment.status === "captured")) throw new Error("Webhook payment is not captured");
      await finalizeSuccessfulPayment({ transaction, payment, source: "webhook" });
    }

    claimed.event.status = "processed";
    claimed.event.processedAt = new Date();
    await claimed.event.save();
    reqLogger.info({ transactionId: String(transaction._id), eventType, eventId }, "Razorpay webhook processed");
    return res.status(200).json({ success: true });
  } catch (error) {
    if (claimed?.event) {
      claimed.event.status = "failed";
      claimed.event.error = normalize(error?.message, 200);
      await claimed.event.save().catch(() => undefined);
    }
    reqLogger.error({ err: error, eventType, eventId }, "Razorpay webhook processing failed");
    return res.status(500).json({ success: false, message: "Webhook processing failed" });
  }
};

exports._test = {
  buildInternalReference,
  buildOrderFailureUpdate,
  buildSupportTransactionInput,
  buildTransactionInput,
  claimWebhookEvent,
  findOwnedTransaction,
  sendError,
  toPublicTransaction,
};
