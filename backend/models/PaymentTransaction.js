const mongoose = require("mongoose");

const paymentTransactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    flowType: {
      type: String,
      enum: ["service", "support"],
      default: "service",
      required: true,
    },
    serviceSlug: { type: String, required: true, trim: true, maxlength: 80, index: true },
    serviceName: { type: String, required: true, trim: true, maxlength: 120 },
    customerName: { type: String, required: true, trim: true, maxlength: 80 },
    contributorName: { type: String, trim: true, maxlength: 80, default: "" },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 320, index: true },
    phone: { type: String, required: true, trim: true, maxlength: 20 },
    preferredDate: {
      type: Date,
      required() { return this.flowType === "service"; },
      default: null,
    },
    preferredTime: {
      type: String,
      required() { return this.flowType === "service"; },
      trim: true,
      maxlength: 5,
      default: "",
    },
    projectBrief: { type: String, trim: true, maxlength: 1200, default: "" },
    message: { type: String, trim: true, maxlength: 300, default: "" },
    amount: { type: Number, required: true, min: 1 },
    amountPaise: { type: Number, required: true, min: 100 },
    currency: { type: String, enum: ["INR"], default: "INR", required: true },
    provider: { type: String, enum: ["razorpay"], default: "razorpay", required: true },
    internalReference: { type: String, required: true, trim: true, maxlength: 40, unique: true },
    razorpayOrderId: { type: String, trim: true, maxlength: 120, default: "" },
    razorpayPaymentId: { type: String, trim: true, maxlength: 120, default: "" },
    status: {
      type: String,
      enum: ["created", "pending", "authorized", "paid", "failed", "refunded"],
      default: "created",
      index: true,
    },
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", default: null },
    paidAt: { type: Date, default: null },
    failedAt: { type: Date, default: null },
    verificationAcceptedAt: { type: Date, default: null },
    webhookReceivedAt: { type: Date, default: null },
    receiptNumber: { type: String, trim: true, maxlength: 40, default: "" },
    receiptGeneratedAt: { type: Date, default: null },
    receiptEmailSentAt: { type: Date, default: null },
    receiptEmailMessageId: { type: String, trim: true, maxlength: 200, default: "" },
    receiptEmailLastAttemptAt: { type: Date, default: null },
    receiptEmailClaimedAt: { type: Date, default: null },
    receiptEmailError: { type: String, trim: true, maxlength: 200, default: "" },
    adminEmailSentAt: { type: Date, default: null },
    adminEmailLastAttemptAt: { type: Date, default: null },
    adminEmailClaimedAt: { type: Date, default: null },
    adminEmailMessageId: { type: String, trim: true, maxlength: 200, default: "" },
    adminEmailError: { type: String, trim: true, maxlength: 200, default: "" },
    failureCode: { type: String, trim: true, maxlength: 80, default: "" },
    failureReason: { type: String, trim: true, maxlength: 200, default: "" },
    providerErrorCode: { type: String, trim: true, maxlength: 80, default: "" },
    providerStatus: { type: Number, min: 0, max: 599, default: 0 },
    failureCategory: { type: String, trim: true, maxlength: 40, default: "" },
    ipAddress: { type: String, trim: true, maxlength: 80, default: "unknown" },
    userAgent: { type: String, trim: true, maxlength: 300, default: "unknown" },
    metadata: { type: Object, default: {} },
  },
  { timestamps: true }
);

paymentTransactionSchema.index({ razorpayOrderId: 1 }, { unique: true, partialFilterExpression: { razorpayOrderId: { $type: "string", $gt: "" } } });
paymentTransactionSchema.index({ razorpayPaymentId: 1 }, { unique: true, partialFilterExpression: { razorpayPaymentId: { $type: "string", $gt: "" } } });
paymentTransactionSchema.index({ receiptNumber: 1 }, { unique: true, partialFilterExpression: { receiptNumber: { $type: "string", $gt: "" } } });
paymentTransactionSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("PaymentTransaction", paymentTransactionSchema);
