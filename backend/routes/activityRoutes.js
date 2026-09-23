const express = require("express");
const { requireAuth } = require("../middleware/auth");
const { authRateLimiter } = require("../middleware/rateLimiter");
const { getMyActivity } = require("../controllers/activityController");

const router = express.Router();

router.get("/my", authRateLimiter, requireAuth, getMyActivity);

module.exports = router;
