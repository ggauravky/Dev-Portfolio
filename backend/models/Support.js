// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Unauthorized copying, modification, or distribution of this software,
// via any medium, is strictly prohibited without the express written
// consent of the author. See LICENSE for details.
// Source: https://github.com/ggauravky/Dev-Portfolio

const mongoose = require("mongoose");

const supportSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },
    blogPostId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BlogPost",
      required: [true, "Blog post ID is required"],
      index: true,
    },
    supporterSnapshot: {
      name: {
        type: String,
        trim: true,
        default: "",
        maxlength: 120,
      },
      email: {
        type: String,
        trim: true,
        lowercase: true,
        default: "",
        maxlength: 320,
      },
      picture: {
        type: String,
        trim: true,
        default: "",
        maxlength: 2048,
      },
    },
    blogSnapshot: {
      slug: {
        type: String,
        trim: true,
        lowercase: true,
        default: "",
        maxlength: 180,
      },
      title: {
        type: String,
        trim: true,
        default: "",
        maxlength: 220,
      },
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

supportSchema.index({ userId: 1, blogPostId: 1 }, { unique: true });
supportSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Support", supportSchema);
