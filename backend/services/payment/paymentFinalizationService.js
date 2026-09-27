const Booking = require("../../models/Booking");
const PaymentTransaction = require("../../models/PaymentTransaction");
const { recordActivityEvent } = require("../activityService");
const {
  classifySmtpError,
  sendAdminPaymentEmail,
  sendPaymentReceiptEmail,
} = require("../../utils/email");
const { generatePaymentReceipt } = require("../../utils/paymentReceipt");
const { logger } = require("../../utils/logger");
const { scheduleBackgroundTask, waitForBackgroundTasks } = require("../../utils/backgroundTasks");

const EMAIL_CLAIM_TIMEOUT_MS = 5 * 60 * 1000;

const compactError = (error) => String(error?.message || error || "Unknown error").trim().slice(0, 200);
const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
const getPaymentEmailMaxAttempts = () =>
  Math.min(3, Math.max(1, Number.parseInt(process.env.PAYMENT_EMAIL_MAX_ATTEMPTS, 10) || 3));
const getPaymentEmailRetryBaseMs = () => {
  const value = Number.parseInt(process.env.PAYMENT_EMAIL_RETRY_BASE_MS, 10);
  return Number.isFinite(value) ? Math.max(0, value) : 1000;
};

const buildReceiptNumber = (transaction) => {
  const paidAt = new Date(transaction?.paidAt || Date.now());
  const year = Number.isNaN(paidAt.getTime()) ? new Date().getUTCFullYear() : paidAt.getUTCFullYear();
  const suffix = String(transaction?._id || transaction?.internalReference || "PAYMENT")
    .replaceAll(/[^a-zA-Z0-9]/g, "")
    .slice(-12)
    .toUpperCase()
    .padStart(12, "0");
  return `GKY-${year}-${suffix}`;
};

const ensureReceiptIdentity = async (transaction) => {
  if (transaction.receiptNumber) return transaction;
  const receiptNumber = buildReceiptNumber(transaction);
  const now = new Date();
  return PaymentTransaction.findOneAndUpdate(
    { _id: transaction._id, receiptNumber: "" },
    { $set: { receiptNumber, receiptGeneratedAt: now } },
    { new: true }
  ).then((updated) => updated || PaymentTransaction.findById(transaction._id));
};

