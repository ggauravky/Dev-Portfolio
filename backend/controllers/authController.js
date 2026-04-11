// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Unauthorized copying, modification, or distribution of this software,
// via any medium, is strictly prohibited without the express written
// consent of the author. See LICENSE for details.
// Source: https://github.com/ggauravky/Dev-Portfolio

const { OAuth2Client } = require("google-auth-library");
const User = require("../models/User");
const { logger } = require("../utils/logger");
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

const buildUserPayload = (user) => ({
  id: String(user._id),
  name: user.name,
  email: user.email,
  picture: user.picture,
});

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

    const normalizedEmail = String(payload.email).trim().toLowerCase();
    const userName = String(payload.name || normalizedEmail.split("@")[0] || "User").trim();
    const picture = String(payload.picture || "").trim();

    let user = await User.findOne({
      $or: [{ googleId: payload.sub }, { email: normalizedEmail }],
    });

    if (user) {
      user.googleId = payload.sub;
      user.email = normalizedEmail;
      user.name = userName;
      user.picture = picture;
      user.lastLoginAt = new Date();
      await user.save();
    } else {
      user = await User.create({
        googleId: payload.sub,
        email: normalizedEmail,
        name: userName,
        picture,
        lastLoginAt: new Date(),
      });
    }

    const sessionToken = issueSessionToken({
      uid: String(user._id),
      gid: user.googleId,
    });

    res.cookie(AUTH_COOKIE_NAME, sessionToken, getSessionCookieOptions());

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

exports.logout = async (req, res) => {
  res.clearCookie(AUTH_COOKIE_NAME, getClearCookieOptions());

  return res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};
