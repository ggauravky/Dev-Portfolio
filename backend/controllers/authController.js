// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Unauthorized copying, modification, or distribution of this software,
// via any medium, is strictly prohibited without the express written
// consent of the author. See LICENSE for details.
// Source: https://github.com/ggauravky/Dev-Portfolio

const { OAuth2Client } = require("google-auth-library");
const User = require("../models/User");
const { logger } = require("../utils/logger");
const {
  sendWelcomeEmail,
  sendWelcomeBackEmail,
  shouldSendWelcomeBackEmail,
} = require("../utils/email");
const {
  AUTH_COOKIE_NAME,
  issueSessionToken,
  getSessionCookieOptions,
  getClearCookieOptions,
} = require("../utils/authSession");

let googleClient = null;

const getGoogleClientId = () => String(process.env.GOOGLE_CLIENT_ID || "").trim();

const getGoogleClient = () => {
  const clientId = getGoogleClientId();

  if (!clientId) {
    const configError = new Error("GOOGLE_CLIENT_ID is missing");
    configError.code = "GOOGLE_AUTH_CONFIG_MISSING";
    throw configError;
  }

  if (!googleClient) {
    googleClient = new OAuth2Client(clientId);
  }

  return googleClient;
};

const buildUserPayload = (user) => {
  const resolvedName = String(user.displayName || user.name || "User").trim() || "User";

  return {
    id: String(user._id),
    name: resolvedName,
    displayName: String(user.displayName || "").trim(),
    email: user.email,
    picture: user.picture,
    emailLocked: true,
  };
};

const normalizeText = (value, maxLength) => String(value || "").trim().slice(0, maxLength);
const normalizeLocale = (value) => normalizeText(value, 20).toLowerCase();
const normalizeDisplayName = (value) => normalizeText(value, 120);

const resolveGoogleSignInConflict = ({
  userByGoogleId,
  userByEmail,
  googleId,
  normalizedEmail,
  reqLogger,
}) => {
  if (
    userByGoogleId &&
    userByEmail &&
    String(userByGoogleId._id) !== String(userByEmail._id)
  ) {
    reqLogger.warn(
      {
        googleId,
        email: normalizedEmail,
        userByGoogleId: String(userByGoogleId._id),
        userByEmail: String(userByEmail._id),
      },
      "Google sign-in rejected due to conflicting account ownership"
    );

    return "Account mapping conflict detected. Please contact support.";
  }

  if (userByEmail && userByEmail.googleId !== googleId) {
    return "This email is already linked with a different Google account.";
  }

  if (userByGoogleId && userByGoogleId.email !== normalizedEmail) {
    return "Your Google account email does not match the original sign-in email.";
  }

  return "";
};

const markLifecycleEmailSent = async ({ userId, type, providerId }) => {
  const now = new Date();

  if (type === "welcome") {
    await User.updateOne(
      { _id: userId },
      {
        $set: {
          lastWelcomeEmailAt: now,
          lastLoginEmailType: "welcome",
          lastLoginEmailProviderId: String(providerId || ""),
        },
        $inc: {
          welcomeEmailSentCount: 1,
        },
      }
    );

    return;
  }

  await User.updateOne(
    { _id: userId },
    {
      $set: {
        lastWelcomeBackEmailAt: now,
        lastLoginEmailType: "welcome_back",
        lastLoginEmailProviderId: String(providerId || ""),
      },
      $inc: {
        welcomeBackEmailSentCount: 1,
      },
    }
  );
};

const scheduleLifecycleLoginEmail = ({ user, isNewUser, reqLogger }) => {
  const userSnapshot = {
    _id: String(user._id),
    id: String(user._id),
    email: user.email,
    name: user.name,
    givenName: user.givenName,
    familyName: user.familyName,
    picture: user.picture,
    lastWelcomeBackEmailAt: user.lastWelcomeBackEmailAt,
  };

  setImmediate(async () => {
    try {
      if (isNewUser) {
        const result = await sendWelcomeEmail({
          user: userSnapshot,
        });

        if (!result.sent) {
          if (!result.skipped) {
            reqLogger.warn(
              {
                userId: userSnapshot._id,
                reason: result.reason,
                error: result.error,
              },
              "Welcome email was not delivered"
            );
          }
          return;
        }

        await markLifecycleEmailSent({
          userId: userSnapshot._id,
          type: "welcome",
          providerId: result.providerId,
        });

        reqLogger.info(
          {
            userId: userSnapshot._id,
            emailId: result.providerId,
            idempotencyKey: result.idempotencyKey,
          },
          "Welcome email sent"
        );
        return;
      }

      if (!shouldSendWelcomeBackEmail(userSnapshot)) {
        reqLogger.debug(
          {
            userId: userSnapshot._id,
          },
          "Welcome-back email skipped due to daily limit"
        );
        return;
      }

      const result = await sendWelcomeBackEmail({
        user: userSnapshot,
      });

      if (!result.sent) {
        if (!result.skipped) {
          reqLogger.warn(
            {
              userId: userSnapshot._id,
              reason: result.reason,
              error: result.error,
            },
            "Welcome-back email was not delivered"
          );
        }
        return;
      }

      await markLifecycleEmailSent({
        userId: userSnapshot._id,
        type: "welcome_back",
        providerId: result.providerId,
      });

      reqLogger.info(
        {
          userId: userSnapshot._id,
          emailId: result.providerId,
          idempotencyKey: result.idempotencyKey,
        },
        "Welcome-back email sent"
      );
    } catch (error) {
      reqLogger.error({ err: error, userId: userSnapshot._id }, "Lifecycle email processing failed");
    }
  });
};

