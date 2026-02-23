const express = require("express");
const { body, validationResult } = require("express-validator");
const { logMlUsage, uploadImage } = require("../controllers/mlLogController");
const rateLimit = require("express-rate-limit");

const router = express.Router();

// Stricter rate limit for image uploads (Cloudinary free tier has monthly limits)
const imageLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 15,
  message: { success: false, message: "Too many image uploads. Try again in 10 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

const uploadImageValidation = [
  body("imageBase64")
    .isString()
    .notEmpty()
    .withMessage("imageBase64 is required."),
  body("predictionLabel")
    .optional()
    .trim()
    .isString()
    .isLength({ max: 180 })
    .withMessage("predictionLabel too long."),
  body("topPredictions")
    .optional()
    .isArray({ max: 5 })
    .withMessage("topPredictions must be array (max 5)."),
];
const mlLogValidation = [
  body("demoType")
    .trim()
    .isString()
    .isLength({ min: 3, max: 40 })
    .withMessage("Invalid demoType."),
  body("event")
    .optional()
    .trim()
    .isString()
    .isLength({ min: 2, max: 40 })
    .withMessage("Invalid event."),
  body("predictionLabel")
    .optional()
    .trim()
    .isString()
    .isLength({ max: 180 })
    .withMessage("predictionLabel too long."),
  body("topPredictions")
    .optional()
    .isArray({ max: 5 })
    .withMessage("topPredictions must be an array (max 5)."),
  body("inputPrompt")
    .optional()
    .trim()
    .isString()
    .isLength({ max: 1200 })
    .withMessage("inputPrompt too long."),
  body("improvedPrompt")
    .optional()
    .trim()
    .isString()
    .isLength({ max: 4000 })
    .withMessage("improvedPrompt too long."),
  body("nlpAction")
    .optional()
    .trim()
    .isString()
    .isLength({ max: 40 })
    .withMessage("nlpAction too long."),
  body("nlpTone")
    .optional()
    .trim()
    .isString()
    .isLength({ max: 60 })
    .withMessage("nlpTone too long."),
];

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array()[0].msg,
    });
  }
  next();
};

router.post("/upload-image", imageLimiter, uploadImageValidation, validate, uploadImage);
router.post("/", mlLogValidation, validate, logMlUsage);

module.exports = router;
