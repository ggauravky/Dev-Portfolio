const { createHmac, randomBytes } = require("node:crypto");

const Booking = require("../../models/Booking");
const SupportPayment = require("../../models/SupportPayment");
const PaymentWebhookEvent = require("../../models/PaymentWebhookEvent");
const User = require("../../models/User");
const { recordActivityEvent } = require("../activityService");
const {
  createGatewayOrder,
  extractGatewayPaymentStatusToken,
  fetchGatewayOrder,
  fetchGatewayOrderPayments,
  normalizeGatewayOrderStatus,
  resolveGatewayState,
  resolveGatewayPaymentId,
} = require("./cashfreeGateway");
const { dispatchPaidNotifications } = require("./notificationService");

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

const PAYMENT_STATUS_NEXT_POLL_MS = Number.parseInt(process.env.PAYMENT_STATUS_NEXT_POLL_MS, 10) || 3000;

const normalizeText = (value, maxLength = 200) =>
  String(value || "")
    .trim()
    .slice(0, maxLength);

const normalizeEmail = (value) => normalizeText(value, 320).toLowerCase();

const normalizeComparableEmail = (value) => {
  const normalized = normalizeEmail(value);
  const [local, domainRaw] = normalized.split("@");

  if (!local || !domainRaw) {
    return normalized;
  }

  const domain = domainRaw === "googlemail.com" ? "gmail.com" : domainRaw;

  if (domain === "gmail.com") {
    const localCanonical = local.split("+")[0].replaceAll(".", "");
    return `${localCanonical}@${domain}`;
  }

  return `${local}@${domain}`;
};

const isMatchingEmail = (left, right) => normalizeComparableEmail(left) === normalizeComparableEmail(right);

const createOrderId = () => `svc_${Date.now()}_${randomBytes(3).toString("hex")}`;
const createPendingPaymentId = (orderId) => `pending_${normalizeText(orderId, 120)}`;

const toCustomerId = (email) =>
  `cust_${normalizeEmail(email)
    .replaceAll(/[^a-z0-9]/g, "")
    .slice(0, 24)}_${Date.now().toString(36)}`;

const isValidIndianPhone = (value) => /^[6-9]\d{9}$/.test(normalizeText(value, 20));
const normalizeIndianPhone = (value) => {
  const digits = String(value || "").replaceAll(/\D/g, "");
  return digits.length >= 10 ? digits.slice(-10) : digits;
};

const resolvePhone = (...values) => {
  for (const value of values) {
    const normalized = normalizeIndianPhone(value);
    if (isValidIndianPhone(normalized)) {
      return normalized;
    }
  }

  return "9000000000";
};

const normalizePreferredDate = (value) => {
  const raw = normalizeText(value, 20);
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    return raw;
  }

  return new Date().toISOString().slice(0, 10);
};

const resolveFrontendReturnUrl = (pathSuffix) => {
  const frontendUrl = normalizeText(process.env.FRONTEND_URL, 500).replace(/\/$/, "");
  if (!frontendUrl) {
    return "";
  }

  try {
    const parsed = new URL(frontendUrl);
    if (parsed.protocol !== "https:") {
      return "";
    }

    return `${frontendUrl}${pathSuffix}`;
  } catch {
    return "";
  }
};

const normalizePreferredTime = (value) => {
  const raw = normalizeText(value, 20);
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(raw) ? raw : "10:00";
};

const splitOrderIdFromUpsertFields = (payload, fallbackOrderId = "") => {
  const mutableFields = { ...(payload && typeof payload === "object" ? payload : {}) };
  const orderId = normalizeText(mutableFields.orderId || fallbackOrderId, 120);
  delete mutableFields.orderId;

  return {
    orderId,
    mutableFields,
  };
};

const getServiceBySlug = (slug) => SERVICE_CATALOG[normalizeText(slug, 80)];

const resolveVerificationStatus = ({ paymentStatus, reconciliationStatus }) => {
  const normalizedPaymentStatus = normalizeText(paymentStatus, 40).toLowerCase();
  const normalizedReconciliation = normalizeText(reconciliationStatus, 40).toLowerCase();

  if (normalizedPaymentStatus === "paid" || normalizedReconciliation === "paid") {
    return "complete";
  }

  if (normalizedPaymentStatus === "failed" || normalizedReconciliation === "failed") {
    return "failed";
  }

  return "pending_gateway";
};

