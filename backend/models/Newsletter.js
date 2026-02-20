const mongoose = require("mongoose");

const newsletterSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      unique: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
    },
    subscribed: {
      type: Boolean,
      default: true,
    },
    ipAddress: {
      type: String,
      default: "unknown",
    },
    userAgent: {
      type: String,
      default: "unknown",
    },
    subscribedAt: {
      type: Date,
      default: Date.now,
    },
    unsubscribedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
// Note: email index is already created by unique:true above, don't duplicate it
newsletterSchema.index({ subscribed: 1 });

// Method to unsubscribe
newsletterSchema.methods.unsubscribe = function () {
  this.subscribed = false;
  this.unsubscribedAt = Date.now();
  return this.save();
};

// Method to resubscribe
newsletterSchema.methods.resubscribe = function () {
  this.subscribed = true;
  this.unsubscribedAt = null;
  return this.save();
};

const Newsletter = mongoose.model("Newsletter", newsletterSchema);

module.exports = Newsletter;
