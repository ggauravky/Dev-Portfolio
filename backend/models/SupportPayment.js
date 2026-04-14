// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Unauthorized copying, modification, or distribution of this software,
// via any medium, is strictly prohibited without the express written
// consent of the author. See LICENSE for details.
// Source: https://github.com/ggauravky/Dev-Portfolio

const mongoose = require("mongoose");

const supportPaymentSchema = new mongoose.Schema(
  {
    contributorName: {
      type: String,
      required: [true, "Contributor name is required"],
      trim: true,
      maxlength: 80,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      match: [/^[6-9]\d{9}$/, "Please enter a valid 10-digit Indian phone number"],
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [1, "Amount must be greater than zero"],
      max: [100000, "Amount cannot exceed 100000"],
    },
    message: {
      type: String,
      trim: true,
      maxlength: 300,
      default: "",
    },
    orderId: {
      type: String,
      required: [true, "Order ID is required"],
      trim: true,
      unique: true,
      index: true,
    },
    paymentId: {
      type: String,
      required: false,
      trim: true,
      sparse: true,
      unique: true,
      index: true,
    },
    paymentProvider: {
      type: String,
      trim: true,
      enum: ["cashfree"],
      default: "cashfree",
    },
    paymentStatus: {
      type: String,
      trim: true,
      enum: ["created", "pending", "failed", "paid"],
      default: "created",
      index: true,
    },
    paidAt: {
      type: Date,
    },
    receiptEmailSentAt: {
      type: Date,
      default: null,
    },
    receiptEmailLastAttemptAt: {
      type: Date,
      default: null,
    },
    receiptEmailRecipient: {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: 320,
      default: "",
    },
    receiptEmailMessageId: {
      type: String,
      trim: true,
      maxlength: 200,
      default: "",
    },
    receiptEmailError: {
      type: String,
      trim: true,
      maxlength: 160,
      default: "",
    },
    verificationAcceptedAt: {
      type: Date,
    },
    webhookReceivedAt: {
      type: Date,
    },
    reconciliationStatus: {
      type: String,
      trim: true,
      enum: ["idle", "queued", "processing", "pending_gateway", "pending_local", "paid", "failed"],
      default: "idle",
      index: true,
    },
    reconciliationAttempts: {
      type: Number,
      min: 0,
      default: 0,
    },
    lastReconciliationAt: {
      type: Date,
    },
    lastReconciliationError: {
      type: String,
      trim: true,
      maxlength: 200,
      default: "",
    },
    ipAddress: {
      type: String,
      default: "unknown",
    },
    userAgent: {
      type: String,
      default: "unknown",
    },
  },
  {
    timestamps: true,
  }
);

supportPaymentSchema.index({ createdAt: -1 });

module.exports = mongoose.model("SupportPayment", supportPaymentSchema);
