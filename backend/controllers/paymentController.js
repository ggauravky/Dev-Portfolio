const Booking = require("../models/Booking");
const SupportPayment = require("../models/SupportPayment");
const { logger } = require("../utils/logger");
const {
  generateServiceConfirmationPdf,
  generateSupportReceiptPdf,
} = require("../utils/pdfGenerator");
const {
  generateServiceConfirmationImage,
  generateSupportReceiptImage,
} = require("../utils/receiptImage");
const {
  enqueuePaymentReconciliationJob,
  getPaymentQueueDiagnostics,
  isPaymentQueueReady,
  startPaymentQueueWorkers,
} = require("../queues/paymentQueue");
const {
  ensureFreshWebhookTimestamp,
  extractWebhookData,
  getCashfreeEnvironment,
  parseWebhookPayload,
  verifyWebhookSignature,
} = require("../services/payment/cashfreeGateway");
const {
  buildStatusData,
  buildWebhookEventKey,
  createServiceOrderAndDraft,
  createSupportOrderAndDraft,
  ensureUserOwnership,
  isMatchingEmail,
  listBookingsForUser,
  listSupportPaymentsForUser,
  normalizeEmail,
  reconcileOrder,
  registerWebhookEventIfNew,
  resolveTransactionForUser,
} = require("../services/payment/paymentLifecycleService");
const { logReceiptDownloadedActivity } = require("../services/payment/notificationService");

const PAYMENT_EMAIL_NOTIFICATIONS_ENABLED =
  String(process.env.PAYMENT_EMAIL_NOTIFICATIONS_ENABLED || "true").trim().toLowerCase() ===
  "true";

const PAYMENT_STATUS_ON_DEMAND_RECONCILIATION_ENABLED =
  String(process.env.PAYMENT_STATUS_ON_DEMAND_RECONCILIATION_ENABLED || "true")
    .trim()
    .toLowerCase() === "true";

const PAYMENT_STATUS_ON_DEMAND_RECONCILE_COOLDOWN_MS =
  Number.parseInt(process.env.PAYMENT_STATUS_ON_DEMAND_RECONCILE_COOLDOWN_MS, 10) || 4000;

const PAYMENT_ASYNC_VERIFY_DELAY_MS =
  Number.parseInt(process.env.PAYMENT_ASYNC_VERIFY_DELAY_MS, 10) || 1500;
const PAYMENT_ASYNC_RECON_MAX_ATTEMPTS =
  Number.parseInt(process.env.PAYMENT_ASYNC_RECON_MAX_ATTEMPTS, 10) || 6;
const PAYMENT_ASYNC_RECON_RETRY_BASE_MS =
  Number.parseInt(process.env.PAYMENT_ASYNC_RECON_RETRY_BASE_MS, 10) || 3000;
const PAYMENT_ASYNC_RECON_RETRY_MAX_MS =
  Number.parseInt(process.env.PAYMENT_ASYNC_RECON_RETRY_MAX_MS, 10) || 20000;

const PAYMENT_CONFIG_ERROR_CODE = "PAYMENT_CONFIG_MISSING";

const reconciliationJobsInFlight = new Set();
const paymentQueueLogger = logger.child({ component: "payment-queue" });
let isPaymentQueueRuntimeActive = false;

const normalizeText = (value, maxLength = 200) =>
  String(value || "")
    .trim()
    .slice(0, maxLength);

const isDatabaseReady = () => Number(Booking?.db?.readyState || 0) === 1;

const getAuthenticatedIdentity = (req) => {
  const userId = normalizeText(req.authUser?.id, 80);
  const email = normalizeEmail(req.authUser?.email);
  const displayName = normalizeText(req.authUser?.displayName || req.authUser?.name, 120) || "Customer";

  if (!userId || !email) {
    return null;
  }

  return {
    userId,
    email,
    displayName,
  };
};

const getRequestClientMeta = (req) => ({
  ipAddress:
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket?.remoteAddress || req.ip || "unknown",
  userAgent: req.headers["user-agent"] || "unknown",
});

const getWebhookRawBody = (req) => {
  if (typeof req.rawBody === "string") {
    return req.rawBody;
  }

  if (Buffer.isBuffer(req.rawBody)) {
    return req.rawBody.toString("utf8");
  }

  if (Buffer.isBuffer(req.body)) {
    return req.body.toString("utf8");
  }

  if (req.body && typeof req.body === "object") {
    try {
      return JSON.stringify(req.body);
    } catch {
      return "";
    }
  }

  return String(req.body || "");
};

const sanitizeFilename = (value, fallback) => {
  const fileName = normalizeText(value, 180)
    .replaceAll(/[^a-zA-Z0-9._-]/g, "-")
    .replaceAll(/-{2,}/g, "-")
    .replaceAll(/^-|-$/g, "");

  return fileName || fallback;
};

const sendBase64Attachment = ({ res, attachment, contentType, fallbackName }) => {
  const contentBase64 = String(attachment?.contentBase64 || attachment?.content || "").trim();
  if (!contentBase64) {
    return false;
  }

  const fileName = sanitizeFilename(attachment?.name, fallbackName);
  const fileBuffer = Buffer.from(contentBase64, "base64");

  res.status(200);
  res.setHeader("Content-Type", contentType);
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
  res.send(fileBuffer);

  return true;
};

