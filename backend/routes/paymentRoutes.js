const express = require("express");
const {
  createOrder,
  createSupportOrder,
  downloadReceipt,
  getTransaction,
  handleRazorpayWebhook,
  recordPaymentFailure,
  verifyPayment,
} = require("../controllers/paymentController");
const { requireAuth } = require("../middleware/auth");
const {
  paymentOrderRateLimiter,
  paymentReadRateLimiter,
  paymentVerificationRateLimiter,
  paymentWebhookRateLimiter,
} = require("../middleware/rateLimiter");
const {
  paymentFailureValidationRules,
  paymentOrderValidationRules,
  supportOrderValidationRules,
  paymentTransactionParamValidationRules,
  paymentVerificationValidationRules,
  validate,
} = require("../middleware/validator");

const router = express.Router();

router.post("/webhook/razorpay", paymentWebhookRateLimiter, handleRazorpayWebhook);
router.post("/create-order", paymentOrderRateLimiter, requireAuth, paymentOrderValidationRules, validate, createOrder);
router.post("/create-support-order", paymentOrderRateLimiter, requireAuth, supportOrderValidationRules, validate, createSupportOrder);
router.post("/verify", paymentVerificationRateLimiter, requireAuth, paymentVerificationValidationRules, validate, verifyPayment);
router.post("/failure", paymentVerificationRateLimiter, requireAuth, paymentFailureValidationRules, validate, recordPaymentFailure);
router.get("/transaction/:transactionId", paymentReadRateLimiter, requireAuth, paymentTransactionParamValidationRules, validate, getTransaction);
router.get("/:transactionId/receipt", paymentReadRateLimiter, requireAuth, paymentTransactionParamValidationRules, validate, downloadReceipt);

module.exports = router;
