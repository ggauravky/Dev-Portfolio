// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Unauthorized copying, modification, or distribution of this software,
// via any medium, is strictly prohibited without the express written
// consent of the author. See LICENSE for details.
// Source: https://github.com/ggauravky/Dev-Portfolio

const { createHmac, randomBytes, randomUUID, timingSafeEqual } = require("node:crypto");
const Booking = require("../models/Booking");
const SupportPayment = require("../models/SupportPayment");
const PaymentWebhookEvent = require("../models/PaymentWebhookEvent");
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
  isPaymentQueueReady,
  enqueuePaymentReconciliationJob,
  startPaymentQueueWorkers,
  getPaymentQueueDiagnostics,
} = require("../queues/paymentQueue");

const SERVICE_CATALOG = {
  mentorship: { title: "Mentorship", amount: 49 },
  "resume-review": { title: "Resume Review", amount: 99 },
  "debugging-help": { title: "Debugging Help", amount: 99 },
  "portfolio-review": { title: "Portfolio Review", amount: 99 },
  "frontend-development": { title: "Frontend Development", amount: 1499 },
  "backend-development": { title: "Backend Development", amount: 1499 },
  "fullstack-development": { title: "Full Stack Development", amount: 3499 },
  "ai-data-guidance": { title: "AI / Data Science Guidance", amount: 499 },
};

const PAYMENT_EMAIL_NOTIFICATIONS_ENABLED = false;

const PAYMENT_CONFIG_ERROR_CODE = "PAYMENT_CONFIG_MISSING";
const CASHFREE_API_VERSION = String(process.env.CASHFREE_API_VERSION || "2023-08-01").trim();
const CASHFREE_TIMEOUT_MS = Number.parseInt(process.env.CASHFREE_TIMEOUT_MS, 10) || 12000;
const PAYMENT_STATUS_NEXT_POLL_MS = Number.parseInt(process.env.PAYMENT_STATUS_NEXT_POLL_MS, 10) || 3000;
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
const CASHFREE_WEBHOOK_TIMESTAMP_MAX_SKEW_MS =
  Number.parseInt(process.env.CASHFREE_WEBHOOK_TIMESTAMP_MAX_SKEW_MS, 10) || 5 * 60 * 1000;
const CASHFREE_WEBHOOK_REQUIRE_TIMESTAMP =
  String(process.env.CASHFREE_WEBHOOK_REQUIRE_TIMESTAMP || "true").trim().toLowerCase() === "true";
const reconciliationJobsInFlight = new Set();
const paymentQueueLogger = logger.child({ component: "payment-queue" });
let isPaymentQueueRuntimeActive = false;
const statusReconciliationInFlight = new Set();
const CASHFREE_WEBHOOK_SECRET = String(process.env.CASHFREE_WEBHOOK_SECRET || "").trim();
let cachedFetch = typeof globalThis.fetch === "function" ? globalThis.fetch : null;

const isAsyncVerifyEnabled = () =>
  String(process.env.PAYMENT_ASYNC_VERIFY_ENABLED || "false").trim().toLowerCase() === "true";

const getWebhookHeaderValue = (req, ...headerNames) => {
  for (const headerName of headerNames) {
    const value = req.headers?.[headerName];
    if (value) {
      return String(Array.isArray(value) ? value[0] : value).trim();
    }
  }

  return "";
};

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

const timingSafeStringEqual = (left, right) => {
  const leftBuffer = Buffer.from(String(left || ""), "utf8");
  const rightBuffer = Buffer.from(String(right || ""), "utf8");

  if (!leftBuffer.length || leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
};

const parseWebhookTimestampMs = (value) => {
  const raw = String(value || "").trim();
  if (!raw) {
    return 0;
  }

  if (/^\d+$/.test(raw)) {
    const numeric = Number.parseInt(raw, 10);
    if (!Number.isFinite(numeric) || numeric <= 0) {
      return 0;
    }

    // Gateways may send unix seconds or unix milliseconds.
    return numeric >= 1_000_000_000_000 ? numeric : numeric * 1000;
  }

  const parsed = Date.parse(raw);
  return Number.isFinite(parsed) ? parsed : 0;
};

const isWebhookTimestampWithinSkew = (timestampValue) => {
  const timestampMs = parseWebhookTimestampMs(timestampValue);
  if (!timestampMs) {
    return false;
  }

  return Math.abs(Date.now() - timestampMs) <= CASHFREE_WEBHOOK_TIMESTAMP_MAX_SKEW_MS;
};

const rejectWebhookTimestampIfInvalid = ({ req, res, reqLogger }) => {
  const webhookTimestamp = getWebhookHeaderValue(req, "x-webhook-timestamp", "x-cf-timestamp");

  if (!CASHFREE_WEBHOOK_REQUIRE_TIMESTAMP) {
    return false;
  }

  if (isWebhookTimestampWithinSkew(webhookTimestamp)) {
    return false;
  }

  reqLogger.warn(
    {
      webhookTimestamp,
      maxSkewMs: CASHFREE_WEBHOOK_TIMESTAMP_MAX_SKEW_MS,
    },
    "Rejected Cashfree webhook due to missing or stale timestamp"
  );

  res.status(401).json({
    success: false,
    message: "Invalid webhook timestamp",
  });

  return true;
};

const isCashfreeWebhookSignatureValid = ({ req, webhookSecret, rawBody }) => {
  const signature = getWebhookHeaderValue(req, "x-webhook-signature", "x-cf-signature");
  if (!signature || !webhookSecret || !rawBody) {
    return false;
  }

  const timestamp = getWebhookHeaderValue(req, "x-webhook-timestamp", "x-cf-timestamp");
  const signedPayloadCandidates = timestamp ? [`${timestamp}${rawBody}`, rawBody] : [rawBody];

  return signedPayloadCandidates.some((signedPayload) => {
    const generatedSignature = createHmac("sha256", webhookSecret)
      .update(signedPayload)
      .digest("base64");

    return timingSafeStringEqual(signature, generatedSignature);
  });
};

const parseWebhookPayload = (rawBody, parsedBody) => {
  if (parsedBody && typeof parsedBody === "object" && !Buffer.isBuffer(parsedBody)) {
    return parsedBody;
  }

  try {
    return JSON.parse(String(rawBody || "{}"));
  } catch {
    return null;
  }
};

const extractWebhookOrderId = (payload) =>
  String(
    payload?.data?.order?.order_id ||
      payload?.data?.order?.id ||
      payload?.order?.order_id ||
      payload?.order?.id ||
      payload?.order_id ||
      payload?.orderId ||
      ""
  ).trim();

const extractWebhookEventName = (payload) =>
  String(
    payload?.type || payload?.event || payload?.name || payload?.event_name || payload?.eventType || ""
  ).trim();

const extractWebhookPaymentId = (payload) =>
  String(
    payload?.data?.payment?.cf_payment_id ||
      payload?.data?.payment?.payment_id ||
      payload?.data?.cf_payment_id ||
      payload?.payment?.cf_payment_id ||
      payload?.payment?.payment_id ||
      payload?.payment_id ||
      payload?.cf_payment_id ||
      ""
  ).trim();

const buildWebhookEventKey = ({ eventName, normalizedOrderId, paymentId, rawBody }) => {
  const normalizedEventName = String(eventName || "cashfree_webhook")
    .trim()
    .toLowerCase()
    .replaceAll(/[^a-z0-9:_-]+/g, "_")
    .slice(0, 60);

  const normalizedPaymentId = String(paymentId || "").trim();
  const bodyFingerprint = createHmac("sha256", CASHFREE_WEBHOOK_SECRET || "cashfree_webhook")
    .update(String(rawBody || ""))
    .digest("hex")
    .slice(0, 24);

  const dedupeToken = normalizedPaymentId || bodyFingerprint;
  return `${normalizedEventName}:${normalizedOrderId}:${dedupeToken}`.slice(0, 180);
};

const registerWebhookEventIfNew = async ({ eventKey, normalizedOrderId, eventName, paymentId }) => {
  try {
    await PaymentWebhookEvent.create({
      eventKey,
      orderId: normalizedOrderId,
      eventName: String(eventName || "").trim().slice(0, 120),
      paymentId: String(paymentId || "").trim().slice(0, 120),
      receivedAt: new Date(),
    });
    return true;
  } catch (error) {
    if (Number(error?.code) === 11000) {
      return false;
    }

    throw error;
  }
};

const getFetchClient = async () => {
  if (typeof cachedFetch === "function") {
    return cachedFetch;
  }

  try {
    const undici = await import("undici");
    if (typeof undici.fetch === "function") {
      cachedFetch = undici.fetch;
      return cachedFetch;
    }
  } catch (error) {
    const fetchError = new Error(
      "No fetch implementation found. Upgrade Node.js to 18+ or install undici."
    );
    fetchError.code = "PAYMENT_FETCH_UNAVAILABLE";
    fetchError.cause = error;
    throw fetchError;
  }

  const fetchError = new Error(
    "No fetch implementation found. Upgrade Node.js to 18+ or install undici."
  );
  fetchError.code = "PAYMENT_FETCH_UNAVAILABLE";
  throw fetchError;
};

const getCashfreeBaseUrl = () => {
  const mode = String(process.env.CASHFREE_ENV || "SANDBOX").trim().toUpperCase();
  return mode === "PRODUCTION"
    ? "https://api.cashfree.com"
    : "https://sandbox.cashfree.com";
};

const getCashfreeConfig = () => {
  const appId = String(process.env.CASHFREE_APP_ID || "").trim();
  const secretKey = String(process.env.CASHFREE_SECRET_KEY || "").trim();

  if (!appId || !secretKey) {
    const configError = new Error("Cashfree credentials are missing in environment variables");
    configError.code = PAYMENT_CONFIG_ERROR_CODE;
    throw configError;
  }

  return {
    appId,
    secretKey,
    baseUrl: getCashfreeBaseUrl(),
  };
};

const callCashfreeApi = async ({ method, endpoint, body, config, requestId, idempotencyKey }) => {
  const fetchClient = await getFetchClient();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), CASHFREE_TIMEOUT_MS);
  const normalizedMethod = String(method || "GET").trim().toUpperCase();
  const resolvedRequestId = String(requestId || randomUUID()).trim();
  const resolvedIdempotencyKey = String(idempotencyKey || "").trim();
  const headers = {
    "Content-Type": "application/json",
    "x-api-version": CASHFREE_API_VERSION,
    "x-client-id": config.appId,
    "x-client-secret": config.secretKey,
    "x-request-id": resolvedRequestId,
  };

  if (resolvedIdempotencyKey && ["POST", "PUT", "PATCH", "DELETE"].includes(normalizedMethod)) {
    headers["x-idempotency-key"] = resolvedIdempotencyKey;
  }

  try {
    const response = await fetchClient(`${config.baseUrl}${endpoint}`, {
      method: normalizedMethod,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    let json = null;
    try {
      json = await response.json();
    } catch {
      json = null;
    }

    if (!response.ok) {
      const err = new Error(
        json?.message || json?.error_description || `Cashfree API error: ${response.status}`
      );
      err.statusCode = response.status;
      err.response = json;
      throw err;
    }

    return json;
  } finally {
    clearTimeout(timeout);
  }
};

const toCustomerId = (email) =>
  `cust_${String(email || "")
    .toLowerCase()
    .replaceAll(/[^a-z0-9]/g, "")
    .slice(0, 24)}_${Date.now().toString(36)}`;

const createOrderId = () => `svc_${Date.now()}_${randomBytes(3).toString("hex")}`;
const createPendingPaymentId = (orderId) => `pending_${String(orderId || "").trim()}`;

const isDatabaseReady = () => Number(Booking?.db?.readyState || 0) === 1;

const normalizeIndianPhone = (value) => {
  const digits = String(value || "").replaceAll(/\D/g, "");
  return digits.length >= 10 ? digits.slice(-10) : digits;
};

const isValidIndianPhone = (value) => /^[6-9]\d{9}$/.test(String(value || "").trim());

const resolvePhone = (...values) => {
  for (const value of values) {
    const normalized = normalizeIndianPhone(value);
    if (isValidIndianPhone(normalized)) {
      return normalized;
    }
  }
  return "";
};

const getRequestClientMeta = (req) => ({
  ipAddress:
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.socket?.remoteAddress ||
    req.ip ||
    "unknown",
  userAgent: req.headers["user-agent"] || "unknown",
});

const normalizePreferredDate = (value) => {
  const raw = String(value || "").trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    return raw;
  }
  return new Date().toISOString().slice(0, 10);
};

const normalizePreferredTime = (value) => {
  const raw = String(value || "").trim();
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(raw) ? raw : "10:00";
};

const toSafeText = (value, maxLength, fallback = "") => {
  const normalized = String(value == null ? "" : value)
    .replaceAll(/\s+/g, " ")
    .trim();
  const truncated = Number.isFinite(maxLength) && maxLength > 0
    ? normalized.slice(0, maxLength)
    : normalized;
  return truncated || fallback;
};

const normalizeEmailAddress = (value) => String(value || "").trim().toLowerCase();
const normalizeComparableEmailAddress = (value) => {
  const normalizedEmail = normalizeEmailAddress(value);
  const [localPart, rawDomain] = normalizedEmail.split("@");

  if (!localPart || !rawDomain) {
    return normalizedEmail;
  }

  const normalizedDomain = rawDomain === "googlemail.com" ? "gmail.com" : rawDomain;
  if (normalizedDomain === "gmail.com") {
    const canonicalLocal = localPart.split("+")[0].replaceAll(".", "");
    return `${canonicalLocal}@gmail.com`;
  }

  return `${localPart}@${normalizedDomain}`;
};

const isMatchingEmail = (left, right) =>
  normalizeComparableEmailAddress(left) === normalizeComparableEmailAddress(right);
const getAuthenticatedIdentity = (req) => {
  const userId = String(req.authUser?.id || "").trim();
  const email = normalizeEmailAddress(req.authUser?.email);
  const displayName = toSafeText(req.authUser?.displayName || req.authUser?.name, 80, "Customer");

  if (!userId || !email) {
    return null;
  }

  return {
    userId,
    email,
    displayName,
  };
};