const resolveReconciliationStatus = (paymentStatus) => {
  const normalizedPaymentStatus = normalizeText(paymentStatus, 40).toLowerCase();

  if (normalizedPaymentStatus === "paid") {
    return "paid";
  }

  if (normalizedPaymentStatus === "failed") {
    return "failed";
  }

  return "pending_gateway";
};

const buildStatusData = ({ kind, record }) => {
  const paymentStatus = normalizeText(record?.paymentStatus || "pending", 40).toLowerCase();
  const reconciliationStatus = normalizeText(record?.reconciliationStatus || "idle", 40).toLowerCase();
  const verificationStatus = resolveVerificationStatus({ paymentStatus, reconciliationStatus });

  return {
    type: kind,
    orderId: normalizeText(record?.orderId, 120),
    paymentStatus,
    verificationStatus,
    reconciliationStatus,
    reconciliationAttempts: Number(record?.reconciliationAttempts || 0),
    receiptReady: paymentStatus === "paid",
    nextPollMs: verificationStatus === "complete" || verificationStatus === "failed" ? 0 : PAYMENT_STATUS_NEXT_POLL_MS,
    amount: Number(record?.amount || 0),
    paymentId: normalizeText(record?.paymentId, 120),
    paidAt: record?.paidAt || null,
    createdAt: record?.createdAt || null,
    updatedAt: record?.updatedAt || null,
    customerName:
      normalizeText(record?.name, 120) ||
      normalizeText(record?.contributorName, 120) ||
      "Customer",
    customerEmail: normalizeEmail(record?.email),
    service:
      kind === "service"
        ? normalizeText(record?.service, 120) || "Service"
        : "Support Jar",
  };
};

const buildPaymentEventKey = ({ actionType, kind, orderId, paymentId }) =>
  `${normalizeText(actionType, 80)}:${normalizeText(kind, 20)}:${normalizeText(orderId, 120)}:${normalizeText(
    paymentId,
    120
  )}`;

const emitPaymentActivity = async ({
  kind,
  record,
  actionType,
  title,
  status = "info",
  metadata = {},
  eventKey = "",
}) => {
  const paymentId = normalizeText(record?.paymentId, 120);
  const orderId = normalizeText(record?.orderId, 120);

  await recordActivityEvent({
    eventKey: eventKey || buildPaymentEventKey({ actionType, kind, orderId, paymentId }),
    userId: record?.userId || null,
    userEmail: normalizeEmail(record?.email),
    domain: "payment",
    actionType,
    title,
    status,
    amount: Number(record?.amount || 0),
    orderId,
    paymentId,
    transactionId: paymentId || orderId,
    receiptKind: kind,
    receiptOrderId: orderId,
    metadata,
  });
};

const resolveUserIdByEmail = async (email) => {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) {
    return null;
  }

  const user = await User.findOne({ email: normalizedEmail }).select("_id").lean();
  return user?._id || null;
};

const resolveKindFromGatewayOrder = ({ kindHint = "", gatewayOrder, booking, supportPayment }) => {
  const normalizedHint = normalizeText(kindHint, 20).toLowerCase();
  if (["service", "support"].includes(normalizedHint)) {
    return normalizedHint;
  }

  const supportType = normalizeText(gatewayOrder?.order_tags?.support_type, 80).toLowerCase();
  const activityType = normalizeText(gatewayOrder?.order_tags?.activity_type, 80).toLowerCase();
  const serviceSlug = normalizeText(gatewayOrder?.order_tags?.service_slug, 80);

  if (supportType || activityType.includes("support")) {
    return "support";
  }

  if (serviceSlug) {
    return "service";
  }

  if (supportPayment && !booking) {
    return "support";
  }

  return "service";
};

