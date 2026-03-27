// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Unauthorized copying, modification, or distribution of this software,
// via any medium, is strictly prohibited without the express written
// consent of the author. See LICENSE for details.
// Source: https://github.com/ggauravky/Dev-Portfolio

const { randomBytes } = require("node:crypto");
const Booking = require("../models/Booking");
const { logger } = require("../utils/logger");

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

const normalizeIndianPhone = (value) => {
  const digits = String(value || "").replace(/\D/g, "");
  return digits.length >= 10 ? digits.slice(-10) : digits;
};

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

const getService = (slug) => SERVICE_CATALOG[String(slug || "").trim()];

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
      message: "A booking conflict occurred while creating payment order. Please retry once.",
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

exports.createOrder = async (req, res) => {
  const reqLogger = req.log || logger;

  try {
    const { name, email, phone, service, preferredDate, preferredTime, projectBrief } = req.body;
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

  try {
    const { orderId, email } = req.body;
    const normalizedOrderId = String(orderId || "").trim();
    const normalizedEmail = String(email || "").trim().toLowerCase();

    let draftBooking = await Booking.findOne({ orderId: normalizedOrderId });

    if (draftBooking?.paymentStatus === "paid") {
      return res.status(200).json({
        success: true,
        message: "Payment already verified",
        data: {
          bookingId: draftBooking._id,
          service: draftBooking.service,
          amount: draftBooking.amount,
        },
      });
    }

    const config = getCashfreeConfig();

    const cashfreeOrder = await callCashfreeApi({
      method: "GET",
      endpoint: `/pg/orders/${encodeURIComponent(normalizedOrderId)}`,
      config,
    });

    if (!cashfreeOrder?.order_id) {
      return res.status(400).json({
        success: false,
        message: "Unable to validate payment order details",
      });
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

      return res.status(403).json({
        success: false,
        message: "Verification details do not match this order",
      });
    }

    const orderServiceSlug = String(cashfreeOrder.order_tags?.service_slug || "").trim();
    const selectedService = getService(draftBooking?.serviceSlug || orderServiceSlug);
    if (!selectedService) {
      return res.status(400).json({
        success: false,
        message: "Order service is invalid",
      });
    }

    if (Number(cashfreeOrder.order_amount) !== selectedService.amount) {
      return res.status(400).json({
        success: false,
        message: "Order amount does not match selected service",
      });
    }

    if (String(cashfreeOrder.order_currency || "").toUpperCase() !== "INR") {
      return res.status(400).json({
        success: false,
        message: "Order currency is invalid",
      });
    }

    if (draftBooking && selectedService?.amount !== draftBooking.amount) {
      return res.status(400).json({
        success: false,
        message: "Booking details mismatch",
      });
    }

    if (draftBooking && orderServiceSlug && orderServiceSlug !== draftBooking.serviceSlug) {
      return res.status(400).json({
        success: false,
        message: "Order service does not match selected service",
      });
    }

    if (!draftBooking) {
      draftBooking = await Booking.findOneAndUpdate(
        { orderId: normalizedOrderId },
        {
          $set: {
            name: String(cashfreeOrder.customer_details?.customer_name || "Customer").trim() || "Customer",
            email: orderEmail || normalizedEmail,
            phone: normalizeIndianPhone(cashfreeOrder.customer_details?.customer_phone),
            serviceSlug: orderServiceSlug,
            service: selectedService.title,
            preferredDate: new Date(normalizePreferredDate(cashfreeOrder.order_tags?.preferred_date)),
            preferredTime: normalizePreferredTime(cashfreeOrder.order_tags?.preferred_time),
            projectBrief: "",
            amount: selectedService.amount,
            paymentProvider: "cashfree",
            paymentStatus: String(cashfreeOrder.order_status || "created").toLowerCase() || "created",
            paymentId: createPendingPaymentId(normalizedOrderId),
            date: new Date(),
          },
          $setOnInsert: {
            orderId: normalizedOrderId,
          },
        },
        {
          new: true,
          upsert: true,
          runValidators: true,
        }
      );
    }

    const paymentList = await callCashfreeApi({
      method: "GET",
      endpoint: `/pg/orders/${encodeURIComponent(normalizedOrderId)}/payments`,
      config,
    });

    const successfulPayment = (Array.isArray(paymentList) ? paymentList : []).find(
      (payment) => String(payment.payment_status || "").toUpperCase() === "SUCCESS"
    );

    if (!successfulPayment) {
      await Booking.updateOne(
        { orderId: normalizedOrderId },
        {
          $set: {
            paymentStatus: String(cashfreeOrder.order_status || "").toLowerCase() || "pending",
          },
        }
      );

      return res.status(409).json({
        success: false,
        message: "Payment is not completed yet",
      });
    }

    const booking = await Booking.findOneAndUpdate(
      { orderId: normalizedOrderId },
      {
        $set: {
          paymentStatus: "paid",
          paymentId:
            String(successfulPayment.cf_payment_id || successfulPayment.payment_id || "").trim() ||
            `cf_${normalizedOrderId}`,
          paymentProvider: "cashfree",
          paidAt: new Date(),
        },
      },
      { new: true }
    );

    reqLogger.info(
      {
        bookingId: booking._id,
        paymentId: booking.paymentId,
        service: booking.service,
      },
      "Payment verified and booking saved"
    );

    return res.status(200).json({
      success: true,
      message: "Payment verified and booking confirmed",
      data: {
        bookingId: booking._id,
        service: booking.service,
        amount: booking.amount,
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