const ensureBooking = async (transaction) => {
  const booking = await Booking.findOneAndUpdate(
    { orderId: transaction.razorpayOrderId },
    {
      $setOnInsert: {
        name: transaction.customerName,
        email: transaction.email,
        userId: transaction.userId,
        phone: transaction.phone,
        serviceSlug: transaction.serviceSlug,
        service: transaction.serviceName,
        preferredDate: transaction.preferredDate,
        preferredTime: transaction.preferredTime,
        projectBrief: transaction.projectBrief,
        amount: transaction.amount,
        paymentId: transaction.razorpayPaymentId,
        orderId: transaction.razorpayOrderId,
        paymentProvider: "razorpay",
        paymentStatus: "paid",
        paidAt: transaction.paidAt,
        verificationAcceptedAt: transaction.verificationAcceptedAt,
        date: transaction.paidAt,
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  if (!transaction.bookingId || String(transaction.bookingId) !== String(booking._id)) {
    await PaymentTransaction.updateOne({ _id: transaction._id }, { $set: { bookingId: booking._id } });
  }
  return booking;
};

const recordPaidActivity = async (transaction) => {
  const isSupport = transaction.flowType === "support";
  await recordActivityEvent({
    eventKey: `payment-success:${transaction._id}`,
    userId: transaction.userId,
    userEmail: transaction.email,
    actionType: "payment_success",
    domain: "payment",
    title: isSupport ? "Support payment completed" : `${transaction.serviceName} booking confirmed`,
    description: isSupport
      ? "Razorpay support payment verified successfully."
      : "Razorpay payment verified and booking confirmed.",
    status: "success",
    amount: transaction.amount,
    currency: transaction.currency,
    orderId: transaction.razorpayOrderId,
    paymentId: transaction.razorpayPaymentId,
    transactionId: String(transaction._id),
    metadata: {
      flow: transaction.flowType,
      provider: "razorpay",
      serviceSlug: transaction.serviceSlug,
      receiptNumber: transaction.receiptNumber,
    },
  });
};

const claimEmailDelivery = (transactionId, kind) => {
  const now = new Date();
  const staleBefore = new Date(now.getTime() - EMAIL_CLAIM_TIMEOUT_MS);
  const sentField = kind === "receipt" ? "receiptEmailSentAt" : "adminEmailSentAt";
  const claimField = kind === "receipt" ? "receiptEmailClaimedAt" : "adminEmailClaimedAt";
  const attemptField = kind === "receipt" ? "receiptEmailLastAttemptAt" : "adminEmailLastAttemptAt";
  const statusField = kind === "receipt" ? "receiptEmailStatus" : "adminEmailStatus";
  const attemptCountField = kind === "receipt" ? "receiptEmailAttemptCount" : "adminEmailAttemptCount";

  return PaymentTransaction.findOneAndUpdate(
    {
      _id: transactionId,
      [sentField]: null,
      $or: [{ [claimField]: null }, { [claimField]: { $lt: staleBefore } }],
    },
    {
      $set: { [claimField]: now, [attemptField]: now, [statusField]: "processing" },
      $inc: { [attemptCountField]: 1 },
    },
    { new: true }
  );
};

const persistEmailResult = async ({ transactionId, kind, result }) => {
  const sentField = kind === "receipt" ? "receiptEmailSentAt" : "adminEmailSentAt";
  const messageField = kind === "receipt" ? "receiptEmailMessageId" : "adminEmailMessageId";
  const errorField = kind === "receipt" ? "receiptEmailError" : "adminEmailError";
  const claimField = kind === "receipt" ? "receiptEmailClaimedAt" : "adminEmailClaimedAt";
  const statusField = kind === "receipt" ? "receiptEmailStatus" : "adminEmailStatus";
  const update = result?.sent
    ? {
        [sentField]: new Date(),
        [messageField]: String(result.messageId || "").slice(0, 200),
        [errorField]: "",
        [claimField]: null,
        [statusField]: "sent",
      }
    : {
        [errorField]: compactError(result?.error?.message || result?.reason || "Email was not sent"),
        [claimField]: null,
        [statusField]: "failed",
      };
  await PaymentTransaction.updateOne({ _id: transactionId }, { $set: update });
};

const deliverReceiptEmailOnce = async (transaction) => {
  const claimed = await claimEmailDelivery(transaction._id, "receipt");
  if (!claimed) return { sent: false, skipped: true, reason: "already_sent_or_in_progress" };

  try {
    const receiptPdf = await generatePaymentReceipt(claimed);
    logger.info(
      { transactionId: String(claimed._id), event: "receipt.generated" },
      "Payment receipt generated"
    );
    const result = await sendPaymentReceiptEmail({ transaction: claimed, receiptPdf });
    await persistEmailResult({ transactionId: claimed._id, kind: "receipt", result });
    return result;
  } catch (error) {
    await persistEmailResult({ transactionId: claimed._id, kind: "receipt", result: { sent: false, error } });
    throw error;
  }
};

const deliverAdminEmailOnce = async (transaction) => {
  const claimed = await claimEmailDelivery(transaction._id, "admin");
  if (!claimed) return { sent: false, skipped: true, reason: "already_sent_or_in_progress" };
  try {
    const result = await sendAdminPaymentEmail({ transaction: claimed });
    await persistEmailResult({ transactionId: claimed._id, kind: "admin", result });
    return result;
  } catch (error) {
    await persistEmailResult({ transactionId: claimed._id, kind: "admin", result: { sent: false, error } });
    throw error;
  }
};

const deliverEmailWithRetry = async ({ transaction, kind, deliver }) => {
  const maxAttempts = getPaymentEmailMaxAttempts();
  let lastResult = { sent: false, skipped: true, reason: "not_attempted" };

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      lastResult = { ...(await deliver(transaction)), attempt };
    } catch (error) {
      lastResult = { sent: false, skipped: false, reason: "delivery_error", error, attempt };
    }

    const safeError = lastResult.error || {};
    const classification = lastResult.skipped
      ? null
      : safeError.category
        ? safeError
        : classifySmtpError(safeError);
    const logContext = {
      transactionId: String(transaction._id),
      emailKind: kind,
      attempt,
      event: lastResult.sent
        ? `email.${kind === "receipt" ? "customer" : "admin"}.sent`
        : lastResult.skipped
          ? `email.${kind === "receipt" ? "customer" : "admin"}.skipped`
          : `email.${kind === "receipt" ? "customer" : "admin"}.failed`,
      messageId: lastResult.sent ? String(lastResult.messageId || "") : undefined,
      smtpCode: !lastResult.sent ? safeError.code : undefined,
      smtpCategory: !lastResult.sent && !lastResult.skipped ? classification?.category : undefined,
    };
    if (lastResult.sent) logger.info(logContext, "Payment email sent");
    else if (lastResult.skipped) logger.info(logContext, "Payment email skipped");
    else logger.warn(logContext, "Payment email attempt failed");

    if (lastResult.sent || lastResult.skipped || classification?.retryable === false) return lastResult;
    if (attempt < maxAttempts) {
      await delay(getPaymentEmailRetryBaseMs() * 2 ** (attempt - 1));
    }
  }

  logger.error(
    {
      transactionId: String(transaction._id),
      emailKind: kind,
      attempt: lastResult.attempt,
      error: compactError(lastResult.error || lastResult.reason),
    },
    "Payment email delivery exhausted retries"
  );
  return lastResult;
};

const runPaymentEmailWorkflow = async (transaction) => {
  await Promise.all([
    deliverEmailWithRetry({
      transaction,
      kind: "receipt",
      deliver: deliverReceiptEmailOnce,
    }),
    deliverEmailWithRetry({
      transaction,
      kind: "admin",
      deliver: deliverAdminEmailOnce,
    }),
  ]);
};

const schedulePaymentEmailWorkflow = (transaction) => {
  logger.info(
    { transactionId: String(transaction._id), event: "email.customer.queued" },
    "Payment customer email queued"
  );
  logger.info(
    { transactionId: String(transaction._id), event: "email.admin.queued" },
    "Payment admin email queued"
  );
  scheduleBackgroundTask({
    name: "payment-email-workflow",
    context: { transactionId: String(transaction._id) },
    task: () => runPaymentEmailWorkflow(transaction),
  });
};

const waitForPendingEmailJobs = async () => {
  await waitForBackgroundTasks();
};

const finalizeSuccessfulPayment = async ({ transaction, payment, source = "verification" }) => {
  const paymentId = String(payment?.id || transaction?.razorpayPaymentId || "").trim();
  if (!transaction?._id || !paymentId) throw new Error("Transaction and payment are required");
  if (transaction.status === "paid" && transaction.razorpayPaymentId && transaction.razorpayPaymentId !== paymentId) {
    const error = new Error("Transaction was finalized with a different payment");
    error.code = "PAYMENT_ALREADY_FINALIZED";
    throw error;
  }

  const now = new Date();
  const update = {
    status: "paid",
    razorpayPaymentId: paymentId,
    paidAt: transaction.paidAt || now,
    failureCode: "",
    failureReason: "",
  };
  if (source === "verification") update.verificationAcceptedAt = now;
  if (source === "webhook") update.webhookReceivedAt = now;

  let finalized = await PaymentTransaction.findOneAndUpdate(
    { _id: transaction._id, $or: [{ status: { $ne: "paid" } }, { razorpayPaymentId: paymentId }] },
    { $set: update },
    { new: true }
  );
  finalized = finalized || (await PaymentTransaction.findById(transaction._id));
  if (!finalized || finalized.status !== "paid" || finalized.razorpayPaymentId !== paymentId) {
    throw new Error("Unable to finalize payment safely");
  }

  finalized = await ensureReceiptIdentity(finalized);
  if (finalized.flowType === "service") {
    await ensureBooking(finalized);
  }
  await recordPaidActivity(finalized);

  logger.info(
    {
      transactionId: String(finalized._id),
      flowType: finalized.flowType,
      source,
      event: "payment.finalized",
    },
    "Payment finalized"
  );

  schedulePaymentEmailWorkflow(finalized);

  return PaymentTransaction.findById(finalized._id);
};

const reconcilePaymentEmails = async (transaction) => {
  if (!transaction?._id || transaction.status !== "paid") {
    const error = new Error("Only paid transactions can be reconciled");
    error.code = "PAYMENT_NOT_PAID";
    throw error;
  }
  const withReceipt = await ensureReceiptIdentity(transaction);
  return runPaymentEmailWorkflow(withReceipt);
};

module.exports = {
  buildReceiptNumber,
  deliverReceiptEmailOnce,
  finalizeSuccessfulPayment,
  reconcilePaymentEmails,
  recordPaidActivity,
  _test: {
    deliverAdminEmailOnce,
    deliverEmailWithRetry,
    claimEmailDelivery,
    runPaymentEmailWorkflow,
    waitForPendingEmailJobs,
  },
};
