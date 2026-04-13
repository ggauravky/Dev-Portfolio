// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Unauthorized copying, modification, or distribution of this software,
// via any medium, is strictly prohibited without the express written
// consent of the author. See LICENSE for details.
// Source: https://github.com/ggauravky/Dev-Portfolio

const express = require("express");
const {
  getPublicAuthConfig,
  googleSignIn,
  getCurrentSession,
  getProfile,
  updateProfile,
  logout,
} = require("../controllers/authController");
const { authRateLimiter } = require("../middleware/rateLimiter");
const { attachOptionalUser, requireAuth } = require("../middleware/auth");
const {
  authProfileUpdateValidationRules,
  validate,
} = require("../middleware/validator");

const router = express.Router();

router.get("/config", authRateLimiter, getPublicAuthConfig);
router.post("/google", authRateLimiter, googleSignIn);
router.get("/me", attachOptionalUser, getCurrentSession);
router.get("/profile", authRateLimiter, requireAuth, getProfile);
router.patch(
  "/profile",
  authRateLimiter,
  requireAuth,
  authProfileUpdateValidationRules,
  validate,
  updateProfile
);
router.post("/logout", attachOptionalUser, logout);

module.exports = router;
