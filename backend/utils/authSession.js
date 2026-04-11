// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Unauthorized copying, modification, or distribution of this software,
// via any medium, is strictly prohibited without the express written
// consent of the author. See LICENSE for details.
// Source: https://github.com/ggauravky/Dev-Portfolio

const jwt = require("jsonwebtoken");

const AUTH_COOKIE_NAME = "portfolio_session";
const DEFAULT_SESSION_TTL_SECONDS = 7 * 24 * 60 * 60;

const getAuthSecret = () => {
  const secret = String(process.env.AUTH_JWT_SECRET || "").trim();

  if (!secret) {
    const configError = new Error("AUTH_JWT_SECRET is missing");
    configError.code = "AUTH_CONFIG_MISSING";
    throw configError;
  }

  return secret;
};

const getSessionTtlSeconds = () => {
  const parsed = Number.parseInt(process.env.AUTH_SESSION_TTL_SECONDS, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_SESSION_TTL_SECONDS;
};

const issueSessionToken = (payload) => {
  return jwt.sign(payload, getAuthSecret(), {
    expiresIn: getSessionTtlSeconds(),
  });
};

const verifySessionToken = (token) => jwt.verify(token, getAuthSecret());

const getSessionCookieOptions = () => {
  const isProd = process.env.NODE_ENV === "production";

  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    path: "/",
    maxAge: getSessionTtlSeconds() * 1000,
  };
};

const getClearCookieOptions = () => {
  const { maxAge, ...base } = getSessionCookieOptions();
  return base;
};

module.exports = {
  AUTH_COOKIE_NAME,
  issueSessionToken,
  verifySessionToken,
  getSessionCookieOptions,
  getClearCookieOptions,
};
