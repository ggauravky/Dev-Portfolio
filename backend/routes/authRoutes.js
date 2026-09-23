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
const {
  deleteProfileAvatar,
  uploadProfileAvatar,
} = require("../controllers/profileController");
const { authRateLimiter, avatarUploadRateLimiter } = require("../middleware/rateLimiter");
const { handleAvatarUpload } = require("../middleware/avatarUpload");
const { attachOptionalUser, requireAuth } = require("../middleware/auth");
const { requireTrustedOrigin } = require("../config/trustedOrigins");
const {
  authProfileUpdateValidationRules,
  googleSignInValidationRules,
  validate,
} = require("../middleware/validator");

const router = express.Router();

router.get("/config", authRateLimiter, getPublicAuthConfig);
router.post(
  "/google",
  authRateLimiter,
  requireTrustedOrigin,
  googleSignInValidationRules,
  validate,
  googleSignIn
);
router.get("/me", attachOptionalUser, getCurrentSession);
router.get("/profile", authRateLimiter, requireAuth, getProfile);
router.patch(
  "/profile",
  authRateLimiter,
  requireTrustedOrigin,
  requireAuth,
  authProfileUpdateValidationRules,
  validate,
  updateProfile
);
router.post(
  "/profile/avatar",
  requireTrustedOrigin,
  requireAuth,
  avatarUploadRateLimiter,
  handleAvatarUpload,
  uploadProfileAvatar
);
router.delete(
  "/profile/avatar",
  requireTrustedOrigin,
  requireAuth,
  avatarUploadRateLimiter,
  deleteProfileAvatar
);
router.post("/logout", authRateLimiter, requireTrustedOrigin, attachOptionalUser, logout);

module.exports = router;
