// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Unauthorized copying, modification, or distribution of this software,
// via any medium, is strictly prohibited without the express written
// consent of the author. See LICENSE for details.
// Source: https://github.com/ggauravky/Dev-Portfolio

const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const {
  subscribe,
  unsubscribe,
  getStats,
} = require("../controllers/newsletterController");
const { contactRateLimiter } = require("../middleware/rateLimiter");
const { requireAdminKey } = require("../middleware/adminAuth");

const emailValidation = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required.")
    .isEmail()
    .withMessage("Please provide a valid email address.")
    .normalizeEmail()
    .isLength({ max: 254 })
    .withMessage("Email address is too long."),
];

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array()[0].msg,
    });
  }
  next();
};

// Apply rate limiting to newsletter routes
router.post("/subscribe", contactRateLimiter, emailValidation, validate, subscribe);
router.post("/unsubscribe", contactRateLimiter, emailValidation, validate, unsubscribe);

// Private route — require ADMIN_KEY header (x-admin-key)
router.get("/stats", requireAdminKey, getStats);

module.exports = router;
