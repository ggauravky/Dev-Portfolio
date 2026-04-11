// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Unauthorized copying, modification, or distribution of this software,
// via any medium, is strictly prohibited without the express written
// consent of the author. See LICENSE for details.
// Source: https://github.com/ggauravky/Dev-Portfolio

const mongoose = require("mongoose");

const blogPostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Blog title is required"],
      trim: true,
      maxlength: 220,
    },
    slug: {
      type: String,
      required: [true, "Blog slug is required"],
      trim: true,
      lowercase: true,
      unique: true,
      index: true,
      match: [/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug format is invalid"],
    },
    content: {
      type: String,
      required: [true, "Blog content is required"],
      trim: true,
      default: "",
      maxlength: 120000,
    },
    supportCount: {
      type: Number,
      default: 0,
      min: [0, "Support count cannot be negative"],
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("BlogPost", blogPostSchema);
