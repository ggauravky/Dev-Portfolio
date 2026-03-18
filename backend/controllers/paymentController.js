// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Unauthorized copying, modification, or distribution of this software,
// via any medium, is strictly prohibited without the express written
// consent of the author. See LICENSE for details.
// Source: https://github.com/ggauravky/Dev-Portfolio

const { createHmac, timingSafeEqual } = require("node:crypto");
const Razorpay = require("razorpay");
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

const getRazorpayClient = () => {
  const keyId = String(process.env.RAZORPAY_KEY_ID || "").trim();
  const keySecret = String(process.env.RAZORPAY_KEY_SECRET || "").trim();

  if (!keyId || !keySecret) {
    const configError = new Error("Razorpay keys are missing in environment variables");
    configError.code = PAYMENT_CONFIG_ERROR_CODE;
    throw configError;
  }

  return {
    keyId,
    keySecret,
    client: new Razorpay({ key_id: keyId, key_secret: keySecret }),
  };
};

const getService = (slug) => SERVICE_CATALOG[String(slug || "").trim()];

const mapGatewayError = (error, fallbackMessage) => {
  if (error?.code === PAYMENT_CONFIG_ERROR_CODE) {
    return {
      status: 503,
      message:
        "Payment service is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in backend .env.",
      logLevel: "warn",
    };
  }

  const razorpayStatus =
    Number(error?.statusCode) ||
    Number(error?.response?.status) ||
    Number(error?.error?.status_code);

  if (Number.isFinite(razorpayStatus)) {
    if (razorpayStatus === 401 || razorpayStatus === 403) {
      return {
        status: 502,
        message:
          "Payment gateway authentication failed. Verify Razorpay key ID and secret for the correct mode.",
        logLevel: "error",
      };
    }

    if (razorpayStatus >= 400 && razorpayStatus < 500) {
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

    const { keyId, client } = getRazorpayClient();

    const amountInPaise = selectedService.amount * 100;
    const receipt = `svc_${Date.now()}_${Math.floor(Math.random() * 10000)}`;

    const order = await client.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt,
      notes: {
        customer_name: String(name || "").trim(),
        customer_email: String(email || "").trim().toLowerCase(),
        customer_phone: String(phone || "").trim(),
        service_slug: String(service || "").trim(),
        preferred_date: String(preferredDate || "").trim(),
        preferred_time: String(preferredTime || "").trim(),
        project_brief: String(projectBrief || "").trim().slice(0, 500),
      },
    });

    reqLogger.info(
      {
        orderId: order.id,
        amountInPaise,
        service,
        preferredDate,
        preferredTime,
      },
      "Razorpay order created"
    );

    return res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId,
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
    const {
      name,
      email,
      phone,
      service,
      preferredDate,
      preferredTime,
      projectBrief,
      amount,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    const selectedService = getService(service);
    if (!selectedService) {
      return res.status(400).json({
        success: false,
        message: "Selected service is invalid",
      });
    }

    if (Number(amount) !== selectedService.amount * 100) {
      return res.status(400).json({
        success: false,
        message: "Payment amount mismatch",
      });
    }

    const { keySecret, client } = getRazorpayClient();

    const razorpayOrder = await client.orders.fetch(String(razorpay_order_id));
    if (!razorpayOrder?.id) {
      return res.status(400).json({
        success: false,
        message: "Unable to validate payment order details",
      });
    }

    if (Number(razorpayOrder.amount) !== selectedService.amount * 100) {
      return res.status(400).json({
        success: false,
        message: "Order amount does not match selected service",
      });
    }

    if (String(razorpayOrder.currency || "").toUpperCase() !== "INR") {
      return res.status(400).json({
        success: false,
        message: "Order currency is invalid",
      });
    }

    const orderServiceSlug = String(razorpayOrder.notes?.service_slug || "").trim();
    if (orderServiceSlug && orderServiceSlug !== String(service || "").trim()) {
      return res.status(400).json({
        success: false,
        message: "Order service does not match selected service",
      });
    }

    const payload = `${razorpay_order_id}|${razorpay_payment_id}`;

    const expectedSignature = createHmac("sha256", keySecret)
      .update(payload)
      .digest("hex");

    const expected = Buffer.from(expectedSignature, "utf8");
    const received = Buffer.from(String(razorpay_signature), "utf8");

    if (expected.length !== received.length || !timingSafeEqual(expected, received)) {
      reqLogger.warn({ razorpay_order_id, razorpay_payment_id }, "Invalid payment signature");
      return res.status(400).json({
        success: false,
        message: "Payment signature verification failed",
      });
    }

    const booking = await Booking.create({
      name: String(name || "").trim(),
      email: String(email || "").trim().toLowerCase(),
      phone: String(phone || "").trim(),
      serviceSlug: String(service || "").trim(),
      service: selectedService.title,
      preferredDate: new Date(preferredDate),
      preferredTime: String(preferredTime || "").trim(),
      projectBrief: String(projectBrief || "").trim(),
      amount: selectedService.amount,
      paymentId: String(razorpay_payment_id),
      orderId: String(razorpay_order_id),
      date: new Date(),
    });

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
