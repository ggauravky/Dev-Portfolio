const mongoose = require("mongoose");

const mlLogSchema = new mongoose.Schema(
  {
    // ── Demo identity ──────────────────────────────────────────────
    demoType: {
      type: String,
      required: true,
      enum: ["image_analyzer", "prompt_improver"],
      index: true,
    },
    event: {
      type: String,
      default: "run",
      trim: true,
      maxLength: 40,
    },

    // ── Image Analyzer fields ──────────────────────────────────────
    predictionLabel: {
      type: String,
      default: "",
      trim: true,
      maxLength: 180,
    },
    topPredictions: {
      type: [
        {
          className: { type: String, trim: true, maxLength: 120 },
          probability: { type: Number, min: 0, max: 1 },
        },
      ],
      default: [],
    },

    // ── Prompt Improver fields ─────────────────────────────────────
    inputPrompt: {
      type: String,
      default: "",
      trim: true,
      maxLength: 1200,
    },
    improvedPrompt: {
      type: String,
      default: "",
      trim: true,
      maxLength: 4000,
    },
    nlpAction: {
      type: String,
      default: "",
      trim: true,
      maxLength: 40,
    },
    nlpTone: {
      type: String,
      default: "",
      trim: true,
      maxLength: 60,
    },

    // ── Visitor identity ───────────────────────────────────────────
    ipAddress: {
      type: String,
      default: "unknown",
    },
    userAgent: {
      type: String,
      default: "unknown",
      maxLength: 240,
    },
    countryCode: {
      type: String,
      default: "unknown",
    },
    city: {
      type: String,
      default: "unknown",
    },

    // ── Cloudinary image (Image Analyzer only) ────────────────────
    imageUrl: {
      type: String,
      default: "",
      trim: true,
    },
    imagePublicId: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
    collection: "mllogs",
  }
);

mlLogSchema.index({ createdAt: -1 });
mlLogSchema.index({ demoType: 1, createdAt: -1 });
mlLogSchema.index({ ipAddress: 1, createdAt: -1 });

module.exports = mongoose.model("MlLog", mlLogSchema);
