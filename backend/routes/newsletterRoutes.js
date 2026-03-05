// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Unauthorized copying, modification, or distribution of this software,
// via any medium, is strictly prohibited without the express written
// consent of the author. See LICENSE for details.
// Source: https://github.com/ggauravky/Dev-Portfolio

const express = require("express");
const router = express.Router();
const {
  subscribe,
  unsubscribe,
  getStats,
} = require("../controllers/newsletterController");
const { contactRateLimiter } = require("../middleware/rateLimiter");

// Apply rate limiting to newsletter routes
router.post("/subscribe", contactRateLimiter, subscribe);
router.post("/unsubscribe", contactRateLimiter, unsubscribe);
router.get("/stats", getStats);

module.exports = router;