const splitOrderIdFromUpsertFields = (payload, fallbackOrderId = "") => {
  const normalizedPayload = payload && typeof payload === "object" ? payload : {};
  const resolvedOrderId = String(normalizedPayload.orderId || fallbackOrderId || "").trim();
  const mutableFields = { ...normalizedPayload };
  delete mutableFields.orderId;

  return {
    resolvedOrderId,
    mutableFields,
  };
};

const getService = (slug) => SERVICE_CATALOG[String(slug || "").trim()];

const normalizePaymentStatusToken = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replaceAll(/[\s-]+/g, "_");

const isSuccessfulPaymentToken = (token) =>
  [
    "success",
    "successful",
    "paid",
    "captured",
    "completed",
    "settled",
    "settlement_successful",
    "charge_success",
  ].includes(token);

const isFailedPaymentToken = (token) =>
  [
    "failed",
    "cancelled",
    "canceled",
    "user_dropped",
    "expired",
    "declined",
    "rejected",
    "voided",
    "charge_failed",
  ].includes(token);

const extractPaymentStatusToken = (payment) =>
  normalizePaymentStatusToken(
    payment?.payment_status ||
      payment?.paymentStatus ||
      payment?.status ||
      payment?.payment_details?.payment_status ||
      payment?.payment_details?.status ||
      ""
  );

const normalizeGatewayPaymentStatus = (value) => {
  const status = normalizePaymentStatusToken(value);

  if (isSuccessfulPaymentToken(status)) {
    return "paid";
  }

  if (isFailedPaymentToken(status)) {
    return "failed";
  }

  if (["pending", "active", "processing", "in_progress", "initiated"].includes(status)) {
    return "pending";
  }

  return "created";
};

const summarizeReconciliationError = (error) =>
  String(error?.message || "reconciliation_failed")
    .trim()
    .slice(0, 200);

const resolveVerificationState = ({ paymentStatus, reconciliationStatus }) => {
  const normalizedPaymentStatus = String(paymentStatus || "").trim().toLowerCase();
  const normalizedReconciliationStatus = String(reconciliationStatus || "").trim().toLowerCase();

  if (normalizedPaymentStatus === "paid" || normalizedReconciliationStatus === "paid") {
    return "complete";
  }

  if (normalizedPaymentStatus === "failed" || normalizedReconciliationStatus === "failed") {
    return "failed";
  }

  if (["pending_local"].includes(normalizedReconciliationStatus)) {
    return "pending_local";
  }

  return "pending_gateway";
};

const buildPaymentStatusData = ({ type, record }) => {
  const paymentStatus = String(record?.paymentStatus || "created").trim().toLowerCase();
  const verificationStatus = resolveVerificationState({
    paymentStatus,
    reconciliationStatus: record?.reconciliationStatus,
  });
  const isResolved = verificationStatus === "complete" || verificationStatus === "failed";

  return {
    type,
    orderId: String(record?.orderId || "").trim(),
    paymentStatus,
    verificationStatus,
    reconciliationStatus: String(record?.reconciliationStatus || "idle").trim().toLowerCase(),
    reconciliationAttempts: Number(record?.reconciliationAttempts || 0),
    receiptReady: paymentStatus === "paid",
    nextPollMs: isResolved ? 0 : PAYMENT_STATUS_NEXT_POLL_MS,
    amount: Number(record?.amount || 0),
    paymentId: String(record?.paymentId || "").trim(),
    paidAt: record?.paidAt || null,
    emailDispatchQueued: PAYMENT_EMAIL_NOTIFICATIONS_ENABLED && paymentStatus === "paid",
    updatedAt: record?.updatedAt || null,
  };
};

const buildPaymentStatusRequestContext = ({ req, res }) => {
  const authIdentity = getAuthenticatedIdentity(req);

  if (!authIdentity) {
    res.status(401).json({
      success: false,
      message: "Please sign in first",
    });
    return null;
  }

  const normalizedOrderId = String(req.params?.orderId || "").trim();
  const providedEmail = normalizeEmailAddress(req.query?.email);

  if (providedEmail && !isMatchingEmail(providedEmail, authIdentity.email)) {
    res.status(403).json({
      success: false,
      message: "Status email must match your signed-in Google account.",
    });
    return null;
  }

  return {
    authIdentity,
    normalizedOrderId,
  };
};

const ensureStatusOwnership = ({ record, authIdentity, res, accountMismatchMessage, detailsMismatchMessage }) => {
  if (!record) {
    return true;
  }

  const ownershipMismatch = getOwnershipMismatchMessage({
    record,
    authIdentity,
    normalizedEmail: authIdentity.email,
    accountMismatchMessage,
    detailsMismatchMessage,
  });

  if (!ownershipMismatch) {
    return true;
  }

  res.status(403).json({
    success: false,
    message: ownershipMismatch,
  });
  return false;
};

const resolvePaymentStatusRecord = ({ booking, supportPayment }) => {
  const useServiceRecord =
    Boolean(booking) &&
    (!supportPayment ||
      new Date(booking.updatedAt || booking.createdAt || 0) >=
        new Date(supportPayment.updatedAt || supportPayment.createdAt || 0));

  return {
    type: useServiceRecord ? "service" : "support",
    record: useServiceRecord ? booking : supportPayment,
  };
};

const isTerminalVerificationState = (value) =>
  ["paid", "failed"].includes(String(value || "").trim().toLowerCase());

