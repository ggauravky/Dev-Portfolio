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

const attachUserFromToken = async (req, res, options = {}) => {
  const { required = false } = options;
  const token = readSessionToken(req);

  if (!token) {
    if (required) {
      return res.status(401).json({
        success: false,
        message: "Please sign in first",
      });
    }

    req.authUser = null;
    return null;
  }

  try {
    const payload = verifySessionToken(token);
    const user = await User.findById(payload.uid).select("_id name email picture");

    if (!user) {
      clearSessionCookie(res);
      if (required) {
        return res.status(401).json({
          success: false,
          message: "Session is invalid. Please sign in again",
        });
      }

      req.authUser = null;
      return null;
    }

    req.authUser = {
      id: String(user._id),
      name: user.name,
      email: user.email,
      picture: user.picture,
    };

    return null;
  } catch (error) {
    const isConfigError = error?.code === "AUTH_CONFIG_MISSING";

    if (!isConfigError) {
      clearSessionCookie(res);
    }

    if (required) {
      if (isConfigError) {
        return res.status(503).json({
          success: false,
          message: "Authentication service is not configured",
        });
      }

      return res.status(401).json({
        success: false,
        message: "Session expired. Please sign in again",
      });
    }

    if (!isConfigError) {
      logger.warn({ err: error }, "Optional auth token validation failed");
    }

    req.authUser = null;
    return null;
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
