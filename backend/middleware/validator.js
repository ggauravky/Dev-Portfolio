// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Unauthorized copying, modification, or distribution of this software,
// via any medium, is strictly prohibited without the express written
// consent of the author. See LICENSE for details.
// Source: https://github.com/ggauravky/Dev-Portfolio

const { body, query, param, validationResult } = require("express-validator");

const getMinBookingDate = () => {
  const minDate = new Date();
  minDate.setHours(0, 0, 0, 0);
  minDate.setDate(minDate.getDate() + 2);
  return minDate;
};

const bookingDetailValidationRules = [
  body("phone")
    .trim()
    .notEmpty()
    .withMessage("Phone number is required")
    .matches(/^[6-9]\d{9}$/)
    .withMessage("Phone number must be a valid 10-digit Indian mobile number"),

  body("preferredDate")
    .notEmpty()
    .withMessage("Preferred date is required")
    .isISO8601({ strict: true, strictSeparator: true })
    .withMessage("Preferred date must be a valid date in YYYY-MM-DD format")
    .custom((value) => {
      const selectedDate = new Date(value);
      selectedDate.setHours(0, 0, 0, 0);

      if (selectedDate < getMinBookingDate()) {
        throw new Error("Preferred date must be at least 2 days from today");
      }
      return true;
    }),

  body("preferredTime")
    .trim()
    .notEmpty()
    .withMessage("Preferred time is required")
    .matches(/^([01]\d|2[0-3]):[0-5]\d$/)
    .withMessage("Preferred time must be in HH:MM format"),

  body("projectBrief")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 1200 })
    .withMessage("Project brief cannot exceed 1200 characters"),
];

// Validation rules for contact form
exports.contactValidationRules = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters")
    .matches(/^[a-zA-Z\u00C0-\u017F\s'-.]+$/)
    .withMessage(
      "Name can only contain letters, spaces, hyphens, apostrophes, and dots"
    ),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),

  body("subject")
    .trim()
    .notEmpty()
    .withMessage("Subject is required")
    .isLength({ min: 5, max: 200 })
    .withMessage("Subject must be between 5 and 200 characters"),

  body("message")
    .trim()
    .notEmpty()
    .withMessage("Message is required")
    .isLength({ min: 10, max: 2000 })
    .withMessage("Message must be between 10 and 2000 characters"),
];

exports.paymentCreateOrderValidationRules = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 80 })
    .withMessage("Name must be between 2 and 80 characters"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),

  body("service")
    .trim()
    .notEmpty()
    .withMessage("Service is required")
    .isLength({ min: 3, max: 60 })
    .withMessage("Service is invalid"),

  ...bookingDetailValidationRules,
];

exports.paymentVerifyValidationRules = [
  body("orderId")
    .trim()
    .notEmpty()
    .withMessage("Order ID is required")
    .matches(/^svc_\d{10,16}_[a-f0-9]{6}$/)
    .withMessage("Order ID format is invalid"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),
];

exports.supportCreateOrderValidationRules = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 80 })
    .withMessage("Name must be between 2 and 80 characters"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),

  body("phone")
    .trim()
    .notEmpty()
    .withMessage("Phone number is required")
    .matches(/^[6-9]\d{9}$/)
    .withMessage("Phone number must be a valid 10-digit Indian mobile number"),

  body("amount")
    .notEmpty()
    .withMessage("Amount is required")
    .isInt({ min: 1, max: 100000 })
    .withMessage("Amount must be between INR 1 and INR 100000"),

  body("message")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 300 })
    .withMessage("Message cannot exceed 300 characters"),
];

exports.supportVerifyValidationRules = [
  body("orderId")
    .trim()
    .notEmpty()
    .withMessage("Order ID is required")
    .matches(/^svc_\d{10,16}_[a-f0-9]{6}$/)
    .withMessage("Order ID format is invalid"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),
];

exports.paymentReceiptValidationRules = [
  param("orderId")
    .trim()
    .notEmpty()
    .withMessage("Order ID is required")
    .matches(/^svc_\d{10,16}_[a-f0-9]{6}$/)
    .withMessage("Order ID format is invalid"),

  query("email")
    .optional({ checkFalsy: true })
    .trim()
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),
];

exports.blogSupportValidationRules = [
  body("slug")
    .trim()
    .notEmpty()
    .withMessage("Blog slug is required")
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .withMessage("Blog slug format is invalid"),

  body("title")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 220 })
    .withMessage("Blog title cannot exceed 220 characters"),

  body("content")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 120000 })
    .withMessage("Blog content is too large"),
];

exports.blogSupportStatusValidationRules = [
  query("slug")
    .trim()
    .notEmpty()
    .withMessage("Blog slug is required")
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .withMessage("Blog slug format is invalid"),
];

exports.authProfileUpdateValidationRules = [
  body("displayName")
    .trim()
    .notEmpty()
    .withMessage("Display name is required")
    .isLength({ min: 2, max: 120 })
    .withMessage("Display name must be between 2 and 120 characters"),
];

exports.validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
    }));

    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errorMessages,
    });
  }

  next();
};
