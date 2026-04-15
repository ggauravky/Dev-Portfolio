const { createHmac, randomUUID, timingSafeEqual } = require("node:crypto");

const CASHFREE_API_VERSION = String(process.env.CASHFREE_API_VERSION || "2023-08-01").trim();
const CASHFREE_TIMEOUT_MS = Number.parseInt(process.env.CASHFREE_TIMEOUT_MS, 10) || 12000;
const CASHFREE_WEBHOOK_TIMESTAMP_MAX_SKEW_MS =
  Number.parseInt(process.env.CASHFREE_WEBHOOK_TIMESTAMP_MAX_SKEW_MS, 10) || 5 * 60 * 1000;
const CASHFREE_WEBHOOK_REQUIRE_TIMESTAMP =
  String(process.env.CASHFREE_WEBHOOK_REQUIRE_TIMESTAMP || "true").trim().toLowerCase() === "true";

let cachedFetch = typeof globalThis.fetch === "function" ? globalThis.fetch : null;

const normalizeText = (value, maxLength = 200) =>
  String(value || "")
    .trim()
    .slice(0, maxLength);

const normalizeToken = (value) =>
  normalizeText(value)
    .toLowerCase()
    .replaceAll(/[\s-]+/g, "_");

const getCashfreeBaseUrl = () => {
  const mode = normalizeText(process.env.CASHFREE_ENV || "SANDBOX").toUpperCase();
  return mode === "PRODUCTION" ? "https://api.cashfree.com" : "https://sandbox.cashfree.com";
};

const getCashfreeEnvironment = () =>
  normalizeText(process.env.CASHFREE_ENV || "SANDBOX").toLowerCase();

const getCashfreeConfig = () => {
  const appId = normalizeText(process.env.CASHFREE_APP_ID);
  const secretKey = normalizeText(process.env.CASHFREE_SECRET_KEY);

  if (!appId || !secretKey) {
    const error = new Error("Cashfree credentials are missing");
    error.code = "PAYMENT_CONFIG_MISSING";
    throw error;
  }

  return {
    appId,
    secretKey,
    baseUrl: getCashfreeBaseUrl(),
  };
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
    const unavailableError = new Error("No fetch implementation available for Cashfree API");
    unavailableError.code = "PAYMENT_FETCH_UNAVAILABLE";
    unavailableError.cause = error;
    throw unavailableError;
  }

  const unavailableError = new Error("No fetch implementation available for Cashfree API");
  unavailableError.code = "PAYMENT_FETCH_UNAVAILABLE";
  throw unavailableError;
};

const callCashfreeApi = async ({ method, endpoint, body, requestId, idempotencyKey }) => {
  const config = getCashfreeConfig();
  const fetchClient = await getFetchClient();

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), CASHFREE_TIMEOUT_MS);

  const normalizedMethod = normalizeText(method || "GET").toUpperCase();
  const headers = {
    "Content-Type": "application/json",
    "x-api-version": CASHFREE_API_VERSION,
    "x-client-id": config.appId,
    "x-client-secret": config.secretKey,
    "x-request-id": normalizeText(requestId || randomUUID(), 120),
  };

  if (
    idempotencyKey &&
    ["POST", "PUT", "PATCH", "DELETE"].includes(normalizedMethod)
  ) {
    headers["x-idempotency-key"] = normalizeText(idempotencyKey, 160);
  }

  try {
    const response = await fetchClient(`${config.baseUrl}${endpoint}`, {
      method: normalizedMethod,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    let payload = null;
    try {
      payload = await response.json();
    } catch {
      payload = null;
    }

    if (!response.ok) {
      const error = new Error(
        payload?.message || payload?.error_description || `Cashfree API error: ${response.status}`
      );
      error.statusCode = response.status;
      error.response = payload;
      throw error;
    }

    return payload;
  } finally {
    clearTimeout(timeout);
  }
};

const toPaymentArray = (value) => {
  if (Array.isArray(value)) {
    return value;
  }

  if (!value || typeof value !== "object") {
    return [];
  }

  const candidates = [
    value.payments,
    value.items,
    value.data,
    value.data?.payments,
    value.data?.items,
    value.results,
    value.payment_list,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate;
    }
  }

  const keys = Object.keys(value || {});
  const isPaymentLike = ["payment_status", "status", "cf_payment_id", "payment_id"].some((key) =>
    keys.includes(key)
  );

  return isPaymentLike ? [value] : [];
};

