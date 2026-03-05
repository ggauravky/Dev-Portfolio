// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Unauthorized copying, modification, or distribution of this software,
// via any medium, is strictly prohibited without the express written
// consent of the author. See LICENSE for details.
// Source: https://github.com/ggauravky/Dev-Portfolio

const MlLog = require("../models/MlLog");
const cloudinary = require("../config/cloudinary");

// ── helpers ────────────────────────────────────────────────────────────────
const extractVisitorInfo = (req) => ({
  ipAddress:
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.socket?.remoteAddress ||
    req.ip ||
    "unknown",
  userAgent: String(req.headers["user-agent"] || "unknown").slice(0, 240),
  countryCode: String(req.headers["x-vercel-ip-country"] || "unknown"),
  city: String(req.headers["x-vercel-ip-city"] || "unknown"),
});

// @desc    Upload image to Cloudinary + create MlLog record in one shot
// @route   POST /api/ml-log/upload-image
// @access  Public
exports.uploadImage = async (req, res) => {
  try {
    const body = req.body || {};

    // ── Validate base64 payload ──────────────────────────────────
    const rawBase64 = String(body.imageBase64 || "");
    if (!rawBase64.startsWith("data:image/")) {
      return res.status(400).json({ success: false, message: "Invalid image data." });
    }
    // Safety: reject suspiciously large payloads (>400KB base64 ≈ ~300KB image)
    if (rawBase64.length > 400_000) {
      return res.status(400).json({ success: false, message: "Image payload too large." });
    }

    // ── Upload to Cloudinary ─────────────────────────────────────
    const uploadResult = await cloudinary.uploader.upload(rawBase64, {
      folder: "portfolio-lab/image-analyzer",
      resource_type: "image",
      // Auto-format & quality for smallest file size
      transformation: [{ quality: "auto", fetch_format: "auto" }],
      // Strip EXIF / GPS metadata for privacy
      exif: false,
      // Tag for easy filtering in Cloudinary dashboard
      tags: ["ml-lab", "image-analyzer"],
    });

    // ── Parse prediction payload ─────────────────────────────────
    const rawPredictions = Array.isArray(body.topPredictions) ? body.topPredictions : [];
    const topPredictions = rawPredictions.slice(0, 5).map((p) => ({
      className: String(p.className || "").trim().slice(0, 120),
      probability: Math.min(1, Math.max(0, Number(p.probability) || 0)),
    }));
    const safeLabel = String(body.predictionLabel || "").trim().slice(0, 180);

    const visitor = extractVisitorInfo(req);

    // ── Persist to MongoDB ───────────────────────────────────────
    const logEntry = await MlLog.create({
      demoType: "image_analyzer",
      event: "analyze",
      predictionLabel: safeLabel,
      topPredictions,
      imageUrl: uploadResult.secure_url,
      imagePublicId: uploadResult.public_id,
      ...visitor,
    });

    console.log(
      `[ML-IMAGE] saved _id=${logEntry._id} cloudinary=${uploadResult.public_id} label="${safeLabel}"`
    );

    return res.status(200).json({
      success: true,
      imageUrl: uploadResult.secure_url,
      id: logEntry._id,
    });
  } catch (error) {
    console.error("[ML-IMAGE] upload error:", error?.message || error);
    return res.status(500).json({ success: false, message: "Image upload failed." });
  }
};

// @desc    Log ML demo usage analytics and persist to MongoDB
// @route   POST /api/ml-log
// @access  Public
exports.logMlUsage = async (req, res) => {
  try {
    const body = req.body || {};

    const safeDemoType = String(body.demoType || "")
      .trim()
      .toLowerCase()
      .slice(0, 40);
    const safeEvent = String(body.event || "run")
      .trim()
      .toLowerCase()
      .slice(0, 40);
    const safeLabel = String(body.predictionLabel || "").trim().slice(0, 180);

    // Image Analyzer fields
    const rawPredictions = Array.isArray(body.topPredictions)
      ? body.topPredictions
      : [];
    const topPredictions = rawPredictions.slice(0, 5).map((p) => ({
      className: String(p.className || "").trim().slice(0, 120),
      probability: Math.min(1, Math.max(0, Number(p.probability) || 0)),
    }));

    // Prompt Improver fields
    const inputPrompt = String(body.inputPrompt || "").trim().slice(0, 1200);
    const improvedPrompt = String(body.improvedPrompt || "").trim().slice(0, 4000);
    const nlpAction = String(body.nlpAction || "").trim().slice(0, 40);
    const nlpTone = String(body.nlpTone || "").trim().slice(0, 60);

    // Visitor identity
    const ipAddress =
      req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
      req.socket?.remoteAddress ||
      req.ip ||
      "unknown";
    const userAgent = String(req.headers["user-agent"] || "unknown").slice(0, 240);
    const countryCode = String(req.headers["x-vercel-ip-country"] || "unknown");
    const city = String(req.headers["x-vercel-ip-city"] || "unknown");

    // Persist to MongoDB
    const logEntry = await MlLog.create({
      demoType: safeDemoType,
      event: safeEvent,
      predictionLabel: safeLabel,
      topPredictions,
      inputPrompt,
      improvedPrompt,
      nlpAction,
      nlpTone,
      ipAddress,
      userAgent,
      countryCode,
      city,
    });

    console.log(
      `[ML-LOG] saved _id=${logEntry._id} demo=${safeDemoType} event=${safeEvent} label="${safeLabel}" country=${countryCode} city="${city}"`
    );

    return res.status(200).json({
      success: true,
      message: "ML usage logged",
      id: logEntry._id,
      timestamp: logEntry.createdAt,
    });
  } catch (error) {
    console.error("ML log endpoint error:", error?.message || error);
    return res.status(500).json({
      success: false,
      message: "Failed to log ML usage",
    });
  }
};
