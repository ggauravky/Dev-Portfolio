const express = require("express");
const router = express.Router();
const { chat } = require("../controllers/chatController");
const { chatRateLimiter } = require("../middleware/rateLimiter");
const { body, validationResult } = require("express-validator");

// Validation rules for chat input
const chatValidation = [
  body("message")
    .trim()
    .notEmpty()
    .withMessage("Message cannot be empty")
    .isLength({ min: 1, max: 1000 })
    .withMessage("Message must be between 1 and 1000 characters")
    .escape(), // sanitize HTML entities
];

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      reply: errors.array()[0].msg,
    });
  }
  next();
};

// POST /api/chat
router.post("/", chatRateLimiter, chatValidation, validate, chat);

module.exports = router;
