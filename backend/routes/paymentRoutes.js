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
} = require("../controllers/paymentController");
const { paymentRateLimiter } = require("../middleware/rateLimiter");
const {
  paymentCreateOrderValidationRules,
  paymentVerifyValidationRules,
  supportCreateOrderValidationRules,
  supportVerifyValidationRules,
  validate,
} = require("../middleware/validator");

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

router.post("/create-order", paymentRateLimiter, paymentCreateOrderValidationRules, validate, createOrder);
router.post("/verify", paymentRateLimiter, paymentVerifyValidationRules, validate, verifyPayment);
router.post(
  "/create-support-order",
  paymentRateLimiter,
  supportCreateOrderValidationRules,
  validate,
  createSupportOrder
);
router.post(
  "/verify-support",
  paymentRateLimiter,
  supportVerifyValidationRules,
  validate,
  verifySupportPayment
);

module.exports = router;
