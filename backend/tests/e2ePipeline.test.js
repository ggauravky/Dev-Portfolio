const { test, describe } = require("node:test");
const assert = require("node:assert");
const { RateLimiter } = require("../middleware/rateLimiter");

describe("Phase 11 — End-to-End Production Hardening Test Suite", () => {
  test("1. RateLimiter blocks requests exceeding window limit with 429", () => {
    const limiter = new RateLimiter(60000, 3);
    const middleware = limiter.middleware();

    const mockReq = { ip: "192.168.1.100" };
    let status = 200;
    let jsonPayload = null;

    const mockRes = {
      setHeader: () => {},
      status: (code) => {
        status = code;
        return {
          json: (data) => {
            jsonPayload = data;
          },
        };
      },
    };

    let nextCalled = 0;
    const next = () => {
      nextCalled += 1;
    };

    // First 3 requests pass
    middleware(mockReq, mockRes, next);
    middleware(mockReq, mockRes, next);
    middleware(mockReq, mockRes, next);
    assert.strictEqual(nextCalled, 3);

    // 4th request triggers 429
    middleware(mockReq, mockRes, next);
    assert.strictEqual(status, 429);
    assert.strictEqual(jsonPayload.error, "Too Many Requests");
  });

  test("2. RateLimiter allows separate clean IP addresses", () => {
    const limiter = new RateLimiter(60000, 2);
    const middleware = limiter.middleware();

    let nextCount = 0;
    const next = () => {
      nextCount += 1;
    };

    middleware({ ip: "10.0.0.1" }, {}, next);
    middleware({ ip: "10.0.0.2" }, {}, next);
    assert.strictEqual(nextCount, 2);
  });
});