const shouldAttemptOnDemandStatusReconciliation = (record) => {
  if (!PAYMENT_STATUS_ON_DEMAND_RECONCILIATION_ENABLED || !record) {
    return false;
  }

  const paymentStatus = String(record.paymentStatus || "").trim().toLowerCase();
  const reconciliationStatus = String(record.reconciliationStatus || "").trim().toLowerCase();

  if (isTerminalVerificationState(paymentStatus) || isTerminalVerificationState(reconciliationStatus)) {
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

const fetchPaymentStatusRecordByType = async ({ type, normalizedOrderId }) => {
  if (type === "service") {
    return Booking.findOne({ orderId: normalizedOrderId }).lean();
  }

  return SupportPayment.findOne({ orderId: normalizedOrderId }).lean();
};

const reconcileStatusRecordOnDemand = async ({
  type,
  normalizedOrderId,
  record,
  reqLogger,
}) => {
  if (!shouldAttemptOnDemandStatusReconciliation(record)) {
    return record;
  }

  const reconciliationKey = `${type}:${normalizedOrderId}`;
  if (statusReconciliationInFlight.has(reconciliationKey)) {
    return record;
  }

  statusReconciliationInFlight.add(reconciliationKey);
  try {
    const attemptNumber = Math.max(1, (Number.parseInt(record?.reconciliationAttempts, 10) || 0) + 1);

    await runAsyncReconciliationAttempt({
      type,
      normalizedOrderId,
      emailDispatchQueued: PAYMENT_EMAIL_NOTIFICATIONS_ENABLED,
      reqLogger,
      attemptNumber,
    });
  } catch (error) {
    reqLogger.warn(
      {
        err: error,
        orderId: normalizedOrderId,
        type,
      },
      "On-demand status reconciliation attempt failed"
    );
  } finally {
    statusReconciliationInFlight.delete(reconciliationKey);
  }

  try {
    const refreshedRecord = await fetchPaymentStatusRecordByType({
      type,
      normalizedOrderId,
    });

    return refreshedRecord || record;
  } catch (error) {
    reqLogger.warn(
      {
        err: error,
        orderId: normalizedOrderId,
        type,
      },
      "Failed to refresh payment status record after reconciliation attempt"
    );
    return record;
  }
};

const toPaymentArray = (paymentList) => {
  if (Array.isArray(paymentList)) {
    return paymentList;
  }

  if (!paymentList || typeof paymentList !== "object") {
    return [];
  }

  const candidates = [
    paymentList.payments,
    paymentList.data,
    paymentList.items,
    paymentList.results,
    paymentList.payment_list,
    paymentList.data?.payments,
    paymentList.data?.items,
    paymentList.result?.payments,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate;
    }
  }

  const hasPaymentMarker = [
    "payment_status",
    "paymentStatus",
    "status",
    "cf_payment_id",
    "payment_id",
    "paymentId",
    "id",
  ].some((key) => Object.keys(paymentList).includes(key));

  return hasPaymentMarker ? [paymentList] : [];
};

const resolveGatewayPaymentId = (payment, orderId) =>
  String(
    payment?.cf_payment_id ||
      payment?.payment_id ||
      payment?.cfPaymentId ||
      payment?.paymentId ||
      payment?.id ||
      ""
  ).trim() || `cf_${String(orderId || "").trim()}`;

const summarizePaymentListForLogs = (paymentList) => {
  const payments = toPaymentArray(paymentList);
  const topLevelKeys = paymentList && typeof paymentList === "object"
    ? Object.keys(paymentList).slice(0, 8)
    : [];

  return {
    isArrayPayload: Array.isArray(paymentList),
    extractedCount: payments.length,
    topLevelKeys,
    statusesPreview: payments.slice(0, 5).map((payment) => extractPaymentStatusToken(payment) || "unknown"),
  };
};

const createSyntheticPaidPayment = (orderId) => ({
  payment_status: "PAID",
  cf_payment_id: `cf_${String(orderId || "").trim()}`,
  source: "gateway_order_status_paid_fallback",
});

const resolveRescuePaymentId = (orderId, ...candidates) => {
  for (const candidate of candidates) {
    const normalized = String(candidate || "").trim();
    if (normalized && !normalized.startsWith("pending_")) {
      return normalized;
    }
  }

  return `cf_${String(orderId || "").trim()}`;
};

const findGatewayPaidFallbackPayment = (paymentList, gatewayOrderStatus, orderId) => {
  if (gatewayOrderStatus !== "paid") {
    return null;
  }

  const payments = toPaymentArray(paymentList);
  if (!payments.length) {
    return createSyntheticPaidPayment(orderId);
  }

  const successfulPayment = payments.find((payment) =>
    isSuccessfulPaymentToken(extractPaymentStatusToken(payment))
  );
  if (successfulPayment) {
    return successfulPayment;
  }

  const nonFailedPaymentWithId = payments.find((payment) => {
    const statusToken = extractPaymentStatusToken(payment);
    const gatewayPaymentId = String(
      payment?.cf_payment_id ||
      payment?.payment_id ||
      payment?.cfPaymentId ||
      payment?.paymentId ||
      payment?.id ||
      ""
    ).trim();

    return gatewayPaymentId && !isFailedPaymentToken(statusToken);
  });

  if (nonFailedPaymentWithId) {
    return nonFailedPaymentWithId;
  }

  const nonFailedPayment = payments.find(
    (payment) => !isFailedPaymentToken(extractPaymentStatusToken(payment))
  );
  if (nonFailedPayment) {
    return nonFailedPayment;
  }

  const paymentWithId = payments.find((payment) =>
    String(
      payment?.cf_payment_id ||
      payment?.payment_id ||
      payment?.cfPaymentId ||
      payment?.paymentId ||
      payment?.id ||
      ""
    ).trim()
  );

  return paymentWithId || payments[0] || createSyntheticPaidPayment(orderId);
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

const getReconciliationRecord = async ({ type, normalizedOrderId }) => {
  if (type === "service") {
    return Booking.findOne({ orderId: normalizedOrderId })
      .select("paymentStatus reconciliationStatus")
      .lean();
  }

  return SupportPayment.findOne({ orderId: normalizedOrderId })
    .select("paymentStatus reconciliationStatus")
    .lean();
};

const shouldRetryReconciliation = async ({
  type,
  normalizedOrderId,
  attemptNumber,
  reqLogger,
}) => {
  if (attemptNumber >= PAYMENT_ASYNC_RECON_MAX_ATTEMPTS) {
    return false;
  }

  try {
    const record = await getReconciliationRecord({
      type,
      normalizedOrderId,
    });

    if (!record) {
      return true;
    }

    const paymentStatus = String(record.paymentStatus || "").trim().toLowerCase();
    const reconciliationStatus = String(record.reconciliationStatus || "").trim().toLowerCase();

    if (["paid", "failed"].includes(paymentStatus)) {
      return false;
    }

    if (["paid", "failed"].includes(reconciliationStatus)) {
      return false;
    }

    return [
      "queued",
      "processing",
      "pending_gateway",
      "pending_local",
      "idle",
      "created",
      "pending",
      "",
    ].includes(reconciliationStatus);
  } catch (error) {
    reqLogger.warn(
      {
        err: error,
        orderId: normalizedOrderId,
        type,
        attemptNumber,
      },
      "Unable to inspect reconciliation state for retry decision"
    );

    return attemptNumber < PAYMENT_ASYNC_RECON_MAX_ATTEMPTS;
  }
};

const findSuccessfulPayment = (paymentList) =>
  toPaymentArray(paymentList).find((payment) => isSuccessfulPaymentToken(extractPaymentStatusToken(payment)));

const findFailedPayment = (paymentList) =>
  toPaymentArray(paymentList).find((payment) => isFailedPaymentToken(extractPaymentStatusToken(payment)));

const buildBookingVerificationContext = ({
  draftBooking,
  cashfreeOrder,
  normalizedEmail,
  normalizedOrderId,
  ipAddress,
  userAgent,
  reqLogger,
}) => {
  if (!cashfreeOrder?.order_id) {
    return {
      error: {
        status: 400,
        message: "Unable to validate payment order details",
      },
    };
  }

  const orderEmail = String(cashfreeOrder.customer_details?.customer_email || "")
    .trim()
    .toLowerCase();

  if (orderEmail && orderEmail !== normalizedEmail) {
    reqLogger.warn(
      {
        orderId: normalizedOrderId,
      },
      "Payment verification rejected due to email mismatch"
    );

    return {
      error: {
        status: 403,
        message: "Verification details do not match this order",
      },
    };
  }

  const orderServiceSlug = String(cashfreeOrder.order_tags?.service_slug || "").trim();
  const resolvedServiceSlug = draftBooking?.serviceSlug || orderServiceSlug;
  const selectedService = getService(resolvedServiceSlug);

  if (!selectedService) {
    return {
      error: {
        status: 400,
        message: "Order service is invalid",
      },
    };
  }

  if (Number(cashfreeOrder.order_amount) !== selectedService.amount) {
    return {
      error: {
        status: 400,
        message: "Order amount does not match selected service",
      },
    };
  }

  if (String(cashfreeOrder.order_currency || "").toUpperCase() !== "INR") {
    return {
      error: {
        status: 400,
        message: "Order currency is invalid",
      },
    };
  }

  if (draftBooking && selectedService.amount !== draftBooking.amount) {
    return {
      error: {
        status: 400,
        message: "Booking details mismatch",
      },
    };
  }

  if (draftBooking && orderServiceSlug && orderServiceSlug !== draftBooking.serviceSlug) {
    return {
      error: {
        status: 400,
        message: "Order service does not match selected service",
      },
    };
  }

  const resolvedPhone = resolvePhone(
    draftBooking?.phone,
    cashfreeOrder.customer_details?.customer_phone
  );

  if (!resolvedPhone) {
    return {
      error: {
        status: 400,
        message: "Order phone details are invalid",
      },
    };
  }

  const customerName =
    String(cashfreeOrder.customer_details?.customer_name || draftBooking?.name || "Customer").trim() ||
    "Customer";
  const preferredDateValue =
    draftBooking?.preferredDate || new Date(normalizePreferredDate(cashfreeOrder.order_tags?.preferred_date));
  const preferredTimeValue =
    draftBooking?.preferredTime || normalizePreferredTime(cashfreeOrder.order_tags?.preferred_time);

  return {
    bookingInsertBase: {
      orderId: normalizedOrderId,
      name: customerName,
      email: orderEmail || normalizedEmail,
      phone: resolvedPhone,
      serviceSlug: resolvedServiceSlug,
      service: selectedService.title,
      preferredDate: preferredDateValue,
      preferredTime: preferredTimeValue,
      projectBrief: draftBooking?.projectBrief || "",
      amount: selectedService.amount,
      ipAddress,
      userAgent,
      date: new Date(),
    },
    gatewayOrderStatus: normalizeGatewayPaymentStatus(cashfreeOrder.order_status),
  };
};

const buildSupportVerificationContext = ({
  supportRecord,
  cashfreeOrder,
  normalizedEmail,
  normalizedOrderId,
  ipAddress,
  userAgent,
}) => {
  if (!cashfreeOrder?.order_id) {
    return {
      error: {
        status: 400,
        message: "Unable to validate support order",
      },
    };
  }

  const orderEmail = String(cashfreeOrder.customer_details?.customer_email || "")
    .trim()
    .toLowerCase();

  if (orderEmail && orderEmail !== normalizedEmail) {
    return {
      error: {
        status: 403,
        message: "Verification details do not match this support order",
      },
    };
  }

  const orderAmount = Number(cashfreeOrder.order_amount);

  if (!Number.isFinite(orderAmount) || orderAmount <= 0) {
    return {
      error: {
        status: 400,
        message: "Support amount is invalid",
      },
    };
  }

  if (String(cashfreeOrder.order_currency || "").toUpperCase() !== "INR") {
    return {
      error: {
        status: 400,
        message: "Order currency is invalid",
      },
    };
  }

  const resolvedSupportPhone = resolvePhone(
    supportRecord?.phone,
    cashfreeOrder.customer_details?.customer_phone
  );

  if (!resolvedSupportPhone) {
    return {
      error: {
        status: 400,
        message: "Support order phone details are invalid",
      },
    };
  }

  const contributorName = toSafeText(
    cashfreeOrder.customer_details?.customer_name || supportRecord?.contributorName,
    80,
    "Supporter"
  );

  return {
    contributorName,
    orderAmount,
    supportInsertBase: {
      orderId: normalizedOrderId,
      contributorName,
      email: orderEmail || normalizedEmail,
      phone: resolvedSupportPhone,
      amount: orderAmount,
      message: toSafeText(supportRecord?.message, 300, ""),
      ipAddress,
      userAgent,
    },
    gatewayOrderStatus: normalizeGatewayPaymentStatus(cashfreeOrder.order_status),
  };
};

const mapMongoError = (error) => {
  if (Number(error?.code) === 11000) {
    return {
      status: 409,
      message: "A payment record conflict occurred. Please retry once with the same order details.",
      logLevel: "warn",
    };
  }

  const errorMessage = String(error?.message || "");
  const errorName = String(error?.name || "");
  const hasConflictingUpdateError =
    Number(error?.code) === 40 || /create a conflict at|ConflictingUpdateOperators/i.test(errorMessage);
  const hasMongoRuntimeIssue =
    /mongo|mongoose/i.test(errorName) ||
    /server selection|topology|connection pool|timed out while checking out|not primary|node is recovering|replica set|connection .* closed/i.test(
      errorMessage
    );

  if (!hasConflictingUpdateError && !hasMongoRuntimeIssue) {
    return null;
  }

  return hasConflictingUpdateError
    ? {
        status: 409,
        message: "Payment confirmation is still reconciling. Please retry with the same order details.",
        logLevel: "warn",
      }
    : {
        status: 503,
        message: "Verification service is temporarily unavailable. Please retry with the same order details.",
        logLevel: "error",
      };
};

const mapGatewayStatusError = (gatewayStatus) => {
  if (!Number.isFinite(gatewayStatus)) {
    return null;
  }

  if (gatewayStatus === 401 || gatewayStatus === 403) {
    return {
      status: 502,
      message:
        "Payment gateway authentication failed. Verify Cashfree app ID and secret for the correct mode.",
      logLevel: "error",
    };
  }

  if (gatewayStatus >= 400 && gatewayStatus < 500) {
    return {
      status: 400,
      message: "Payment request was rejected by gateway. Please retry with valid details.",
      logLevel: "warn",
    };
  }

  return {
    status: 502,
    message: "Payment gateway is unavailable right now. Please try again shortly.",
    logLevel: "error",
  };
};

const mapGatewayError = (error, fallbackMessage) => {
  if (error?.code === PAYMENT_CONFIG_ERROR_CODE) {
    return {
      status: 503,
      message:
          "Payment service is not configured. Set CASHFREE_APP_ID and CASHFREE_SECRET_KEY in backend .env.",
      logLevel: "warn",
    };
  }

  if (error?.code === "PAYMENT_FETCH_UNAVAILABLE") {
    return {
      status: 503,
      message:
        "Payment service runtime is not ready. Upgrade Node.js to 18+ on server and redeploy.",
      logLevel: "error",
    };
  }

  if (error?.name === "AbortError") {
    return {
      status: 504,
      message: "Payment gateway timed out. Please retry in a moment.",
      logLevel: "warn",
    };
  }

  if (typeof error?.message === "string" && /fetch failed|network|socket|ECONN|ENOTFOUND/i.test(error.message)) {
    return {
      status: 502,
      message: "Payment gateway network is temporarily unavailable. Please try again shortly.",
      logLevel: "error",
    };
  }

  const mappedMongoError = mapMongoError(error);
  if (mappedMongoError) {
    return mappedMongoError;
  }

  if (error?.name === "ValidationError") {
    const validationMessage = Object.values(error.errors || {})[0]?.message;
    return {
      status: 400,
      message: validationMessage || "Payment details are invalid. Please refresh and try again.",
      logLevel: "warn",
    };
  }

  if (error?.name === "CastError") {
    return {
      status: 400,
      message: "Payment request contains invalid identifiers. Please retry from checkout.",
      logLevel: "warn",
    };
  }

  const gatewayStatus =
    Number(error?.statusCode) ||
    Number(error?.response?.status) ||
    Number(error?.error?.status_code);

  const mappedGatewayStatusError = mapGatewayStatusError(gatewayStatus);
  if (mappedGatewayStatusError) {
    return mappedGatewayStatusError;
  }

  return {
    status: 500,
    message: fallbackMessage,
    logLevel: "error",
  };
};

// Payment and support transactional emails are intentionally disabled.

const buildVerifyRequestContext = ({ req, res, requireAuthMessage, emailMismatchMessage }) => {
  const authIdentity = getAuthenticatedIdentity(req);
  if (!authIdentity) {
    res.status(401).json({
      success: false,
      message: requireAuthMessage,
    });
    return null;
  }

  const normalizedOrderId = String(req.body?.orderId || "").trim();
  const providedEmail = normalizeEmailAddress(req.body?.email);

  return {
    authIdentity,
    normalizedOrderId,
    providedEmail,
    normalizedEmail: authIdentity.email,
  };
};

const buildReceiptRequestContext = ({ req, res, requireAuthMessage, emailMismatchMessage }) => {
  const authIdentity = getAuthenticatedIdentity(req);
  if (!authIdentity) {
    res.status(401).json({
      success: false,
      message: requireAuthMessage,
    });
    return null;
  }

  const normalizedOrderId = String(req.params?.orderId || "").trim();
  const providedEmail = normalizeEmailAddress(req.query?.email);

  return {
    authIdentity,
    normalizedOrderId,
    providedEmail,
    normalizedEmail: authIdentity.email,
  };
};

const getOwnershipMismatchMessage = ({
  record,
  authIdentity,
  normalizedEmail,
  accountMismatchMessage,
  detailsMismatchMessage,
}) => {
  if (record?.userId && String(record.userId) !== authIdentity.userId) {
    return accountMismatchMessage;
  }

  if (record?.email && !isMatchingEmail(record.email, normalizedEmail)) {
    return detailsMismatchMessage;
  }

  return "";
};

const queueServiceEmailIfConfigured = () => {};
const queueSupportEmailIfConfigured = () => {};

const tryHandleAsyncServiceVerification = async ({
  draftBooking,
  normalizedOrderId,
  emailDispatchQueued,
  reqLogger,
  res,
}) => {
  if (!isAsyncVerifyEnabled() || !draftBooking) {
    return false;
  }

  const acceptedAt = draftBooking.verificationAcceptedAt || new Date();

  await Booking.updateOne(
    { _id: draftBooking._id },
    {
      $set: {
        verificationAcceptedAt: acceptedAt,
        reconciliationStatus: "queued",
        lastReconciliationAt: new Date(),
        lastReconciliationError: "",
      },
    }
  );

  const scheduled = scheduleAsyncReconciliation({
    type: "service",
    normalizedOrderId,
    emailDispatchQueued,
    reqLogger,
  });

  res.status(202).json({
    success: true,
    message: scheduled
      ? "Payment verification queued. We are confirming this payment in the background."
      : "Payment verification is already in progress.",
    data: {
      bookingId: draftBooking._id,
      service: draftBooking.service,
      amount: draftBooking.amount,
      orderId: normalizedOrderId,
      paymentId: draftBooking.paymentId,
      emailDispatchQueued,
      verificationStatus: "pending_gateway",
      reconciliationStatus: scheduled ? "queued" : "processing",
      receiptReady: false,
      nextPollMs: PAYMENT_STATUS_NEXT_POLL_MS,
    },
  });

  return true;
};

const tryHandleAsyncSupportVerification = async ({
  supportRecord,
  normalizedOrderId,
  emailDispatchQueued,
  reqLogger,
  res,
}) => {
  if (!isAsyncVerifyEnabled() || !supportRecord) {
    return false;
  }

  const acceptedAt = supportRecord.verificationAcceptedAt || new Date();

  await SupportPayment.updateOne(
    { _id: supportRecord._id },
    {
      $set: {
        verificationAcceptedAt: acceptedAt,
        reconciliationStatus: "queued",
        lastReconciliationAt: new Date(),
        lastReconciliationError: "",
      },
    }
  );

  const scheduled = scheduleAsyncReconciliation({
    type: "support",
    normalizedOrderId,
    emailDispatchQueued,
    reqLogger,
  });

  res.status(202).json({
    success: true,
    message: scheduled
      ? "Support payment verification queued. We are confirming this payment in the background."
      : "Support payment verification is already in progress.",
    data: {
      orderId: normalizedOrderId,
      amount: supportRecord.amount,
      contributorName: supportRecord.contributorName,
      paymentId: supportRecord.paymentId,
      emailDispatchQueued,
      verificationStatus: "pending_gateway",
      reconciliationStatus: scheduled ? "queued" : "processing",
      receiptReady: false,
      nextPollMs: PAYMENT_STATUS_NEXT_POLL_MS,
    },
  });

  return true;
};

const sendServiceVerificationSuccess = ({
  res,
  message,
  booking,
  orderId,
  paymentId,
  emailDispatchQueued,
}) => {
  return res.status(200).json({
    success: true,
    message,
    data: {
      bookingId: booking._id,
      service: booking.service,
      amount: booking.amount,
      orderId,
      paymentId,
      emailDispatchQueued,
    },
  });
};

const sendSupportVerificationSuccess = ({
  res,
  message,
  orderId,
  amount,
  contributorName,
  paymentId,
  emailDispatchQueued,
}) => {
  return res.status(200).json({
    success: true,
    message,
    data: {
      orderId,
      amount,
      contributorName,
      paymentId,
      emailDispatchQueued,
    },
  });
};

const updateServiceReconciliationState = async ({
  normalizedOrderId,
  setFields,
  incrementAttempt = false,
}) => {
  const update = {
    $set: {
      ...setFields,
    },
  };

  if (incrementAttempt) {
    update.$inc = {
      reconciliationAttempts: 1,
    };
  }

  await Booking.updateOne({ orderId: normalizedOrderId }, update);
};

const updateSupportReconciliationState = async ({
  normalizedOrderId,
  setFields,
  incrementAttempt = false,
}) => {
  const update = {
    $set: {
      ...setFields,
    },
  };

  if (incrementAttempt) {
    update.$inc = {
      reconciliationAttempts: 1,
    };
  }

  await SupportPayment.updateOne({ orderId: normalizedOrderId }, update);
};

const reconcileServiceOrderAsync = async ({ normalizedOrderId, emailDispatchQueued, reqLogger }) => {
  if (!isDatabaseReady()) {
    return;
  }

  let gatewayOrderStatusAtFailure = "";
  let bookingInsertBaseAtFailure = null;
  let lastDraftBooking = null;

  try {
    await updateServiceReconciliationState({
      normalizedOrderId,
      setFields: {
        reconciliationStatus: "processing",
        lastReconciliationAt: new Date(),
      },
      incrementAttempt: true,
    });

    const draftBooking = await Booking.findOne({ orderId: normalizedOrderId });
    lastDraftBooking = draftBooking;

    if (!draftBooking) {
      await updateServiceReconciliationState({
        normalizedOrderId,
        setFields: {
          reconciliationStatus: "pending_local",
          lastReconciliationAt: new Date(),
          lastReconciliationError: "booking_not_found",
        },
      });
      return;
    }

    if (draftBooking.paymentStatus === "paid") {
      await updateServiceReconciliationState({
        normalizedOrderId,
        setFields: {
          reconciliationStatus: "paid",
          lastReconciliationAt: new Date(),
          lastReconciliationError: "",
        },
      });

      queueServiceEmailIfConfigured({
        emailDispatchQueued,
        bookingId: draftBooking._id,
        reqLogger,
      });
      return;
    }

    const config = getCashfreeConfig();
    const normalizedEmail = normalizeEmailAddress(draftBooking.email);

    const cashfreeOrder = await callCashfreeApi({
      method: "GET",
      endpoint: `/pg/orders/${encodeURIComponent(normalizedOrderId)}`,
      config,
    });

    const verificationContext = buildBookingVerificationContext({
      draftBooking,
      cashfreeOrder,
      normalizedEmail,
      normalizedOrderId,
      ipAddress: draftBooking.ipAddress || "system",
      userAgent: draftBooking.userAgent || "async-reconciliation",
      reqLogger,
    });

    if (verificationContext.error) {
      await updateServiceReconciliationState({
        normalizedOrderId,
        setFields: {
          reconciliationStatus: "pending_gateway",
          lastReconciliationAt: new Date(),
          lastReconciliationError: verificationContext.error.message,
        },
      });
      return;
    }

    const { bookingInsertBase, gatewayOrderStatus } = verificationContext;
    bookingInsertBase.userId = draftBooking?.userId || null;
    bookingInsertBase.email = normalizedEmail;
    gatewayOrderStatusAtFailure = gatewayOrderStatus;
    bookingInsertBaseAtFailure = bookingInsertBase;

    await upsertServiceVerificationDraft({
      normalizedOrderId,
      bookingInsertBase,
      gatewayOrderStatus,
    });

    const paymentList = await fetchOrderPaymentsWithPaidFallback({
      config,
      normalizedOrderId,
      gatewayOrderStatus,
      reqLogger,
      fallbackLogMessage:
        "Service async reconciliation payment list fetch failed for paid order; continuing with gateway-paid fallback",
    });

    const successfulPayment =
      findSuccessfulPayment(paymentList) ||
      findGatewayPaidFallbackPayment(paymentList, gatewayOrderStatus, normalizedOrderId);

    if (!successfulPayment) {
      const failedPayment = findFailedPayment(paymentList);
      const nextStatus = resolvePendingVerificationStatus({
        failedPayment,
        gatewayOrderStatus,
      });

      await persistServicePendingStatusSafely({
        normalizedOrderId,
        bookingInsertBase,
        nextStatus,
        reqLogger,
      });

      await updateServiceReconciliationState({
        normalizedOrderId,
        setFields: {
          reconciliationStatus: nextStatus === "failed" ? "failed" : "pending_gateway",
          lastReconciliationAt: new Date(),
          lastReconciliationError: "",
        },
      });
      return;
    }

    const booking = await Booking.findOneAndUpdate(
      { orderId: normalizedOrderId },
      {
        $set: {
          paymentStatus: "paid",
          paymentId: resolveGatewayPaymentId(successfulPayment, normalizedOrderId),
          paymentProvider: "cashfree",
          paidAt: new Date(),
          reconciliationStatus: "paid",
          lastReconciliationAt: new Date(),
          lastReconciliationError: "",
        },
        $setOnInsert: bookingInsertBase,
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    );

    queueServiceEmailIfConfigured({
      emailDispatchQueued,
      bookingId: booking?._id,
      reqLogger,
    });
  } catch (error) {
    const rescuedBooking = await tryRescueServicePaidBooking({
      gatewayOrderStatusAtFailure,
      normalizedOrderId,
      lastDraftBooking,
      error,
      bookingInsertBaseAtFailure,
      reqLogger,
    });

    if (rescuedBooking) {
      await updateServiceReconciliationState({
        normalizedOrderId,
        setFields: {
          reconciliationStatus: "paid",
          lastReconciliationAt: new Date(),
          lastReconciliationError: "",
        },
      });

      queueServiceEmailIfConfigured({
        emailDispatchQueued,
        bookingId: rescuedBooking._id,
        reqLogger,
      });
      return;
    }

    await updateServiceReconciliationState({
      normalizedOrderId,
      setFields: {
        reconciliationStatus: "pending_local",
        lastReconciliationAt: new Date(),
        lastReconciliationError: summarizeReconciliationError(error),
      },
    });

    reqLogger.error(
      {
        err: error,
        orderId: normalizedOrderId,
      },
      "Service async reconciliation failed"
    );
  }
};

const reconcileSupportOrderAsync = async ({ normalizedOrderId, emailDispatchQueued, reqLogger }) => {
  if (!isDatabaseReady()) {
    return;
  }

  let gatewayOrderStatusAtFailure = "";
  let supportInsertBaseAtFailure = null;
  let lastSupportRecord = null;

  try {
    await updateSupportReconciliationState({
      normalizedOrderId,
      setFields: {
        reconciliationStatus: "processing",
        lastReconciliationAt: new Date(),
      },
      incrementAttempt: true,
    });

    const supportRecord = await SupportPayment.findOne({ orderId: normalizedOrderId });
    lastSupportRecord = supportRecord;

    if (!supportRecord) {
      await updateSupportReconciliationState({
        normalizedOrderId,
        setFields: {
          reconciliationStatus: "pending_local",
          lastReconciliationAt: new Date(),
          lastReconciliationError: "support_record_not_found",
        },
      });
      return;
    }

    if (supportRecord.paymentStatus === "paid") {
      await updateSupportReconciliationState({
        normalizedOrderId,
        setFields: {
          reconciliationStatus: "paid",
          lastReconciliationAt: new Date(),
          lastReconciliationError: "",
        },
      });

      queueSupportEmailIfConfigured({
        emailDispatchQueued,
        supportPaymentId: supportRecord._id,
        reqLogger,
      });
      return;
    }

    const config = getCashfreeConfig();
    const normalizedEmail = normalizeEmailAddress(supportRecord.email);

    const cashfreeOrder = await callCashfreeApi({
      method: "GET",
      endpoint: `/pg/orders/${encodeURIComponent(normalizedOrderId)}`,
      config,
    });

    const verificationContext = buildSupportVerificationContext({
      supportRecord,
      cashfreeOrder,
      normalizedEmail,
      normalizedOrderId,
      ipAddress: supportRecord.ipAddress || "system",
      userAgent: supportRecord.userAgent || "async-reconciliation",
    });

    if (verificationContext.error) {
      await updateSupportReconciliationState({
        normalizedOrderId,
        setFields: {
          reconciliationStatus: "pending_gateway",
          lastReconciliationAt: new Date(),
          lastReconciliationError: verificationContext.error.message,
        },
      });
      return;
    }

    const { supportInsertBase, gatewayOrderStatus } = verificationContext;
    supportInsertBase.userId = supportRecord?.userId || null;
    supportInsertBase.email = normalizedEmail;
    gatewayOrderStatusAtFailure = gatewayOrderStatus;
    supportInsertBaseAtFailure = supportInsertBase;

    const paymentList = await fetchOrderPaymentsWithPaidFallback({
      config,
      normalizedOrderId,
      gatewayOrderStatus,
      reqLogger,
      fallbackLogMessage:
        "Support async reconciliation payment list fetch failed for paid order; continuing with gateway-paid fallback",
    });

    const successfulPayment =
      findSuccessfulPayment(paymentList) ||
      findGatewayPaidFallbackPayment(paymentList, gatewayOrderStatus, normalizedOrderId);

    if (!successfulPayment) {
      const failedPayment = findFailedPayment(paymentList);
      const nextStatus = resolvePendingVerificationStatus({
        failedPayment,
        gatewayOrderStatus,
      });

      await persistSupportPendingStatusSafely({
        normalizedOrderId,
        supportInsertBase,
        nextStatus,
        reqLogger,
      });

      await updateSupportReconciliationState({
        normalizedOrderId,
        setFields: {
          reconciliationStatus: nextStatus === "failed" ? "failed" : "pending_gateway",
          lastReconciliationAt: new Date(),
          lastReconciliationError: "",
        },
      });
      return;
    }

    const resolvedPaymentId = resolveGatewayPaymentId(successfulPayment, normalizedOrderId);
    const conflictingPayment = await findSupportPaymentConflict({
      normalizedOrderId,
      resolvedPaymentId,
    });

    if (conflictingPayment) {
      await updateSupportReconciliationState({
        normalizedOrderId,
        setFields: {
          reconciliationStatus: "pending_local",
          lastReconciliationAt: new Date(),
          lastReconciliationError: "payment_id_conflict",
        },
      });
      return;
    }

    const { resolvedOrderId: supportInsertOrderId, mutableFields: supportMutableFields } =
      splitOrderIdFromUpsertFields(supportInsertBase, normalizedOrderId);

    const savedSupportPayment = await SupportPayment.findOneAndUpdate(
      { orderId: normalizedOrderId },
      {
        $set: {
          ...supportMutableFields,
          paymentStatus: "paid",
          paymentProvider: "cashfree",
          paymentId: resolvedPaymentId,
          paidAt: new Date(),
          reconciliationStatus: "paid",
          lastReconciliationAt: new Date(),
          lastReconciliationError: "",
        },
        $setOnInsert: {
          orderId: supportInsertOrderId || normalizedOrderId,
          ...supportMutableFields,
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    );

    queueSupportEmailIfConfigured({
      emailDispatchQueued,
      supportPaymentId: savedSupportPayment?._id,
      reqLogger,
    });
  } catch (error) {
    const rescuedSupportPayment = await tryRescueSupportPaidPayment({
      gatewayOrderStatusAtFailure,
      normalizedOrderId,
      lastSupportRecord,
      error,
      supportInsertBaseAtFailure,
      reqLogger,
    });

    if (rescuedSupportPayment) {
      await updateSupportReconciliationState({
        normalizedOrderId,
        setFields: {
          reconciliationStatus: "paid",
          lastReconciliationAt: new Date(),
          lastReconciliationError: "",
        },
      });

      queueSupportEmailIfConfigured({
        emailDispatchQueued,
        supportPaymentId: rescuedSupportPayment._id,
        reqLogger,
      });
      return;
    }

    await updateSupportReconciliationState({
      normalizedOrderId,
      setFields: {
        reconciliationStatus: "pending_local",
        lastReconciliationAt: new Date(),
        lastReconciliationError: summarizeReconciliationError(error),
      },
    });

    reqLogger.error(
      {
        err: error,
        orderId: normalizedOrderId,
      },
      "Support async reconciliation failed"
    );
  }
};

const runAsyncReconciliationAttempt = async ({
  type,
  normalizedOrderId,
  emailDispatchQueued,
  reqLogger,
  attemptNumber,
}) => {
  const effectiveLogger = reqLogger || logger;
  const orderId = String(normalizedOrderId || "").trim();
  const normalizedAttempt = Number.parseInt(attemptNumber, 10) || 1;

  if (!orderId || normalizedAttempt > PAYMENT_ASYNC_RECON_MAX_ATTEMPTS) {
    return;
  }

  let shouldRetry = false;

  try {
    if (type === "service") {
      await reconcileServiceOrderAsync({
        normalizedOrderId: orderId,
        emailDispatchQueued,
        reqLogger: effectiveLogger,
      });
    } else if (type === "support") {
      await reconcileSupportOrderAsync({
        normalizedOrderId: orderId,
        emailDispatchQueued,
        reqLogger: effectiveLogger,
      });
    } else {
      effectiveLogger.warn(
        {
          type,
          orderId,
        },
        "Skipped reconciliation for unknown job type"
      );
      return;
    }

    shouldRetry = await shouldRetryReconciliation({
      type,
      normalizedOrderId: orderId,
      attemptNumber: normalizedAttempt,
      reqLogger: effectiveLogger,
    });
  } catch (error) {
    effectiveLogger.error(
      {
        err: error,
        orderId,
        type,
        attemptNumber: normalizedAttempt,
      },
      "Async reconciliation execution failed"
    );

    shouldRetry = normalizedAttempt < PAYMENT_ASYNC_RECON_MAX_ATTEMPTS;
  }

  if (shouldRetry && normalizedAttempt < PAYMENT_ASYNC_RECON_MAX_ATTEMPTS) {
    scheduleAsyncReconciliation({
      type,
      normalizedOrderId: orderId,
      emailDispatchQueued,
      reqLogger: effectiveLogger,
      attemptNumber: normalizedAttempt + 1,
    });
  }
};

const scheduleAsyncReconciliationInProcess = ({
  type,
  normalizedOrderId,
  emailDispatchQueued,
  reqLogger,
  attemptNumber,
}) => {
  const orderId = String(normalizedOrderId || "").trim();
  const normalizedAttempt = Number.parseInt(attemptNumber, 10) || 1;

  if (!orderId || normalizedAttempt > PAYMENT_ASYNC_RECON_MAX_ATTEMPTS) {
    return false;
  }

  const jobKey = `${type}:${orderId}`;
  if (reconciliationJobsInFlight.has(jobKey)) {
    return false;
  }

  reconciliationJobsInFlight.add(jobKey);
  const delayMs = getReconciliationRetryDelayMs(normalizedAttempt);

  setTimeout(() => {
    void runAsyncReconciliationAttempt({
      type,
      normalizedOrderId: orderId,
      emailDispatchQueued,
      reqLogger,
      attemptNumber: normalizedAttempt,
    }).finally(() => {
      reconciliationJobsInFlight.delete(jobKey);
    });
  }, delayMs);

  return true;
};

const scheduleAsyncReconciliation = ({
  type,
  normalizedOrderId,
  emailDispatchQueued,
  reqLogger,
  attemptNumber = 1,
}) => {
  const orderId = String(normalizedOrderId || "").trim();
  if (!orderId) {
    return false;
  }

  const normalizedAttempt = Number.parseInt(attemptNumber, 10) || 1;
  if (normalizedAttempt > PAYMENT_ASYNC_RECON_MAX_ATTEMPTS) {
    return false;
  }

  if (!isPaymentQueueReady() || !isPaymentQueueRuntimeActive) {
    return scheduleAsyncReconciliationInProcess({
      type,
      normalizedOrderId: orderId,
      emailDispatchQueued,
      reqLogger,
      attemptNumber: normalizedAttempt,
    });
  }

  const effectiveLogger = reqLogger || logger;
  const delayMs = getReconciliationRetryDelayMs(normalizedAttempt);

  void enqueuePaymentReconciliationJob({
    type,
    normalizedOrderId: orderId,
    emailDispatchQueued,
    attemptNumber: normalizedAttempt,
    delayMs,
  })
    .then((queued) => {
      if (!queued) {
        scheduleAsyncReconciliationInProcess({
          type,
          normalizedOrderId: orderId,
          emailDispatchQueued,
          reqLogger: effectiveLogger,
          attemptNumber: normalizedAttempt,
        });
      }
    })
    .catch((error) => {
      effectiveLogger.warn(
        {
          err: error,
          orderId,
          type,
          attemptNumber: normalizedAttempt,
        },
        "Failed to enqueue reconciliation job; using in-process scheduler"
      );

      scheduleAsyncReconciliationInProcess({
        type,
        normalizedOrderId: orderId,
        emailDispatchQueued,
        reqLogger: effectiveLogger,
        attemptNumber: normalizedAttempt,
      });
    });

  return true;
};

const processPaymentQueueReconciliationJob = async ({
  type,
  normalizedOrderId,
  emailDispatchQueued,
  attemptNumber,
}) => {
  await runAsyncReconciliationAttempt({
    type,
    normalizedOrderId,
    emailDispatchQueued,
    reqLogger: paymentQueueLogger,
    attemptNumber,
  });
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
      "Failed to start payment queue workers"
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
      "Failed to fetch payment queue admin status"
    );

    return res.status(500).json({
      success: false,
      message: "Unable to fetch payment queue status",
    });
  }
};

const fetchOrderPaymentsWithPaidFallback = async ({
  config,
  normalizedOrderId,
  gatewayOrderStatus,
  reqLogger,
  fallbackLogMessage,
}) => {
  try {
    return await callCashfreeApi({
      method: "GET",
      endpoint: `/pg/orders/${encodeURIComponent(normalizedOrderId)}/payments`,
      config,
    });
  } catch (paymentListError) {
    if (gatewayOrderStatus !== "paid") {
      throw paymentListError;
    }

    reqLogger.warn(
      {
        orderId: normalizedOrderId,
        gatewayOrderStatus,
        err: paymentListError,
      },
      fallbackLogMessage
    );
    return [];
  }
};

const resolvePendingVerificationStatus = ({ failedPayment, gatewayOrderStatus }) => {
  if (failedPayment) {
    return "failed";
  }

  if (gatewayOrderStatus === "failed" || gatewayOrderStatus === "paid") {
    return "pending";
  }

  return gatewayOrderStatus;
};

const resolvePendingVerificationMessage = ({ failedPayment, gatewayOrderStatus, failedMessage }) => {
  if (failedPayment) {
    return failedMessage;
  }

  if (gatewayOrderStatus === "paid") {
    return "Payment is being finalized by gateway. Please retry in a few seconds.";
  }

  return "Payment is not completed yet";
};

const upsertServiceVerificationDraft = async ({
  normalizedOrderId,
  bookingInsertBase,
  gatewayOrderStatus,
}) => {
  await Booking.findOneAndUpdate(
    { orderId: normalizedOrderId },
    {
      $setOnInsert: {
        ...bookingInsertBase,
        paymentProvider: "cashfree",
        paymentStatus: gatewayOrderStatus,
        paymentId: createPendingPaymentId(normalizedOrderId),
      },
    },
    {
      upsert: true,
      runValidators: true,
    }
  );
};

const persistServicePendingStatusSafely = async ({
  normalizedOrderId,
  bookingInsertBase,
  nextStatus,
  reqLogger,
}) => {
  try {
    await Booking.updateOne(
      { orderId: normalizedOrderId },
      {
        $set: {
          paymentStatus: nextStatus,
        },
        $setOnInsert: bookingInsertBase,
      },
      {
        upsert: true,
        runValidators: true,
      }
    );
  } catch (pendingPersistError) {
    reqLogger.warn(
      {
        orderId: normalizedOrderId,
        nextStatus,
        err: pendingPersistError,
      },
      "Service pending-status persistence failed during verification"
    );
  }
};

const persistSupportPendingStatusSafely = async ({
  normalizedOrderId,
  supportInsertBase,
  nextStatus,
  reqLogger,
}) => {
  const { resolvedOrderId, mutableFields } = splitOrderIdFromUpsertFields(
    supportInsertBase,
    normalizedOrderId
  );

  try {
    await SupportPayment.findOneAndUpdate(
      { orderId: normalizedOrderId },
      {
        $set: {
          ...mutableFields,
          paymentStatus: nextStatus,
          paymentProvider: "cashfree",
          paymentId: createPendingPaymentId(normalizedOrderId),
        },
        $setOnInsert: {
          orderId: resolvedOrderId || normalizedOrderId,
          ...mutableFields,
        },
      },
      {
        upsert: true,
        runValidators: true,
      }
    );
  } catch (pendingPersistError) {
    reqLogger.warn(
      {
        orderId: normalizedOrderId,
        nextStatus,
        err: pendingPersistError,
      },
      "Support pending-status persistence failed during verification"
    );
  }
};

const findOrCreatePaidServiceBooking = async ({
  normalizedOrderId,
  lastDraftBooking,
  error,
  bookingInsertBaseAtFailure,
}) => {
  let paidBooking = await Booking.findOne({
    orderId: normalizedOrderId,
    paymentStatus: "paid",
  });

  if (paidBooking) {
    return paidBooking;
  }

  const rescuePaymentId = resolveRescuePaymentId(
    normalizedOrderId,
    lastDraftBooking?.paymentId,
    error?.cf_payment_id,
    error?.payment_id
  );

  const rescueSet = {
    paymentStatus: "paid",
    paymentProvider: "cashfree",
    paymentId: rescuePaymentId,
    paidAt: new Date(),
  };

  const { resolvedOrderId: serviceInsertOrderId, mutableFields: serviceMutableFields } =
    splitOrderIdFromUpsertFields(bookingInsertBaseAtFailure, normalizedOrderId);

  if (bookingInsertBaseAtFailure) {
    Object.assign(rescueSet, serviceMutableFields);
  }

  const rescueUpdate = {
    $set: rescueSet,
  };

  if (bookingInsertBaseAtFailure) {
    rescueUpdate.$setOnInsert = {
      orderId: serviceInsertOrderId || normalizedOrderId,
      ...serviceMutableFields,
    };
  }

  paidBooking = await Booking.findOneAndUpdate(
    { orderId: normalizedOrderId },
    rescueUpdate,
    {
      new: true,
      upsert: !!bookingInsertBaseAtFailure,
      runValidators: !!bookingInsertBaseAtFailure,
    }
  );

  return paidBooking;
};

const tryRescueServicePaidBooking = async ({
  gatewayOrderStatusAtFailure,
  normalizedOrderId,
  lastDraftBooking,
  error,
  bookingInsertBaseAtFailure,
  reqLogger,
}) => {
  if (gatewayOrderStatusAtFailure !== "paid") {
    return null;
  }

  try {
    const paidBooking = await findOrCreatePaidServiceBooking({
      normalizedOrderId,
      lastDraftBooking,
      error,
      bookingInsertBaseAtFailure,
    });

    if (paidBooking?.paymentStatus !== "paid") {
      return null;
    }

    reqLogger.warn(
      {
        orderId: normalizedOrderId,
        bookingId: paidBooking._id,
        paymentId: paidBooking.paymentId,
        err: error,
      },
      "Service payment verified via paid-order rescue path"
    );

    return paidBooking;
  } catch (rescueError) {
    reqLogger.error(
      {
        err: rescueError,
        orderId: normalizedOrderId,
      },
      "Service paid-order rescue path failed"
    );
    return null;
  }
};

const findSupportPaymentConflict = async ({ normalizedOrderId, resolvedPaymentId }) => {
  return SupportPayment.findOne({
    paymentId: resolvedPaymentId,
    orderId: { $ne: normalizedOrderId },
  })
    .select("orderId paymentStatus")
    .lean();
};

const findOrCreatePaidSupportPayment = async ({
  normalizedOrderId,
  lastSupportRecord,
  error,
  supportInsertBaseAtFailure,
}) => {
  let paidSupportPayment = await SupportPayment.findOne({
    orderId: normalizedOrderId,
    paymentStatus: "paid",
  });

  if (paidSupportPayment) {
    return paidSupportPayment;
  }

  const rescuePaymentId = resolveRescuePaymentId(
    normalizedOrderId,
    lastSupportRecord?.paymentId,
    error?.cf_payment_id,
    error?.payment_id
  );

  const rescueSet = {
    paymentStatus: "paid",
    paymentProvider: "cashfree",
    paymentId: rescuePaymentId,
    paidAt: new Date(),
  };

  const { resolvedOrderId: supportInsertOrderId, mutableFields: supportMutableFields } =
    splitOrderIdFromUpsertFields(supportInsertBaseAtFailure, normalizedOrderId);

  if (supportInsertBaseAtFailure) {
    Object.assign(rescueSet, supportMutableFields);
  }

  const rescueUpdate = {
    $set: rescueSet,
  };

  if (supportInsertBaseAtFailure) {
    rescueUpdate.$setOnInsert = {
      orderId: supportInsertOrderId || normalizedOrderId,
      ...supportMutableFields,
    };
  }

  paidSupportPayment = await SupportPayment.findOneAndUpdate(
    { orderId: normalizedOrderId },
    rescueUpdate,
    {
      new: true,
      upsert: !!supportInsertBaseAtFailure,
      runValidators: !!supportInsertBaseAtFailure,
    }
  );

  return paidSupportPayment;
};

const tryRescueSupportPaidPayment = async ({
  gatewayOrderStatusAtFailure,
  normalizedOrderId,
  lastSupportRecord,
  error,
  supportInsertBaseAtFailure,
  reqLogger,
}) => {
  if (gatewayOrderStatusAtFailure !== "paid") {
    return null;
  }

  try {
    const paidSupportPayment = await findOrCreatePaidSupportPayment({
      normalizedOrderId,
      lastSupportRecord,
      error,
      supportInsertBaseAtFailure,
    });

    if (paidSupportPayment?.paymentStatus !== "paid") {
      return null;
    }

    reqLogger.warn(
      {
        orderId: normalizedOrderId,
        supportPaymentId: paidSupportPayment._id,
        paymentId: paidSupportPayment.paymentId,
        err: error,
      },
      "Support payment verified via paid-order rescue path"
    );

    return paidSupportPayment;
  } catch (rescueError) {
    reqLogger.error(
      {
        err: rescueError,
        orderId: normalizedOrderId,
      },
      "Support paid-order rescue path failed"
    );
    return null;
  }
};

const findWebhookPaymentRecords = async (normalizedOrderId) => {
  const [booking, supportPayment] = await Promise.all([
    Booking.findOne({ orderId: normalizedOrderId })
      .select("_id paymentStatus")
      .lean(),
    SupportPayment.findOne({ orderId: normalizedOrderId })
      .select("_id paymentStatus")
      .lean(),
  ]);

  return {
    booking,
    supportPayment,
  };
};

const markWebhookReceivedMetadata = async ({ normalizedOrderId, booking, supportPayment, eventName }) => {
  const now = new Date();
  const metadata = {
    webhookReceivedAt: now,
    reconciliationStatus: "queued",
    lastReconciliationAt: now,
    lastReconciliationError: eventName ? `webhook:${eventName}`.slice(0, 200) : "",
  };

  const updates = [];

  if (booking?._id) {
    updates.push(
      Booking.updateOne(
        { orderId: normalizedOrderId },
        {
          $set: metadata,
        }
      )
    );
  }

  if (supportPayment?._id) {
    updates.push(
      SupportPayment.updateOne(
        { orderId: normalizedOrderId },
        {
          $set: metadata,
        }
      )
    );
  }

  if (updates.length) {
    await Promise.all(updates);
  }
};

const handleDuplicateWebhookEventIfNeeded = async ({
  normalizedOrderId,
  eventName,
  paymentId,
  rawBody,
  reqLogger,
  res,
}) => {
  const webhookEventKey = buildWebhookEventKey({
    eventName,
    normalizedOrderId,
    paymentId,
    rawBody,
  });

  let isNewWebhookEvent = true;
  try {
    isNewWebhookEvent = await registerWebhookEventIfNew({
      eventKey: webhookEventKey,
      normalizedOrderId,
      eventName,
      paymentId,
    });
  } catch (dedupeError) {
    reqLogger.warn(
      {
        err: dedupeError,
        orderId: normalizedOrderId,
        eventName,
        paymentId,
      },
      "Webhook dedupe persistence failed; continuing without dedupe guarantee"
    );
  }

  if (isNewWebhookEvent) {
    return false;
  }

  reqLogger.info(
    {
      orderId: normalizedOrderId,
      eventName,
      paymentId,
    },
    "Duplicate Cashfree webhook ignored"
  );

  res.status(200).json({
    success: true,
    message: "Duplicate webhook ignored",
  });
  return true;
};

const validateAndExtractWebhookContext = ({ req, res, reqLogger }) => {
  if (!isDatabaseReady()) {
    res.status(202).json({
      success: true,
      message: "Webhook acknowledged while database is unavailable. Retry will reconcile later.",
    });
    return null;
  }

  if (!CASHFREE_WEBHOOK_SECRET) {
    reqLogger.error("Cashfree webhook secret is missing in environment configuration");
    res.status(503).json({
      success: false,
      message: "Webhook secret is not configured on server",
    });
    return null;
  }

  const rawBody = getWebhookRawBody(req);
  if (rejectWebhookTimestampIfInvalid({ req, res, reqLogger })) {
    return null;
  }

  const signatureValid = isCashfreeWebhookSignatureValid({
    req,
    webhookSecret: CASHFREE_WEBHOOK_SECRET,
    rawBody,
  });

  if (!signatureValid) {
    reqLogger.warn(
      {
        webhookSignature: getWebhookHeaderValue(req, "x-webhook-signature", "x-cf-signature"),
        webhookTimestamp: getWebhookHeaderValue(req, "x-webhook-timestamp", "x-cf-timestamp"),
      },
      "Rejected Cashfree webhook due to invalid signature"
    );

    res.status(401).json({
      success: false,
      message: "Invalid webhook signature",
    });
    return null;
  }

  const payload = parseWebhookPayload(rawBody, req.body);
  if (!payload) {
    res.status(400).json({
      success: false,
      message: "Invalid webhook payload",
    });
    return null;
  }

  const normalizedOrderId = extractWebhookOrderId(payload);
  const eventName = extractWebhookEventName(payload);
  const paymentId = extractWebhookPaymentId(payload);

  if (!normalizedOrderId) {
    reqLogger.warn(
      {
        eventName,
        payloadKeys: Object.keys(payload || {}).slice(0, 12),
      },
      "Cashfree webhook did not include a valid order identifier"
    );

    res.status(202).json({
      success: true,
      message: "Webhook accepted without order identifier",
    });
    return null;
  }

  return {
    rawBody,
    normalizedOrderId,
    eventName,
    paymentId,
  };
};

exports.handleCashfreeWebhook = async (req, res) => {
  const reqLogger = req.log || logger;

  const webhookContext = validateAndExtractWebhookContext({ req, res, reqLogger });
  if (!webhookContext) {
    return;
  }

  const { rawBody, normalizedOrderId, eventName, paymentId } = webhookContext;

  const duplicateHandled = await handleDuplicateWebhookEventIfNeeded({
    normalizedOrderId,
    eventName,
    paymentId,
    rawBody,
    reqLogger,
    res,
  });

  if (duplicateHandled) {
    return;
  }

  try {
    const { booking, supportPayment } = await findWebhookPaymentRecords(normalizedOrderId);

    if (!booking && !supportPayment) {
      reqLogger.warn(
        {
          orderId: normalizedOrderId,
          eventName,
        },
        "Cashfree webhook received for unknown order"
      );

      return res.status(202).json({
        success: true,
        message: "Webhook accepted for unknown order",
      });
    }

    await markWebhookReceivedMetadata({
      normalizedOrderId,
      booking,
      supportPayment,
      eventName,
    });

    const emailDispatchQueued = PAYMENT_EMAIL_NOTIFICATIONS_ENABLED;
    const scheduledTypes = [];

    if (booking) {
      const scheduled = scheduleAsyncReconciliation({
        type: "service",
        normalizedOrderId,
        emailDispatchQueued,
        reqLogger,
      });
      if (scheduled) {
        scheduledTypes.push("service");
      }
    }

    if (supportPayment) {
      const scheduled = scheduleAsyncReconciliation({
        type: "support",
        normalizedOrderId,
        emailDispatchQueued,
        reqLogger,
      });
      if (scheduled) {
        scheduledTypes.push("support");
      }
    }

    reqLogger.info(
      {
        orderId: normalizedOrderId,
        eventName,
        scheduledTypes,
      },
      "Cashfree webhook accepted and reconciliation scheduled"
    );

    return res.status(200).json({
      success: true,
      message: "Webhook processed",
    });
  } catch (error) {
    reqLogger.error(
      {
        err: error,
        orderId: normalizedOrderId,
        eventName,
      },
      "Cashfree webhook processing failed"
    );

    return res.status(500).json({
      success: false,
      message: "Webhook processing failed",
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

  try {
    const { name, email, phone, service, preferredDate, preferredTime, projectBrief } = req.body;
    const { ipAddress, userAgent } = getRequestClientMeta(req);
    const authIdentity = getAuthenticatedIdentity(req);

    if (!authIdentity) {
      return res.status(401).json({
        success: false,
        message: "Please sign in with Google before booking a service.",
      });
    }

    const providedEmail = normalizeEmailAddress(email);
    if (providedEmail && !isMatchingEmail(providedEmail, authIdentity.email)) {
      reqLogger.warn(
        {
          providedEmail,
          authEmail: authIdentity.email,
          userId: authIdentity.userId,
        },
        "Create-order email mismatch ignored in favor of signed-in account email"
      );
    }

    const selectedService = getService(service);

    if (!selectedService) {
      return res.status(400).json({
        success: false,
        message: "Selected service is invalid",
      });
    }

    const config = getCashfreeConfig();

    const serviceSlug = String(service || "").trim();
    const normalizedEmail = authIdentity.email;
    const customerName = toSafeText(name, 80, authIdentity.displayName);
    const orderId = createOrderId();

    const frontendUrl = String(process.env.FRONTEND_URL || "").trim().replace(/\/$/, "");

    const order = await callCashfreeApi({
      method: "POST",
      endpoint: "/pg/orders",
      config,
      requestId: randomUUID(),
      idempotencyKey: randomUUID(),
      body: {
        order_id: orderId,
        order_amount: selectedService.amount,
        order_currency: "INR",
        order_note: `${selectedService.title} booking`,
        customer_details: {
          customer_id: toCustomerId(normalizedEmail),
          customer_name: customerName,
          customer_email: normalizedEmail,
          customer_phone: String(phone || "").trim(),
        },
        order_tags: {
          service_slug: serviceSlug,
          preferred_date: String(preferredDate || "").trim(),
          preferred_time: String(preferredTime || "").trim(),
        },
        ...(frontendUrl
          ? {
              order_meta: {
                return_url: `${frontendUrl}/booknow`,
              },
            }
          : {}),
      },
    });

    try {
      await Booking.findOneAndUpdate(
        { orderId },
        {
          $set: {
            name: customerName,
            email: normalizedEmail,
            userId: authIdentity.userId,
            phone: normalizeIndianPhone(phone),
            serviceSlug,
            service: selectedService.title,
            preferredDate: new Date(preferredDate),
            preferredTime: normalizePreferredTime(preferredTime),
            projectBrief: String(projectBrief || "").trim(),
            amount: selectedService.amount,
            paymentProvider: "cashfree",
            paymentStatus: "created",
            // Keep a unique placeholder to avoid legacy non-sparse paymentId index conflicts.
            paymentId: createPendingPaymentId(orderId),
            reconciliationStatus: "idle",
            reconciliationAttempts: 0,
            lastReconciliationError: "",
            ipAddress,
            userAgent,
            date: new Date(),
          },
          $setOnInsert: {
            orderId,
          },
        },
        {
          new: true,
          upsert: true,
          runValidators: true,
        }
      );
    } catch (dbError) {
      reqLogger.warn(
        {
          err: dbError,
          orderId,
        },
        "Draft booking persistence failed during create-order; continuing with gateway order"
      );
    }

    reqLogger.info(
      {
        orderId,
        userId: authIdentity.userId,
        amount: selectedService.amount,
        service,
        preferredDate,
        preferredTime,
      },
      "Cashfree order created"
    );

    return res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: {
        orderId,
        amount: selectedService.amount,
        currency: "INR",
        paymentSessionId: order.payment_session_id,
        environment: String(process.env.CASHFREE_ENV || "SANDBOX").trim().toLowerCase(),
        serviceTitle: selectedService.title,
      },
    });
  } catch (error) {
    const mapped = mapGatewayError(error, "Unable to create payment order");
    reqLogger[mapped.logLevel](
      {
        err: error,
        paymentCode: error?.code,
        upstreamStatus: error?.statusCode || error?.response?.status,
      },
      "Create order failed"
    );

    return res.status(mapped.status).json({
      success: false,
      message: mapped.message,
    });
  }
};

exports.verifyPayment = async (req, res) => {
  const reqLogger = req.log || logger;
  const emailDispatchQueued = PAYMENT_EMAIL_NOTIFICATIONS_ENABLED;

  if (!isDatabaseReady()) {
    return res.status(503).json({
      success: false,
      message: "Database is temporarily unavailable. Please retry in a moment.",
    });
  }

  const verifyContext = buildVerifyRequestContext({
    req,
    res,
    requireAuthMessage: "Please sign in with Google before verifying payment.",
    emailMismatchMessage: "Verification email must match your signed-in Google account.",
  });
  if (!verifyContext) {
    return;
  }

  const { authIdentity, normalizedOrderId, normalizedEmail } = verifyContext;
  let gatewayOrderStatusAtFailure = "";
  let bookingInsertBaseAtFailure = null;
  let lastDraftBooking = null;

  try {
    const { ipAddress, userAgent } = getRequestClientMeta(req);
    const draftBooking = await Booking.findOne({ orderId: normalizedOrderId });
    lastDraftBooking = draftBooking;

    const ownershipMismatchMessage = getOwnershipMismatchMessage({
      record: draftBooking,
      authIdentity,
      normalizedEmail,
      accountMismatchMessage: "This booking belongs to a different signed-in account.",
      detailsMismatchMessage: "Verification details do not match this order.",
    });

    if (ownershipMismatchMessage) {
      return res.status(403).json({
        success: false,
        message: ownershipMismatchMessage,
      });
    }

    if (draftBooking?.paymentStatus === "paid") {
      queueServiceEmailIfConfigured({
        emailDispatchQueued,
        bookingId: draftBooking._id,
        reqLogger,
      });

      return sendServiceVerificationSuccess({
        res,
        message: "Payment already verified",
        booking: draftBooking,
        orderId: normalizedOrderId,
        paymentId: draftBooking.paymentId,
        emailDispatchQueued,
      });
    }

    if (
      await tryHandleAsyncServiceVerification({
        draftBooking,
        normalizedOrderId,
        emailDispatchQueued,
        reqLogger,
        res,
      })
    ) {
      return;
    }

    const config = getCashfreeConfig();

    const cashfreeOrder = await callCashfreeApi({
      method: "GET",
      endpoint: `/pg/orders/${encodeURIComponent(normalizedOrderId)}`,
      config,
    });

    const verificationContext = buildBookingVerificationContext({
      draftBooking,
      cashfreeOrder,
      normalizedEmail,
      normalizedOrderId,
      ipAddress,
      userAgent,
      reqLogger,
    });

    if (verificationContext.error) {
      return res.status(verificationContext.error.status).json({
        success: false,
        message: verificationContext.error.message,
      });
    }

    const { bookingInsertBase, gatewayOrderStatus } = verificationContext;
    bookingInsertBase.userId = draftBooking?.userId || authIdentity.userId;
    bookingInsertBase.email = normalizedEmail;
    gatewayOrderStatusAtFailure = gatewayOrderStatus;
    bookingInsertBaseAtFailure = bookingInsertBase;

    await upsertServiceVerificationDraft({
      normalizedOrderId,
      bookingInsertBase,
      gatewayOrderStatus,
    });

    const paymentList = await fetchOrderPaymentsWithPaidFallback({
      config,
      normalizedOrderId,
      gatewayOrderStatus,
      reqLogger,
      fallbackLogMessage:
        "Service payment list fetch failed for paid order; continuing with gateway-paid fallback",
    });

    const successfulPayment =
      findSuccessfulPayment(paymentList) ||
      findGatewayPaidFallbackPayment(paymentList, gatewayOrderStatus, normalizedOrderId);

    if (!successfulPayment) {
      const failedPayment = findFailedPayment(paymentList);
      const nextStatus = resolvePendingVerificationStatus({
        failedPayment,
        gatewayOrderStatus,
      });

      await persistServicePendingStatusSafely({
        normalizedOrderId,
        bookingInsertBase,
        nextStatus,
        reqLogger,
      });

      reqLogger.warn(
        {
          orderId: normalizedOrderId,
          gatewayOrderStatus,
          paymentListSummary: summarizePaymentListForLogs(paymentList),
        },
        "Service payment verification pending because no successful payment marker was found"
      );

      return res.status(409).json({
        success: false,
        message: resolvePendingVerificationMessage({
          failedPayment,
          gatewayOrderStatus,
          failedMessage: "Payment was not completed. If amount was deducted, gateway will auto-reconcile.",
        }),
      });
    }

    const booking = await Booking.findOneAndUpdate(
      { orderId: normalizedOrderId },
      {
        $set: {
          paymentStatus: "paid",
          paymentId: resolveGatewayPaymentId(successfulPayment, normalizedOrderId),
          paymentProvider: "cashfree",
          paidAt: new Date(),
        },
        $setOnInsert: bookingInsertBase,
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    );

    reqLogger.info(
      {
        bookingId: booking._id,
        paymentId: booking.paymentId,
        service: booking.service,
      },
      "Payment verified and booking saved"
    );

    queueServiceEmailIfConfigured({
      emailDispatchQueued,
      bookingId: booking._id,
      reqLogger,
    });

    return sendServiceVerificationSuccess({
      res,
      message: "Payment verified and booking confirmed",
      booking,
      orderId: normalizedOrderId,
      paymentId: booking.paymentId,
      emailDispatchQueued,
    });
  } catch (error) {
    const rescuedBooking = await tryRescueServicePaidBooking({
      gatewayOrderStatusAtFailure,
      normalizedOrderId,
      lastDraftBooking,
      error,
      bookingInsertBaseAtFailure,
      reqLogger,
    });

    if (rescuedBooking) {
      queueServiceEmailIfConfigured({
        emailDispatchQueued,
        bookingId: rescuedBooking._id,
        reqLogger,
      });

      return sendServiceVerificationSuccess({
        res,
        message: "Payment verified and booking confirmed",
        booking: rescuedBooking,
        orderId: normalizedOrderId,
        paymentId: rescuedBooking.paymentId,
        emailDispatchQueued,
      });
    }

    const mapped = mapGatewayError(error, "Unable to verify payment");
    reqLogger[mapped.logLevel](
      {
        err: error,
        paymentCode: error?.code,
        upstreamStatus: error?.statusCode || error?.response?.status,
      },
      "Payment verification failed"
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

  try {
    const { name, email, phone, amount, message } = req.body;
    const { ipAddress, userAgent } = getRequestClientMeta(req);
    const authIdentity = getAuthenticatedIdentity(req);
    if (!authIdentity) {
      return res.status(401).json({
        success: false,
        message: "Please sign in with Google before creating a support payment.",
      });
    }

    const providedEmail = normalizeEmailAddress(email);
    if (providedEmail && !isMatchingEmail(providedEmail, authIdentity.email)) {
      reqLogger.warn(
        {
          providedEmail,
          authEmail: authIdentity.email,
          userId: authIdentity.userId,
        },
        "Create-support-order email mismatch ignored in favor of signed-in account email"
      );
    }

    const normalizedEmail = authIdentity.email;
    const contributorName = toSafeText(name, 80, authIdentity.displayName);
    const normalizedAmount = Number.parseInt(amount, 10);

    if (!Number.isFinite(normalizedAmount) || normalizedAmount < 1 || normalizedAmount > 100000) {
      return res.status(400).json({
        success: false,
        message: "Support amount is invalid",
      });
    }

    const orderId = createOrderId();
    const config = getCashfreeConfig();
    const frontendUrl = String(process.env.FRONTEND_URL || "").trim().replace(/\/$/, "");

    const order = await callCashfreeApi({
      method: "POST",
      endpoint: "/pg/orders",
      config,
      requestId: randomUUID(),
      idempotencyKey: randomUUID(),
      body: {
        order_id: orderId,
        order_amount: normalizedAmount,
        order_currency: "INR",
        order_note: "Direct support contribution",
        customer_details: {
          customer_id: toCustomerId(normalizedEmail),
          customer_name: contributorName,
          customer_email: normalizedEmail,
          customer_phone: normalizeIndianPhone(phone),
        },
        order_tags: {
          support_type: "direct_support",
          contributor_note: String(message || "").trim().slice(0, 120),
        },
        ...(frontendUrl
          ? {
              order_meta: {
                return_url: `${frontendUrl}/support`,
              },
            }
          : {}),
      },
    });

    try {
      await SupportPayment.findOneAndUpdate(
        { orderId },
        {
          $set: {
            contributorName,
            email: normalizedEmail,
            userId: authIdentity.userId,
            phone: normalizeIndianPhone(phone),
            amount: normalizedAmount,
            message: String(message || "").trim(),
            paymentStatus: "created",
            paymentProvider: "cashfree",
            paymentId: createPendingPaymentId(orderId),
            reconciliationStatus: "idle",
            reconciliationAttempts: 0,
            lastReconciliationError: "",
            ipAddress,
            userAgent,
          },
          $setOnInsert: {
            orderId,
          },
        },
        {
          upsert: true,
          runValidators: true,
        }
      );
    } catch (dbError) {
      reqLogger.warn(
        {
          err: dbError,
          orderId,
        },
        "Support draft persistence failed during create-support-order; continuing with gateway order"
      );
    }

    reqLogger.info(
      {
        orderId,
        userId: authIdentity.userId,
        amount: normalizedAmount,
      },
      "Support order created"
    );

    return res.status(201).json({
      success: true,
      message: "Support order created successfully",
      data: {
        orderId,
        amount: normalizedAmount,
        currency: "INR",
        paymentSessionId: order.payment_session_id,
        environment: String(process.env.CASHFREE_ENV || "SANDBOX").trim().toLowerCase(),
        purpose: "Support Jar",
      },
    });
  } catch (error) {
    const mapped = mapGatewayError(error, "Unable to create support order");
    reqLogger[mapped.logLevel](
      {
        err: error,
        paymentCode: error?.code,
        upstreamStatus: error?.statusCode || error?.response?.status,
      },
      "Create support order failed"
    );

    return res.status(mapped.status).json({
      success: false,
      message: mapped.message,
    });
  }
};

exports.verifySupportPayment = async (req, res) => {
  const reqLogger = req.log || logger;
  const emailDispatchQueued = PAYMENT_EMAIL_NOTIFICATIONS_ENABLED;
  const verifyContext = buildVerifyRequestContext({
    req,
    res,
    requireAuthMessage: "Please sign in with Google before verifying support payment.",
    emailMismatchMessage: "Verification email must match your signed-in Google account.",
  });
  if (!verifyContext) {
    return;
  }

  const { authIdentity, normalizedOrderId, normalizedEmail } = verifyContext;
  let gatewayOrderStatusAtFailure = "";
  let supportInsertBaseAtFailure = null;
  let lastSupportRecord = null;
  let lastContributorName = "Supporter";
  let lastOrderAmount = 0;

  if (!isDatabaseReady()) {
    return res.status(503).json({
      success: false,
      message: "Database is temporarily unavailable. Please retry in a moment.",
    });
  }

  try {
    const { ipAddress, userAgent } = getRequestClientMeta(req);
    const config = getCashfreeConfig();
    const supportRecord = await SupportPayment.findOne({ orderId: normalizedOrderId });
    lastSupportRecord = supportRecord;

    const ownershipMismatchMessage = getOwnershipMismatchMessage({
      record: supportRecord,
      authIdentity,
      normalizedEmail,
      accountMismatchMessage: "This support payment belongs to a different signed-in account.",
      detailsMismatchMessage: "Verification details do not match this support order.",
    });

    if (ownershipMismatchMessage) {
      return res.status(403).json({
        success: false,
        message: ownershipMismatchMessage,
      });
    }

    if (supportRecord?.paymentStatus === "paid") {
      queueSupportEmailIfConfigured({
        emailDispatchQueued,
        supportPaymentId: supportRecord._id,
        reqLogger,
      });

      return sendSupportVerificationSuccess({
        res,
        message: "Support payment already verified",
        orderId: normalizedOrderId,
        amount: supportRecord.amount,
        contributorName: supportRecord.contributorName,
        paymentId: supportRecord.paymentId,
        emailDispatchQueued,
      });
    }

    if (
      await tryHandleAsyncSupportVerification({
        supportRecord,
        normalizedOrderId,
        emailDispatchQueued,
        reqLogger,
        res,
      })
    ) {
      return;
    }

    const cashfreeOrder = await callCashfreeApi({
      method: "GET",
      endpoint: `/pg/orders/${encodeURIComponent(normalizedOrderId)}`,
      config,
    });

    const verificationContext = buildSupportVerificationContext({
      supportRecord,
      cashfreeOrder,
      normalizedEmail,
      normalizedOrderId,
      ipAddress,
      userAgent,
    });

    if (verificationContext.error) {
      return res.status(verificationContext.error.status).json({
        success: false,
        message: verificationContext.error.message,
      });
    }

    const { contributorName, orderAmount, supportInsertBase, gatewayOrderStatus } = verificationContext;
    supportInsertBase.userId = supportRecord?.userId || authIdentity.userId;
    supportInsertBase.email = normalizedEmail;
    gatewayOrderStatusAtFailure = gatewayOrderStatus;
    supportInsertBaseAtFailure = supportInsertBase;
    lastContributorName = contributorName;
    lastOrderAmount = orderAmount;

    const paymentList = await fetchOrderPaymentsWithPaidFallback({
      config,
      normalizedOrderId,
      gatewayOrderStatus,
      reqLogger,
      fallbackLogMessage:
        "Support payment list fetch failed for paid order; continuing with gateway-paid fallback",
    });

    const successfulPayment =
      findSuccessfulPayment(paymentList) ||
      findGatewayPaidFallbackPayment(paymentList, gatewayOrderStatus, normalizedOrderId);

    if (!successfulPayment) {
      const failedPayment = findFailedPayment(paymentList);
      const nextStatus = resolvePendingVerificationStatus({
        failedPayment,
        gatewayOrderStatus,
      });

      await persistSupportPendingStatusSafely({
        normalizedOrderId,
        supportInsertBase,
        nextStatus,
        reqLogger,
      });

      reqLogger.warn(
        {
          orderId: normalizedOrderId,
          gatewayOrderStatus,
          paymentListSummary: summarizePaymentListForLogs(paymentList),
        },
        "Support payment verification pending because no successful payment marker was found"
      );

      return res.status(409).json({
        success: false,
        message: resolvePendingVerificationMessage({
          failedPayment,
          gatewayOrderStatus,
          failedMessage:
            "Payment was not completed. If amount was deducted, it will be auto-reconciled by gateway.",
        }),
      });
    }

    const resolvedPaymentId = resolveGatewayPaymentId(successfulPayment, normalizedOrderId);

    const conflictingPayment = await findSupportPaymentConflict({
      normalizedOrderId,
      resolvedPaymentId,
    });

    if (conflictingPayment) {
      reqLogger.warn(
        {
          orderId: normalizedOrderId,
          paymentId: resolvedPaymentId,
          conflictingOrderId: conflictingPayment.orderId,
          conflictingStatus: conflictingPayment.paymentStatus,
        },
        "Support payment verification rejected due to payment-id conflict"
      );

      return res.status(409).json({
        success: false,
        message: "Payment confirmation is still reconciling. Please retry with the same email in a moment.",
      });
    }

    const { resolvedOrderId: supportInsertOrderId, mutableFields: supportMutableFields } =
      splitOrderIdFromUpsertFields(supportInsertBase, normalizedOrderId);

    const savedSupportPayment = await SupportPayment.findOneAndUpdate(
      { orderId: normalizedOrderId },
      {
        $set: {
          ...supportMutableFields,
          paymentStatus: "paid",
          paymentProvider: "cashfree",
          paymentId: resolvedPaymentId,
          paidAt: new Date(),
        },
        $setOnInsert: {
          orderId: supportInsertOrderId || normalizedOrderId,
          ...supportMutableFields,
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    );

    reqLogger.info(
      {
        orderId: normalizedOrderId,
        amount: orderAmount,
        paymentId: resolvedPaymentId,
      },
      "Support payment verified"
    );

    queueSupportEmailIfConfigured({
      emailDispatchQueued,
      supportPaymentId: savedSupportPayment?._id,
      reqLogger,
    });

    return sendSupportVerificationSuccess({
      res,
      message: "Support payment verified",
      orderId: normalizedOrderId,
      amount: orderAmount,
      contributorName,
      paymentId: resolvedPaymentId,
      emailDispatchQueued,
    });
  } catch (error) {
    const rescuedSupportPayment = await tryRescueSupportPaidPayment({
      gatewayOrderStatusAtFailure,
      normalizedOrderId,
      lastSupportRecord,
      error,
      supportInsertBaseAtFailure,
      reqLogger,
    });

    if (rescuedSupportPayment) {
      queueSupportEmailIfConfigured({
        emailDispatchQueued,
        supportPaymentId: rescuedSupportPayment._id,
        reqLogger,
      });

      return sendSupportVerificationSuccess({
        res,
        message: "Support payment verified",
        orderId: normalizedOrderId,
        amount: rescuedSupportPayment.amount || lastOrderAmount,
        contributorName: rescuedSupportPayment.contributorName || lastContributorName,
        paymentId: rescuedSupportPayment.paymentId,
        emailDispatchQueued,
      });
    }

    const mapped = mapGatewayError(error, "Unable to verify support payment");
    reqLogger[mapped.logLevel](
      {
        err: error,
        orderId: normalizedOrderId,
        email: normalizedEmail,
        paymentCode: error?.code,
        errorName: error?.name,
        mongoCode: error?.code,
        upstreamStatus: error?.statusCode || error?.response?.status,
      },
      "Support payment verification failed"
    );

    return res.status(mapped.status).json({
      success: false,
      message: mapped.message,
    });
  }
};

const handlePaymentStatusRequest = async ({ req, res, reqLogger }) => {
  const statusRequestContext = buildPaymentStatusRequestContext({ req, res });
  if (!statusRequestContext) {
    return;
  }

  const { authIdentity, normalizedOrderId } = statusRequestContext;

  if (!isDatabaseReady()) {
    return res.status(503).json({
      success: false,
      message: "Database is temporarily unavailable. Please retry in a moment.",
    });
  }

  try {
    const [booking, supportPayment] = await Promise.all([
      Booking.findOne({ orderId: normalizedOrderId }).lean(),
      SupportPayment.findOne({ orderId: normalizedOrderId }).lean(),
    ]);

    if (!booking && !supportPayment) {
      return res.status(404).json({
        success: false,
        message: "Payment order not found",
      });
    }

    if (
      !ensureStatusOwnership({
        record: booking,
        authIdentity,
        res,
        accountMismatchMessage: "This booking belongs to a different signed-in account.",
        detailsMismatchMessage: "Status access is not allowed for this account.",
      })
    ) {
      return;
    }

    if (
      !ensureStatusOwnership({
        record: supportPayment,
        authIdentity,
        res,
        accountMismatchMessage: "This support payment belongs to a different signed-in account.",
        detailsMismatchMessage: "Status access is not allowed for this account.",
      })
    ) {
      return;
    }

    const { type, record } = resolvePaymentStatusRecord({
      booking,
      supportPayment,
    });

    const statusRecord = await reconcileStatusRecordOnDemand({
      type,
      normalizedOrderId,
      record,
      reqLogger,
    });
    const statusData = buildPaymentStatusData({
      type,
      record: statusRecord,
    });

    if (type === "service") {
      statusData.bookingId = String(statusRecord?._id || "").trim();
      statusData.service = String(statusRecord?.service || "").trim();
      statusData.serviceSlug = String(statusRecord?.serviceSlug || "").trim();
    } else {
      statusData.supportPaymentId = String(statusRecord?._id || "").trim();
      statusData.contributorName = String(statusRecord?.contributorName || "Supporter").trim();
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
        orderId: normalizedOrderId,
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

exports.getPaymentStatus = async (req, res) => {
  return handlePaymentStatusRequest({
    req,
    res,
    reqLogger: req.log || logger,
  });
};

exports.getMyBookings = async (req, res) => {
  const reqLogger = req.log || logger;
  const authIdentity = getAuthenticatedIdentity(req);

  if (!authIdentity) {
    return res.status(401).json({
      success: false,
      message: "Please sign in first",
    });
  }

  if (!isDatabaseReady()) {
    return res.status(503).json({
      success: false,
      message: "Database is temporarily unavailable. Please retry in a moment.",
    });
  }

  try {
    await Booking.updateMany(
      {
        userId: null,
        email: authIdentity.email,
      },
      {
        $set: {
          userId: authIdentity.userId,
        },
      }
    );

    const bookings = await Booking.find({
      $or: [
        { userId: authIdentity.userId },
        { userId: null, email: authIdentity.email },
      ],
    })
      .select(
        "_id orderId paymentId paymentStatus paymentProvider service serviceSlug amount preferredDate preferredTime paidAt createdAt updatedAt verificationAcceptedAt reconciliationStatus reconciliationAttempts lastReconciliationAt lastReconciliationError"
      )
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      message: "Bookings fetched successfully",
      data: {
        items: (bookings || []).map((booking) => ({
          id: String(booking._id),
          orderId: booking.orderId,
          paymentId: booking.paymentId,
          paymentStatus: booking.paymentStatus,
          paymentProvider: booking.paymentProvider,
          service: booking.service,
          serviceSlug: booking.serviceSlug,
          amount: booking.amount,
          preferredDate: booking.preferredDate,
          preferredTime: booking.preferredTime,
          paidAt: booking.paidAt,
          createdAt: booking.createdAt,
          updatedAt: booking.updatedAt,
          verificationAcceptedAt: booking.verificationAcceptedAt,
          reconciliationStatus: booking.reconciliationStatus,
          reconciliationAttempts: booking.reconciliationAttempts,
          lastReconciliationAt: booking.lastReconciliationAt,
          lastReconciliationError: booking.lastReconciliationError,
        })),
      },
    });
  } catch (error) {
    reqLogger.error(
      {
        err: error,
        userId: authIdentity.userId,
      },
      "Failed to fetch user bookings"
    );

    return res.status(500).json({
      success: false,
      message: "Unable to load your booking activity right now.",
    });
  }
};

exports.getMySupportPayments = async (req, res) => {
  const reqLogger = req.log || logger;
  const authIdentity = getAuthenticatedIdentity(req);

  if (!authIdentity) {
    return res.status(401).json({
      success: false,
      message: "Please sign in first",
    });
  }

  if (!isDatabaseReady()) {
    return res.status(503).json({
      success: false,
      message: "Database is temporarily unavailable. Please retry in a moment.",
    });
  }

  try {
    await SupportPayment.updateMany(
      {
        userId: null,
        email: authIdentity.email,
      },
      {
        $set: {
          userId: authIdentity.userId,
        },
      }
    );

    const supportPayments = await SupportPayment.find({
      $or: [
        { userId: authIdentity.userId },
        { userId: null, email: authIdentity.email },
      ],
    })
      .select(
        "_id orderId paymentId paymentStatus paymentProvider contributorName amount message paidAt createdAt updatedAt verificationAcceptedAt reconciliationStatus reconciliationAttempts lastReconciliationAt lastReconciliationError"
      )
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      message: "Support payments fetched successfully",
      data: {
        items: (supportPayments || []).map((item) => ({
          id: String(item._id),
          orderId: item.orderId,
          paymentId: item.paymentId,
          paymentStatus: item.paymentStatus,
          paymentProvider: item.paymentProvider,
          contributorName: item.contributorName,
          amount: item.amount,
          message: item.message,
          paidAt: item.paidAt,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
          verificationAcceptedAt: item.verificationAcceptedAt,
          reconciliationStatus: item.reconciliationStatus,
          reconciliationAttempts: item.reconciliationAttempts,
          lastReconciliationAt: item.lastReconciliationAt,
          lastReconciliationError: item.lastReconciliationError,
        })),
      },
    });
  } catch (error) {
    reqLogger.error(
      {
        err: error,
        userId: authIdentity.userId,
      },
      "Failed to fetch user support payments"
    );

    return res.status(500).json({
      success: false,
      message: "Unable to load your support activity right now.",
    });
  }
};

exports.downloadServiceReceipt = async (req, res) => {
  const reqLogger = req.log || logger;
  const receiptContext = buildReceiptRequestContext({
    req,
    res,
    requireAuthMessage: "Please sign in with Google before downloading service receipts.",
    emailMismatchMessage: "Receipt email must match your signed-in Google account.",
  });
  if (!receiptContext) {
    return;
  }

  const { authIdentity, normalizedOrderId, normalizedEmail } = receiptContext;

  if (!isDatabaseReady()) {
    return res.status(503).json({
      success: false,
      message: "Database is temporarily unavailable. Please retry in a moment.",
    });
  }

  try {
    const booking = await Booking.findOne({ orderId: normalizedOrderId }).lean();

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found for receipt download",
      });
    }

    const ownershipMismatchMessage = getOwnershipMismatchMessage({
      record: booking,
      authIdentity,
      normalizedEmail,
      accountMismatchMessage: "This receipt belongs to a different signed-in account.",
      detailsMismatchMessage: "Receipt access is not allowed for this account.",
    });

    if (ownershipMismatchMessage) {
      return res.status(403).json({
        success: false,
        message: ownershipMismatchMessage,
      });
    }

    if (booking.paymentStatus !== "paid") {
      return res.status(409).json({
        success: false,
        message: "Receipt is available only after payment confirmation",
      });
    }

    const attachment = await generateServiceConfirmationPdf({ booking });
    const contentBase64 = String(attachment?.contentBase64 || "").trim();

    if (!contentBase64) {
      return res.status(503).json({
        success: false,
        message: "Unable to generate service confirmation PDF right now",
      });
    }

    const filename = String(attachment?.name || `service-confirmation-${normalizedOrderId}.pdf`);
    const buffer = Buffer.from(contentBase64, "base64");

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Cache-Control", "private, no-store");
    res.setHeader("Pragma", "no-cache");

    return res.status(200).send(buffer);
  } catch (error) {
    reqLogger.error(
      {
        err: error,
        orderId: normalizedOrderId,
      },
      "Service receipt download failed"
    );

    return res.status(503).json({
      success: false,
      message: "Unable to generate service confirmation PDF. Please retry in a moment.",
    });
  }
};

exports.downloadSupportReceipt = async (req, res) => {
  const reqLogger = req.log || logger;
  const receiptContext = buildReceiptRequestContext({
    req,
    res,
    requireAuthMessage: "Please sign in with Google before downloading support receipts.",
    emailMismatchMessage: "Receipt email must match your signed-in Google account.",
  });
  if (!receiptContext) {
    return;
  }

  const { authIdentity, normalizedOrderId, normalizedEmail } = receiptContext;

  if (!isDatabaseReady()) {
    return res.status(503).json({
      success: false,
      message: "Database is temporarily unavailable. Please retry in a moment.",
    });
  }

  try {
    const supportPayment = await SupportPayment.findOne({ orderId: normalizedOrderId }).lean();

    if (!supportPayment) {
      return res.status(404).json({
        success: false,
        message: "Support receipt not found",
      });
    }

    const ownershipMismatchMessage = getOwnershipMismatchMessage({
      record: supportPayment,
      authIdentity,
      normalizedEmail,
      accountMismatchMessage: "This receipt belongs to a different signed-in account.",
      detailsMismatchMessage: "Receipt access is not allowed for this account.",
    });

    if (ownershipMismatchMessage) {
      return res.status(403).json({
        success: false,
        message: ownershipMismatchMessage,
      });
    }

    if (supportPayment.paymentStatus !== "paid") {
      return res.status(409).json({
        success: false,
        message: "Receipt is available only after payment confirmation",
      });
    }

    const attachment = await generateSupportReceiptPdf({ supportPayment });
    const contentBase64 = String(attachment?.contentBase64 || "").trim();

    if (!contentBase64) {
      return res.status(503).json({
        success: false,
        message: "Unable to generate support receipt PDF right now",
      });
    }

    const filename = String(attachment?.name || `support-receipt-${normalizedOrderId}.pdf`);
    const buffer = Buffer.from(contentBase64, "base64");

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Cache-Control", "private, no-store");
    res.setHeader("Pragma", "no-cache");

    return res.status(200).send(buffer);
  } catch (error) {
    reqLogger.error(
      {
        err: error,
        orderId: normalizedOrderId,
      },
      "Support receipt download failed"
    );

    return res.status(503).json({
      success: false,
      message: "Unable to generate support receipt PDF. Please retry in a moment.",
    });
  }
};

exports.downloadServiceReceiptImage = async (req, res) => {
  const reqLogger = req.log || logger;
  const receiptContext = buildReceiptRequestContext({
    req,
    res,
    requireAuthMessage: "Please sign in with Google before downloading service receipts.",
    emailMismatchMessage: "Receipt email must match your signed-in Google account.",
  });
  if (!receiptContext) {
    return;
  }

  const { authIdentity, normalizedOrderId, normalizedEmail } = receiptContext;

  if (!isDatabaseReady()) {
    return res.status(503).json({
      success: false,
      message: "Database is temporarily unavailable. Please retry in a moment.",
    });
  }

  try {
    const booking = await Booking.findOne({ orderId: normalizedOrderId }).lean();

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found for receipt download",
      });
    }

    const ownershipMismatchMessage = getOwnershipMismatchMessage({
      record: booking,
      authIdentity,
      normalizedEmail,
      accountMismatchMessage: "This receipt belongs to a different signed-in account.",
      detailsMismatchMessage: "Receipt access is not allowed for this account.",
    });

    if (ownershipMismatchMessage) {
      return res.status(403).json({
        success: false,
        message: ownershipMismatchMessage,
      });
    }

    if (booking.paymentStatus !== "paid") {
      return res.status(409).json({
        success: false,
        message: "Receipt is available only after payment confirmation",
      });
    }

    const attachment = await generateServiceConfirmationImage({ booking });
    const contentBase64 = String(attachment?.contentBase64 || "").trim();

    if (!contentBase64) {
      return res.status(503).json({
        success: false,
        message: "Unable to generate service confirmation image right now",
      });
    }

    const filename = String(attachment?.name || `service-confirmation-${normalizedOrderId}.svg`);
    const buffer = Buffer.from(contentBase64, "base64");

    res.setHeader("Content-Type", "image/svg+xml");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Cache-Control", "private, no-store");
    res.setHeader("Pragma", "no-cache");

    return res.status(200).send(buffer);
  } catch (error) {
    reqLogger.error(
      {
        err: error,
        orderId: normalizedOrderId,
      },
      "Service receipt image download failed"
    );

    return res.status(503).json({
      success: false,
      message: "Unable to generate service confirmation image. Please retry in a moment.",
    });
  }
};

exports.downloadSupportReceiptImage = async (req, res) => {
  const reqLogger = req.log || logger;
  const receiptContext = buildReceiptRequestContext({
    req,
    res,
    requireAuthMessage: "Please sign in with Google before downloading support receipts.",
    emailMismatchMessage: "Receipt email must match your signed-in Google account.",
  });
  if (!receiptContext) {
    return;
  }

  const { authIdentity, normalizedOrderId, normalizedEmail } = receiptContext;

  if (!isDatabaseReady()) {
    return res.status(503).json({
      success: false,
      message: "Database is temporarily unavailable. Please retry in a moment.",
    });
  }

  try {
    const supportPayment = await SupportPayment.findOne({ orderId: normalizedOrderId }).lean();

    if (!supportPayment) {
      return res.status(404).json({
        success: false,
        message: "Support receipt not found",
      });
    }

    const ownershipMismatchMessage = getOwnershipMismatchMessage({
      record: supportPayment,
      authIdentity,
      normalizedEmail,
      accountMismatchMessage: "This receipt belongs to a different signed-in account.",
      detailsMismatchMessage: "Receipt access is not allowed for this account.",
    });

    if (ownershipMismatchMessage) {
      return res.status(403).json({
        success: false,
        message: ownershipMismatchMessage,
      });
    }

    if (supportPayment.paymentStatus !== "paid") {
      return res.status(409).json({
        success: false,
        message: "Receipt is available only after payment confirmation",
      });
    }

    const attachment = await generateSupportReceiptImage({ supportPayment });
    const contentBase64 = String(attachment?.contentBase64 || "").trim();

    if (!contentBase64) {
      return res.status(503).json({
        success: false,
        message: "Unable to generate support receipt image right now",
      });
    }

    const filename = String(attachment?.name || `support-receipt-${normalizedOrderId}.svg`);
    const buffer = Buffer.from(contentBase64, "base64");

    res.setHeader("Content-Type", "image/svg+xml");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Cache-Control", "private, no-store");
    res.setHeader("Pragma", "no-cache");

    return res.status(200).send(buffer);
  } catch (error) {
    reqLogger.error(
      {
        err: error,
        orderId: normalizedOrderId,
      },
      "Support receipt image download failed"
    );

    return res.status(503).json({
      success: false,
      message: "Unable to generate support receipt image. Please retry in a moment.",
    });
  }
};
