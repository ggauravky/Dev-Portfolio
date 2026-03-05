// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Unauthorized copying, modification, or distribution of this software,
// via any medium, is strictly prohibited without the express written
// consent of the author. See LICENSE for details.
// Source: https://github.com/ggauravky/Dev-Portfolio

const rateLimit = require("express-rate-limit");

// Rate limiter for contact form submissions
exports.contactRateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 5, // Limit each IP to 5 requests per windowMs
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
  max: parseInt(process.env.CHAT_RATE_LIMIT_MAX) || 30,
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
