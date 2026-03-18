// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Unauthorized copying, modification, or distribution of this software,
// via any medium, is strictly prohibited without the express written
// consent of the author. See LICENSE for details.
// Source: https://github.com/ggauravky/Dev-Portfolio

const express = require("express");
const { createOrder, verifyPayment } = require("../controllers/paymentController");
const { paymentRateLimiter } = require("../middleware/rateLimiter");
const {
  paymentCreateOrderValidationRules,
  paymentVerifyValidationRules,
  validate,
} = require("../middleware/validator");

const router = express.Router();

router.post("/create-order", paymentRateLimiter, paymentCreateOrderValidationRules, validate, createOrder);
router.post("/verify", paymentRateLimiter, paymentVerifyValidationRules, validate, verifyPayment);

module.exports = router;
