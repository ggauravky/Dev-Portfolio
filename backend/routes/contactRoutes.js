// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Unauthorized copying, modification, or distribution of this software,
// via any medium, is strictly prohibited without the express written
// consent of the author. See LICENSE for details.
// Source: https://github.com/ggauravky/Dev-Portfolio

const express = require("express");
const router = express.Router();
const {
  submitContact,
  getAllContacts,
  getContactStats,
} = require("../controllers/contactController");
const { contactValidationRules, validate } = require("../middleware/validator");
const { contactRateLimiter } = require("../middleware/rateLimiter");

// Public route - Submit contact form
router.post(
  "/",
  contactRateLimiter,
  contactValidationRules,
  validate,
  submitContact
);

// Private routes (you can add authentication middleware later)
router.get("/", getAllContacts);
router.get("/stats", getContactStats);

module.exports = router;
