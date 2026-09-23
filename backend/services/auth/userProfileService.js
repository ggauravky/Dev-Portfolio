const PROFILE_SELECT = [
  "_id",
  "name",
  "displayName",
  "email",
  "emailVerified",
  "picture",
  "avatarUrl",
  "+avatarPublicId",
  "bio",
  "location",
  "website",
  "createdAt",
  "lastLoginAt",
].join(" ");

const EDITABLE_PROFILE_FIELDS = new Set(["displayName", "bio", "location", "website"]);
const PROTECTED_PROFILE_FIELDS = new Set([
  "_id",
  "id",
  "email",
  "emailVerified",
  "googleId",
  "name",
  "picture",
  "providerPicture",
  "avatarUrl",
  "avatarPublicId",
  "createdAt",
  "lastLoginAt",
  "provider",
]);

const normalizeText = (value, maxLength) => String(value || "").trim().slice(0, maxLength);

const serializeUser = (user) => {
  if (!user) return null;

  const displayName = normalizeText(user.displayName, 80);
  const providerName = normalizeText(user.name, 120) || "User";
  const providerPicture = normalizeText(user.picture, 2048);
  const avatarUrl = normalizeText(user.avatarUrl, 2048);

  return {
    id: String(user._id || user.id || ""),
    name: displayName || providerName,
    displayName,
    email: normalizeText(user.email, 320).toLowerCase(),
    emailVerified: user.emailVerified !== false,
    picture: avatarUrl || providerPicture,
    providerPicture,
    hasCustomAvatar: Boolean(avatarUrl && normalizeText(user.avatarPublicId, 500)),
    bio: normalizeText(user.bio, 180),
    location: normalizeText(user.location, 80),
    website: normalizeText(user.website, 300),
    createdAt: user.createdAt || null,
    lastLoginAt: user.lastLoginAt || null,
    emailLocked: true,
    provider: "google",
  };
};

const buildProfileUpdate = (body = {}) => {
  const payload = body && typeof body === "object" && !Array.isArray(body) ? body : {};
  const keys = Object.keys(payload);
  const protectedKeys = keys.filter((key) => PROTECTED_PROFILE_FIELDS.has(key));
  if (protectedKeys.length) {
    const error = new Error(`These account fields cannot be changed: ${protectedKeys.join(", ")}`);
    error.code = "PROFILE_FIELD_LOCKED";
    error.status = 400;
    throw error;
  }

  const unknownKeys = keys.filter((key) => !EDITABLE_PROFILE_FIELDS.has(key));
  if (unknownKeys.length) {
    const error = new Error(`Unsupported profile fields: ${unknownKeys.join(", ")}`);
    error.code = "PROFILE_FIELD_UNSUPPORTED";
    error.status = 400;
    throw error;
  }

  if (!keys.length) {
    const error = new Error("Add at least one profile field to update");
    error.code = "PROFILE_UPDATE_EMPTY";
    error.status = 400;
    throw error;
  }

  const limits = { displayName: 80, bio: 180, location: 80, website: 300 };
  const update = {};
  for (const key of keys) {
    const value = String(payload[key] || "").trim();
    if (key === "displayName" && (value.length < 2 || value.length > limits[key])) {
      const error = new Error("Display name must be between 2 and 80 characters");
      error.code = "PROFILE_DISPLAY_NAME_INVALID";
      error.status = 400;
      throw error;
    }
    if (value.length > limits[key]) {
      const error = new Error(`${key} is too long`);
      error.code = "PROFILE_FIELD_TOO_LONG";
      error.status = 400;
      throw error;
    }
    if (key === "website" && value) {
      let parsed;
      try {
        parsed = new URL(value);
      } catch {
        parsed = null;
      }
      if (!parsed || !["http:", "https:"].includes(parsed.protocol)) {
        const error = new Error("Website must start with http:// or https://");
        error.code = "PROFILE_WEBSITE_INVALID";
        error.status = 400;
        throw error;
      }
    }
    update[key] = value;
  }
  return update;
};

module.exports = {
  EDITABLE_PROFILE_FIELDS,
  PROFILE_SELECT,
  PROTECTED_PROFILE_FIELDS,
  buildProfileUpdate,
  serializeUser,
};
