const assert = require("node:assert/strict");
const http = require("node:http");
const test = require("node:test");
const express = require("express");

const User = require("../models/User");
const authController = require("../controllers/authController");
const profileController = require("../controllers/profileController");
const { handleAvatarUpload, avatarFileFilter, MAX_AVATAR_BYTES } = require("../middleware/avatarUpload");
const { buildProfileUpdate, serializeUser } = require("../services/auth/userProfileService");
const { reconcileGoogleAccount } = require("../services/auth/googleAccountService");

const userId = "507f1f77bcf86cd799439011";

const buildUser = (overrides = {}) => ({
  _id: userId,
  googleId: "google-profile-1",
  name: "Google Name",
  displayName: "Portfolio Name",
  email: "user@example.test",
  emailVerified: true,
  picture: "https://google.test/avatar.jpg",
  avatarUrl: "",
  avatarPublicId: "",
  bio: "Building useful software.",
  location: "Lucknow, India",
  website: "https://example.test",
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  lastLoginAt: new Date("2026-09-23T12:00:00.000Z"),
  ...overrides,
});

const createResponse = () => ({
  statusCode: 200,
  payload: null,
  status(code) {
    this.statusCode = code;
    return this;
  },
  json(value) {
    this.payload = value;
    return value;
  },
});

const withUserModel = async ({ foundUser = buildUser(), updatedUser = buildUser(), run }) => {
  const originalFindById = User.findById;
  const originalFindByIdAndUpdate = User.findByIdAndUpdate;
  let updateCall = null;
  User.findById = () => ({ select: async () => foundUser });
  User.findByIdAndUpdate = async (...args) => {
    updateCall = args;
    return updatedUser;
  };
  try {
    return await run({ getUpdateCall: () => updateCall });
  } finally {
    User.findById = originalFindById;
    User.findByIdAndUpdate = originalFindByIdAndUpdate;
    profileController._test.resetDependencies();
  }
};

test("1. profile GET requires auth", async () => {
  const res = createResponse();
  await authController.getProfile({ authUser: null }, res);
  assert.equal(res.statusCode, 401);
});

test("2. profile GET returns only safe serialized fields", async () => {
  await withUserModel({
    foundUser: buildUser({ avatarPublicId: "private-id" }),
    run: async () => {
      const res = createResponse();
      await authController.getProfile({ authUser: { id: userId } }, res);
      assert.equal(res.statusCode, 200);
      assert.equal(res.payload.data.user.email, "user@example.test");
      assert.equal("googleId" in res.payload.data.user, false);
      assert.equal("avatarPublicId" in res.payload.data.user, false);
    },
  });
});

test("3. profile PATCH requires auth", async () => {
  const res = createResponse();
  await authController.updateProfile({ authUser: null, body: { displayName: "Updated" } }, res);
  assert.equal(res.statusCode, 401);
});

test("4. displayName updates", () => {
  assert.deepEqual(buildProfileUpdate({ displayName: " Updated Name " }), { displayName: "Updated Name" });
});

test("5. bio updates", () => {
  assert.deepEqual(buildProfileUpdate({ bio: " Short bio " }), { bio: "Short bio" });
});

test("6. location updates", () => {
  assert.deepEqual(buildProfileUpdate({ location: " Lucknow " }), { location: "Lucknow" });
});

test("7. valid website updates", () => {
  assert.deepEqual(buildProfileUpdate({ website: "https://example.test/me" }), { website: "https://example.test/me" });
});

test("8. invalid website is rejected", () => {
  assert.throws(() => buildProfileUpdate({ website: "javascript:alert(1)" }), { code: "PROFILE_WEBSITE_INVALID" });
});

test("9. email change is rejected", () => {
  assert.throws(() => buildProfileUpdate({ email: "other@example.test" }), { code: "PROFILE_FIELD_LOCKED" });
});

test("10. googleId change is rejected", () => {
  assert.throws(() => buildProfileUpdate({ googleId: "other" }), { code: "PROFILE_FIELD_LOCKED" });
});

test("11. oversized displayName is rejected", () => {
  assert.throws(() => buildProfileUpdate({ displayName: "x".repeat(81) }), { code: "PROFILE_DISPLAY_NAME_INVALID" });
});

