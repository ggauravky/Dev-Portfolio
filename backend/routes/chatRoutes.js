// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Unauthorized copying, modification, or distribution of this software,
// via any medium, is strictly prohibited without the express written
// consent of the author. See LICENSE for details.
// Source: https://github.com/ggauravky/Dev-Portfolio

const express = require("express");
const router = express.Router();
const { chatbot, chatbotPrivacyPolicy } = require("../controllers/chatbotController");
const { chatRateLimiter } = require("../middleware/rateLimiter");
const { body, validationResult } = require("express-validator");

// Validation rules for chat input
const chatValidation = [
  body("message")
    .trim()
    .notEmpty()
    .withMessage("Message cannot be empty")
    .isLength({ min: 1, max: 1000 })
    .withMessage("Message must be between 1 and 1000 characters"),
];

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      reply: errors.array()[0].msg,
    });
  }
  next();
};

// POST /api/chat
router.get("/privacy-policy", chatbotPrivacyPolicy);
router.post("/", chatRateLimiter, chatValidation, validate, chatbot);

module.exports = router;
