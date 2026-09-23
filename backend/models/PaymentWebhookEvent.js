const mongoose = require("mongoose");

const paymentWebhookEventSchema = new mongoose.Schema(
  {
    eventId: { type: String, required: true, trim: true, maxlength: 160, unique: true, index: true },
    provider: { type: String, enum: ["razorpay"], default: "razorpay", required: true },
    eventType: { type: String, required: true, trim: true, maxlength: 80, index: true },
    status: { type: String, enum: ["processing", "processed", "failed", "ignored"], default: "processing", index: true },
    transactionId: { type: mongoose.Schema.Types.ObjectId, ref: "PaymentTransaction", default: null },
    attempts: { type: Number, min: 1, default: 1 },
    processedAt: { type: Date, default: null },
    error: { type: String, trim: true, maxlength: 200, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PaymentWebhookEvent", paymentWebhookEventSchema);
