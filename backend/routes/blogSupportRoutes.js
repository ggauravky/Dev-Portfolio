// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Unauthorized copying, modification, or distribution of this software,
// via any medium, is strictly prohibited without the express written
// consent of the author. See LICENSE for details.
// Source: https://github.com/ggauravky/Dev-Portfolio

const express = require("express");
const {
  getSupportStatus,
  getSupportCounts,
  supportBlogPost,
  getMySupports,
} = require("../controllers/blogSupportController");
const { requireAuth, attachOptionalUser } = require("../middleware/auth");
const { blogSupportRateLimiter } = require("../middleware/rateLimiter");
const {
  blogSupportValidationRules,
  blogSupportStatusValidationRules,
  validate,
} = require("../middleware/validator");

const router = express.Router();

router.get(
  "/support-status",
  blogSupportRateLimiter,
  attachOptionalUser,
  blogSupportStatusValidationRules,
  validate,
  getSupportStatus
);
router.get("/support-counts", blogSupportRateLimiter, getSupportCounts);
router.get("/my-supports", blogSupportRateLimiter, requireAuth, getMySupports);
router.post(
  "/support",
  blogSupportRateLimiter,
  requireAuth,
  blogSupportValidationRules,
  validate,
  supportBlogPost
);

module.exports = router;
