// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Unauthorized copying, modification, or distribution of this software,
// via any medium, is strictly prohibited without the express written
// consent of the author. See LICENSE for details.
// Source: https://github.com/ggauravky/Dev-Portfolio

const express = require("express");
const {
  createOrder,
  verifyPayment,
  createSupportOrder,
  verifySupportPayment,
  getMyBookings,
  getMySupportPayments,
  downloadServiceReceipt,
  downloadSupportReceipt,
} = require("../controllers/paymentController");
const { paymentRateLimiter } = require("../middleware/rateLimiter");
const {
  paymentCreateOrderValidationRules,
  paymentVerifyValidationRules,
  supportCreateOrderValidationRules,
  supportVerifyValidationRules,
  paymentReceiptValidationRules,
  validate,
} = require("../middleware/validator");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

const isPaymentGatewayEnabled = () =>
  String(process.env.PAYMENT_GATEWAY_ENABLED || "true").trim().toLowerCase() === "true";

const blockIfGatewayDisabled = (req, res, next) => {
  if (isPaymentGatewayEnabled()) {
    return next();
  }

  return res.status(503).json({
    success: false,
    message: "Payment gateway is under construction. Please try again later.",
  });
};

router.use(blockIfGatewayDisabled);

router.post(
  "/create-order",
  paymentRateLimiter,
  requireAuth,
  paymentCreateOrderValidationRules,
  validate,
  createOrder
);
router.post(
  "/verify",
  paymentRateLimiter,
  requireAuth,
  paymentVerifyValidationRules,
  validate,
  verifyPayment
);
router.post(
  "/create-support-order",
  paymentRateLimiter,
  requireAuth,
  supportCreateOrderValidationRules,
  validate,
  createSupportOrder
);
router.post(
  "/verify-support",
  paymentRateLimiter,
  requireAuth,
  supportVerifyValidationRules,
  validate,
  verifySupportPayment
);
router.get("/my-bookings", paymentRateLimiter, requireAuth, getMyBookings);
router.get("/my-support-payments", paymentRateLimiter, requireAuth, getMySupportPayments);
router.get(
  "/receipt/service/:orderId",
  paymentRateLimiter,
  requireAuth,
  paymentReceiptValidationRules,
  validate,
  downloadServiceReceipt
);
router.get(
  "/receipt/support/:orderId",
  paymentRateLimiter,
  requireAuth,
  paymentReceiptValidationRules,
  validate,
  downloadSupportReceipt
);

module.exports = router;
