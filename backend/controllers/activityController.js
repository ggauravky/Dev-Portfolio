const { logger } = require("../utils/logger");
const { listUserActivity } = require("../services/activityService");
const {
  listBookingsForUser,
  listSupportPaymentsForUser,
} = require("../services/payment/paymentLifecycleService");

const normalizeText = (value, maxLength = 200) =>
  String(value || "")
    .trim()
    .slice(0, maxLength);

const normalizeEmail = (value) => normalizeText(value, 320).toLowerCase();

const mapPaymentStatusToTimelineStatus = (value) => {
  const normalized = normalizeText(value, 40).toLowerCase();

  if (normalized === "paid") {
    return "success";
  }

  if (normalized === "failed") {
    return "failed";
  }

  if (["created", "pending"].includes(normalized)) {
    return "pending";
  }

  return "info";
};

const toFallbackTimelineItem = ({ kind, record }) => {
  const orderId = normalizeText(record?.orderId, 120);
  const paymentId = normalizeText(record?.paymentId, 120);
  const service =
    kind === "service" ? normalizeText(record?.service, 120) || "Service" : "Support Jar";

  return {
    id: `${kind}:${String(record?._id || orderId)}`,
    domain: "payment",
    actionType: "payment_record",
    title: `${service} payment record`,
    status: mapPaymentStatusToTimelineStatus(record?.paymentStatus),
    amount: Number.isFinite(Number(record?.amount)) ? Number(record.amount) : null,
    currency: "INR",
    timestamp: record?.updatedAt || record?.createdAt || null,
    transactionId: paymentId || orderId,
    orderId,
    paymentId,
    receipt: orderId
      ? {
          kind,
          orderId,
        }
      : null,
    metadata: {
      source: "historical_payment_fallback",
      paymentStatus: normalizeText(record?.paymentStatus, 40).toLowerCase(),
    },
  };
};

const toTimelineItem = (event) => ({
  id: String(event._id),
  domain: normalizeText(event.domain, 40) || "payment",
  actionType: normalizeText(event.actionType, 80),
  title: normalizeText(event.title, 160),
  status: normalizeText(event.status, 20) || "info",
  amount: Number.isFinite(Number(event.amount)) ? Number(event.amount) : null,
  currency: normalizeText(event.currency, 10) || "INR",
  timestamp: event.createdAt || event.updatedAt,
  transactionId:
    normalizeText(event.transactionId, 120) ||
    normalizeText(event.paymentId, 120) ||
    normalizeText(event.orderId, 120),
  orderId: normalizeText(event.orderId, 120),
  paymentId: normalizeText(event.paymentId, 120),
  receipt: event.receiptKind
    ? {
        kind: event.receiptKind,
        orderId: normalizeText(event.receiptOrderId || event.orderId, 120),
      }
    : null,
  metadata: event.metadata && typeof event.metadata === "object" ? event.metadata : {},
});

exports.getMyActivity = async (req, res) => {
  const reqLogger = req.log || logger;
  const authUser = req.authUser;

  if (!authUser?.id || !authUser?.email) {
    return res.status(401).json({
      success: false,
      message: "Please sign in first",
    });
  }

  try {
    const events = await listUserActivity({
      userId: authUser.id,
      userEmail: normalizeEmail(authUser.email),
      limit: req.query?.limit,
      cursorCreatedAt: req.query?.cursor,
    });

    let items = events.map(toTimelineItem);

    if (!items.length) {
      const [bookings, supportPayments] = await Promise.all([
        listBookingsForUser({
          authIdentity: {
            userId: authUser.id,
            email: normalizeEmail(authUser.email),
          },
        }),
        listSupportPaymentsForUser({
          authIdentity: {
            userId: authUser.id,
            email: normalizeEmail(authUser.email),
          },
        }),
      ]);

      const fallbackItems = [
        ...(bookings || []).map((record) => toFallbackTimelineItem({ kind: "service", record })),
        ...(supportPayments || []).map((record) =>
          toFallbackTimelineItem({
            kind: "support",
            record,
          })
        ),
      ]
        .filter((item) => item.timestamp)
        .sort((left, right) => new Date(right.timestamp).getTime() - new Date(left.timestamp).getTime());

      const normalizedLimit = Math.max(1, Math.min(Number.parseInt(req.query?.limit, 10) || 100, 200));
      items = fallbackItems.slice(0, normalizedLimit);
    }

    return res.status(200).json({
      success: true,
      message: "Activity timeline fetched successfully",
      data: {
        items,
        nextCursor: items.length ? String(items[items.length - 1].timestamp || "") : "",
      },
    });
  } catch (error) {
    reqLogger.error({ err: error, userId: authUser.id }, "Failed to fetch activity timeline");
    return res.status(500).json({
      success: false,
      message: "Unable to load your activity right now",
    });
  }
};
