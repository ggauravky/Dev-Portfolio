const crypto = require("node:crypto");
const Razorpay = require("razorpay");

let razorpayClient = null;
let clientFingerprint = "";

const normalize = (value) => String(value || "").trim();

const getKeyMode = (keyId) => {
  const normalizedKeyId = normalize(keyId);
  if (normalizedKeyId.startsWith("rzp_test_")) return "test";
  if (normalizedKeyId.startsWith("rzp_live_")) return "live";
  return "invalid";
};

const isRazorpayEnabled = () =>
  ["1", "true", "yes", "on"].includes(
    normalize(process.env.RAZORPAY_ENABLED).toLowerCase()
  );

const requireGatewayConfig = () => {
  if (!isRazorpayEnabled()) {
    const error = new Error("Payments are temporarily unavailable.");
    error.code = "PAYMENT_GATEWAY_DISABLED";
    error.status = 503;
    throw error;
  }

  const keyId = normalize(process.env.RAZORPAY_KEY_ID);
  const keySecret = normalize(process.env.RAZORPAY_KEY_SECRET);
  if (!keyId || !keySecret) {
    const error = new Error("Payment gateway is not configured.");
    error.code = "PAYMENT_GATEWAY_NOT_CONFIGURED";
    error.status = 503;
    throw error;
  }

  return { keyId, keySecret };
};

const getRazorpayClient = () => {
  const config = requireGatewayConfig();
  const fingerprint = `${config.keyId}:${config.keySecret}`;
  if (!razorpayClient || clientFingerprint !== fingerprint) {
    razorpayClient = new Razorpay({ key_id: config.keyId, key_secret: config.keySecret });
    clientFingerprint = fingerprint;
  }
  return razorpayClient;
};

const getGatewayDiagnostics = () => {
  const keyId = normalize(process.env.RAZORPAY_KEY_ID);
  const keySecret = normalize(process.env.RAZORPAY_KEY_SECRET);

  return {
    provider: "razorpay",
    enabled: isRazorpayEnabled(),
    keyConfigured: Boolean(keyId),
    secretConfigured: Boolean(keySecret),
    keyMode: getKeyMode(keyId),
    keyLength: keyId.length,
    secretLength: keySecret.length,
  };
};

const testGatewayAuthentication = async () => {
  const client = getRazorpayClient();
  return client.orders.all({ count: 1 });
};

const mapGatewayError = (error) => {
  if (String(error?.code || "").startsWith("PAYMENT_GATEWAY_")) return error;

  const providerError = error?.error || error?.response?.data?.error || {};
  const providerStatus = Number(error?.statusCode || error?.response?.status || error?.status) || 0;
  const providerCode = normalize(providerError.code || error?.code).slice(0, 80);
  const providerMessage = normalize(
    providerError.description || providerError.reason || error?.message
  ).slice(0, 200);
  const isAuthenticationFailure =
    providerStatus === 401 || /authentication|unauthori[sz]ed/i.test(providerMessage);
  const isNetworkFailure = !providerStatus && Boolean(error?.request || error?.code);

  const mapped = new Error(
    isAuthenticationFailure
      ? "Payment gateway is temporarily unavailable."
      : "Payment provider request failed. Please try again shortly."
  );
  mapped.code = isAuthenticationFailure
    ? "PAYMENT_GATEWAY_AUTH_FAILED"
    : "PAYMENT_GATEWAY_REQUEST_FAILED";
  mapped.status = isAuthenticationFailure ? 503 : 502;
  mapped.provider = "razorpay";
  mapped.providerStatus = providerStatus;
  mapped.providerCode = providerCode;
  mapped.failureCategory = isAuthenticationFailure
    ? "authentication"
    : isNetworkFailure
      ? "network"
      : "provider";
  return mapped;
};

const callGateway = async (operation) => {
  try {
    return await operation();
  } catch (error) {
    throw mapGatewayError(error);
  }
};

const toPaise = (amountInRupees) => {
  const amount = Number(amountInRupees);
  if (!Number.isSafeInteger(amount) || amount <= 0) {
    throw new TypeError("Amount must be a positive integer number of rupees");
  }
  return amount * 100;
};