const mapPaymentError = (error, fallbackMessage) => {
  if (error?.code === PAYMENT_CONFIG_ERROR_CODE) {
    return {
      status: 503,
      message:
        "Payment service is not configured. Set CASHFREE_APP_ID and CASHFREE_SECRET_KEY on backend.",
      logLevel: "warn",
      retryable: false,
    };
  }

  if (error?.code === "PAYMENT_FETCH_UNAVAILABLE") {
    return {
      status: 503,
      message: "Payment runtime is not ready. Upgrade backend Node runtime to 18+.",
      logLevel: "error",
      retryable: false,
    };
  }

  if (error?.code === "ORDER_ID_MISSING") {
    return {
      status: 400,
      message: "Order ID is required",
      logLevel: "warn",
      retryable: false,
    };
  }

  if (error?.code === "SERVICE_INVALID") {
    return {
      status: 400,
      message: "Selected service is invalid",
      logLevel: "warn",
      retryable: false,
    };
  }

  if (error?.code === "SUPPORT_AMOUNT_INVALID") {
    return {
      status: 400,
      message: "Amount must be between INR 1 and INR 100000",
      logLevel: "warn",
      retryable: false,
    };
  }

  if (error?.name === "AbortError") {
    return {
      status: 504,
      message: "Payment gateway timed out. Please retry in a moment.",
      logLevel: "warn",
      retryable: true,
    };
  }

  const message = normalizeText(error?.message, 300);
  if (/fetch failed|network|socket|econn|enotfound|etimedout/i.test(message)) {
    return {
      status: 502,
      message: "Payment gateway network is temporarily unavailable. Please retry shortly.",
      logLevel: "error",
      retryable: true,
    };
  }

  if (error?.name === "ValidationError") {
    const validationMessage = Object.values(error.errors || {})[0]?.message;
    return {
      status: 400,
      message: normalizeText(validationMessage, 220) || "Payment payload is invalid",
      logLevel: "warn",
      retryable: false,
    };
  }

  if (Number(error?.code) === 11000) {
    return {
      status: 409,
      message: "A payment record conflict occurred. Please retry once with the same order details.",
      logLevel: "warn",
      retryable: true,
    };
  }

  const gatewayStatus = Number(error?.statusCode || error?.response?.status || 0);
  if (gatewayStatus === 404) {
    return {
      status: 404,
      message: "Payment order was not found on gateway",
      logLevel: "warn",
      retryable: false,
    };
  }

  if (gatewayStatus === 401 || gatewayStatus === 403) {
    return {
      status: 502,
      message: "Payment gateway authentication failed. Verify Cashfree keys for the selected mode.",
      logLevel: "error",
      retryable: false,
    };
  }

  if (gatewayStatus === 429) {
    return {
      status: 503,
      message: "Payment gateway is rate-limiting requests. Please retry shortly.",
      logLevel: "warn",
      retryable: true,
    };
  }

  if (gatewayStatus >= 400 && gatewayStatus < 500) {
    return {
      status: 400,
      message: "Payment request was rejected by gateway",
      logLevel: "warn",
      retryable: false,
    };
  }

  if (gatewayStatus >= 500) {
    return {
      status: 502,
      message: "Payment gateway is unavailable right now. Please try again shortly.",
      logLevel: "error",
      retryable: true,
    };
  }

  return {
    status: 500,
    message: fallbackMessage,
    logLevel: "error",
    retryable: false,
  };
};

const getReconciliationRetryDelayMs = (attemptNumber) => {
  const normalizedAttempt = Number.parseInt(attemptNumber, 10) || 1;

  if (normalizedAttempt <= 1) {
    return Math.max(500, PAYMENT_ASYNC_VERIFY_DELAY_MS);
  }

  const exponentialDelay =
    PAYMENT_ASYNC_RECON_RETRY_BASE_MS * 2 ** Math.max(0, normalizedAttempt - 2);

  return Math.max(1200, Math.min(exponentialDelay, PAYMENT_ASYNC_RECON_RETRY_MAX_MS));
};

const shouldRetryAsyncReconciliation = ({ shouldRetry, attemptNumber }) =>
  Boolean(shouldRetry) && Number.parseInt(attemptNumber, 10) < PAYMENT_ASYNC_RECON_MAX_ATTEMPTS;

const getOwnedOrderContext = async ({ orderId, authIdentity }) => {
  const normalizedOrderId = normalizeText(orderId, 120);

  const [booking, supportPayment] = await Promise.all([
    Booking.findOne({ orderId: normalizedOrderId }),
    SupportPayment.findOne({ orderId: normalizedOrderId }),
  ]);

  const serviceOwned = booking ? ensureUserOwnership({ record: booking, authIdentity }) : false;
  const supportOwned = supportPayment
    ? ensureUserOwnership({ record: supportPayment, authIdentity })
    : false;

  if (serviceOwned && supportOwned) {
    const serviceTime = new Date(booking.updatedAt || booking.createdAt || 0).getTime();
    const supportTime = new Date(supportPayment.updatedAt || supportPayment.createdAt || 0).getTime();

    return serviceTime >= supportTime
      ? { kind: "service", record: booking, forbidden: false, exists: true }
      : { kind: "support", record: supportPayment, forbidden: false, exists: true };
  }

  if (serviceOwned) {
    return { kind: "service", record: booking, forbidden: false, exists: true };
  }

  if (supportOwned) {
    return { kind: "support", record: supportPayment, forbidden: false, exists: true };
  }

  if (booking || supportPayment) {
    return { kind: "", record: null, forbidden: true, exists: true };
  }

  return { kind: "", record: null, forbidden: false, exists: false };
};

const buildDetailedStatus = ({ kind, record }) => {
  const base = buildStatusData({ kind, record });

  if (kind === "support") {
    return {
      ...base,
      supportPaymentId: normalizeText(record?._id, 80),
      contributorName: normalizeText(record?.contributorName, 120),
      email: normalizeEmail(record?.email),
      message: normalizeText(record?.message, 300),
      transactionId: base.paymentId || base.orderId,
    };
  }

  return {
    ...base,
    bookingId: normalizeText(record?._id, 80),
    name: normalizeText(record?.name, 120),
    email: normalizeEmail(record?.email),
    service: normalizeText(record?.service, 120),
    serviceSlug: normalizeText(record?.serviceSlug, 80),
    preferredDate: record?.preferredDate || null,
    preferredTime: normalizeText(record?.preferredTime, 20),
    projectBrief: normalizeText(record?.projectBrief, 1200),
    transactionId: base.paymentId || base.orderId,
  };
};

const isResolvedStatus = (statusData) => {
  const verificationState = normalizeText(statusData?.verificationStatus, 40).toLowerCase();
  return verificationState === "complete" || verificationState === "failed";
};

const shouldAttemptOnDemandReconciliation = (record) => {
  if (!PAYMENT_STATUS_ON_DEMAND_RECONCILIATION_ENABLED || !record) {
    return false;
  }

  const paymentStatus = normalizeText(record.paymentStatus, 40).toLowerCase();
  const reconciliationStatus = normalizeText(record.reconciliationStatus, 40).toLowerCase();

  if (["paid", "failed"].includes(paymentStatus) || ["paid", "failed"].includes(reconciliationStatus)) {
    return false;
  }

  const lastReconciliationAtMs = new Date(record.lastReconciliationAt || 0).getTime();
  if (
    Number.isFinite(lastReconciliationAtMs) &&
    lastReconciliationAtMs > 0 &&
    Date.now() - lastReconciliationAtMs < PAYMENT_STATUS_ON_DEMAND_RECONCILE_COOLDOWN_MS
  ) {
    return false;
  }

  return true;
};