const isSuccessToken = (token) =>
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

const isFailureToken = (token) =>
  [
    "failed",
    "cancelled",
    "canceled",
    "declined",
    "rejected",
    "expired",
    "voided",
    "charge_failed",
    "user_dropped",
  ].includes(token);

const extractGatewayPaymentStatusToken = (payment) =>
  normalizeToken(
    payment?.payment_status ||
      payment?.paymentStatus ||
      payment?.status ||
      payment?.payment_details?.payment_status ||
      payment?.payment_details?.status ||
      ""
  );

const normalizeGatewayOrderStatus = (value) => {
  const token = normalizeToken(value);

  if (isSuccessToken(token)) {
    return "paid";
  }

  if (isFailureToken(token)) {
    return "failed";
  }

  if (["pending", "active", "processing", "in_progress", "created", "initiated"].includes(token)) {
    return "pending";
  }

  return "pending";
};

const resolveGatewayPaymentId = (payment, orderId) =>
  normalizeText(
    payment?.cf_payment_id || payment?.payment_id || payment?.paymentId || payment?.id || "",
    120
  ) || `cf_${normalizeText(orderId, 120)}`;

const resolveGatewayState = ({ order, payments, orderId }) => {
  const orderStatus = normalizeGatewayOrderStatus(order?.order_status || order?.status || "");
  const paymentList = toPaymentArray(payments);

  const successfulPayment = paymentList.find((payment) =>
    isSuccessToken(extractGatewayPaymentStatusToken(payment))
  );
  const failedPayment = paymentList.find((payment) =>
    isFailureToken(extractGatewayPaymentStatusToken(payment))
  );

  if (successfulPayment || orderStatus === "paid") {
    return {
      paymentStatus: "paid",
      paymentId: resolveGatewayPaymentId(successfulPayment || paymentList[0], orderId),
      gatewayOrderStatus: orderStatus,
      payments: paymentList,
    };
  }

  if (failedPayment || orderStatus === "failed") {
    return {
      paymentStatus: "failed",
      paymentId: resolveGatewayPaymentId(failedPayment || paymentList[0], orderId),
      gatewayOrderStatus: orderStatus,
      payments: paymentList,
    };
  }

  return {
    paymentStatus: "pending",
    paymentId: resolveGatewayPaymentId(paymentList[0], orderId),
    gatewayOrderStatus: orderStatus,
    payments: paymentList,
  };
};

const getWebhookHeader = (headers, ...keys) => {
  for (const key of keys) {
    const value = headers?.[key];
    if (value) {
      return normalizeText(Array.isArray(value) ? value[0] : value, 500);
    }
  }

  return "";
};

const parseWebhookTimestampMs = (value) => {
  const raw = normalizeText(value, 80);
  if (!raw) {
    return 0;
  }

  if (/^\d+$/.test(raw)) {
    const numeric = Number.parseInt(raw, 10);
    if (!Number.isFinite(numeric) || numeric <= 0) {
      return 0;
    }

    return numeric >= 1_000_000_000_000 ? numeric : numeric * 1000;
  }

  const parsed = Date.parse(raw);
  return Number.isFinite(parsed) ? parsed : 0;
};

