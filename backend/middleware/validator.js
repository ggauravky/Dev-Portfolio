// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Unauthorized copying, modification, or distribution of this software,
// via any medium, is strictly prohibited without the express written
// consent of the author. See LICENSE for details.
// Source: https://github.com/ggauravky/Dev-Portfolio

const { body, param, query, validationResult } = require("express-validator");
const {
  SUPPORT_MAX_AMOUNT_INR,
  SUPPORT_MIN_AMOUNT_INR,
} = require("../config/payment");

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
  body().custom((value) => {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      throw new Error("Profile update must be an object");
    }

    const allowed = new Set(["displayName", "bio", "location", "website"]);
    const protectedFields = new Set([
      "_id",
      "id",
      "email",
      "emailVerified",
      "googleId",
      "name",
      "picture",
      "providerPicture",
      "avatarUrl",
      "avatarPublicId",
      "createdAt",
      "lastLoginAt",
      "provider",
    ]);
    const keys = Object.keys(value);
    const locked = keys.filter((key) => protectedFields.has(key));
    if (locked.length) {
      throw new Error(`These account fields cannot be changed: ${locked.join(", ")}`);
    }
    const unknown = keys.filter((key) => !allowed.has(key));
    if (unknown.length) {
      throw new Error(`Unsupported profile fields: ${unknown.join(", ")}`);
    }
    if (!keys.length) {
      throw new Error("Add at least one profile field to update");
    }
    return true;
  }),
  body("displayName")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Display name is required")
    .isLength({ min: 2, max: 80 })
    .withMessage("Display name must be between 2 and 80 characters"),
  body("bio")
    .optional()
    .trim()
    .isLength({ max: 180 })
    .withMessage("Bio must be 180 characters or fewer"),
  body("location")
    .optional()
    .trim()
    .isLength({ max: 80 })
    .withMessage("Location must be 80 characters or fewer"),
  body("website")
    .optional({ values: "falsy" })
    .trim()
    .isLength({ max: 300 })
    .withMessage("Website must be 300 characters or fewer")
    .isURL({ protocols: ["http", "https"], require_protocol: true })
    .withMessage("Website must start with http:// or https://"),
];

exports.googleSignInValidationRules = [
  body("credential")
    .isString()
    .withMessage("Google credential is required")
    .trim()
    .notEmpty()
    .withMessage("Google credential is required")
    .isLength({ max: 10000 })
    .withMessage("Google credential is invalid"),
  body("selectBy")
    .optional({ checkFalsy: true })
    .isString()
    .trim()
    .isLength({ max: 40 })
    .withMessage("Google sign-in method is invalid"),
  body("loginEventId")
    .optional({ checkFalsy: true })
    .isUUID()
    .withMessage("Google login event ID is invalid"),
];

const transactionIdRule = (location = "body") => {
  const builder = location === "param" ? param("transactionId") : body("transactionId");
  return builder.trim().isMongoId().withMessage("Transaction ID is invalid");
};

exports.paymentOrderValidationRules = [
  body("serviceSlug")
    .trim()
    .notEmpty()
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .isLength({ max: 80 })
    .withMessage("Service selection is invalid"),
  body("name")
    .trim()
    .isLength({ min: 2, max: 80 })
    .matches(/^[a-zA-Z\u00C0-\u024F\s'.-]+$/)
    .withMessage("Please provide a valid name"),
  body("phone")
    .trim()
    .matches(/^[6-9]\d{9}$/)
    .withMessage("Phone must be a valid 10-digit Indian mobile number"),
  body("preferredDate")
    .trim()
    .isISO8601({ strict: true, strictSeparator: true })
    .withMessage("Preferred date is invalid")
    .custom((value) => {
      const selected = new Date(`${value}T00:00:00.000Z`);
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);
      if (selected < today) throw new Error("Preferred date cannot be in the past");
      return true;
    }),
  body("preferredTime")
    .trim()
    .matches(/^([01]\d|2[0-3]):[0-5]\d$/)
    .withMessage("Preferred time must be in HH:MM format"),
  body("projectBrief")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 1200 })
    .withMessage("Project brief cannot exceed 1200 characters"),
];

exports.supportOrderValidationRules = [
  body("name")
    .trim()
    .isLength({ min: 2, max: 80 })
    .matches(/^[a-zA-Z\u00C0-\u024F\s'.-]+$/)
    .withMessage("Please provide a valid name"),
  body("phone")
    .trim()
    .matches(/^[6-9]\d{9}$/)
    .withMessage("Phone must be a valid 10-digit Indian mobile number"),
  body("amount")
    .isInt({ min: SUPPORT_MIN_AMOUNT_INR, max: SUPPORT_MAX_AMOUNT_INR })
    .withMessage(`Support amount must be between INR ${SUPPORT_MIN_AMOUNT_INR} and INR ${SUPPORT_MAX_AMOUNT_INR}`),
  body("message")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 300 })
    .withMessage("Support message cannot exceed 300 characters"),
];

exports.paymentVerificationValidationRules = [
  transactionIdRule(),
  body("razorpay_payment_id")
    .trim()
    .matches(/^pay_[a-zA-Z0-9]{6,100}$/)
    .withMessage("Razorpay payment ID is invalid"),
  body("razorpay_order_id")
    .trim()
    .matches(/^order_[a-zA-Z0-9]{6,100}$/)
    .withMessage("Razorpay order ID is invalid"),
  body("razorpay_signature")
    .trim()
    .matches(/^[a-fA-F0-9]{64}$/)
    .withMessage("Razorpay signature is invalid"),
];

exports.paymentFailureValidationRules = [
  transactionIdRule(),
  body("code").optional({ checkFalsy: true }).trim().isLength({ max: 80 }),
  body("reason").optional({ checkFalsy: true }).trim().isLength({ max: 200 }),
];

exports.paymentTransactionParamValidationRules = [transactionIdRule("param")];

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
