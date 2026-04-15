const mongoose = require("mongoose");

const activityEventSchema = new mongoose.Schema(
  {
    eventKey: {
      type: String,
      trim: true,
      maxlength: 180,
      default: "",
      index: true,
      sparse: true,
      unique: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    userEmail: {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: 320,
      default: "",
      index: true,
    },
    actionType: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
      index: true,
    },
    domain: {
      type: String,
      trim: true,
      maxlength: 40,
      default: "payment",
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 160,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },
    status: {
      type: String,
      trim: true,
      enum: ["success", "pending", "failed", "info"],
      default: "info",
      index: true,
    },
    amount: {
      type: Number,
      default: null,
    },
    currency: {
      type: String,
      trim: true,
      maxlength: 10,
      default: "INR",
    },
    orderId: {
      type: String,
      trim: true,
      maxlength: 120,
      default: "",
      index: true,
    },
    paymentId: {
      type: String,
      trim: true,
      maxlength: 120,
      default: "",
      index: true,
    },
    transactionId: {
      type: String,
      trim: true,
      maxlength: 120,
      default: "",
      index: true,
    },
    receiptKind: {
      type: String,
      trim: true,
      enum: ["", "service", "support"],
      default: "",
    },
    receiptOrderId: {
      type: String,
      trim: true,
      maxlength: 120,
      default: "",
    },
    metadata: {
      type: Object,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

activityEventSchema.index({ userId: 1, createdAt: -1 });
activityEventSchema.index({ userEmail: 1, createdAt: -1 });
activityEventSchema.index({ domain: 1, actionType: 1, createdAt: -1 });

module.exports = mongoose.model("ActivityEvent", activityEventSchema);
