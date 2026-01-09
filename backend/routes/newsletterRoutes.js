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