const buildServiceRecordFromGateway = async ({ orderId, gatewayOrder, gatewayState, existingRecord }) => {
  const orderAmount = Number(gatewayOrder?.order_amount || existingRecord?.amount || 0);
  const serviceSlug =
    normalizeText(gatewayOrder?.order_tags?.service_slug, 80) ||
    normalizeText(existingRecord?.serviceSlug, 80) ||
    "mentorship";
  const catalogService = getServiceBySlug(serviceSlug) || {
    title: normalizeText(existingRecord?.service, 120) || "Service",
    amount: Number.isFinite(orderAmount) && orderAmount > 0 ? orderAmount : 1,
  };

  const paymentStatus = gatewayState.paymentStatus;
  const paidAt = paymentStatus === "paid" ? new Date() : null;
  const userId = existingRecord?.userId || (await resolveUserIdByEmail(gatewayOrder?.customer_details?.customer_email));

  const base = {
    orderId,
    name:
      normalizeText(gatewayOrder?.customer_details?.customer_name, 120) ||
      normalizeText(existingRecord?.name, 120) ||
      "Customer",
    email:
      normalizeEmail(gatewayOrder?.customer_details?.customer_email) ||
      normalizeEmail(existingRecord?.email),
    userId: userId || null,
    phone: resolvePhone(gatewayOrder?.customer_details?.customer_phone, existingRecord?.phone),
    serviceSlug,
    service: catalogService.title,
    preferredDate: new Date(
      normalizePreferredDate(gatewayOrder?.order_tags?.preferred_date || existingRecord?.preferredDate)
    ),
    preferredTime: normalizePreferredTime(
      gatewayOrder?.order_tags?.preferred_time || existingRecord?.preferredTime
    ),
    projectBrief: normalizeText(existingRecord?.projectBrief, 1200),
    amount: Number.isFinite(orderAmount) && orderAmount > 0 ? orderAmount : catalogService.amount,
    paymentProvider: "cashfree",
    paymentStatus,
    paymentId:
      paymentStatus === "paid" || paymentStatus === "failed"
        ? normalizeText(gatewayState.paymentId, 120)
        : normalizeText(existingRecord?.paymentId, 120) || createPendingPaymentId(orderId),
    paidAt: paidAt || existingRecord?.paidAt || null,
    reconciliationStatus: resolveReconciliationStatus(paymentStatus),
    lastReconciliationAt: new Date(),
    lastReconciliationError: "",
  };

  return base;
};

const buildSupportRecordFromGateway = async ({ orderId, gatewayOrder, gatewayState, existingRecord }) => {
  const orderAmount = Number(gatewayOrder?.order_amount || existingRecord?.amount || 0);
  const paymentStatus = gatewayState.paymentStatus;
  const paidAt = paymentStatus === "paid" ? new Date() : null;

  const userId = existingRecord?.userId || (await resolveUserIdByEmail(gatewayOrder?.customer_details?.customer_email));

  return {
    orderId,
    contributorName:
      normalizeText(gatewayOrder?.customer_details?.customer_name, 120) ||
      normalizeText(existingRecord?.contributorName, 120) ||
      "Supporter",
    email:
      normalizeEmail(gatewayOrder?.customer_details?.customer_email) ||
      normalizeEmail(existingRecord?.email),
    userId: userId || null,
    phone: resolvePhone(gatewayOrder?.customer_details?.customer_phone, existingRecord?.phone),
    amount: Number.isFinite(orderAmount) && orderAmount > 0 ? orderAmount : 1,
    message: normalizeText(existingRecord?.message, 300),
    paymentProvider: "cashfree",
    paymentStatus,
    paymentId:
      paymentStatus === "paid" || paymentStatus === "failed"
        ? normalizeText(gatewayState.paymentId, 120)
        : normalizeText(existingRecord?.paymentId, 120) || createPendingPaymentId(orderId),
    paidAt: paidAt || existingRecord?.paidAt || null,
    reconciliationStatus: resolveReconciliationStatus(paymentStatus),
    lastReconciliationAt: new Date(),
    lastReconciliationError: "",
  };
};

const upsertServiceRecord = async ({ orderId, payload }) => {
  const { orderId: insertOrderId, mutableFields } = splitOrderIdFromUpsertFields(payload, orderId);

  return Booking.findOneAndUpdate(
    { orderId },
    {
      $set: mutableFields,
      $setOnInsert: {
        orderId: insertOrderId || orderId,
        date: new Date(),
      },
    },
    {
      new: true,
      upsert: true,
      runValidators: true,
    }
  );
};

const upsertSupportRecord = async ({ orderId, payload }) => {
  const { orderId: insertOrderId, mutableFields } = splitOrderIdFromUpsertFields(payload, orderId);

  return SupportPayment.findOneAndUpdate(
    { orderId },
    {
      $set: mutableFields,
      $setOnInsert: {
        orderId: insertOrderId || orderId,
      },
    },
    {
      new: true,
      upsert: true,
      runValidators: true,
    }
  );
};

const getRecordsByOrderId = async (orderId) => {
  const [booking, supportPayment] = await Promise.all([
    Booking.findOne({ orderId }),
    SupportPayment.findOne({ orderId }),
  ]);

  return {
    booking,
    supportPayment,
  };
};

