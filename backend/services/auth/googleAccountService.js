const User = require("../../models/User");

const ACCOUNT_CONFLICT_MESSAGE =
  "This email is already linked to another account. Please contact support.";

class GoogleAccountError extends Error {
  constructor(message, { code, status }) {
    super(message);
    this.name = "GoogleAccountError";
    this.code = code;
    this.status = status;
  }
}

const normalizeText = (value, maxLength) =>
  String(value || "").trim().slice(0, maxLength);

const normalizeGoogleProfile = (payload) => {
  const googleId = normalizeText(payload?.sub, 255);
  const email = normalizeText(payload?.email, 320).toLowerCase();

  if (!googleId || !email) {
    throw new GoogleAccountError("Google account details are invalid", {
      code: "GOOGLE_PROFILE_INVALID",
      status: 400,
    });
  }

  if (payload?.email_verified !== true) {
    throw new GoogleAccountError("Google account email is not verified", {
      code: "GOOGLE_EMAIL_UNVERIFIED",
      status: 403,
    });
  }

  const fallbackName = email.split("@")[0] || "User";

  return {
    googleId,
    email,
    name: normalizeText(payload?.name || fallbackName, 120) || "User",
    givenName: normalizeText(payload?.given_name, 80),
    familyName: normalizeText(payload?.family_name, 80),
    picture: normalizeText(payload?.picture, 2048),
    locale: normalizeText(payload?.locale, 20).toLowerCase(),
    emailVerified: true,
  };
};

const isSameUser = (left, right) =>
  Boolean(left && right && String(left._id) === String(right._id));

const throwAccountConflict = () => {
  throw new GoogleAccountError(ACCOUNT_CONFLICT_MESSAGE, {
    code: "GOOGLE_ACCOUNT_CONFLICT",
    status: 409,
  });
};

const mapDuplicateKeyError = (error) => {
  if (error?.code === 11000) {
    throwAccountConflict();
  }

  throw error;
};

const reconcileGoogleAccount = async (
  payload,
  { UserModel = User, now = () => new Date() } = {}
) => {
  const profile = normalizeGoogleProfile(payload);
  const userByGoogleId = await UserModel.findOne({ googleId: profile.googleId });

  if (userByGoogleId) {
    if (String(userByGoogleId.email || "").toLowerCase() !== profile.email) {
      const emailOwner = await UserModel.findOne({ email: profile.email });
      if (emailOwner && !isSameUser(userByGoogleId, emailOwner)) {
        throwAccountConflict();
      }
      userByGoogleId.email = profile.email;
    }

    userByGoogleId.name = profile.name;
    userByGoogleId.givenName = profile.givenName;
    userByGoogleId.familyName = profile.familyName;
    userByGoogleId.picture = profile.picture;
    userByGoogleId.locale = profile.locale;
    userByGoogleId.emailVerified = true;
    userByGoogleId.lastLoginAt = now();

    if (!String(userByGoogleId.displayName || "").trim()) {
      userByGoogleId.displayName = profile.name;
    }

    try {
      await userByGoogleId.save();
    } catch (error) {
      mapDuplicateKeyError(error);
    }

    return { user: userByGoogleId, isNewUser: false };
  }

  const emailOwner = await UserModel.findOne({ email: profile.email });
  if (emailOwner) {
    throwAccountConflict();
  }

  try {
    const user = await UserModel.create({
      ...profile,
      displayName: profile.name,
      lastLoginAt: now(),
    });

    return { user, isNewUser: true };
  } catch (error) {
    mapDuplicateKeyError(error);
  }
};

module.exports = {
  ACCOUNT_CONFLICT_MESSAGE,
  GoogleAccountError,
  normalizeGoogleProfile,
  reconcileGoogleAccount,
};
