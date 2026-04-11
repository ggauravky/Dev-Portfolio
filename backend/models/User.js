// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Unauthorized copying, modification, or distribution of this software,
// via any medium, is strictly prohibited without the express written
// consent of the author. See LICENSE for details.
// Source: https://github.com/ggauravky/Dev-Portfolio

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    googleId: {
      type: String,
      required: [true, "Google account ID is required"],
      trim: true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      unique: true,
      index: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
    },
    name: {
      type: String,
      required: [true, "Display name is required"],
      trim: true,
      maxlength: 120,
    },
    givenName: {
      type: String,
      trim: true,
      default: "",
      maxlength: 80,
    },
    familyName: {
      type: String,
      trim: true,
      default: "",
      maxlength: 80,
    },
    emailVerified: {
      type: Boolean,
      default: true,
      index: true,
    },
    locale: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
      maxlength: 20,
    },
    picture: {
      type: String,
      trim: true,
      default: "",
    },
    lastLoginAt: {
      type: Date,
      default: Date.now,
    },
    lastWelcomeEmailAt: {
      type: Date,
      default: null,
    },
    lastWelcomeBackEmailAt: {
      type: Date,
      default: null,
    },
    welcomeEmailSentCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    welcomeBackEmailSentCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastLoginEmailType: {
      type: String,
      enum: ["none", "welcome", "welcome_back"],
      default: "none",
    },
    lastLoginEmailProviderId: {
      type: String,
      trim: true,
      default: "",
      maxlength: 200,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