const reconcileOrder = async ({ orderId, kindHint = "", source = "status", reqLogger }) => {
  const normalizedOrderId = normalizeText(orderId, 120);
  if (!normalizedOrderId) {
    const error = new Error("order_id_missing");
    error.code = "ORDER_ID_MISSING";
    throw error;
  }

  const { booking, supportPayment } = await getRecordsByOrderId(normalizedOrderId);

  const gatewayOrder = await fetchGatewayOrder(normalizedOrderId);
  let gatewayPayments = [];
  try {
    gatewayPayments = await fetchGatewayOrderPayments(normalizedOrderId);
  } catch {
    gatewayPayments = [];
  }

  const gatewayState = resolveGatewayState({
    order: gatewayOrder,
    payments: gatewayPayments,
    orderId: normalizedOrderId,
  });

  const kind = resolveKindFromGatewayOrder({
    kindHint,
    gatewayOrder,
    booking,
    supportPayment,
  });

  let updatedRecord = null;

  if (kind === "support") {
    const supportPayload = await buildSupportRecordFromGateway({
      orderId: normalizedOrderId,
      gatewayOrder,
      gatewayState,
      existingRecord: supportPayment,
    });

    if (source === "webhook") {
      supportPayload.webhookReceivedAt = new Date();
    }

    updatedRecord = await upsertSupportRecord({
      orderId: normalizedOrderId,
      payload: supportPayload,
    });
  } else {
    const servicePayload = await buildServiceRecordFromGateway({
      orderId: normalizedOrderId,
      gatewayOrder,
      gatewayState,
      existingRecord: booking,
    });

    if (source === "webhook") {
      servicePayload.webhookReceivedAt = new Date();
    }

    updatedRecord = await upsertServiceRecord({
      orderId: normalizedOrderId,
      payload: servicePayload,
    });
  }

  await emitPaymentActivity({
    kind,
    record: updatedRecord,
    actionType: "reconciliation_started",
    title: "Payment reconciliation started",
    status: "info",
    eventKey: `reconcile:start:${kind}:${normalizedOrderId}`,
    metadata: {
      source,
    },
  });

  if (gatewayState.paymentStatus === "paid") {
    await emitPaymentActivity({
      kind,
      record: updatedRecord,
      actionType: "payment_success",
      title: "Payment successful",
      status: "success",
      eventKey: `payment:success:${kind}:${normalizedOrderId}:${normalizeText(
        updatedRecord?.paymentId,
        120
      )}`,
      metadata: {
        gatewayOrderStatus: normalizeGatewayOrderStatus(gatewayOrder?.order_status),
      },
    });

    await dispatchPaidNotifications({
      kind,
      record: updatedRecord,
      reqLogger,
    });
  } else if (gatewayState.paymentStatus === "failed") {
    await emitPaymentActivity({
      kind,
      record: updatedRecord,
      actionType: "payment_failed",
      title: "Payment failed",
      status: "failed",
      eventKey: `payment:failed:${kind}:${normalizedOrderId}`,
      metadata: {
        gatewayOrderStatus: normalizeGatewayOrderStatus(gatewayOrder?.order_status),
        lastPaymentToken:
          normalizeText(extractGatewayPaymentStatusToken(gatewayState.payments?.[0]), 80) ||
          "failed",
      },
    });
  }

  const statusData = buildStatusData({
    kind,
    record: updatedRecord,
  });

  return {
    kind,
    record: updatedRecord,
    statusData,
    shouldRetry: statusData.verificationStatus === "pending_gateway",
  };
};