const createHmacSignature = (payload, secret) =>
  crypto.createHmac("sha256", normalize(secret)).update(payload).digest("hex");

const timingSafeHexEqual = (left, right) => {
  const leftValue = normalize(left).toLowerCase();
  const rightValue = normalize(right).toLowerCase();
  if (!/^[a-f0-9]{64}$/.test(leftValue) || !/^[a-f0-9]{64}$/.test(rightValue)) {
    return false;
  }
  return crypto.timingSafeEqual(Buffer.from(leftValue, "hex"), Buffer.from(rightValue, "hex"));
};

const verifyPaymentSignature = ({ orderId, paymentId, signature, secret }) => {
  const expected = createHmacSignature(`${normalize(orderId)}|${normalize(paymentId)}`, secret);
  return timingSafeHexEqual(expected, signature);
};

const verifyWebhookSignature = ({ rawBody, signature, secret }) => {
  const body = Buffer.isBuffer(rawBody) ? rawBody : Buffer.from(String(rawBody || ""), "utf8");
  const expected = crypto.createHmac("sha256", normalize(secret)).update(body).digest("hex");
  return timingSafeHexEqual(expected, signature);
};

const assertPaymentMatchesTransaction = (payment, transaction) => {
  if (!payment || normalize(payment.order_id) !== normalize(transaction.razorpayOrderId)) {
    const error = new Error("Payment order does not match this transaction");
    error.code = "PAYMENT_ORDER_MISMATCH";
    throw error;
  }
  if (Number(payment.amount) !== Number(transaction.amountPaise)) {
    const error = new Error("Payment amount does not match this transaction");
    error.code = "PAYMENT_AMOUNT_MISMATCH";
    throw error;
  }
  if (normalize(payment.currency).toUpperCase() !== "INR") {
    const error = new Error("Payment currency does not match this transaction");
    error.code = "PAYMENT_CURRENCY_MISMATCH";
    throw error;
  }
  return true;
};

const assertOrderMatchesRequest = (order, { amountPaise, currency }) => {
  const orderId = normalize(order?.id);
  if (!/^order_[a-zA-Z0-9]{6,100}$/.test(orderId)) {
    const error = new Error("Payment gateway returned an invalid order");
    error.code = "INVALID_GATEWAY_ORDER";
    error.status = 502;
    throw error;
  }
  if (Number(order?.amount) !== Number(amountPaise)) {
    const error = new Error("Payment gateway returned an unexpected order amount");
    error.code = "GATEWAY_ORDER_AMOUNT_MISMATCH";
    error.status = 502;
    throw error;
  }
  if (normalize(order?.currency).toUpperCase() !== normalize(currency).toUpperCase()) {
    const error = new Error("Payment gateway returned an unexpected order currency");
    error.code = "GATEWAY_ORDER_CURRENCY_MISMATCH";
    error.status = 502;
    throw error;
  }
  return true;
};

const createGatewayOrder = async ({ amountPaise, currency, receipt, notes }) => {
  const client = getRazorpayClient();
  return callGateway(() => client.orders.create({
    amount: Number(amountPaise),
    currency: normalize(currency).toUpperCase(),
    receipt: normalize(receipt).slice(0, 40),
    notes,
  }));
};

const fetchGatewayPayment = async (paymentId) =>
  callGateway(() => getRazorpayClient().payments.fetch(normalize(paymentId)));

const fetchCapturedPaymentForOrder = async (orderId) => {
  const response = await callGateway(() =>
    getRazorpayClient().orders.fetchPayments(normalize(orderId))
  );
  const items = Array.isArray(response?.items) ? response.items : [];
  return items.find((payment) => payment?.captured === true || payment?.status === "captured") || null;
};

module.exports = {
  assertOrderMatchesRequest,
  assertPaymentMatchesTransaction,
  createGatewayOrder,
  createHmacSignature,
  fetchCapturedPaymentForOrder,
  fetchGatewayPayment,
  getGatewayDiagnostics,
  getKeyMode,
  getRazorpayClient,
  isRazorpayEnabled,
  mapGatewayError,
  requireGatewayConfig,
  testGatewayAuthentication,
  timingSafeHexEqual,
  toPaise,
  verifyPaymentSignature,
  verifyWebhookSignature,
};
