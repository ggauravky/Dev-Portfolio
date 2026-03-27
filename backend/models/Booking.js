// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Unauthorized copying, modification, or distribution of this software,
// via any medium, is strictly prohibited without the express written
// consent of the author. See LICENSE for details.
// Source: https://github.com/ggauravky/Dev-Portfolio

const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: 80,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      match: [/^[6-9]\d{9}$/, "Please enter a valid 10-digit Indian phone number"],
    },
    serviceSlug: {
      type: String,
      required: [true, "Service slug is required"],
      trim: true,
      maxlength: 80,
      index: true,
    },
    service: {
      type: String,
      required: [true, "Service is required"],
      trim: true,
      maxlength: 80,
    },
    preferredDate: {
      type: Date,
      required: [true, "Preferred date is required"],
    },
    preferredTime: {
      type: String,
      required: [true, "Preferred time is required"],
      trim: true,
      match: [/^([01]\d|2[0-3]):[0-5]\d$/, "Preferred time must be in HH:MM format"],
    },
    projectBrief: {
      type: String,
      trim: true,
      maxlength: 1200,
      default: "",
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [1, "Amount must be greater than zero"],
    },
    paymentId: {
      type: String,
      required: false,
      trim: true,
      sparse: true,
      unique: true,
      index: true,
    },
    orderId: {
      type: String,
      required: [true, "Order ID is required"],
      trim: true,
      unique: true,
      index: true,
    },
    paymentProvider: {
      type: String,
      trim: true,
      enum: ["cashfree", "razorpay"],
      default: "cashfree",
    },
    paymentStatus: {
      type: String,
      trim: true,
      enum: ["created", "pending", "paid", "failed"],
      default: "created",
      index: true,
    },
    paidAt: {
      type: Date,
    },
    date: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

bookingSchema.index({ email: 1, date: -1 });
bookingSchema.index({ serviceSlug: 1, preferredDate: 1 });

module.exports = mongoose.model("Booking", bookingSchema);
