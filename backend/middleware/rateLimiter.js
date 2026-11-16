/**
 * Production Sliding Window Rate Limiting Middleware.
 *
 * Each instance keeps a Map<key, timestamps[]>. Keys are removed as soon as
 * their window empties, and a single class-level sweep (unref'd, so it never
 * keeps the process alive) clears keys that went idle without another request.
 */
const DEFAULT_SWEEP_INTERVAL_MS = 5 * 60 * 1000;

class RateLimiter {
  static instances = new Set();
  static sweepTimer = null;

  constructor(windowMs = 60 * 1000, maxRequests = 30, options = {}) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
    this.keyGenerator = options.keyGenerator;
    this.message = options.message;
    this.ipHits = new Map(); // IP -> Array of timestamps

    RateLimiter.instances.add(this);
    RateLimiter.startSweep();
  }

  /**
   * Remove keys whose timestamps have all left the window.
   * Returns the number of keys removed.
   */
  sweep(now = Date.now()) {
    let removed = 0;
    for (const [key, timestamps] of this.ipHits) {
      const live = timestamps.filter((time) => now - time < this.windowMs);
      if (live.length === 0) {
        this.ipHits.delete(key);
        removed += 1;
      } else if (live.length !== timestamps.length) {
        this.ipHits.set(key, live);
      }
    }
    return removed;
  }

  static sweepAll(now = Date.now()) {
    let removed = 0;
    for (const limiter of RateLimiter.instances) {
      removed += limiter.sweep(now);
    }
    return removed;
  }

  static startSweep(intervalMs = DEFAULT_SWEEP_INTERVAL_MS) {
    if (RateLimiter.sweepTimer) return RateLimiter.sweepTimer;
    RateLimiter.sweepTimer = setInterval(() => RateLimiter.sweepAll(), intervalMs);
    RateLimiter.sweepTimer.unref?.();
    return RateLimiter.sweepTimer;
  }

  static stopSweep() {
    if (RateLimiter.sweepTimer) {
      clearInterval(RateLimiter.sweepTimer);
      RateLimiter.sweepTimer = null;
    }
  }

  middleware() {
    return (req, res, next) => {
      const clientIp =
        this.keyGenerator?.(req) || req.ip || req.headers["x-forwarded-for"] || "127.0.0.1";
      const now = Date.now();

      // Filter out timestamps outside window
      const timestamps = (this.ipHits.get(clientIp) || []).filter(
        (time) => now - time < this.windowMs
      );

      if (timestamps.length >= this.maxRequests) {
        if (timestamps.length === 0) {
          this.ipHits.delete(clientIp);
        } else {
          this.ipHits.set(clientIp, timestamps);
        }
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