test("12. oversized bio is rejected", () => {
  assert.throws(() => buildProfileUpdate({ bio: "x".repeat(181) }), { code: "PROFILE_FIELD_TOO_LONG" });
});

test("13. unknown profile properties are rejected", () => {
  assert.throws(() => buildProfileUpdate({ role: "admin" }), { code: "PROFILE_FIELD_UNSUPPORTED" });
});

test("14. avatar upload requires auth", async () => {
  const res = createResponse();
  await profileController.uploadProfileAvatar({ authUser: null, file: { buffer: Buffer.from("image") } }, res);
  assert.equal(res.statusCode, 401);
});

const runFileFilter = (mimetype) => new Promise((resolve) => {
  avatarFileFilter({}, { mimetype }, (error, accepted) => resolve({ error, accepted }));
});

test("15. valid JPEG is accepted", async () => {
  const result = await runFileFilter("image/jpeg");
  assert.equal(result.error, null);
  assert.equal(result.accepted, true);
});

test("16. valid PNG is accepted", async () => {
  assert.equal((await runFileFilter("image/png")).accepted, true);
});

test("17. valid WebP is accepted", async () => {
  assert.equal((await runFileFilter("image/webp")).accepted, true);
});

test("18. avatar larger than 5 MB is rejected", async () => {
  assert.equal(MAX_AVATAR_BYTES, 5 * 1024 * 1024);
  const app = express();
  app.post("/avatar", handleAvatarUpload, (req, res) => res.json({ success: true }));
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  try {
    const form = new FormData();
    form.append("avatar", new Blob([new Uint8Array(MAX_AVATAR_BYTES + 1)], { type: "image/jpeg" }), "large.jpg");
    const response = await fetch(`http://127.0.0.1:${server.address().port}/avatar`, { method: "POST", body: form });
    const payload = await response.json();
    assert.equal(response.status, 400);
    assert.equal(payload.code, "AVATAR_TOO_LARGE");
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test("19. SVG avatar is rejected", async () => {
  const result = await runFileFilter("image/svg+xml");
  assert.equal(result.error.code, "AVATAR_TYPE_INVALID");
});

test("20. unsupported avatar MIME is rejected", async () => {
  const result = await runFileFilter("application/pdf");
  assert.equal(result.error.code, "AVATAR_TYPE_INVALID");
});

test("21. Cloudinary failure does not overwrite the current avatar", async () => {
  await withUserModel({
    foundUser: buildUser({ avatarUrl: "https://old.test/avatar.webp", avatarPublicId: "old-id" }),
    run: async ({ getUpdateCall }) => {
      profileController._test.setDependencies({ uploadAvatar: async () => { throw new Error("provider failed"); } });
      const res = createResponse();
      await profileController.uploadProfileAvatar({ authUser: { id: userId }, file: { buffer: Buffer.from("image") }, log: { warn() {} } }, res);
      assert.equal(res.statusCode, 502);
      assert.equal(getUpdateCall(), null);
    },
  });
});

test("22. successful avatar upload stores URL and public ID", async () => {
  await withUserModel({
    updatedUser: buildUser({ avatarUrl: "https://cdn.test/new.webp", avatarPublicId: "new-id" }),
    run: async ({ getUpdateCall }) => {
      profileController._test.setDependencies({ uploadAvatar: async () => ({ url: "https://cdn.test/new.webp", publicId: "new-id" }) });
      const res = createResponse();
      await profileController.uploadProfileAvatar({ authUser: { id: userId }, file: { buffer: Buffer.from("image") } }, res);
      assert.deepEqual(getUpdateCall()[1].$set, { avatarUrl: "https://cdn.test/new.webp", avatarPublicId: "new-id" });
    },
  });
});

test("23. avatar replacement returns the new public image", async () => {
  await withUserModel({
    foundUser: buildUser({ avatarUrl: "https://cdn.test/old.webp", avatarPublicId: "old-id" }),
    updatedUser: buildUser({ avatarUrl: "https://cdn.test/new.webp", avatarPublicId: "new-id" }),
    run: async () => {
      profileController._test.setDependencies({
        uploadAvatar: async () => ({ url: "https://cdn.test/new.webp", publicId: "new-id" }),
        deleteAvatar: async () => ({ result: "ok" }),
      });
      const res = createResponse();
      await profileController.uploadProfileAvatar({ authUser: { id: userId }, file: { buffer: Buffer.from("image") } }, res);
      assert.equal(res.payload.data.user.picture, "https://cdn.test/new.webp");
    },
  });
});

test("24. replacing an avatar attempts old image cleanup", async () => {
  let deletedId = "";
  await withUserModel({
    foundUser: buildUser({ avatarPublicId: "old-id" }),
    updatedUser: buildUser({ avatarUrl: "https://cdn.test/new.webp", avatarPublicId: "new-id" }),
    run: async () => {
      profileController._test.setDependencies({
        uploadAvatar: async () => ({ url: "https://cdn.test/new.webp", publicId: "new-id" }),
        deleteAvatar: async (publicId) => { deletedId = publicId; },
      });
      await profileController.uploadProfileAvatar({ authUser: { id: userId }, file: { buffer: Buffer.from("image") } }, createResponse());
      assert.equal(deletedId, "old-id");
    },
  });
});

test("25. avatar delete clears custom avatar fields", async () => {
  const current = buildUser({ avatarUrl: "https://cdn.test/custom.webp", avatarPublicId: "custom-id" });
  current.save = async () => current;
  await withUserModel({
    foundUser: current,
    run: async () => {
      profileController._test.setDependencies({ deleteAvatar: async () => ({ result: "ok" }) });
      await profileController.deleteProfileAvatar({ authUser: { id: userId } }, createResponse());
      assert.equal(current.avatarUrl, "");
      assert.equal(current.avatarPublicId, "");
    },
  });
});

test("26. deleting custom avatar falls back to Google picture", async () => {
  const current = buildUser({ avatarUrl: "https://cdn.test/custom.webp", avatarPublicId: "custom-id" });
  current.save = async () => current;
  await withUserModel({
    foundUser: current,
    run: async () => {
      profileController._test.setDependencies({ deleteAvatar: async () => ({ result: "ok" }) });
      const res = createResponse();
      await profileController.deleteProfileAvatar({ authUser: { id: userId } }, res);
      assert.equal(res.payload.data.user.picture, "https://google.test/avatar.jpg");
    },
  });
});

test("27. clients cannot submit an arbitrary Cloudinary public ID", () => {
  assert.throws(() => buildProfileUpdate({ avatarPublicId: "someone-elses-image" }), { code: "PROFILE_FIELD_LOCKED" });
});

test("28. Google re-login preserves a custom avatar", async () => {
  const existing = buildUser({ avatarUrl: "https://cdn.test/custom.webp", avatarPublicId: "custom-id", save: async () => {} });
  const UserModel = { findOne: async (query) => query.googleId ? existing : null };
  await reconcileGoogleAccount({ sub: existing.googleId, email: existing.email, email_verified: true, name: "Fresh Google Name", picture: "https://google.test/new.jpg" }, { UserModel });
  assert.equal(existing.avatarUrl, "https://cdn.test/custom.webp");
  assert.equal(existing.avatarPublicId, "custom-id");
});

test("29. Google re-login preserves a custom display name", async () => {
  const existing = buildUser({ displayName: "My Chosen Name", save: async () => {} });
  const UserModel = { findOne: async (query) => query.googleId ? existing : null };
  await reconcileGoogleAccount({ sub: existing.googleId, email: existing.email, email_verified: true, name: "Fresh Google Name" }, { UserModel });
  assert.equal(existing.displayName, "My Chosen Name");
});

test("30. safe auth serializer resolves custom avatar before provider picture", () => {
  const serialized = serializeUser(buildUser({ avatarUrl: "https://cdn.test/custom.webp", avatarPublicId: "custom-id" }));
  assert.equal(serialized.picture, "https://cdn.test/custom.webp");
  assert.equal(serialized.providerPicture, "https://google.test/avatar.jpg");
  assert.equal(serialized.hasCustomAvatar, true);
});