exports.getPublicAuthConfig = async (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Auth config fetched",
    data: {
      googleClientId: getGoogleClientId(),
    },
  });
};

exports.googleSignIn = async (req, res) => {
  const reqLogger = req.log || logger;

  try {
    const credential = String(req.body?.credential || "").trim();

    if (!credential) {
      return res.status(400).json({
        success: false,
        message: "Google credential is required",
      });
    }

    const client = getGoogleClient();
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: getGoogleClientId(),
    });

    const payload = ticket.getPayload();

    if (!payload?.sub || !payload?.email) {
      return res.status(400).json({
        success: false,
        message: "Google account details are invalid",
      });
    }

    if (payload.email_verified === false) {
      return res.status(403).json({
        success: false,
        message: "Google account email is not verified",
      });
    }

    const normalizedEmail = normalizeText(payload.email, 320).toLowerCase();
    const fallbackUserName = normalizedEmail.split("@")[0] || "User";
    const userName = normalizeText(payload.name || fallbackUserName, 120) || "User";
    const givenName = normalizeText(payload.given_name, 80);
    const familyName = normalizeText(payload.family_name, 80);
    const locale = normalizeLocale(payload.locale);
    const emailVerified = payload.email_verified !== false;
    const picture = normalizeText(payload.picture, 2048);

    const userByGoogleId = await User.findOne({ googleId: payload.sub });
    const userByEmail = await User.findOne({ email: normalizedEmail });

    const accountConflictMessage = resolveGoogleSignInConflict({
      userByGoogleId,
      userByEmail,
      googleId: payload.sub,
      normalizedEmail,
      reqLogger,
    });

    if (accountConflictMessage) {
      return res.status(409).json({
        success: false,
        message: accountConflictMessage,
      });
    }

    const existingUser = userByGoogleId || userByEmail;

    const isNewUser = !existingUser;
    let user = existingUser;

    if (user) {
      user.googleId = payload.sub;
      user.name = userName;
      user.givenName = givenName;
      user.familyName = familyName;
      user.locale = locale;
      user.emailVerified = emailVerified;
      user.picture = picture;
      if (!user.displayName) {
        user.displayName = userName;
      }
      user.lastLoginAt = new Date();
      await user.save();
    } else {
      user = await User.create({
        googleId: payload.sub,
        email: normalizedEmail,
        name: userName,
        displayName: userName,
        givenName,
        familyName,
        locale,
        emailVerified,
        picture,
        lastLoginAt: new Date(),
      });
    }

    const sessionToken = issueSessionToken({
      uid: String(user._id),
      gid: user.googleId,
    });

    res.cookie(AUTH_COOKIE_NAME, sessionToken, getSessionCookieOptions());

    scheduleLifecycleLoginEmail({
      user,
      isNewUser,
      reqLogger,
    });

    return res.status(200).json({
      success: true,
      message: "Signed in successfully",
      data: {
        user: buildUserPayload(user),
      },
    });
  } catch (error) {
    if (error?.code === "GOOGLE_AUTH_CONFIG_MISSING" || error?.code === "AUTH_CONFIG_MISSING") {
      return res.status(503).json({
        success: false,
        message: "Google Sign-In is not configured on server",
      });
    }

    reqLogger.error({ err: error }, "Google sign-in failed");
    return res.status(401).json({
      success: false,
      message: "Google sign-in failed. Please try again",
    });
  }
};

exports.getCurrentSession = async (req, res) => {
  if (!req.authUser) {
    return res.status(200).json({
      success: true,
      message: "No active session",
      data: {
        user: null,
      },
    });
  }

  return res.status(200).json({
    success: true,
    message: "Session fetched successfully",
    data: {
      user: req.authUser,
    },
  });
};

exports.getProfile = async (req, res) => {
  if (!req.authUser?.id) {
    return res.status(401).json({
      success: false,
      message: "Please sign in first",
    });
  }

  const user = await User.findById(req.authUser.id).select("_id name displayName email picture");
  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User profile not found",
    });
  }

  return res.status(200).json({
    success: true,
    message: "Profile fetched successfully",
    data: {
      user: buildUserPayload(user),
    },
  });
};

exports.updateProfile = async (req, res) => {
  if (!req.authUser?.id) {
    return res.status(401).json({
      success: false,
      message: "Please sign in first",
    });
  }

  const updatedDisplayName = normalizeDisplayName(req.body?.displayName);

  const user = await User.findByIdAndUpdate(
    req.authUser.id,
    {
      $set: {
        displayName: updatedDisplayName,
      },
    },
    {
      new: true,
      runValidators: true,
      fields: "_id name displayName email picture",
    }
  );

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User profile not found",
    });
  }

  return res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    data: {
      user: buildUserPayload(user),
    },
  });
};

exports.logout = async (req, res) => {
  res.clearCookie(AUTH_COOKIE_NAME, getClearCookieOptions());

  return res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};
