const assert = require("node:assert/strict");
const test = require("node:test");

const { RateLimiter } = require("../middleware/rateLimiter");

const createRes = () => {
  const res = {
    statusCode: 200,
    headers: {},
    body: null,
    setHeader(name, value) {
      this.headers[name] = value;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };
  return res;
};

const hit = (middleware, ip) => {
  const res = createRes();
  let nextCalled = false;
  middleware({ ip, headers: {} }, res, () => {
    nextCalled = true;
  });
  return { res, nextCalled };
};

test.after(() => {
  RateLimiter.stopSweep();
});

test("rate limiter blocks after the limit and keeps the key bounded", () => {
  const limiter = new RateLimiter(60 * 1000, 2);
  const middleware = limiter.middleware();

  assert.equal(hit(middleware, "1.1.1.1").nextCalled, true);
  assert.equal(hit(middleware, "1.1.1.1").nextCalled, true);
  const blocked = hit(middleware, "1.1.1.1");
  assert.equal(blocked.nextCalled, false);
  assert.equal(blocked.res.statusCode, 429);
  assert.equal(limiter.ipHits.get("1.1.1.1").length, 2);
});

test("rate limiter deletes a key inline when its filtered window is empty", () => {
  const limiter = new RateLimiter(60 * 1000, 0);
  const middleware = limiter.middleware();

  limiter.ipHits.set("2.2.2.2", [Date.now() - 120 * 1000]);
  const blocked = hit(middleware, "2.2.2.2");

  assert.equal(blocked.res.statusCode, 429);
  assert.equal(limiter.ipHits.has("2.2.2.2"), false);
});

test("sweep removes idle keys, trims stale timestamps and keeps live ones", () => {
  const limiter = new RateLimiter(1000, 10);
  const now = Date.now();

  limiter.ipHits.set("idle", [now - 5000, now - 3000]);
  limiter.ipHits.set("empty", []);
  limiter.ipHits.set("mixed", [now - 5000, now - 100]);
  limiter.ipHits.set("live", [now - 10]);

  const removed = limiter.sweep(now);

  assert.equal(removed, 2);
  assert.equal(limiter.ipHits.has("idle"), false);
  assert.equal(limiter.ipHits.has("empty"), false);
  assert.deepEqual(limiter.ipHits.get("mixed"), [now - 100]);
  assert.deepEqual(limiter.ipHits.get("live"), [now - 10]);
});

test("sweepAll covers every limiter instance", () => {
  const first = new RateLimiter(1000, 10);
  const second = new RateLimiter(1000, 10);
  const now = Date.now();
  first.ipHits.set("a", [now - 5000]);
  second.ipHits.set("b", [now - 5000]);

  RateLimiter.sweepAll(now);

  assert.equal(first.ipHits.size, 0);
  assert.equal(second.ipHits.size, 0);
});

test("the periodic sweep timer is unref'd and can be stopped", () => {
  RateLimiter.stopSweep();
  const timer = RateLimiter.startSweep(60 * 1000);

  assert.ok(timer);
  assert.equal(timer.hasRef(), false);
  assert.equal(RateLimiter.startSweep(), timer, "startSweep is idempotent");

  RateLimiter.stopSweep();
  assert.equal(RateLimiter.sweepTimer, null);
});
