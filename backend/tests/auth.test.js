const assert = require("node:assert/strict");
const test = require("node:test");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/auth");
const {
  ACCOUNT_CONFLICT_MESSAGE,
  normalizeGoogleProfile,
  reconcileGoogleAccount,
} = require("../services/auth/googleAccountService");
const {
  AUTH_COOKIE_NAME,
  AUTH_SESSION_ALGORITHM,
  AUTH_SESSION_AUDIENCE,
  AUTH_SESSION_ISSUER,
  getSessionCookieOptions,
  issueSessionToken,
  verifySessionToken,
} = require("../utils/authSession");
const { isTrustedOrigin, requireTrustedOrigin } = require("../config/trustedOrigins");

const originalEnvironment = {
  AUTH_COOKIE_SAME_SITE: process.env.AUTH_COOKIE_SAME_SITE,
  AUTH_JWT_SECRET: process.env.AUTH_JWT_SECRET,
  AUTH_SESSION_TTL_SECONDS: process.env.AUTH_SESSION_TTL_SECONDS,
  FRONTEND_URL: process.env.FRONTEND_URL,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  LOGIN_EMAIL_MAX_ATTEMPTS: process.env.LOGIN_EMAIL_MAX_ATTEMPTS,
  LOGIN_EMAIL_RETRY_BASE_MS: process.env.LOGIN_EMAIL_RETRY_BASE_MS,
  NODE_ENV: process.env.NODE_ENV,
};

process.env.AUTH_JWT_SECRET = "auth-test-secret-with-more-than-thirty-two-characters";
process.env.AUTH_SESSION_TTL_SECONDS = "604800";
process.env.FRONTEND_URL = "https://portfolio.example.test";
process.env.GOOGLE_CLIENT_ID = "123456-test.apps.googleusercontent.com";
process.env.LOGIN_EMAIL_MAX_ATTEMPTS = "1";
process.env.LOGIN_EMAIL_RETRY_BASE_MS = "0";
process.env.NODE_ENV = "test";

const validPayload = {
  sub: "google-sub-123",
  email: "person@example.test",
  email_verified: true,
  name: "Person Example",
  given_name: "Person",
  family_name: "Example",
  picture: "https://images.example.test/person.jpg",
  locale: "en-IN",
};

const buildUser = (overrides = {}) => {
  const user = {
    _id: "507f1f77bcf86cd799439011",
    googleId: validPayload.sub,
    email: validPayload.email,
    name: "Existing Name",
    displayName: "Custom Display Name",
    givenName: "Existing",
    familyName: "Name",
    picture: "https://images.example.test/old.jpg",
    locale: "en",
    emailVerified: true,
    lastWelcomeBackEmailAt: null,
    lastLoginAt: new Date("2026-01-01T00:00:00.000Z"),
    saveCalls: 0,
    async save() {
      this.saveCalls += 1;
      return this;
    },
    ...overrides,
  };
  return user;
};

const buildUserModel = ({ userByGoogleId = null, userByEmail = null } = {}) => {
  const calls = { creates: [], queries: [] };
  return {
    calls,
    async findOne(query) {
      calls.queries.push(query);
      if (Object.hasOwn(query, "googleId")) return userByGoogleId;
      if (Object.hasOwn(query, "email")) return userByEmail;
      return null;
    },
    async create(input) {
      calls.creates.push(input);
      return buildUser({ ...input });
    },
  };
};

const quietLogger = { info() {}, warn() {}, error() {} };

const buildResponse = () => {
  const state = { body: null, clearCookie: null, cookie: null, headers: {}, status: 200 };
  return {
    state,
    clearCookie(name, options) {
      state.clearCookie = { name, options };
      return this;
    },
    cookie(name, value, options) {
      state.cookie = { name, value, options };
      return this;
    },
    json(value) {
      state.body = value;
      return value;
    },
    set(name, value) {
      state.headers[name] = value;
      return this;
    },
    status(code) {
      state.status = code;
      return this;
    },
  };
};

