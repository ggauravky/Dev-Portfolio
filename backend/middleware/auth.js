// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Unauthorized copying, modification, or distribution of this software,
// via any medium, is strictly prohibited without the express written
// consent of the author. See LICENSE for details.
// Source: https://github.com/ggauravky/Dev-Portfolio

const User = require("../models/User");
const { logger } = require("../utils/logger");
const {
  AUTH_COOKIE_NAME,
  verifySessionToken,
  getClearCookieOptions,
} = require("../utils/authSession");

const readBearerToken = (headerValue) => {
  const raw = String(headerValue || "").trim();
  if (!raw.toLowerCase().startsWith("bearer ")) {
    return "";
  }
  return raw.slice(7).trim();
};

const readSessionToken = (req) => {
  const cookieToken = req.cookies?.[AUTH_COOKIE_NAME];
  if (cookieToken) {
    return cookieToken;
  }

  return readBearerToken(req.headers.authorization);
};

const clearSessionCookie = (res) => {
  res.clearCookie(AUTH_COOKIE_NAME, getClearCookieOptions());
};

const setAnonymousUser = (req) => {
  req.authUser = null;
  return null;
};

const rejectIfRequired = (res, required, status, message) => {
  if (!required) {
    return null;
  }

  return res.status(status).json({
    success: false,
    message,
  });
};

const handleMissingToken = (req, res, required) => {
  const rejection = rejectIfRequired(res, required, 401, "Please sign in first");
  if (rejection) {
    return rejection;
  }

  return setAnonymousUser(req);
};

const buildAuthUser = (user) => ({
  id: String(user._id),
  name: user.name,
  email: user.email,
  picture: user.picture,
});

const handleMissingUser = (req, res, required) => {
  clearSessionCookie(res);
  const rejection = rejectIfRequired(res, required, 401, "Session is invalid. Please sign in again");
  if (rejection) {
    return rejection;
  }

  return setAnonymousUser(req);
};

const handleTokenError = (req, res, required, error) => {
  const isConfigError = error?.code === "AUTH_CONFIG_MISSING";

  if (!isConfigError) {
    clearSessionCookie(res);
  }

  if (required) {
    return res.status(isConfigError ? 503 : 401).json({
      success: false,
      message: isConfigError
        ? "Authentication service is not configured"
        : "Session expired. Please sign in again",
    });
  }

  if (!isConfigError) {
    logger.warn({ err: error }, "Optional auth token validation failed");
  }

  return setAnonymousUser(req);
};

const attachUserFromToken = async (req, res, options = {}) => {
  const { required = false } = options;
  const token = readSessionToken(req);

  if (!token) {
    return handleMissingToken(req, res, required);
  }

  try {
    const payload = verifySessionToken(token);
    const user = await User.findById(payload.uid).select("_id name email picture");

    if (!user) {
      return handleMissingUser(req, res, required);
    }

    req.authUser = buildAuthUser(user);

    return null;
  } catch (error) {
    return handleTokenError(req, res, required, error);
  }
};

exports.attachOptionalUser = async (req, res, next) => {
  const response = await attachUserFromToken(req, res, { required: false });
  if (response) {
    return;
  }
  next();
};

exports.requireAuth = async (req, res, next) => {
  const response = await attachUserFromToken(req, res, { required: true });
  if (response) {
    return;
  }
  next();
};
