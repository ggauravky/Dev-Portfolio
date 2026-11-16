const assert = require("node:assert/strict");
const test = require("node:test");

const BlogPost = require("../models/BlogPost");
const Support = require("../models/Support");
const blogSupportController = require("../controllers/blogSupportController");
const { asyncHandler } = require("../utils/asyncHandler");
const { scrubEvent } = require("../utils/monitoring");

const createRes = () => ({
  statusCode: 200,
  body: null,
  status(code) {
    this.statusCode = code;
    return this;
  },
  json(payload) {
    this.body = payload;
    return this;
  },
});

test("asyncHandler forwards a rejected handler to next instead of leaving it unhandled", async () => {
  const failure = new Error("db down");
  let forwarded;
  const wrapped = asyncHandler(async () => {
    throw failure;
  });

  await wrapped({}, createRes(), (error) => {
    forwarded = error;
  });

  assert.equal(forwarded, failure);
});

test("asyncHandler leaves successful handlers alone", async () => {
  let nextCalled = false;
  const res = createRes();
  await asyncHandler(async (req, response) => response.status(204).json({ ok: true }))({}, res, () => {
    nextCalled = true;
  });
  assert.equal(res.statusCode, 204);
  assert.equal(nextCalled, false);
});

test("blog support never overwrites an existing post's title or content", async (t) => {
  const existing = {
    _id: "64b000000000000000000001",
    slug: "real-post",
    title: "Real title",
    content: "Real content",
    save: () => {
      throw new Error("existing post must not be saved");
    },
  };
  t.mock.method(BlogPost, "findOne", async () => existing);
  t.mock.method(BlogPost, "create", async () => {
    throw new Error("must not create");
  });
  t.mock.method(BlogPost, "updateOne", async () => ({}));
  t.mock.method(BlogPost, "findById", () => ({ select: async () => ({ supportCount: 3 }) }));
  t.mock.method(Support, "updateOne", async () => ({ upsertedCount: 1 }));

  const res = createRes();
  await blogSupportController.supportBlogPost(
    {
      body: { slug: "real-post", title: "Defaced", content: "x".repeat(5000) },
      authUser: { id: "64b0000000000000000000aa", name: "A", email: "a@example.com" },
      log: { error() {} },
    },
    res
  );

  assert.equal(res.statusCode, 200);
  assert.equal(existing.title, "Real title");
  assert.equal(existing.content, "Real content");
});

test("blog support stores only a short content snapshot for a new slug", async (t) => {
  let created;
  t.mock.method(BlogPost, "findOne", async () => null);
  t.mock.method(BlogPost, "create", async (doc) => {
    created = doc;
    return { _id: "64b000000000000000000002", ...doc };
  });
  t.mock.method(BlogPost, "updateOne", async () => ({}));
  t.mock.method(BlogPost, "findById", () => ({ select: async () => ({ supportCount: 1 }) }));
  t.mock.method(Support, "updateOne", async () => ({ upsertedCount: 1 }));

  const res = createRes();
  await blogSupportController.supportBlogPost(
    {
      body: { slug: "new-post", title: "New post", content: "y".repeat(120000) },
      authUser: { id: "64b0000000000000000000aa", name: "A", email: "a@example.com" },
      log: { error() {} },
    },
    res
  );

  assert.equal(res.statusCode, 200);
  assert.equal(created.content.length, 500);
});

test("Sentry events drop request bodies and cookies and redact secret-like keys", () => {
  const event = scrubEvent({
    request: {
      url: "https://api.example.com/api/auth/google",
      data: { credential: "google-id-token" },
      cookies: { portfolio_session: "jwt" },
      headers: { authorization: "Bearer abc", "user-agent": "ua" },
    },
    extra: { token: "t", path: "/api/auth/google" },
  });

  assert.equal(event.request.data, undefined);
  assert.equal(event.request.cookies, undefined);
  assert.equal(event.request.headers.authorization, "[REDACTED]");
  assert.equal(event.request.headers["user-agent"], "ua");
  assert.equal(event.extra.token, "[REDACTED]");
  assert.equal(event.extra.path, "/api/auth/google");
});

test("Sentry scrubbing leaves the SDK's internal scope objects untouched", () => {
  class FakeScope {
    constructor() {
      this.self = this;
      this.tags = new Map([["a", 1]]);
    }
  }
  const scope = new FakeScope();
  const original = { request: { data: { a: 1 } }, sdkProcessingMetadata: { capturedSpanScope: scope } };

  const event = scrubEvent(original);

  assert.equal(event, original);
  assert.equal(event.sdkProcessingMetadata.capturedSpanScope, scope);
  assert.ok(scope.tags instanceof Map);
});