const flushImmediate = () => new Promise((resolve) => setImmediate(resolve));

const runGoogleSignIn = async ({
  body = { credential: "test-google-credential" },
  dependencies = {},
  isNewUser = false,
  user = buildUser(),
} = {}) => {
  authController._test.setDependencies({
    verifyGoogleCredential: async () => validPayload,
    reconcileGoogleAccount: async () => ({ user, isNewUser }),
    recordActivityEvent: async () => ({}),
    claimLoginEmailEvent: async () => true,
    markLifecycleEmailSent: async () => {},
    sendWelcomeEmail: async () => ({ sent: false, skipped: true }),
    sendWelcomeBackEmail: async () => ({ sent: false, skipped: true }),
    ...dependencies,
  });
  const response = buildResponse();
  await authController.googleSignIn(
    { body, headers: {}, id: "request-test", log: quietLogger },
    response
  );
  return response.state;
};

test.afterEach(async () => {
  await flushImmediate();
  authController._test.resetDependencies();
  process.env.GOOGLE_CLIENT_ID = "123456-test.apps.googleusercontent.com";
  process.env.NODE_ENV = "test";
  delete process.env.AUTH_COOKIE_SAME_SITE;
});

test.after(() => {
  for (const [key, value] of Object.entries(originalEnvironment)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
});

test("1. missing credential returns 400", async () => {
  const result = await runGoogleSignIn({ body: {} });
  assert.equal(result.status, 400);
});

test("2. invalid Google token returns 401", async () => {
  const result = await runGoogleSignIn({
    dependencies: { verifyGoogleCredential: async () => { throw new Error("invalid token"); } },
  });
  assert.equal(result.status, 401);
});

test("3. missing GOOGLE_CLIENT_ID fails safely with 503", async () => {
  delete process.env.GOOGLE_CLIENT_ID;
  const result = await runGoogleSignIn();
  assert.equal(result.status, 503);
  assert.doesNotMatch(JSON.stringify(result.body), /AUTH_JWT_SECRET|auth-test-secret/);
});

test("4. valid verified Google profile creates a new user", async () => {
  const UserModel = buildUserModel();
  const result = await reconcileGoogleAccount(validPayload, { UserModel });
  assert.equal(result.isNewUser, true);
  assert.equal(UserModel.calls.creates.length, 1);
});

test("5. Google sub is stored as the stable googleId", async () => {
  const UserModel = buildUserModel();
  await reconcileGoogleAccount(validPayload, { UserModel });
  assert.equal(UserModel.calls.creates[0].googleId, validPayload.sub);
  assert.deepEqual(UserModel.calls.queries[0], { googleId: validPayload.sub });
});

test("6. returning user is found by Google sub before email", async () => {
  const existing = buildUser();
  const UserModel = buildUserModel({ userByGoogleId: existing });
  const result = await reconcileGoogleAccount(validPayload, { UserModel });
  assert.equal(result.user, existing);
  assert.deepEqual(UserModel.calls.queries, [{ googleId: validPayload.sub }]);
});

test("7. returning user is not duplicated", async () => {
  const existing = buildUser();
  const UserModel = buildUserModel({ userByGoogleId: existing });
  await reconcileGoogleAccount(validPayload, { UserModel });
  assert.equal(UserModel.calls.creates.length, 0);
  assert.equal(existing.saveCalls, 1);
});

test("8. returning user's canonical Google profile is refreshed", async () => {
  const existing = buildUser();
  await reconcileGoogleAccount(validPayload, { UserModel: buildUserModel({ userByGoogleId: existing }) });
  assert.equal(existing.name, validPayload.name);
  assert.equal(existing.picture, validPayload.picture);
  assert.equal(existing.locale, "en-in");
});

test("9. customized displayName is preserved", async () => {
  const existing = buildUser({ displayName: "My Portfolio Name" });
  await reconcileGoogleAccount(validPayload, { UserModel: buildUserModel({ userByGoogleId: existing }) });
  assert.equal(existing.displayName, "My Portfolio Name");
});

test("10. same Google sub can update to a new verified email", async () => {
  const existing = buildUser({ email: "old@example.test" });
  const UserModel = buildUserModel({ userByGoogleId: existing, userByEmail: null });
  await reconcileGoogleAccount(validPayload, { UserModel });
  assert.equal(existing.email, validPayload.email);
});

test("11. changed email owned by another user returns conflict", async () => {
  const existing = buildUser({ email: "old@example.test" });
  const another = buildUser({ _id: "507f1f77bcf86cd799439012", googleId: "other-sub" });
  await assert.rejects(
    () => reconcileGoogleAccount(validPayload, {
      UserModel: buildUserModel({ userByGoogleId: existing, userByEmail: another }),
    }),
    { status: 409, message: ACCOUNT_CONFLICT_MESSAGE }
  );
});

test("12. different Google sub cannot take an existing email account", async () => {
  const emailOwner = buildUser({ googleId: "other-sub" });
  await assert.rejects(
    () => reconcileGoogleAccount(validPayload, {
      UserModel: buildUserModel({ userByGoogleId: null, userByEmail: emailOwner }),
    }),
    { status: 409 }
  );
});

test("13. unverified Google email is rejected", () => {
  assert.throws(
    () => normalizeGoogleProfile({ ...validPayload, email_verified: false }),
    { status: 403 }
  );
});

test("14. session cookie is HttpOnly", () => {
  assert.equal(getSessionCookieOptions().httpOnly, true);
});

test("15. production session cookie is Secure", () => {
  process.env.NODE_ENV = "production";
  assert.equal(getSessionCookieOptions().secure, true);
});

test("16. cookie SameSite follows cross-site production and local development", () => {
  process.env.NODE_ENV = "production";
  assert.equal(getSessionCookieOptions().sameSite, "none");
  process.env.NODE_ENV = "development";
  assert.equal(getSessionCookieOptions().sameSite, "lax");
});

test("17. valid app session restores the authenticated user", async () => {
  const originalFindById = User.findById;
  const sessionUser = buildUser();
  User.findById = () => ({ select: async () => sessionUser });
  const req = { cookies: { [AUTH_COOKIE_NAME]: issueSessionToken({ uid: sessionUser._id }) } };
  const res = buildResponse();
  let nextCalled = false;
  try {
    await authMiddleware.attachOptionalUser(req, res, () => { nextCalled = true; });
    assert.equal(nextCalled, true);
    assert.equal(req.authUser.id, sessionUser._id);
    assert.equal(req.authUser.provider, "google");
  } finally {
    User.findById = originalFindById;
  }
});

test("18. logged-out visitor receives an anonymous optional session", async () => {
  const req = { cookies: {}, headers: {} };
  const res = buildResponse();
  let nextCalled = false;
  await authMiddleware.attachOptionalUser(req, res, () => { nextCalled = true; });
  assert.equal(nextCalled, true);
  assert.equal(req.authUser, null);
});

test("19. invalid session is rejected and cleared", async () => {
  const req = { cookies: { [AUTH_COOKIE_NAME]: "invalid-session" }, headers: {} };
  const res = buildResponse();
  await authMiddleware.attachOptionalUser(req, res, () => {});
  assert.equal(req.authUser, null);
  assert.equal(res.state.clearCookie.name, AUTH_COOKIE_NAME);
});

test("20. protected route rejects an unauthenticated request", async () => {
  const req = { cookies: {}, headers: {} };
  const res = buildResponse();
  await authMiddleware.requireAuth(req, res, () => assert.fail("next must not run"));
  assert.equal(res.state.status, 401);
});

test("21. logout clears the session cookie with matching options", async () => {
  const res = buildResponse();
  await authController.logout({ authUser: null, log: quietLogger }, res);
  assert.equal(res.state.status, 200);
  assert.equal(res.state.clearCookie.name, AUTH_COOKIE_NAME);
  assert.equal(res.state.clearCookie.options.path, "/");
});

test("22. lifecycle email failure does not fail authentication", async () => {
  const result = await runGoogleSignIn({
    dependencies: { sendWelcomeBackEmail: async () => { throw new Error("SMTP unavailable"); } },
  });
  assert.equal(result.status, 200);
  assert.ok(result.cookie);
});

test("23. login activity failure does not fail authentication", async () => {
  const result = await runGoogleSignIn({
    dependencies: { recordActivityEvent: async () => { throw new Error("Mongo unavailable"); } },
  });
  assert.equal(result.status, 200);
});

test("24. returning login performs no user deletion", async () => {
  const existing = buildUser();
  const UserModel = {
    ...buildUserModel({ userByGoogleId: existing }),
    deleteOne: async () => assert.fail("deleteOne must never be called"),
  };
  const result = await reconcileGoogleAccount(validPayload, { UserModel });
  assert.equal(result.user._id, existing._id);
});

test("25. Google credential is never persisted", async () => {
  const UserModel = buildUserModel();
  await reconcileGoogleAccount({ ...validPayload, credential: "secret-google-token" }, { UserModel });
  assert.equal("credential" in UserModel.calls.creates[0], false);
});

test("26. Google credential is not returned in auth response", async () => {
  const result = await runGoogleSignIn({ body: { credential: "secret-google-token" } });
  assert.doesNotMatch(JSON.stringify(result.body), /secret-google-token/);
});

test("27. auth response never exposes session token or server secret", async () => {
  const result = await runGoogleSignIn();
  assert.equal("token" in result.body.data, false);
  assert.doesNotMatch(JSON.stringify(result.body), /auth-test-secret|googleId/);
});

test("28. session JWT has fixed algorithm, issuer, audience, and jti", () => {
  const token = issueSessionToken({ uid: "507f1f77bcf86cd799439011", extra: "ignored" });
  const decoded = jwt.decode(token, { complete: true });
  assert.equal(decoded.header.alg, AUTH_SESSION_ALGORITHM);
  assert.equal(decoded.payload.iss, AUTH_SESSION_ISSUER);
  assert.equal(decoded.payload.aud, AUTH_SESSION_AUDIENCE);
  assert.ok(decoded.payload.jti);
  assert.equal("extra" in decoded.payload, false);
  assert.equal(verifySessionToken(token).uid, "507f1f77bcf86cd799439011");
});

test("29. Authorization bearer tokens are ignored", async () => {
  const req = { cookies: {}, headers: { authorization: `Bearer ${issueSessionToken({ uid: "user" })}` } };
  await authMiddleware.attachOptionalUser(req, buildResponse(), () => {});
  assert.equal(req.authUser, null);
});

test("30. trusted-origin middleware accepts only configured origins in production", () => {
  process.env.NODE_ENV = "production";
  process.env.FRONTEND_URL = "https://portfolio.example.test";
  assert.equal(isTrustedOrigin("https://portfolio.example.test"), true);
  assert.equal(isTrustedOrigin("https://attacker.vercel.app"), false);

  const allowedResponse = buildResponse();
  let nextCalled = false;
  requireTrustedOrigin(
    { get: () => "https://portfolio.example.test" },
    allowedResponse,
    () => { nextCalled = true; }
  );
  assert.equal(nextCalled, true);

  const blockedResponse = buildResponse();
  requireTrustedOrigin({ get: () => "https://attacker.vercel.app" }, blockedResponse, () => {});
  assert.equal(blockedResponse.state.status, 403);
});

test("31. public auth config exposes only safe client configuration", async () => {
  const res = buildResponse();
  await authController.getPublicAuthConfig({}, res);
  assert.deepEqual(Object.keys(res.state.body.data).sort(), ["googleAuthEnabled", "googleClientId"]);
  assert.equal(res.state.body.data.googleAuthEnabled, true);
});

test("32. login event ID is stable for a retried credential", () => {
  assert.equal(
    authController._test.buildLoginEventId("same-google-credential"),
    authController._test.buildLoginEventId("same-google-credential")
  );
  assert.notEqual(
    authController._test.buildLoginEventId("same-google-credential"),
    authController._test.buildLoginEventId("different-google-credential")
  );
  assert.equal(
    authController._test.buildLoginEventId("same-google-credential", "98ee6b87-2f9f-44ca-bc12-8ff4ba12ce1d"),
    authController._test.buildLoginEventId("same-google-credential", "98ee6b87-2f9f-44ca-bc12-8ff4ba12ce1d")
  );
  assert.notEqual(
    authController._test.buildLoginEventId("same-google-credential", "98ee6b87-2f9f-44ca-bc12-8ff4ba12ce1d"),
    authController._test.buildLoginEventId("same-google-credential", "91648e91-cbae-4bdb-bda3-c4da15acb92d")
  );
});

test("33. successful Google login emails the verified user exactly once", async () => {
  const deliveries = [];
  await runGoogleSignIn({
    dependencies: {
      sendWelcomeBackEmail: async (input) => {
        deliveries.push(input);
        return { sent: true, messageId: "login-message-1" };
      },
    },
  });
  await flushImmediate();
  assert.equal(deliveries.length, 1);
  assert.equal(deliveries[0].user.email, validPayload.email);
});

test("34. duplicate POST retry for the same login event sends no duplicate email", async () => {
  const claimedEvents = new Set();
  let deliveryCount = 0;
  const dependencies = {
    claimLoginEmailEvent: async ({ loginEventId }) => {
      if (claimedEvents.has(loginEventId)) return false;
      claimedEvents.add(loginEventId);
      return true;
    },
    sendWelcomeBackEmail: async () => {
      deliveryCount += 1;
      return { sent: true, messageId: "login-message-duplicate-test" };
    },
  };

  await runGoogleSignIn({ dependencies });
  await flushImmediate();
  await runGoogleSignIn({ dependencies });
  await flushImmediate();
  assert.equal(deliveryCount, 1);
});

test("35. new and returning users use their matching lifecycle templates", async () => {
  const types = [];
  const dependencies = {
    sendWelcomeEmail: async () => {
      types.push("welcome");
      return { sent: true, messageId: "welcome-1" };
    },
    sendWelcomeBackEmail: async () => {
      types.push("welcome_back");
      return { sent: true, messageId: "welcome-back-1" };
    },
  };
  await runGoogleSignIn({ dependencies, isNewUser: true });
  await flushImmediate();
  await runGoogleSignIn({ dependencies, isNewUser: false, body: { credential: "credential-2" } });
  await flushImmediate();
  assert.deepEqual(types, ["welcome", "welcome_back"]);
});

test("36. auth session lookup never triggers lifecycle email", async () => {
  let deliveryCount = 0;
  authController._test.setDependencies({
    sendWelcomeEmail: async () => { deliveryCount += 1; },
    sendWelcomeBackEmail: async () => { deliveryCount += 1; },
  });
  const response = buildResponse();
  await authController.getCurrentSession({ authUser: buildUser() }, response);
  assert.equal(response.state.status, 200);
  assert.equal(deliveryCount, 0);
});

test("37. login event claim is an atomic bounded MongoDB update", async () => {
  const originalUpdateOne = User.updateOne;
  let capturedQuery;
  let capturedUpdate;
  User.updateOne = async (query, update) => {
    capturedQuery = query;
    capturedUpdate = update;
    return { modifiedCount: 1 };
  };

  try {
    const claimed = await authController._test.claimLoginEmailEvent({
      userId: "507f1f77bcf86cd799439011",
      loginEventId: "google-event-1",
    });
    assert.equal(claimed, true);
    assert.deepEqual(capturedQuery.recentLoginEmailEventIds, { $ne: "google-event-1" });
    assert.equal(capturedUpdate.$push.recentLoginEmailEventIds.$slice, -24);
  } finally {
    User.updateOne = originalUpdateOne;
  }
});

test("38. temporary login email failure retries without failing authentication", async () => {
  process.env.LOGIN_EMAIL_MAX_ATTEMPTS = "3";
  process.env.LOGIN_EMAIL_RETRY_BASE_MS = "0";
  let attempts = 0;
  authController._test.setDependencies({
    sendWelcomeBackEmail: async () => {
      attempts += 1;
      if (attempts === 1) {
        return {
          sent: false,
          skipped: false,
          reason: "smtp_error",
          error: { code: "ETIMEDOUT", category: "SMTP_TEMPORARY_FAILURE", retryable: true },
        };
      }
      return { sent: true, messageId: "login-after-retry" };
    },
  });

  try {
    const result = await authController._test.dispatchLifecycleEmailWithRetry({
      isNewUser: false,
      userSnapshot: { _id: "user-1", loginEventId: "login-retry-1" },
      reqLogger: quietLogger,
    });
    assert.equal(result.sent, true);
    assert.equal(attempts, 2);
  } finally {
    process.env.LOGIN_EMAIL_MAX_ATTEMPTS = "1";
  }
});

test("39. permanent login SMTP authentication failure stops bounded retry", async () => {
  process.env.LOGIN_EMAIL_MAX_ATTEMPTS = "3";
  let attempts = 0;
  authController._test.setDependencies({
    sendWelcomeBackEmail: async () => {
      attempts += 1;
      return {
        sent: false,
        skipped: false,
        reason: "smtp_error",
        error: { code: "EAUTH", category: "SMTP_AUTH_FAILED", retryable: false },
      };
    },
  });

  try {
    const result = await authController._test.dispatchLifecycleEmailWithRetry({
      isNewUser: false,
      userSnapshot: { _id: "user-1", loginEventId: "login-auth-failure" },
      reqLogger: quietLogger,
    });
    assert.equal(result.sent, false);
    assert.equal(attempts, 1);
  } finally {
    process.env.LOGIN_EMAIL_MAX_ATTEMPTS = "1";
  }
});

test("40. separate explicit login event IDs allow legitimate later notifications", async () => {
  const claimedEvents = new Set();
  let deliveries = 0;
  const dependencies = {
    claimLoginEmailEvent: async ({ loginEventId }) => {
      if (claimedEvents.has(loginEventId)) return false;
      claimedEvents.add(loginEventId);
      return true;
    },
    sendWelcomeBackEmail: async () => {
      deliveries += 1;
      return { sent: true, messageId: `login-${deliveries}` };
    },
  };

  await runGoogleSignIn({
    dependencies,
    body: {
      credential: "same-google-credential",
      loginEventId: "98ee6b87-2f9f-44ca-bc12-8ff4ba12ce1d",
    },
  });
  await authController._test.waitForBackgroundTasks();
  await runGoogleSignIn({
    dependencies,
    body: {
      credential: "same-google-credential",
      loginEventId: "91648e91-cbae-4bdb-bda3-c4da15acb92d",
    },
  });
  await authController._test.waitForBackgroundTasks();
  assert.equal(deliveries, 2);
});

test("41. missing SMTP configuration is logged as a login email failure", async () => {
  process.env.LOGIN_EMAIL_MAX_ATTEMPTS = "3";
  let attempts = 0;
  const events = [];
  authController._test.setDependencies({
    sendWelcomeBackEmail: async () => {
      attempts += 1;
      return { sent: false, skipped: true, reason: "smtp_not_configured" };
    },
  });

  try {
    await authController._test.dispatchLifecycleEmailWithRetry({
      isNewUser: false,
      userSnapshot: { _id: "user-1", loginEventId: "login-config-failure" },
      reqLogger: {
        info(context) { events.push(context); },
        warn(context) { events.push(context); },
      },
    });
    assert.equal(attempts, 1);
    assert.ok(events.some((event) =>
      event.event === "email.login.failed" && event.smtpCategory === "SMTP_NOT_CONFIGURED"
    ));
  } finally {
    process.env.LOGIN_EMAIL_MAX_ATTEMPTS = "1";
  }
});