const createServiceOrderAndDraft = async ({ authIdentity, payload, requestMeta }) => {
  const selectedService = getServiceBySlug(payload?.service);
  if (!selectedService) {
    const error = new Error("service_invalid");
    error.code = "SERVICE_INVALID";
    throw error;
  }

  const orderId = createOrderId();
  const customerName = normalizeText(payload?.name, 120) || normalizeText(authIdentity?.displayName, 120) || "Customer";
  const customerEmail = normalizeEmail(authIdentity?.email);

  const orderPayload = {
    order_id: orderId,
    order_amount: selectedService.amount,
    order_currency: "INR",
    order_note: `${selectedService.title} booking`,
    customer_details: {
      customer_id: toCustomerId(customerEmail),
      customer_name: customerName,
      customer_email: customerEmail,
      customer_phone: resolvePhone(payload?.phone),
    },
    order_tags: {
      service_slug: normalizeText(payload?.service, 80),
      activity_type: "service_purchase",
      preferred_date: normalizePreferredDate(payload?.preferredDate),
      preferred_time: normalizePreferredTime(payload?.preferredTime),
    },
  };

  const returnUrl = resolveFrontendReturnUrl("/booknow");
  if (returnUrl) {
    orderPayload.order_meta = {
      return_url: returnUrl,
    };
  }

  const order = await createGatewayOrder(orderPayload);

  const draftPayload = {
    orderId,
    name: customerName,
    email: customerEmail,
    userId: authIdentity?.userId || null,
    phone: resolvePhone(payload?.phone),
    serviceSlug: normalizeText(payload?.service, 80),
    service: selectedService.title,
    preferredDate: new Date(normalizePreferredDate(payload?.preferredDate)),
    preferredTime: normalizePreferredTime(payload?.preferredTime),
    projectBrief: normalizeText(payload?.projectBrief, 1200),
    amount: selectedService.amount,
    paymentProvider: "cashfree",
    paymentStatus: "created",
    paymentId: createPendingPaymentId(orderId),
    reconciliationStatus: "idle",
    reconciliationAttempts: 0,
    lastReconciliationError: "",
    ipAddress: requestMeta?.ipAddress || "unknown",
    userAgent: requestMeta?.userAgent || "unknown",
  };

  const draftRecord = await upsertServiceRecord({
    orderId,
    payload: draftPayload,
  });

  await emitPaymentActivity({
    kind: "service",
    record: draftRecord,
    actionType: "order_created",
    title: "Service order created",
    status: "pending",
    eventKey: `order:created:service:${orderId}`,
    metadata: {
      serviceSlug: normalizeText(payload?.service, 80),
    },
  });

  return {
    order,
    orderId,
    amount: selectedService.amount,
    serviceTitle: selectedService.title,
  };
};

const createSupportOrderAndDraft = async ({ authIdentity, payload, requestMeta }) => {
  const amount = Number.parseInt(payload?.amount, 10);
  if (!Number.isFinite(amount) || amount <= 0 || amount > 100000) {
    const error = new Error("support_amount_invalid");
    error.code = "SUPPORT_AMOUNT_INVALID";
    throw error;
  }

  const orderId = createOrderId();
  const contributorName =
    normalizeText(payload?.name, 120) || normalizeText(authIdentity?.displayName, 120) || "Supporter";
  const customerEmail = normalizeEmail(authIdentity?.email);

  const orderPayload = {
    order_id: orderId,
    order_amount: amount,
    order_currency: "INR",
    order_note: "Direct support contribution",
    customer_details: {
      customer_id: toCustomerId(customerEmail),
      customer_name: contributorName,
      customer_email: customerEmail,
      customer_phone: resolvePhone(payload?.phone),
    },
    order_tags: {
      support_type: "direct_support",
      activity_type: "support_jar",
      contributor_note: normalizeText(payload?.message, 120),
    },
  };

  const returnUrl = resolveFrontendReturnUrl("/support");
  if (returnUrl) {
    orderPayload.order_meta = {
      return_url: returnUrl,
    };
  }

  const order = await createGatewayOrder(orderPayload);

  const draftPayload = {
    orderId,
    contributorName,
    email: customerEmail,
    userId: authIdentity?.userId || null,
    phone: resolvePhone(payload?.phone),
    amount,
    message: normalizeText(payload?.message, 300),
    paymentStatus: "created",
    paymentProvider: "cashfree",
    paymentId: createPendingPaymentId(orderId),
    reconciliationStatus: "idle",
    reconciliationAttempts: 0,
    lastReconciliationError: "",
    ipAddress: requestMeta?.ipAddress || "unknown",
    userAgent: requestMeta?.userAgent || "unknown",
  };

  const draftRecord = await upsertSupportRecord({
    orderId,
    payload: draftPayload,
  });

  await emitPaymentActivity({
    kind: "support",
    record: draftRecord,
    actionType: "order_created",
    title: "Support order created",
    status: "pending",
    eventKey: `order:created:support:${orderId}`,
    metadata: {},
  });

  return {
    order,
    orderId,
    amount,
  };
};

