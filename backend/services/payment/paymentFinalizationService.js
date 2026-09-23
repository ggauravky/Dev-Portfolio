const Booking = require("../../models/Booking");
const PaymentTransaction = require("../../models/PaymentTransaction");
const { recordActivityEvent } = require("../activityService");
const { sendAdminPaymentEmail, sendPaymentReceiptEmail } = require("../../utils/email");
const { generatePaymentReceipt } = require("../../utils/paymentReceipt");
const { logger } = require("../../utils/logger");

const EMAIL_CLAIM_TIMEOUT_MS = 5 * 60 * 1000;
const pendingEmailJobs = new Set();

const compactError = (error) => String(error?.message || error || "Unknown error").trim().slice(0, 200);
const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
const getPaymentEmailMaxAttempts = () =>
  Math.min(3, Math.max(1, Number.parseInt(process.env.PAYMENT_EMAIL_MAX_ATTEMPTS, 10) || 3));
const getPaymentEmailRetryBaseMs = () =>
  Math.max(0, Number.parseInt(process.env.PAYMENT_EMAIL_RETRY_BASE_MS, 10) || 1000);

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

  return PaymentTransaction.findOneAndUpdate(
    {
      _id: transactionId,
      [sentField]: null,
      $or: [{ [claimField]: null }, { [claimField]: { $lt: staleBefore } }],
    },
    { $set: { [claimField]: now, [attemptField]: now } },
    { new: true }
  );
};

const persistEmailResult = async ({ transactionId, kind, result }) => {
  const sentField = kind === "receipt" ? "receiptEmailSentAt" : "adminEmailSentAt";
  const messageField = kind === "receipt" ? "receiptEmailMessageId" : "adminEmailMessageId";
  const errorField = kind === "receipt" ? "receiptEmailError" : "adminEmailError";
  const claimField = kind === "receipt" ? "receiptEmailClaimedAt" : "adminEmailClaimedAt";
  const update = result?.sent
    ? { [sentField]: new Date(), [messageField]: String(result.messageId || "").slice(0, 200), [errorField]: "", [claimField]: null }
    : { [errorField]: compactError(result?.error?.message || result?.reason || "Email was not sent"), [claimField]: null };
  await PaymentTransaction.updateOne({ _id: transactionId }, { $set: update });
};

const deliverReceiptEmailOnce = async (transaction) => {
  const claimed = await claimEmailDelivery(transaction._id, "receipt");
  if (!claimed) return { sent: false, skipped: true, reason: "already_sent_or_in_progress" };

  try {
    const receiptPdf = await generatePaymentReceipt(claimed);
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

    if (lastResult.sent || lastResult.skipped) return lastResult;
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
  let job;
  job = new Promise((resolve) => setImmediate(resolve))
    .then(() => runPaymentEmailWorkflow(transaction))
    .catch((error) => {
      logger.error(
        { transactionId: String(transaction._id), error: compactError(error) },
        "Payment email workflow failed"
      );
    })
    .finally(() => pendingEmailJobs.delete(job));
  pendingEmailJobs.add(job);
};

const waitForPendingEmailJobs = async () => {
  await Promise.all([...pendingEmailJobs]);
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

  schedulePaymentEmailWorkflow(finalized);

  return PaymentTransaction.findById(finalized._id);
};

module.exports = {
  buildReceiptNumber,
  deliverReceiptEmailOnce,
  finalizeSuccessfulPayment,
  recordPaidActivity,
  _test: {
    deliverAdminEmailOnce,
    deliverEmailWithRetry,
    runPaymentEmailWorkflow,
    waitForPendingEmailJobs,
  },
};