const markReconciliationQueued = async ({ kindHint, orderId, source }) => {
  const normalizedOrderId = normalizeText(orderId, 120);
  if (!normalizedOrderId) {
    return;
  }

  const now = new Date();
  const metadata = {
    reconciliationStatus: "queued",
    lastReconciliationAt: now,
    lastReconciliationError: "",
  };

  if (source === "verify") {
    metadata.verificationAcceptedAt = now;
  }

  if (source === "webhook") {
    metadata.webhookReceivedAt = now;
  }

  const updates = [];

  if (!kindHint || kindHint === "service") {
    updates.push(Booking.updateOne({ orderId: normalizedOrderId }, { $set: metadata }));
  }

  if (!kindHint || kindHint === "support") {
    updates.push(SupportPayment.updateOne({ orderId: normalizedOrderId }, { $set: metadata }));
  }

  if (updates.length) {
    await Promise.allSettled(updates);
  }
};

const executeReconciliationAttempt = async ({
  kindHint,
  orderId,
  attemptNumber,
  source,
  reqLogger,
}) => {
  const effectiveLogger = reqLogger || logger;

  try {
    const outcome = await reconcileOrder({
      orderId,
      kindHint,
      source,
      reqLogger: effectiveLogger,
    });

    return {
      success: true,
      shouldRetry: Boolean(outcome?.shouldRetry),
      outcome,
    };
  } catch (error) {
    const mapped = mapPaymentError(error, "Unable to reconcile payment right now");

    effectiveLogger[mapped.logLevel](
      {
        err: error,
        orderId,
        kindHint,
        attemptNumber,
        source,
      },
      "Async payment reconciliation attempt failed"
    );

    return {
      success: false,
      shouldRetry: mapped.retryable,
      error,
      mapped,
    };
  }
};

const scheduleAsyncReconciliationInProcess = ({
  kindHint,
  orderId,
  attemptNumber,
  source,
  reqLogger,
}) => {
  const normalizedOrderId = normalizeText(orderId, 120);
  const normalizedAttempt = Number.parseInt(attemptNumber, 10) || 1;

  if (!normalizedOrderId || normalizedAttempt > PAYMENT_ASYNC_RECON_MAX_ATTEMPTS) {
    return false;
  }

  const key = `${kindHint || "auto"}:${normalizedOrderId}`;
  if (reconciliationJobsInFlight.has(key)) {
    return false;
  }

  reconciliationJobsInFlight.add(key);
  const delayMs = getReconciliationRetryDelayMs(normalizedAttempt);

  setTimeout(() => {
    void executeReconciliationAttempt({
      kindHint,
      orderId: normalizedOrderId,
      attemptNumber: normalizedAttempt,
      source,
      reqLogger,
    })
      .then((result) => {
        if (
          shouldRetryAsyncReconciliation({
            shouldRetry: result.shouldRetry,
            attemptNumber: normalizedAttempt,
          })
        ) {
          scheduleAsyncReconciliation({
            kindHint,
            orderId: normalizedOrderId,
            attemptNumber: normalizedAttempt + 1,
            source,
            reqLogger,
          });
        }
      })
      .finally(() => {
        reconciliationJobsInFlight.delete(key);
      });
  }, delayMs);

  return true;
};

const scheduleAsyncReconciliation = ({
  kindHint,
  orderId,
  attemptNumber = 1,
  source = "async",
  reqLogger,
}) => {
  const normalizedOrderId = normalizeText(orderId, 120);
  const normalizedAttempt = Number.parseInt(attemptNumber, 10) || 1;

  if (!normalizedOrderId || normalizedAttempt > PAYMENT_ASYNC_RECON_MAX_ATTEMPTS) {
    return false;
  }

  if (!isPaymentQueueReady() || !isPaymentQueueRuntimeActive) {
    return scheduleAsyncReconciliationInProcess({
      kindHint,
      orderId: normalizedOrderId,
      attemptNumber: normalizedAttempt,
      source,
      reqLogger,
    });
  }

  const queueType = normalizeText(kindHint, 20).toLowerCase() || "auto";
  const delayMs = getReconciliationRetryDelayMs(normalizedAttempt);
  const effectiveLogger = reqLogger || logger;

  void enqueuePaymentReconciliationJob({
    type: queueType,
    normalizedOrderId,
    emailDispatchQueued: PAYMENT_EMAIL_NOTIFICATIONS_ENABLED,
    attemptNumber: normalizedAttempt,
    delayMs,
  })
    .then((queued) => {
      if (!queued) {
        scheduleAsyncReconciliationInProcess({
          kindHint,
          orderId: normalizedOrderId,
          attemptNumber: normalizedAttempt,
          source,
          reqLogger: effectiveLogger,
        });
      }
    })
    .catch((error) => {
      effectiveLogger.warn(
        {
          err: error,
          orderId: normalizedOrderId,
          kindHint,
          attemptNumber: normalizedAttempt,
        },
        "Failed to enqueue reconciliation job, falling back to in-process scheduler"
      );

      scheduleAsyncReconciliationInProcess({
        kindHint,
        orderId: normalizedOrderId,
        attemptNumber: normalizedAttempt,
        source,
        reqLogger: effectiveLogger,
      });
    });

  return true;
};

const processPaymentQueueReconciliationJob = async ({
  type,
  normalizedOrderId,
  attemptNumber,
}) => {
  const kindHint = normalizeText(type, 20).toLowerCase();
  const normalizedKindHint = ["service", "support"].includes(kindHint) ? kindHint : "";
  const normalizedAttempt = Number.parseInt(attemptNumber, 10) || 1;

  const result = await executeReconciliationAttempt({
    kindHint: normalizedKindHint,
    orderId: normalizedOrderId,
    attemptNumber: normalizedAttempt,
    source: "queue",
    reqLogger: paymentQueueLogger,
  });

  if (
    shouldRetryAsyncReconciliation({
      shouldRetry: result.shouldRetry,
      attemptNumber: normalizedAttempt,
    })
  ) {
    scheduleAsyncReconciliation({
      kindHint: normalizedKindHint,
      orderId: normalizedOrderId,
      attemptNumber: normalizedAttempt + 1,
      source: "queue",
      reqLogger: paymentQueueLogger,
    });
  }
};

