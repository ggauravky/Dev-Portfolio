const ActivityEvent = require("../models/ActivityEvent");

const normalizeText = (value, maxLength = 200) =>
  String(value || "")
    .trim()
    .slice(0, maxLength);

const normalizeEmail = (value) => normalizeText(value, 320).toLowerCase();

const buildEventPayload = (input = {}) => {
  const paymentId = normalizeText(input.paymentId || input.transactionId, 120);

  return {
    eventKey: normalizeText(input.eventKey, 180),
    userId: input.userId || null,
    userEmail: normalizeEmail(input.userEmail),
    actionType: normalizeText(input.actionType, 80) || "event",
    domain: normalizeText(input.domain, 40) || "payment",
    title: normalizeText(input.title, 160) || "Activity event",
    description: normalizeText(input.description, 500),
    status: ["success", "pending", "failed", "info"].includes(String(input.status || "").trim())
      ? String(input.status).trim()
      : "info",
    amount: Number.isFinite(Number(input.amount)) ? Number(input.amount) : null,
    currency: normalizeText(input.currency, 10) || "INR",
    orderId: normalizeText(input.orderId, 120),
    paymentId,
    transactionId: normalizeText(input.transactionId || paymentId, 120),
    receiptKind: ["service", "support"].includes(String(input.receiptKind || "").trim())
      ? String(input.receiptKind).trim()
      : "",
    receiptOrderId: normalizeText(input.receiptOrderId || input.orderId, 120),
    metadata: input.metadata && typeof input.metadata === "object" ? input.metadata : {},
  };
};

const recordActivityEvent = async (input = {}) => {
  const payload = buildEventPayload(input);

  if (payload.eventKey) {
    return ActivityEvent.findOneAndUpdate(
      { eventKey: payload.eventKey },
      {
        $set: payload,
        $setOnInsert: {
          createdAt: new Date(),
        },
      },
      {
        new: true,
        upsert: true,
      }
    );
  }

  return ActivityEvent.create(payload);
};

const listUserActivity = async ({ userId, userEmail, limit = 100, cursorCreatedAt = null }) => {
  const query = {
    $or: [],
  };

  if (userId) {
    query.$or.push({ userId });
  }

  if (normalizeEmail(userEmail)) {
    query.$or.push({ userEmail: normalizeEmail(userEmail) });
  }

  if (!query.$or.length) {
    return [];
  }

  if (cursorCreatedAt) {
    query.createdAt = { $lt: new Date(cursorCreatedAt) };
  }

  const normalizedLimit = Math.max(1, Math.min(Number.parseInt(limit, 10) || 50, 200));

  return ActivityEvent.find(query)
    .sort({ createdAt: -1 })
    .limit(normalizedLimit)
    .lean();
};

module.exports = {
  recordActivityEvent,
  listUserActivity,
};