const ensureUserOwnership = ({ record, authIdentity }) => {
  if (!record) {
    return true;
  }

  const userId = String(authIdentity?.userId || "").trim();
  const authEmail = normalizeEmail(authIdentity?.email);

  if (record.userId && String(record.userId) !== userId) {
    return false;
  }

  if (record.email && !isMatchingEmail(record.email, authEmail)) {
    return false;
  }

  return true;
};

const findOwnedOrderById = async ({ orderId, authIdentity }) => {
  const normalizedOrderId = normalizeText(orderId, 120);
  const { booking, supportPayment } = await getRecordsByOrderId(normalizedOrderId);

  if (booking && ensureUserOwnership({ record: booking, authIdentity })) {
    return {
      kind: "service",
      record: booking,
    };
  }

  if (supportPayment && ensureUserOwnership({ record: supportPayment, authIdentity })) {
    return {
      kind: "support",
      record: supportPayment,
    };
  }

  return null;
};

const listBookingsForUser = async ({ authIdentity }) => {
  const userId = authIdentity?.userId || null;
  const userEmail = normalizeEmail(authIdentity?.email);

  if (!userId || !userEmail) {
    return [];
  }

  await Booking.updateMany(
    {
      userId: null,
      email: userEmail,
    },
    {
      $set: {
        userId,
      },
    }
  );

  return Booking.find({
    $or: [{ userId }, { userId: null, email: userEmail }],
  })
    .sort({ createdAt: -1 })
    .lean();
};

const listSupportPaymentsForUser = async ({ authIdentity }) => {
  const userId = authIdentity?.userId || null;
  const userEmail = normalizeEmail(authIdentity?.email);

  if (!userId || !userEmail) {
    return [];
  }

  await SupportPayment.updateMany(
    {
      userId: null,
      email: userEmail,
    },
    {
      $set: {
        userId,
      },
    }
  );

  return SupportPayment.find({
    $or: [{ userId }, { userId: null, email: userEmail }],
  })
    .sort({ createdAt: -1 })
    .lean();
};

const resolveTransactionForUser = async ({ transactionId, authIdentity }) => {
  const normalizedTransactionId = normalizeText(transactionId, 120);

  const [bookingByPaymentId, supportByPaymentId, bookingByOrderId, supportByOrderId] = await Promise.all([
    Booking.findOne({ paymentId: normalizedTransactionId }),
    SupportPayment.findOne({ paymentId: normalizedTransactionId }),
    Booking.findOne({ orderId: normalizedTransactionId }),
    SupportPayment.findOne({ orderId: normalizedTransactionId }),
  ]);

  const candidates = [
    { kind: "service", record: bookingByPaymentId },
    { kind: "support", record: supportByPaymentId },
    { kind: "service", record: bookingByOrderId },
    { kind: "support", record: supportByOrderId },
  ].filter((entry) => entry.record);

  for (const candidate of candidates) {
    if (ensureUserOwnership({ record: candidate.record, authIdentity })) {
      return candidate;
    }
  }

  return null;
};

const buildWebhookEventKey = ({ eventName, orderId, paymentId, rawBody }) => {
  const normalizedEventName =
    normalizeText(eventName, 80).toLowerCase().replaceAll(/[^a-z0-9:_-]+/g, "_") ||
    "cashfree_webhook";

  const bodyFingerprint = createHmac(
    "sha256",
    normalizeText(process.env.CASHFREE_WEBHOOK_SECRET, 400) || "cashfree_webhook"
  )
    .update(String(rawBody || ""))
    .digest("hex")
    .slice(0, 24);

  const dedupeToken = normalizeText(paymentId, 120) || bodyFingerprint;
  return `${normalizedEventName}:${normalizeText(orderId, 120)}:${dedupeToken}`.slice(0, 180);
};

const registerWebhookEventIfNew = async ({ eventKey, orderId, eventName, paymentId }) => {
  try {
    await PaymentWebhookEvent.create({
      eventKey,
      orderId: normalizeText(orderId, 120),
      eventName: normalizeText(eventName, 120),
      paymentId: normalizeText(paymentId, 120),
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

module.exports = {
  buildStatusData,
  buildWebhookEventKey,
  createServiceOrderAndDraft,
  createSupportOrderAndDraft,
  ensureUserOwnership,
  findOwnedOrderById,
  listBookingsForUser,
  listSupportPaymentsForUser,
  reconcileOrder,
  registerWebhookEventIfNew,
  resolveTransactionForUser,
  normalizeEmail,
  isMatchingEmail,
};