const ensureFreshWebhookTimestamp = (headers) => {
  const timestamp = getWebhookHeader(headers, "x-webhook-timestamp", "x-cf-timestamp");

  if (!CASHFREE_WEBHOOK_REQUIRE_TIMESTAMP) {
    return {
      ok: true,
      timestamp,
    };
  }

  const timestampMs = parseWebhookTimestampMs(timestamp);
  if (!timestampMs) {
    return {
      ok: false,
      timestamp,
      reason: "missing_or_invalid_timestamp",
    };
  }

  const isWithinSkew = Math.abs(Date.now() - timestampMs) <= CASHFREE_WEBHOOK_TIMESTAMP_MAX_SKEW_MS;
  if (!isWithinSkew) {
    return {
      ok: false,
      timestamp,
      reason: "stale_timestamp",
    };
  }

  return {
    ok: true,
    timestamp,
  };
};

const safeEquals = (left, right) => {
  const leftBuffer = Buffer.from(String(left || ""), "utf8");
  const rightBuffer = Buffer.from(String(right || ""), "utf8");

  if (!leftBuffer.length || leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
};

const verifyWebhookSignature = ({ headers, rawBody }) => {
  const webhookSecret = normalizeText(process.env.CASHFREE_WEBHOOK_SECRET, 400);
  const signature = getWebhookHeader(headers, "x-webhook-signature", "x-cf-signature");

  if (!signature || !webhookSecret || !rawBody) {
    return {
      ok: false,
      reason: "missing_signature_inputs",
    };
  }

  const timestamp = getWebhookHeader(headers, "x-webhook-timestamp", "x-cf-timestamp");
  const payloadCandidates = timestamp ? [`${timestamp}${rawBody}`, rawBody] : [rawBody];

  const isValid = payloadCandidates.some((candidate) => {
    const generated = createHmac("sha256", webhookSecret).update(candidate).digest("base64");
    return safeEquals(signature, generated);
  });

  return {
    ok: isValid,
    reason: isValid ? "valid" : "signature_mismatch",
  };
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

const extractWebhookData = (payload) => {
  const orderId = normalizeText(
    payload?.data?.order?.order_id ||
      payload?.data?.order?.id ||
      payload?.order?.order_id ||
      payload?.order?.id ||
      payload?.order_id ||
      payload?.orderId,
    120
  );

  const paymentId = normalizeText(
    payload?.data?.payment?.cf_payment_id ||
      payload?.data?.payment?.payment_id ||
      payload?.data?.cf_payment_id ||
      payload?.payment?.cf_payment_id ||
      payload?.payment?.payment_id ||
      payload?.payment_id ||
      payload?.cf_payment_id,
    120
  );

  const eventName = normalizeText(
    payload?.type || payload?.event || payload?.event_name || payload?.name || payload?.eventType,
    120
  );

  return {
    orderId,
    paymentId,
    eventName,
  };
};

const createGatewayOrder = async (payload) =>
  callCashfreeApi({
    method: "POST",
    endpoint: "/pg/orders",
    body: payload,
    requestId: randomUUID(),
    idempotencyKey: normalizeText(payload?.order_id, 160) || randomUUID(),
  });

const fetchGatewayOrder = async (orderId) =>
  callCashfreeApi({
    method: "GET",
    endpoint: `/pg/orders/${encodeURIComponent(normalizeText(orderId, 120))}`,
  });

const fetchGatewayOrderPayments = async (orderId) =>
  callCashfreeApi({
    method: "GET",
    endpoint: `/pg/orders/${encodeURIComponent(normalizeText(orderId, 120))}/payments`,
  });

module.exports = {
  createGatewayOrder,
  extractGatewayPaymentStatusToken,
  extractWebhookData,
  fetchGatewayOrder,
  fetchGatewayOrderPayments,
  getCashfreeEnvironment,
  getWebhookHeader,
  normalizeGatewayOrderStatus,
  parseWebhookPayload,
  resolveGatewayPaymentId,
  resolveGatewayState,
  toPaymentArray,
  verifyWebhookSignature,
  ensureFreshWebhookTimestamp,
};