if (isPaymentQueueReady()) {
  try {
    isPaymentQueueRuntimeActive = Boolean(
      startPaymentQueueWorkers({
        processReconciliationJob: processPaymentQueueReconciliationJob,
      })
    );
  } catch (error) {
    isPaymentQueueRuntimeActive = false;
    paymentQueueLogger.error(
      {
        err: error,
      },
      "Failed to start payment queue worker"
    );
  }
}

exports.getPaymentQueueAdminStatus = async (req, res) => {
  const reqLogger = req.log || logger;
  const failedSampleLimit = Number.parseInt(req.query?.failedSampleLimit, 10) || 5;

  try {
    const queueStatus = await getPaymentQueueDiagnostics({ failedSampleLimit });
    return res.status(200).json({
      success: true,
      data: queueStatus,
    });
  } catch (error) {
    reqLogger.error(
      {
        err: error,
      },
      "Failed to fetch payment queue diagnostics"
    );

    return res.status(500).json({
      success: false,
      message: "Unable to fetch payment queue status",
    });
  }
};

exports.createOrder = async (req, res) => {
  const reqLogger = req.log || logger;

  if (!isDatabaseReady()) {
    return res.status(503).json({
      success: false,
      message: "Database is temporarily unavailable. Please retry in a moment.",
    });
  }

  const authIdentity = getAuthenticatedIdentity(req);
  if (!authIdentity) {
    return res.status(401).json({
      success: false,
      message: "Please sign in with Google before booking a service.",
    });
  }

  const providedEmail = normalizeEmail(req.body?.email);
  if (providedEmail && !isMatchingEmail(providedEmail, authIdentity.email)) {
    return res.status(403).json({
      success: false,
      message: "Booking email must match your signed-in Google account.",
    });
  }

  try {
    const { order, orderId, amount, serviceTitle } = await createServiceOrderAndDraft({
      authIdentity,
      payload: req.body,
      requestMeta: getRequestClientMeta(req),
    });

    const paymentSessionId = normalizeText(order?.payment_session_id || order?.paymentSessionId, 300);

    return res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: {
        orderId,
        amount,
        currency: "INR",
        paymentSessionId,
        environment: getCashfreeEnvironment(),
        serviceTitle,
      },
    });
  } catch (error) {
    const mapped = mapPaymentError(error, "Unable to create payment order");

    reqLogger[mapped.logLevel](
      {
        err: error,
        userId: authIdentity.userId,
      },
      "Create order failed"
    );

    return res.status(mapped.status).json({
      success: false,
      message: mapped.message,
    });
  }
};

exports.createSupportOrder = async (req, res) => {
  const reqLogger = req.log || logger;

  if (!isDatabaseReady()) {
    return res.status(503).json({
      success: false,
      message: "Database is temporarily unavailable. Please retry in a moment.",
    });
  }

  const authIdentity = getAuthenticatedIdentity(req);
  if (!authIdentity) {
    return res.status(401).json({
      success: false,
      message: "Please sign in with Google before starting support payment.",
    });
  }

  const providedEmail = normalizeEmail(req.body?.email);
  if (providedEmail && !isMatchingEmail(providedEmail, authIdentity.email)) {
    return res.status(403).json({
      success: false,
      message: "Support payment email must match your signed-in Google account.",
    });
  }

  try {
    const { order, orderId, amount } = await createSupportOrderAndDraft({
      authIdentity,
      payload: req.body,
      requestMeta: getRequestClientMeta(req),
    });

    const paymentSessionId = normalizeText(order?.payment_session_id || order?.paymentSessionId, 300);

    return res.status(201).json({
      success: true,
      message: "Support order created successfully",
      data: {
        orderId,
        amount,
        currency: "INR",
        paymentSessionId,
        environment: getCashfreeEnvironment(),
      },
    });
  } catch (error) {
    const mapped = mapPaymentError(error, "Unable to create support payment order");

    reqLogger[mapped.logLevel](
      {
        err: error,
        userId: authIdentity.userId,
      },
      "Create support order failed"
    );

    return res.status(mapped.status).json({
      success: false,
      message: mapped.message,
    });
  }
};

const validateVerifyContext = ({ req, res, authMessage, emailMismatchMessage }) => {
  const authIdentity = getAuthenticatedIdentity(req);
  if (!authIdentity) {
    res.status(401).json({
      success: false,
      message: authMessage,
    });
    return null;
  }

  const orderId = normalizeText(req.body?.orderId, 120);
  if (!orderId) {
    res.status(400).json({
      success: false,
      message: "Order ID is required",
    });
    return null;
  }

  const providedEmail = normalizeEmail(req.body?.email);
  if (providedEmail && !isMatchingEmail(providedEmail, authIdentity.email)) {
    res.status(403).json({
      success: false,
      message: emailMismatchMessage,
    });
    return null;
  }

  return {
    authIdentity,
    orderId,
  };
};

const respondPendingVerification = ({ res, statusData, message }) =>
  res.status(202).json({
    success: true,
    message,
    data: statusData,
  });

const respondFailedVerification = ({ res, message }) =>
  res.status(409).json({
    success: false,
    message,
  });

