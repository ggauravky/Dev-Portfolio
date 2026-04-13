// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Unauthorized copying, modification, or distribution of this software,
// via any medium, is strictly prohibited without the express written
// consent of the author. See LICENSE for details.
// Source: https://github.com/ggauravky/Dev-Portfolio

const { randomBytes } = require("node:crypto");
const Booking = require("../models/Booking");
const SupportPayment = require("../models/SupportPayment");
const { logger } = require("../utils/logger");
const {
  sendServiceBookingConfirmationEmail,
  sendSupportThankYouEmail,
  isBrevoConfigured,
} = require("../utils/email");
const {
  generateServiceConfirmationPdf,
  generateSupportReceiptPdf,
} = require("../utils/pdfGenerator");

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

const isEmailDispatchConfigured = () => isBrevoConfigured();

const PAYMENT_CONFIG_ERROR_CODE = "PAYMENT_CONFIG_MISSING";
const CASHFREE_API_VERSION = String(process.env.CASHFREE_API_VERSION || "2023-08-01").trim();
const CASHFREE_TIMEOUT_MS = Number.parseInt(process.env.CASHFREE_TIMEOUT_MS, 10) || 12000;
let cachedFetch = typeof globalThis.fetch === "function" ? globalThis.fetch : null;

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

const callCashfreeApi = async ({ method, endpoint, body, config }) => {
  const fetchClient = await getFetchClient();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), CASHFREE_TIMEOUT_MS);

  try {
    const response = await fetchClient(`${config.baseUrl}${endpoint}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        "x-api-version": CASHFREE_API_VERSION,
        "x-client-id": config.appId,
        "x-client-secret": config.secretKey,
      },
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
const isMatchingEmail = (left, right) => normalizeEmailAddress(left) === normalizeEmailAddress(right);
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

  const explicitFailed = payments.find((payment) => isFailedPaymentToken(extractPaymentStatusToken(payment)));
  if (explicitFailed) {
    return null;
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

  if (Number(error?.code) === 11000) {
    return {
      status: 409,
      message: "A payment record conflict occurred. Please retry once with the same order details.",
      logLevel: "warn",
    };
  }

  const errorMessage = String(error?.message || "");
  const errorName = String(error?.name || "");
  if (
    /mongo|mongoose/i.test(errorName) ||
    /server selection|topology|connection pool|timed out while checking out|not primary|node is recovering|replica set|connection .* closed/i.test(
      errorMessage
    )
  ) {
    return {
      status: 503,
      message: "Verification service is temporarily unavailable. Please retry with the same order details.",
      logLevel: "error",
    };
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

  if (Number.isFinite(gatewayStatus)) {
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
  }

  return {
    status: 500,
    message: fallbackMessage,
    logLevel: "error",
  };
};

const scheduleServiceConfirmationEmail = ({ bookingId, reqLogger }) => {
  const normalizedBookingId = String(bookingId || "").trim();
  if (!normalizedBookingId) {
    return;
  }

  setImmediate(async () => {
    try {
      const booking = await Booking.findById(normalizedBookingId).lean();
      if (booking?.paymentStatus !== "paid" || booking?.confirmationEmailSentAt) {
        return;
      }

      let attachment = null;
      try {
        attachment = await generateServiceConfirmationPdf({ booking });
      } catch (pdfError) {
        reqLogger.warn(
          {
            err: pdfError,
            bookingId: normalizedBookingId,
          },
          "Service confirmation PDF generation failed; sending email without attachment"
        );
      }

      const result = await sendServiceBookingConfirmationEmail({
        booking,
        attachments: attachment ? [attachment] : [],
      });

      if (!result.customer?.sent) {
        await Booking.updateOne(
          { _id: normalizedBookingId },
          {
            $set: {
              confirmationEmailLastAttemptAt: new Date(),
              confirmationEmailError: String(result.customer?.reason || "send_failed"),
            },
          }
        );

        if (!result.customer?.skipped) {
          reqLogger.warn(
            {
              bookingId: normalizedBookingId,
              reason: result.customer?.reason,
              error: result.customer?.error,
            },
            "Service confirmation email was not delivered"
          );
        }
        return;
      }

      await Booking.updateOne(
        { _id: normalizedBookingId },
        {
          $set: {
            confirmationEmailSentAt: new Date(),
            confirmationEmailRecipient: String(booking.email || "").toLowerCase(),
            confirmationEmailMessageId: String(
              result.customer?.messageId || result.customer?.providerId || ""
            ),
            confirmationEmailAdminMessageId: String(
              result.admin?.messageId || result.admin?.providerId || ""
            ),
            confirmationEmailLastAttemptAt: new Date(),
            confirmationEmailError: "",
          },
        }
      );

      reqLogger.info(
        {
          bookingId: normalizedBookingId,
          customerEmailId: result.customer?.messageId || result.customer?.providerId,
          adminEmailSent: Boolean(result.admin?.sent),
          adminEmailId: result.admin?.messageId || result.admin?.providerId,
        },
        "Service confirmation email delivered"
      );
    } catch (error) {
      reqLogger.error(
        {
          err: error,
          bookingId: normalizedBookingId,
        },
        "Service confirmation email processing failed"
      );

      try {
        await Booking.updateOne(
          { _id: normalizedBookingId },
          {
            $set: {
              confirmationEmailLastAttemptAt: new Date(),
              confirmationEmailError: "processing_failed",
            },
          }
        );
      } catch {
        // Ignore metadata update failures for background email jobs.
      }
    }
  });
};

const scheduleSupportThankYouEmail = ({ supportPaymentId, reqLogger }) => {
  const normalizedSupportId = String(supportPaymentId || "").trim();
  if (!normalizedSupportId) {
    return;
  }

  setImmediate(async () => {
    try {
      const supportPayment = await SupportPayment.findById(normalizedSupportId).lean();
      if (supportPayment?.paymentStatus !== "paid" || supportPayment?.thankYouEmailSentAt) {
        return;
      }

      let attachment = null;
      try {
        attachment = await generateSupportReceiptPdf({ supportPayment });
      } catch (pdfError) {
        reqLogger.warn(
          {
            err: pdfError,
            supportPaymentId: normalizedSupportId,
          },
          "Support receipt PDF generation failed; sending email without attachment"
        );
      }

      const result = await sendSupportThankYouEmail({
        supportPayment,
        attachments: attachment ? [attachment] : [],
      });

      if (!result.sent) {
        await SupportPayment.updateOne(
          { _id: normalizedSupportId },
          {
            $set: {
              thankYouEmailLastAttemptAt: new Date(),
              thankYouEmailError: String(result.reason || "send_failed"),
            },
          }
        );

        if (!result.skipped) {
          reqLogger.warn(
            {
              supportPaymentId: normalizedSupportId,
              reason: result.reason,
              error: result.error,
            },
            "Support thank-you email was not delivered"
          );
        }
        return;
      }

      await SupportPayment.updateOne(
        { _id: normalizedSupportId },
        {
          $set: {
            thankYouEmailSentAt: new Date(),
            thankYouEmailRecipient: String(supportPayment.email || "").toLowerCase(),
            thankYouEmailMessageId: String(result.messageId || result.providerId || ""),
            thankYouEmailLastAttemptAt: new Date(),
            thankYouEmailError: "",
          },
        }
      );

      reqLogger.info(
        {
          supportPaymentId: normalizedSupportId,
          emailId: result.messageId || result.providerId,
        },
        "Support thank-you email delivered"
      );
    } catch (error) {
      reqLogger.error(
        {
          err: error,
          supportPaymentId: normalizedSupportId,
        },
        "Support thank-you email processing failed"
      );

      try {
        await SupportPayment.updateOne(
          { _id: normalizedSupportId },
          {
            $set: {
              thankYouEmailLastAttemptAt: new Date(),
              thankYouEmailError: "processing_failed",
            },
          }
        );
      } catch {
        // Ignore metadata update failures for background email jobs.
      }
    }
  });
};

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
  if (providedEmail && !isMatchingEmail(providedEmail, authIdentity.email)) {
    res.status(403).json({
      success: false,
      message: emailMismatchMessage,
    });
    return null;
  }

  return {
    authIdentity,
    normalizedOrderId,
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
  if (providedEmail && !isMatchingEmail(providedEmail, authIdentity.email)) {
    res.status(403).json({
      success: false,
      message: emailMismatchMessage,
    });
    return null;
  }

  return {
    authIdentity,
    normalizedOrderId,
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

const queueServiceEmailIfConfigured = ({ emailDispatchQueued, bookingId, reqLogger }) => {
  if (!emailDispatchQueued) {
    return;
  }

  scheduleServiceConfirmationEmail({
    bookingId,
    reqLogger,
  });
};

const queueSupportEmailIfConfigured = ({ emailDispatchQueued, supportPaymentId, reqLogger }) => {
  if (!emailDispatchQueued) {
    return;
  }

  scheduleSupportThankYouEmail({
    supportPaymentId,
    reqLogger,
  });
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
  try {
    await SupportPayment.findOneAndUpdate(
      { orderId: normalizedOrderId },
      {
        $set: {
          ...supportInsertBase,
          paymentStatus: nextStatus,
          paymentProvider: "cashfree",
          paymentId: createPendingPaymentId(normalizedOrderId),
        },
        $setOnInsert: {
          ...supportInsertBase,
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

  if (bookingInsertBaseAtFailure) {
    Object.assign(rescueSet, bookingInsertBaseAtFailure);
  }

  const rescueUpdate = {
    $set: rescueSet,
  };

  if (bookingInsertBaseAtFailure) {
    rescueUpdate.$setOnInsert = bookingInsertBaseAtFailure;
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

  if (supportInsertBaseAtFailure) {
    Object.assign(rescueSet, supportInsertBaseAtFailure);
  }

  const rescueUpdate = {
    $set: rescueSet,
  };

  if (supportInsertBaseAtFailure) {
    rescueUpdate.$setOnInsert = supportInsertBaseAtFailure;
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
      return res.status(403).json({
        success: false,
        message: "Booking email must match your signed-in Google account.",
      });
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
  const emailDispatchQueued = isEmailDispatchConfigured();

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
      return res.status(403).json({
        success: false,
        message: "Support email must match your signed-in Google account.",
      });
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
  const emailDispatchQueued = isEmailDispatchConfigured();
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

    const savedSupportPayment = await SupportPayment.findOneAndUpdate(
      { orderId: normalizedOrderId },
      {
        $set: {
          ...supportInsertBase,
          paymentStatus: "paid",
          paymentProvider: "cashfree",
          paymentId: resolvedPaymentId,
          paidAt: new Date(),
        },
        $setOnInsert: {
          ...supportInsertBase,
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
        "_id orderId paymentId paymentStatus paymentProvider service serviceSlug amount preferredDate preferredTime paidAt createdAt updatedAt confirmationEmailSentAt confirmationEmailError"
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
          confirmationEmailSentAt: booking.confirmationEmailSentAt,
          confirmationEmailError: booking.confirmationEmailError,
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
        "_id orderId paymentId paymentStatus paymentProvider contributorName amount message paidAt createdAt updatedAt thankYouEmailSentAt thankYouEmailError"
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
          thankYouEmailSentAt: item.thankYouEmailSentAt,
          thankYouEmailError: item.thankYouEmailError,
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
