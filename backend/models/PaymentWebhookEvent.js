const mongoose = require("mongoose");

const PAYMENT_WEBHOOK_EVENT_TTL_DAYS =
  Number.parseInt(process.env.PAYMENT_WEBHOOK_EVENT_TTL_DAYS, 10) || 14;
const PAYMENT_WEBHOOK_EVENT_TTL_SECONDS = Math.max(24 * 60 * 60, PAYMENT_WEBHOOK_EVENT_TTL_DAYS * 24 * 60 * 60);

const paymentWebhookEventSchema = new mongoose.Schema(
  {
    eventKey: {
      type: String,
      required: true,
      trim: true,
      maxlength: 180,
      unique: true,
      index: true,
    },
    orderId: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
      index: true,
    },
    eventName: {
      type: String,
      trim: true,
      maxlength: 120,
      default: "",
    },
    paymentId: {
      type: String,
      trim: true,
      maxlength: 120,
      default: "",
    },
    receivedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

paymentWebhookEventSchema.index({ receivedAt: 1 }, { expireAfterSeconds: PAYMENT_WEBHOOK_EVENT_TTL_SECONDS });

module.exports = mongoose.model("PaymentWebhookEvent", paymentWebhookEventSchema);
