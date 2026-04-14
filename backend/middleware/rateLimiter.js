// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Unauthorized copying, modification, or distribution of this software,
// via any medium, is strictly prohibited without the express written
// consent of the author. See LICENSE for details.
// Source: https://github.com/ggauravky/Dev-Portfolio

const rateLimit = require("express-rate-limit");

const parsePositiveInt = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

// Rate limiter for contact form submissions
exports.contactRateLimiter = rateLimit({
  windowMs: parsePositiveInt(process.env.RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000), // 15 minutes
  max: parsePositiveInt(process.env.RATE_LIMIT_MAX_REQUESTS, 5), // Limit each IP to 5 requests per windowMs
  message: {
    success: false,
    message: "Too many messages sent from this IP. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: "Too many requests. Please try again in 15 minutes.",
      retryAfter: req.rateLimit.resetTime,
    });
  },
});

// General API rate limiter
exports.generalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later.",
  },
});

// Chat (AI chatbot) rate limiter — 30 messages per 10 minutes per IP
exports.chatRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: parsePositiveInt(process.env.CHAT_RATE_LIMIT_MAX, 30),
  message: {
    success: false,
    reply: "You're sending messages too quickly. Please wait a few minutes before trying again.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      reply: "Too many messages sent. Please slow down and try again in a few minutes.",
    });
  },
});

// Payment route limiter to reduce abuse on order creation and verification
exports.paymentRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: parsePositiveInt(process.env.PAYMENT_RATE_LIMIT_MAX, 15),
  message: {
    success: false,
    message: "Too many payment requests. Please try again shortly.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Webhook limiter is separate from checkout APIs so gateway retries are allowed
// while still reducing abuse on public webhook endpoints.
exports.paymentWebhookRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: parsePositiveInt(process.env.PAYMENT_WEBHOOK_RATE_LIMIT_MAX, 120),
  message: {
    success: false,
    message: "Too many webhook requests. Please retry shortly.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Auth route limiter to prevent Google sign-in abuse
exports.authRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: parsePositiveInt(process.env.AUTH_RATE_LIMIT_MAX, 20),
  message: {
    success: false,
    message: "Too many authentication attempts. Please try again shortly.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Blog support limiter to protect support endpoints from spam clicks
exports.blogSupportRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: parsePositiveInt(process.env.BLOG_SUPPORT_RATE_LIMIT_MAX, 80),
  message: {
    success: false,
    message: "Too many support requests. Please wait and try again.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
