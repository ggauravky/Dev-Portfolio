/**
 * Production Sliding Window Rate Limiting Middleware.
 */
class RateLimiter {
  constructor(windowMs = 60 * 1000, maxRequests = 30, options = {}) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
    this.keyGenerator = options.keyGenerator;
    this.message = options.message;
    this.ipHits = new Map(); // IP -> Array of timestamps
  }

  middleware() {
    return (req, res, next) => {
      const clientIp =
        this.keyGenerator?.(req) || req.ip || req.headers["x-forwarded-for"] || "127.0.0.1";
      const now = Date.now();

      let timestamps = this.ipHits.get(clientIp) || [];
      // Filter out timestamps outside window
      timestamps = timestamps.filter((time) => now - time < this.windowMs);

      if (timestamps.length >= this.maxRequests) {
        res.setHeader("Retry-After", Math.ceil(this.windowMs / 1000));
        return res.status(429).json({
          error: "Too Many Requests",
          message:
            this.message ||
            `Rate limit exceeded. Please wait ${Math.ceil(this.windowMs / 1000)} seconds before trying again.`,
          retryAfterMs: this.windowMs,
        });
      }

      timestamps.push(now);
      this.ipHits.set(clientIp, timestamps);

      next();
    };
  }
}

const defaultLimiter = new RateLimiter(60 * 1000, 30);
const contactLimiter = new RateLimiter(60 * 1000, 10);
const generalLimiter = new RateLimiter(60 * 1000, 100);
const authLimiter = new RateLimiter(60 * 1000, 15);
const blogSupportLimiter = new RateLimiter(60 * 1000, 20);
const paymentOrderLimiter = new RateLimiter(60 * 1000, 8);
const paymentVerificationLimiter = new RateLimiter(60 * 1000, 20);
const paymentReadLimiter = new RateLimiter(60 * 1000, 60);
const paymentWebhookLimiter = new RateLimiter(60 * 1000, 300);
const avatarUploadLimiter = new RateLimiter(60 * 60 * 1000, 10, {
  keyGenerator: (req) => `avatar:${req.authUser?.id || req.ip || "anonymous"}`,
  message: "Too many profile image changes. Please try again later.",
});

module.exports = {
  RateLimiter,
  rateLimiter: defaultLimiter.middleware(),
  contactRateLimiter: contactLimiter.middleware(),
  generalRateLimiter: generalLimiter.middleware(),
  authRateLimiter: authLimiter.middleware(),
  blogSupportRateLimiter: blogSupportLimiter.middleware(),
  paymentOrderRateLimiter: paymentOrderLimiter.middleware(),
  paymentVerificationRateLimiter: paymentVerificationLimiter.middleware(),
  paymentReadRateLimiter: paymentReadLimiter.middleware(),
  paymentWebhookRateLimiter: paymentWebhookLimiter.middleware(),
  avatarUploadRateLimiter: avatarUploadLimiter.middleware(),
};