exports.verifyPayment = async (req, res) => {
  const reqLogger = req.log || logger;

  if (!isDatabaseReady()) {
    return res.status(503).json({
      success: false,
      message: "Database is temporarily unavailable. Please retry in a moment.",
    });
  }

  const context = validateVerifyContext({
    req,
    res,
    authMessage: "Please sign in with Google before verifying payment.",
    emailMismatchMessage: "Verification email must match your signed-in Google account.",
  });

  if (!context) {
    return;
  }

  const { authIdentity, orderId } = context;

  try {
    const ownership = await getOwnedOrderContext({ orderId, authIdentity });

    if (ownership.forbidden) {
      return res.status(403).json({
        success: false,
        message: "This booking belongs to a different signed-in account.",
      });
    }

    if (ownership.kind === "support") {
      return res.status(400).json({
        success: false,
        message: "This order belongs to support payment flow.",
      });
    }

    await markReconciliationQueued({
      kindHint: "service",
      orderId,
      source: "verify",
    });

    const reconciliationResult = await reconcileOrder({
      orderId,
      kindHint: "service",
      source: "verify",
      reqLogger,
    });

    if (!ensureUserOwnership({ record: reconciliationResult.record, authIdentity })) {
      return res.status(403).json({
        success: false,
        message: "This booking belongs to a different signed-in account.",
      });
    }

    const statusData = buildDetailedStatus({
      kind: reconciliationResult.kind,
      record: reconciliationResult.record,
    });

    if (statusData.verificationStatus === "failed" || statusData.paymentStatus === "failed") {
      return respondFailedVerification({
        res,
        message: "Payment was not completed. No booking has been confirmed yet.",
      });
    }

    if (!isResolvedStatus(statusData)) {
      await markReconciliationQueued({
        kindHint: "service",
        orderId,
        source: "verify",
      });

      scheduleAsyncReconciliation({
        kindHint: "service",
        orderId,
        attemptNumber: 2,
        source: "verify",
        reqLogger,
      });

      return respondPendingVerification({
        res,
        statusData,
        message: "Payment verification queued. We are confirming this payment in the background.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Payment verified and booking confirmed",
      data: {
        bookingId: statusData.bookingId,
        service: statusData.service,
        amount: statusData.amount,
        orderId: statusData.orderId,
        paymentId: statusData.paymentId,
        verificationStatus: statusData.verificationStatus,
        reconciliationStatus: statusData.reconciliationStatus,
        receiptReady: statusData.receiptReady,
        emailDispatchQueued: PAYMENT_EMAIL_NOTIFICATIONS_ENABLED,
      },
    });
  } catch (error) {
    const mapped = mapPaymentError(error, "Payment verification failed");

    reqLogger[mapped.logLevel](
      {
        err: error,
        orderId,
        userId: authIdentity.userId,
      },
      "Service verification failed"
    );

    if (mapped.retryable) {
      await markReconciliationQueued({
        kindHint: "service",
        orderId,
        source: "verify",
      });

      scheduleAsyncReconciliation({
        kindHint: "service",
        orderId,
        attemptNumber: 1,
        source: "verify",
        reqLogger,
      });

      return respondPendingVerification({
        res,
        statusData: {
          type: "service",
          orderId,
          paymentStatus: "pending",
          verificationStatus: "pending_gateway",
          reconciliationStatus: "queued",
          receiptReady: false,
          nextPollMs: PAYMENT_ASYNC_VERIFY_DELAY_MS,
        },
        message: "Payment is being finalized. Please retry in a few seconds.",
      });
    }

    return res.status(mapped.status).json({
      success: false,
      message: mapped.message,
    });
  }
};

exports.verifySupportPayment = async (req, res) => {
  const reqLogger = req.log || logger;

  if (!isDatabaseReady()) {
    return res.status(503).json({
      success: false,
      message: "Database is temporarily unavailable. Please retry in a moment.",
    });
  }

  const context = validateVerifyContext({
    req,
    res,
    authMessage: "Please sign in with Google before verifying support payment.",
    emailMismatchMessage: "Verification email must match your signed-in Google account.",
  });

  if (!context) {
    return;
  }

  const { authIdentity, orderId } = context;

  try {
    const ownership = await getOwnedOrderContext({ orderId, authIdentity });

    if (ownership.forbidden) {
      return res.status(403).json({
        success: false,
        message: "This support payment belongs to a different signed-in account.",
      });
    }

    if (ownership.kind === "service") {
      return res.status(400).json({
        success: false,
        message: "This order belongs to service booking flow.",
      });
    }

    await markReconciliationQueued({
      kindHint: "support",
      orderId,
      source: "verify",
    });

    const reconciliationResult = await reconcileOrder({
      orderId,
      kindHint: "support",
      source: "verify",
      reqLogger,
    });

    if (!ensureUserOwnership({ record: reconciliationResult.record, authIdentity })) {
      return res.status(403).json({
        success: false,
        message: "This support payment belongs to a different signed-in account.",
      });
    }

    const statusData = buildDetailedStatus({
      kind: reconciliationResult.kind,
      record: reconciliationResult.record,
    });

    if (statusData.verificationStatus === "failed" || statusData.paymentStatus === "failed") {
      return respondFailedVerification({
        res,
        message: "Payment was not completed. No support amount has been confirmed.",
      });
    }

    if (!isResolvedStatus(statusData)) {
      await markReconciliationQueued({
        kindHint: "support",
        orderId,
        source: "verify",
      });

      scheduleAsyncReconciliation({
        kindHint: "support",
        orderId,
        attemptNumber: 2,
        source: "verify",
        reqLogger,
      });

      return respondPendingVerification({
        res,
        statusData,
        message:
          "Support payment verification queued. We are confirming this payment in the background.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Support payment verified successfully",
      data: {
        orderId: statusData.orderId,
        amount: statusData.amount,
        contributorName: statusData.contributorName,
        paymentId: statusData.paymentId,
        verificationStatus: statusData.verificationStatus,
        reconciliationStatus: statusData.reconciliationStatus,
        receiptReady: statusData.receiptReady,
        emailDispatchQueued: PAYMENT_EMAIL_NOTIFICATIONS_ENABLED,
      },
    });
  } catch (error) {
    const mapped = mapPaymentError(error, "Support payment verification failed");

    reqLogger[mapped.logLevel](
      {
        err: error,
        orderId,
        userId: authIdentity.userId,
      },
      "Support verification failed"
    );

    if (mapped.retryable) {
      await markReconciliationQueued({
        kindHint: "support",
        orderId,
        source: "verify",
      });

      scheduleAsyncReconciliation({
        kindHint: "support",
        orderId,
        attemptNumber: 1,
        source: "verify",
        reqLogger,
      });

      return respondPendingVerification({
        res,
        statusData: {
          type: "support",
          orderId,
          paymentStatus: "pending",
          verificationStatus: "pending_gateway",
          reconciliationStatus: "queued",
          receiptReady: false,
          nextPollMs: PAYMENT_ASYNC_VERIFY_DELAY_MS,
        },
        message: "Payment is being finalized. Please retry in a few seconds.",
      });
    }

    return res.status(mapped.status).json({
      success: false,
      message: mapped.message,
    });
  }
};

exports.handleCashfreeWebhook = async (req, res) => {
  const reqLogger = req.log || logger;

  if (!isDatabaseReady()) {
    return res.status(202).json({
      success: true,
      message: "Webhook acknowledged while database is unavailable.",
    });
  }

  const webhookSecret = normalizeText(process.env.CASHFREE_WEBHOOK_SECRET, 400);
  if (!webhookSecret) {
    reqLogger.error("Cashfree webhook secret is missing in environment configuration");
    return res.status(503).json({
      success: false,
      message: "Webhook secret is not configured on server",
    });
  }

  const rawBody = getWebhookRawBody(req);

  const timestampValidation = ensureFreshWebhookTimestamp(req.headers);
  const signatureHeader = normalizeText(
    req.headers?.["x-webhook-signature"] || req.headers?.["x-cf-signature"],
    500
  );
  if (!timestampValidation.ok) {
    const allowMissingTimestampFallback =
      timestampValidation.reason === "missing_or_invalid_timestamp" && Boolean(signatureHeader);

    if (allowMissingTimestampFallback) {
      reqLogger.warn(
        {
          reason: timestampValidation.reason,
        },
        "Webhook timestamp header missing or invalid; continuing with signature-only validation"
      );
    } else {
      return res.status(401).json({
        success: false,
        message: "Invalid webhook timestamp",
      });
    }
  }

  const signatureValidation = verifyWebhookSignature({
    headers: req.headers,
    rawBody,
  });

  if (!signatureValidation.ok) {
    reqLogger.warn(
      {
        reason: signatureValidation.reason,
      },
      "Rejected Cashfree webhook due to invalid signature"
    );

    return res.status(401).json({
      success: false,
      message: "Invalid webhook signature",
    });
  }

  const payload = parseWebhookPayload(rawBody, req.body);
  if (!payload) {
    return res.status(400).json({
      success: false,
      message: "Invalid webhook payload",
    });
  }

  const { orderId, paymentId, eventName } = extractWebhookData(payload);
  if (!orderId) {
    return res.status(202).json({
      success: true,
      message: "Webhook accepted without order identifier",
    });
  }

  const eventKey = buildWebhookEventKey({
    eventName,
    orderId,
    paymentId,
    rawBody,
  });

  try {
    const isNewEvent = await registerWebhookEventIfNew({
      eventKey,
      orderId,
      eventName,
      paymentId,
    });

    if (!isNewEvent) {
      return res.status(200).json({
        success: true,
        message: "Duplicate webhook ignored",
      });
    }
  } catch (dedupeError) {
    reqLogger.warn(
      {
        err: dedupeError,
        orderId,
        eventName,
      },
      "Webhook dedupe persistence failed, continuing"
    );
  }

  await markReconciliationQueued({
    kindHint: "",
    orderId,
    source: "webhook",
  });

  scheduleAsyncReconciliation({
    kindHint: "",
    orderId,
    attemptNumber: 1,
    source: "webhook",
    reqLogger,
  });

  return res.status(200).json({
    success: true,
    message: "Webhook accepted",
  });
};

const respondOwnershipForbidden = (res) =>
  res.status(403).json({
    success: false,
    message: "This payment belongs to a different signed-in account.",
  });

const resolveOwnedStatusRecord = async ({ orderId, authIdentity, reqLogger, res }) => {
  let ownership = await getOwnedOrderContext({ orderId, authIdentity });

  if (ownership.forbidden) {
    respondOwnershipForbidden(res);
    return null;
  }

  if (ownership.record) {
    return ownership;
  }

  try {
    await reconcileOrder({
      orderId,
      kindHint: "",
      source: "status",
      reqLogger,
    });
  } catch (error) {
    reqLogger.warn(
      {
        err: error,
        orderId,
      },
      "On-demand status reconciliation failed while resolving missing record"
    );
  }

  ownership = await getOwnedOrderContext({ orderId, authIdentity });

  if (ownership.forbidden) {
    respondOwnershipForbidden(res);
    return null;
  }

  if (!ownership.record) {
    res.status(404).json({
      success: false,
      message: "Payment record not found for this order",
    });
    return null;
  }

  return ownership;
};

const tryRefreshOwnedStatusRecord = async ({ ownership, orderId, authIdentity, reqLogger }) => {
  if (!ownership?.record || !shouldAttemptOnDemandReconciliation(ownership.record)) {
    return ownership;
  }

  try {
    const result = await reconcileOrder({
      orderId,
      kindHint: ownership.kind,
      source: "status",
      reqLogger,
    });

    if (ensureUserOwnership({ record: result.record, authIdentity })) {
      return {
        kind: result.kind,
        record: result.record,
        forbidden: false,
        exists: true,
      };
    }

    return ownership;
  } catch (error) {
    reqLogger.warn(
      {
        err: error,
        orderId,
        type: ownership.kind,
      },
      "On-demand status reconciliation failed"
    );

    return ownership;
  }
};

exports.getPaymentStatus = async (req, res) => {
  const reqLogger = req.log || logger;

  if (!isDatabaseReady()) {
    return res.status(503).json({
      success: false,
      message: "Database is temporarily unavailable. Please retry in a moment.",
    });
  }

  const authIdentity = getAuthenticatedIdentity(req);
  if (!authIdentity) {
    return res.status(401).json({
      success: false,
      message: "Please sign in first",
    });
  }

  const orderId = normalizeText(req.params?.orderId, 120);
  const providedEmail = normalizeEmail(req.query?.email);

  if (providedEmail && !isMatchingEmail(providedEmail, authIdentity.email)) {
    return res.status(403).json({
      success: false,
      message: "Status email must match your signed-in Google account.",
    });
  }

  try {
    const resolvedOwnership = await resolveOwnedStatusRecord({
      orderId,
      authIdentity,
      reqLogger,
      res,
    });

    if (!resolvedOwnership) {
      return;
    }

    const ownership = await tryRefreshOwnedStatusRecord({
      ownership: resolvedOwnership,
      orderId,
      authIdentity,
      reqLogger,
    });

    const statusData = buildDetailedStatus({
      kind: ownership.kind,
      record: ownership.record,
    });

    if (!isResolvedStatus(statusData)) {
      await markReconciliationQueued({
        kindHint: ownership.kind,
        orderId,
        source: "status",
      });

      scheduleAsyncReconciliation({
        kindHint: ownership.kind,
        orderId,
        attemptNumber: 1,
        source: "status",
        reqLogger,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Payment status fetched successfully",
      data: statusData,
    });
  } catch (error) {
    reqLogger.error(
      {
        err: error,
        orderId,
        userId: authIdentity.userId,
      },
      "Failed to fetch payment status"
    );

    return res.status(500).json({
      success: false,
      message: "Unable to fetch payment status right now",
    });
  }
};

exports.getTransactionStatus = async (req, res) => {
  const reqLogger = req.log || logger;

  if (!isDatabaseReady()) {
    return res.status(503).json({
      success: false,
      message: "Database is temporarily unavailable. Please retry in a moment.",
    });
  }

  const authIdentity = getAuthenticatedIdentity(req);
  if (!authIdentity) {
    return res.status(401).json({
      success: false,
      message: "Please sign in first",
    });
  }

  const transactionId = normalizeText(req.params?.transactionId, 120);
  if (!transactionId) {
    return res.status(400).json({
      success: false,
      message: "Transaction ID is required",
    });
  }

  try {
    let resolved = await resolveTransactionForUser({
      transactionId,
      authIdentity,
    });

    if (!resolved) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found for your account",
      });
    }

    if (shouldAttemptOnDemandReconciliation(resolved.record)) {
      try {
        await reconcileOrder({
          orderId: resolved.record.orderId,
          kindHint: resolved.kind,
          source: "transaction_lookup",
          reqLogger,
        });
      } catch (error) {
        reqLogger.warn(
          {
            err: error,
            transactionId,
            orderId: resolved.record.orderId,
          },
          "On-demand transaction reconciliation failed"
        );
      }

      const refreshed = await resolveTransactionForUser({
        transactionId,
        authIdentity,
      });

      if (refreshed) {
        resolved = refreshed;
      }
    }

    const statusData = buildDetailedStatus({
      kind: resolved.kind,
      record: resolved.record,
    });

    if (!isResolvedStatus(statusData)) {
      await markReconciliationQueued({
        kindHint: resolved.kind,
        orderId: resolved.record.orderId,
        source: "transaction_lookup",
      });

      scheduleAsyncReconciliation({
        kindHint: resolved.kind,
        orderId: resolved.record.orderId,
        attemptNumber: 1,
        source: "transaction_lookup",
        reqLogger,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Transaction status fetched successfully",
      data: {
        ...statusData,
        transactionId,
      },
    });
  } catch (error) {
    reqLogger.error(
      {
        err: error,
        transactionId,
        userId: authIdentity.userId,
      },
      "Failed to fetch transaction status"
    );

    return res.status(500).json({
      success: false,
      message: "Unable to fetch transaction status right now",
    });
  }
};

exports.getMyBookings = async (req, res) => {
  const reqLogger = req.log || logger;

  if (!isDatabaseReady()) {
    return res.status(503).json({
      success: false,
      message: "Database is temporarily unavailable. Please retry in a moment.",
    });
  }

  const authIdentity = getAuthenticatedIdentity(req);
  if (!authIdentity) {
    return res.status(401).json({
      success: false,
      message: "Please sign in first",
    });
  }

  try {
    const bookings = await listBookingsForUser({ authIdentity });

    return res.status(200).json({
      success: true,
      message: "Bookings fetched successfully",
      data: {
        items: (bookings || []).map((booking) => ({
          id: normalizeText(booking?._id, 80),
          orderId: normalizeText(booking?.orderId, 120),
          paymentId: normalizeText(booking?.paymentId, 120),
          paymentStatus: normalizeText(booking?.paymentStatus, 40).toLowerCase(),
          paymentProvider: normalizeText(booking?.paymentProvider, 40).toLowerCase(),
          service: normalizeText(booking?.service, 120),
          serviceSlug: normalizeText(booking?.serviceSlug, 80),
          amount: Number(booking?.amount || 0),
          preferredDate: booking?.preferredDate || null,
          preferredTime: normalizeText(booking?.preferredTime, 20),
          paidAt: booking?.paidAt || null,
          createdAt: booking?.createdAt || null,
          updatedAt: booking?.updatedAt || null,
          verificationAcceptedAt: booking?.verificationAcceptedAt || null,
          reconciliationStatus: normalizeText(booking?.reconciliationStatus, 40).toLowerCase(),
          reconciliationAttempts: Number(booking?.reconciliationAttempts || 0),
          lastReconciliationAt: booking?.lastReconciliationAt || null,
          lastReconciliationError: normalizeText(booking?.lastReconciliationError, 200),
        })),
      },
    });
  } catch (error) {
    reqLogger.error(
      {
        err: error,
        userId: authIdentity.userId,
      },
      "Failed to fetch bookings"
    );

    return res.status(500).json({
      success: false,
      message: "Unable to load your booking activity right now.",
    });
  }
};

exports.getMySupportPayments = async (req, res) => {
  const reqLogger = req.log || logger;

  if (!isDatabaseReady()) {
    return res.status(503).json({
      success: false,
      message: "Database is temporarily unavailable. Please retry in a moment.",
    });
  }

  const authIdentity = getAuthenticatedIdentity(req);
  if (!authIdentity) {
    return res.status(401).json({
      success: false,
      message: "Please sign in first",
    });
  }

  try {
    const supportPayments = await listSupportPaymentsForUser({ authIdentity });

    return res.status(200).json({
      success: true,
      message: "Support payments fetched successfully",
      data: {
        items: (supportPayments || []).map((item) => ({
          id: normalizeText(item?._id, 80),
          orderId: normalizeText(item?.orderId, 120),
          paymentId: normalizeText(item?.paymentId, 120),
          paymentStatus: normalizeText(item?.paymentStatus, 40).toLowerCase(),
          paymentProvider: normalizeText(item?.paymentProvider, 40).toLowerCase(),
          contributorName: normalizeText(item?.contributorName, 120),
          amount: Number(item?.amount || 0),
          message: normalizeText(item?.message, 300),
          paidAt: item?.paidAt || null,
          createdAt: item?.createdAt || null,
          updatedAt: item?.updatedAt || null,
          verificationAcceptedAt: item?.verificationAcceptedAt || null,
          reconciliationStatus: normalizeText(item?.reconciliationStatus, 40).toLowerCase(),
          reconciliationAttempts: Number(item?.reconciliationAttempts || 0),
          lastReconciliationAt: item?.lastReconciliationAt || null,
          lastReconciliationError: normalizeText(item?.lastReconciliationError, 200),
        })),
      },
    });
  } catch (error) {
    reqLogger.error(
      {
        err: error,
        userId: authIdentity.userId,
      },
      "Failed to fetch support payments"
    );

    return res.status(500).json({
      success: false,
      message: "Unable to load your support activity right now.",
    });
  }
};

const validateReceiptContext = ({ req, res }) => {
  const authIdentity = getAuthenticatedIdentity(req);
  if (!authIdentity) {
    res.status(401).json({
      success: false,
      message: "Please sign in first",
    });
    return null;
  }

  const orderId = normalizeText(req.params?.orderId, 120);
  if (!orderId) {
    res.status(400).json({
      success: false,
      message: "Order ID is required",
    });
    return null;
  }

  const providedEmail = normalizeEmail(req.query?.email);
  if (providedEmail && !isMatchingEmail(providedEmail, authIdentity.email)) {
    res.status(403).json({
      success: false,
      message: "Receipt email must match your signed-in Google account.",
    });
    return null;
  }

  return {
    authIdentity,
    orderId,
  };
};

const resolveOwnedReceiptRecord = async ({ orderId, authIdentity, expectedKind, res }) => {
  const ownership = await getOwnedOrderContext({ orderId, authIdentity });

  if (ownership.forbidden) {
    res.status(403).json({
      success: false,
      message: "This payment belongs to a different signed-in account.",
    });
    return null;
  }

  if (!ownership.record) {
    res.status(404).json({
      success: false,
      message: "Payment record not found for this order",
    });
    return null;
  }

  if (ownership.kind !== expectedKind) {
    res.status(404).json({
      success: false,
      message: "Receipt not available for this order",
    });
    return null;
  }

  if (normalizeText(ownership.record.paymentStatus, 40).toLowerCase() !== "paid") {
    res.status(409).json({
      success: false,
      message: "Receipt is available after payment confirmation",
    });
    return null;
  }

  return ownership;
};

exports.downloadServiceReceipt = async (req, res) => {
  const reqLogger = req.log || logger;

  const context = validateReceiptContext({ req, res });
  if (!context) {
    return;
  }

  try {
    const ownership = await resolveOwnedReceiptRecord({
      orderId: context.orderId,
      authIdentity: context.authIdentity,
      expectedKind: "service",
      res,
    });

    if (!ownership) {
      return;
    }

    const attachment = await generateServiceConfirmationPdf({
      booking: ownership.record,
    });

    const sent = sendBase64Attachment({
      res,
      attachment,
      contentType: "application/pdf",
      fallbackName: `service-confirmation-${context.orderId}.pdf`,
    });

    if (!sent) {
      return res.status(500).json({
        success: false,
        message: "Unable to generate service confirmation PDF",
      });
    }

    logReceiptDownloadedActivity({
      kind: "service",
      record: ownership.record,
      metadata: {
        format: "pdf",
      },
    }).catch(() => {});
  } catch (error) {
    reqLogger.error(
      {
        err: error,
        orderId: context.orderId,
      },
      "Service receipt download failed"
    );

    return res.status(500).json({
      success: false,
      message: "Unable to download service confirmation PDF",
    });
  }
};

exports.downloadSupportReceipt = async (req, res) => {
  const reqLogger = req.log || logger;

  const context = validateReceiptContext({ req, res });
  if (!context) {
    return;
  }

  try {
    const ownership = await resolveOwnedReceiptRecord({
      orderId: context.orderId,
      authIdentity: context.authIdentity,
      expectedKind: "support",
      res,
    });

    if (!ownership) {
      return;
    }

    const attachment = await generateSupportReceiptPdf({
      supportPayment: ownership.record,
    });

    const sent = sendBase64Attachment({
      res,
      attachment,
      contentType: "application/pdf",
      fallbackName: `support-receipt-${context.orderId}.pdf`,
    });

    if (!sent) {
      return res.status(500).json({
        success: false,
        message: "Unable to generate support receipt PDF",
      });
    }

    logReceiptDownloadedActivity({
      kind: "support",
      record: ownership.record,
      metadata: {
        format: "pdf",
      },
    }).catch(() => {});
  } catch (error) {
    reqLogger.error(
      {
        err: error,
        orderId: context.orderId,
      },
      "Support receipt download failed"
    );

    return res.status(500).json({
      success: false,
      message: "Unable to download support receipt PDF",
    });
  }
};

exports.downloadServiceReceiptImage = async (req, res) => {
  const reqLogger = req.log || logger;

  const context = validateReceiptContext({ req, res });
  if (!context) {
    return;
  }

  try {
    const ownership = await resolveOwnedReceiptRecord({
      orderId: context.orderId,
      authIdentity: context.authIdentity,
      expectedKind: "service",
      res,
    });

    if (!ownership) {
      return;
    }

    const attachment = await generateServiceConfirmationImage({
      booking: ownership.record,
    });

    const sent = sendBase64Attachment({
      res,
      attachment,
      contentType: "image/svg+xml",
      fallbackName: `service-confirmation-${context.orderId}.svg`,
    });

    if (!sent) {
      return res.status(500).json({
        success: false,
        message: "Unable to generate service confirmation image",
      });
    }

    logReceiptDownloadedActivity({
      kind: "service",
      record: ownership.record,
      metadata: {
        format: "image",
      },
    }).catch(() => {});
  } catch (error) {
    reqLogger.error(
      {
        err: error,
        orderId: context.orderId,
      },
      "Service receipt image download failed"
    );

    return res.status(500).json({
      success: false,
      message: "Unable to download service confirmation image",
    });
  }
};

exports.downloadSupportReceiptImage = async (req, res) => {
  const reqLogger = req.log || logger;

  const context = validateReceiptContext({ req, res });
  if (!context) {
    return;
  }

  try {
    const ownership = await resolveOwnedReceiptRecord({
      orderId: context.orderId,
      authIdentity: context.authIdentity,
      expectedKind: "support",
      res,
    });

    if (!ownership) {
      return;
    }

    const attachment = await generateSupportReceiptImage({
      supportPayment: ownership.record,
    });

    const sent = sendBase64Attachment({
      res,
      attachment,
      contentType: "image/svg+xml",
      fallbackName: `support-receipt-${context.orderId}.svg`,
    });

    if (!sent) {
      return res.status(500).json({
        success: false,
        message: "Unable to generate support receipt image",
      });
    }

    logReceiptDownloadedActivity({
      kind: "support",
      record: ownership.record,
      metadata: {
        format: "image",
      },
    }).catch(() => {});
  } catch (error) {
    reqLogger.error(
      {
        err: error,
        orderId: context.orderId,
      },
      "Support receipt image download failed"
    );

    return res.status(500).json({
      success: false,
      message: "Unable to download support receipt image",
    });
  }
};
