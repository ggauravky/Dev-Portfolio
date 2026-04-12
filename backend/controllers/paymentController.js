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
  ].some((key) => Object.hasOwn(paymentList, key));

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
    const selectedService = getService(service);

    if (!selectedService) {
      return res.status(400).json({
        success: false,
        message: "Selected service is invalid",
      });
    }

    const config = getCashfreeConfig();

    const serviceSlug = String(service || "").trim();
    const normalizedEmail = String(email || "").trim().toLowerCase();
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
          customer_name: String(name || "").trim(),
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
            name: String(name || "").trim(),
            email: normalizedEmail,
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

  if (!isDatabaseReady()) {
    return res.status(503).json({
      success: false,
      message: "Database is temporarily unavailable. Please retry in a moment.",
    });
  }

  try {
    const { orderId, email } = req.body;
    const { ipAddress, userAgent } = getRequestClientMeta(req);
    const normalizedOrderId = String(orderId || "").trim();
    const normalizedEmail = String(email || "").trim().toLowerCase();

    let draftBooking = await Booking.findOne({ orderId: normalizedOrderId });

    if (draftBooking?.paymentStatus === "paid") {
      scheduleServiceConfirmationEmail({
        bookingId: draftBooking._id,
        reqLogger,
      });

      return res.status(200).json({
        success: true,
        message: "Payment already verified",
        data: {
          bookingId: draftBooking._id,
          service: draftBooking.service,
          amount: draftBooking.amount,
          orderId: normalizedOrderId,
          paymentId: draftBooking.paymentId,
          emailDispatchQueued: true,
        },
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

    const paymentList = await callCashfreeApi({
      method: "GET",
      endpoint: `/pg/orders/${encodeURIComponent(normalizedOrderId)}/payments`,
      config,
    });

    const successfulPayment = findSuccessfulPayment(paymentList);

    if (!successfulPayment) {
      const failedPayment = findFailedPayment(paymentList);
      let nextStatus = gatewayOrderStatus;
      if (failedPayment) {
        nextStatus = "failed";
      } else if (gatewayOrderStatus === "failed") {
        nextStatus = "pending";
      } else if (gatewayOrderStatus === "paid") {
        nextStatus = "pending";
      }

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

      const pendingMessage = gatewayOrderStatus === "paid"
        ? "Payment is being finalized by gateway. Please retry in a few seconds."
        : "Payment is not completed yet";

      return res.status(409).json({
        success: false,
        message: failedPayment
          ? "Payment was not completed. If amount was deducted, gateway will auto-reconcile."
          : pendingMessage,
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

    scheduleServiceConfirmationEmail({
      bookingId: booking._id,
      reqLogger,
    });

    return res.status(200).json({
      success: true,
      message: "Payment verified and booking confirmed",
      data: {
        bookingId: booking._id,
        service: booking.service,
        amount: booking.amount,
        orderId: normalizedOrderId,
        paymentId: booking.paymentId,
        emailDispatchQueued: true,
      },
    });
  } catch (error) {
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
    const normalizedEmail = String(email || "").trim().toLowerCase();
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
          customer_name: String(name || "").trim(),
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
            contributorName: String(name || "").trim(),
            email: normalizedEmail,
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
  const normalizedOrderId = String(req.body?.orderId || "").trim();
  const normalizedEmail = String(req.body?.email || "").trim().toLowerCase();

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

    if (supportRecord?.paymentStatus === "paid") {
      scheduleSupportThankYouEmail({
        supportPaymentId: supportRecord._id,
        reqLogger,
      });

      return res.status(200).json({
        success: true,
        message: "Support payment already verified",
        data: {
          orderId: normalizedOrderId,
          amount: supportRecord.amount,
          contributorName: supportRecord.contributorName,
          paymentId: supportRecord.paymentId,
          emailDispatchQueued: true,
        },
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

    const paymentList = await callCashfreeApi({
      method: "GET",
      endpoint: `/pg/orders/${encodeURIComponent(normalizedOrderId)}/payments`,
      config,
    });

    const successfulPayment = findSuccessfulPayment(paymentList);

    if (!successfulPayment) {
      const failedPayment = findFailedPayment(paymentList);

      let nextStatus = gatewayOrderStatus;
      if (failedPayment) {
        nextStatus = "failed";
      } else if (gatewayOrderStatus === "failed") {
        nextStatus = "pending";
      } else if (gatewayOrderStatus === "paid") {
        nextStatus = "pending";
      }
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

      const pendingMessage = gatewayOrderStatus === "paid"
        ? "Payment is being finalized by gateway. Please retry in a few seconds."
        : "Payment is not completed yet";

      return res.status(409).json({
        success: false,
        message: failedPayment
          ? "Payment was not completed. If amount was deducted, it will be auto-reconciled by gateway."
          : pendingMessage,
      });
    }

    const resolvedPaymentId = resolveGatewayPaymentId(successfulPayment, normalizedOrderId);

    const conflictingPayment = await SupportPayment.findOne({
      paymentId: resolvedPaymentId,
      orderId: { $ne: normalizedOrderId },
    })
      .select("orderId paymentStatus")
      .lean();

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

    scheduleSupportThankYouEmail({
      supportPaymentId: savedSupportPayment?._id,
      reqLogger,
    });

    return res.status(200).json({
      success: true,
      message: "Support payment verified",
      data: {
        orderId: normalizedOrderId,
        amount: orderAmount,
        contributorName,
        paymentId: resolvedPaymentId,
        emailDispatchQueued: true,
      },
    });
  } catch (error) {
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

exports.downloadServiceReceipt = async (req, res) => {
  const reqLogger = req.log || logger;
  const normalizedOrderId = String(req.params?.orderId || "").trim();
  const normalizedEmail = normalizeEmailAddress(req.query?.email);

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

    if (!isMatchingEmail(booking.email, normalizedEmail)) {
      return res.status(403).json({
        success: false,
        message: "Receipt access is not allowed for this email",
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
    res.setHeader("Cache-Control", "private, max-age=300");

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
  const normalizedOrderId = String(req.params?.orderId || "").trim();
  const normalizedEmail = normalizeEmailAddress(req.query?.email);

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

    if (!isMatchingEmail(supportPayment.email, normalizedEmail)) {
      return res.status(403).json({
        success: false,
        message: "Receipt access is not allowed for this email",
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
    res.setHeader("Cache-Control", "private, max-age=300");

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
