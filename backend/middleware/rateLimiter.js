/**
 * Production Sliding Window Rate Limiting Middleware.
 */
class RateLimiter {
  constructor(windowMs = 60 * 1000, maxRequests = 30) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
    this.ipHits = new Map(); // IP -> Array of timestamps
  }

  middleware() {
    return (req, res, next) => {
      const clientIp = req.ip || req.headers["x-forwarded-for"] || "127.0.0.1";
      const now = Date.now();

      let timestamps = this.ipHits.get(clientIp) || [];
      // Filter out timestamps outside window
      timestamps = timestamps.filter((time) => now - time < this.windowMs);

      if (timestamps.length >= this.maxRequests) {
        res.setHeader("Retry-After", Math.ceil(this.windowMs / 1000));
        return res.status(429).json({
          error: "Too Many Requests",
          message: "Rate limit exceeded. Please wait 60 seconds before sending another request.",
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
const paymentLimiter = new RateLimiter(60 * 1000, 20);
const paymentWebhookLimiter = new RateLimiter(60 * 1000, 60);

module.exports = {
  RateLimiter,
  rateLimiter: defaultLimiter.middleware(),
  contactRateLimiter: contactLimiter.middleware(),
  generalRateLimiter: generalLimiter.middleware(),
  authRateLimiter: authLimiter.middleware(),
  blogSupportRateLimiter: blogSupportLimiter.middleware(),
  paymentRateLimiter: paymentLimiter.middleware(),
  paymentWebhookRateLimiter: paymentWebhookLimiter.middleware(),
};
