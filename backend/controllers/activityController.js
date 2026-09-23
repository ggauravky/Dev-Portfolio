const { logger } = require("../utils/logger");
const { listUserActivity } = require("../services/activityService");

const normalizeText = (value, maxLength = 200) =>
  String(value || "")
    .trim()
    .slice(0, maxLength);

const normalizeEmail = (value) => normalizeText(value, 320).toLowerCase();

const toTimelineItem = (event) => ({
  id: String(event._id),
  domain: normalizeText(event.domain, 40) || "activity",
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
  flow: normalizeText(event.receiptKind, 20),
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

    const items = events.map(toTimelineItem);

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
