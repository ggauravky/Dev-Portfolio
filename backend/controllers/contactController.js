// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Unauthorized copying, modification, or distribution of this software,
// via any medium, is strictly prohibited without the express written
// consent of the author. See LICENSE for details.
// Source: https://github.com/ggauravky/Dev-Portfolio

const Contact = require("../models/Contact");
const { logger } = require("../utils/logger");

// @desc    Submit contact form
// @route   POST /api/contact
// @access  Public
exports.submitContact = async (req, res) => {
  const reqLogger = req.log || logger;
  try {
    const { name, email, subject, message } = req.body;

    // Get client IP and user agent
    const ipAddress =
      req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
      req.socket.remoteAddress ||
      req.ip ||
      "unknown";

    const userAgent = req.headers["user-agent"] || "unknown";

    reqLogger.info({ email, ipAddress }, "New contact submission");

    // Create contact entry
    const contact = await Contact.create({
      name,
      email,
      subject,
      message,
      ipAddress,
      userAgent,
    });

    reqLogger.info({ contactId: contact._id }, "Contact saved successfully");

    res.status(201).json({
      success: true,
      message: "Thank you for your message! I will get back to you soon.",
      data: {
        id: contact._id,
        name: contact.name,
        email: contact.email,
        createdAt: contact.createdAt,
      },
    });
  } catch (error) {
    reqLogger.error({ err: error }, "Contact submission error");

    // Handle specific MongoDB errors
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      reqLogger.warn({ messages }, "Contact validation errors");
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: messages,
      });
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      reqLogger.warn({ keyValue: error.keyValue }, "Duplicate contact entry attempted");
      return res.status(409).json({
        success: false,
        message: "A message with similar details already exists.",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to send message. Please try again later.",
    });
  }
};

// @desc    Get all contacts (for admin/personal use)
// @route   GET /api/contact
// @access  Private (you can add authentication later)
exports.getAllContacts = async (req, res) => {
  const reqLogger = req.log || logger;
  try {
    const { status, limit = 50, page = 1 } = req.query;

    const query = {};
    if (status) {
      query.status = status;
    }

    const pageNumber = Number.parseInt(page, 10);
    const limitNumber = Number.parseInt(limit, 10);

    const contacts = await Contact.find(query)
      .sort({ createdAt: -1 })
      .limit(limitNumber)
      .skip((pageNumber - 1) * limitNumber);

    const total = await Contact.countDocuments(query);

    res.status(200).json({
      success: true,
      count: contacts.length,
      total,
      page: pageNumber,
      pages: Math.ceil(total / limitNumber),
      data: contacts,
    });
  } catch (error) {
    reqLogger.error({ err: error }, "Get contacts error");
    res.status(500).json({
      success: false,
      message: "Failed to fetch contacts",
    });
  }
};

// @desc    Get contact statistics
// @route   GET /api/contact/stats
// @access  Private
exports.getContactStats = async (req, res) => {
  const reqLogger = req.log || logger;
  try {
    const totalContacts = await Contact.countDocuments();
    const unreadContacts = await Contact.countDocuments({ status: "unread" });
    const readContacts = await Contact.countDocuments({ status: "read" });
    const repliedContacts = await Contact.countDocuments({ status: "replied" });

    // Get contacts from last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentContacts = await Contact.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
    });

    res.status(200).json({
      success: true,
      data: {
        total: totalContacts,
        unread: unreadContacts,
        read: readContacts,
        replied: repliedContacts,
        last30Days: recentContacts,
      },
    });
  } catch (error) {
    reqLogger.error({ err: error }, "Get contact stats error");
    res.status(500).json({
      success: false,
      message: "Failed to fetch statistics",
    });
  }
};
