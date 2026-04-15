const express = require("express");
const { requireAuth } = require("../middleware/auth");
const { paymentRateLimiter } = require("../middleware/rateLimiter");
const { getMyActivity } = require("../controllers/activityController");

const router = express.Router();

router.get("/my", paymentRateLimiter, requireAuth, getMyActivity);

module.exports = router;
