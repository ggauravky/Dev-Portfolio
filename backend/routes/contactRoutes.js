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
