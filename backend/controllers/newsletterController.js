// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Unauthorized copying, modification, or distribution of this software,
// via any medium, is strictly prohibited without the express written
// consent of the author. See LICENSE for details.
// Source: https://github.com/ggauravky/Dev-Portfolio

const Newsletter = require("../models/Newsletter");

// @desc    Subscribe to newsletter
// @route   POST /api/newsletter/subscribe
// @access  Public
exports.subscribe = async (req, res) => {
  try {
    const { email } = req.body;

    // Validate email
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // Check if email already exists
    const existingSubscriber = await Newsletter.findOne({ email });

    if (existingSubscriber) {
      // If already subscribed
      if (existingSubscriber.subscribed) {
        return res.status(400).json({
          success: false,
          message: "This email is already subscribed to our newsletter!",
        });
      }

      // If previously unsubscribed, resubscribe
      await existingSubscriber.resubscribe();

      return res.status(200).json({
        success: true,
        message:
          "Welcome back! You have been resubscribed to our newsletter. 🎉",
      });
    }

    // Get IP address and user agent
    const ipAddress =
      req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
      req.socket.remoteAddress ||
      req.ip ||
      "unknown";
    const userAgent = req.headers["user-agent"] || "unknown";

    // Create new subscriber
    const subscriber = await Newsletter.create({
      email,
      ipAddress,
      userAgent,
    });

    res.status(201).json({
      success: true,
      message:
        "🎉 Successfully subscribed! You'll receive updates about new blog posts.",
      data: {
        email: subscriber.email,
        subscribedAt: subscriber.subscribedAt,
      },
    });
  } catch (error) {
    console.error("Newsletter subscription error:", error);

    // Handle duplicate key error (shouldn't happen due to check above, but just in case)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "This email is already subscribed!",
      });
    }

    // Handle validation errors
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => ({
        field: err.path,
        message: err.message,
      }));

      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to subscribe. Please try again later.",
    });
  }
};

// @desc    Unsubscribe from newsletter
// @route   POST /api/newsletter/unsubscribe
// @access  Public
exports.unsubscribe = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const subscriber = await Newsletter.findOne({ email });

    if (!subscriber) {
      return res.status(404).json({
        success: false,
        message: "Email not found in our newsletter list",
      });
    }

    if (!subscriber.subscribed) {
      return res.status(400).json({
        success: false,
        message: "This email is already unsubscribed",
      });
    }

    await subscriber.unsubscribe();

    res.status(200).json({
      success: true,
      message: "Successfully unsubscribed from newsletter",
    });
  } catch (error) {
    console.error("Newsletter unsubscribe error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to unsubscribe. Please try again later.",
    });
  }
};

// @desc    Get newsletter stats
// @route   GET /api/newsletter/stats
// @access  Public (or you can make it private)
exports.getStats = async (req, res) => {
  try {
    const totalSubscribers = await Newsletter.countDocuments({
      subscribed: true,
    });
    const totalUnsubscribed = await Newsletter.countDocuments({
      subscribed: false,
    });
    const totalEmails = await Newsletter.countDocuments();

    res.status(200).json({
      success: true,
      data: {
        totalSubscribers,
        totalUnsubscribed,
        totalEmails,
      },
    });
  } catch (error) {
    console.error("Newsletter stats error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch newsletter stats",
    });
  }
};
