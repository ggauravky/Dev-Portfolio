// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Unauthorized copying, modification, or distribution of this software,
// via any medium, is strictly prohibited without the express written
// consent of the author. See LICENSE for details.
// Source: https://github.com/ggauravky/Dev-Portfolio

const { randomUUID } = require("node:crypto");
const jwt = require("jsonwebtoken");

const AUTH_COOKIE_NAME = "portfolio_session";
const DEFAULT_SESSION_TTL_SECONDS = 7 * 24 * 60 * 60;
const AUTH_SESSION_ALGORITHM = "HS256";
const AUTH_SESSION_ISSUER = "dev-portfolio-api";
const AUTH_SESSION_AUDIENCE = "dev-portfolio-web";

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

const issueSessionToken = ({ uid }) => {
  const normalizedUserId = String(uid || "").trim();
  if (!normalizedUserId) {
    throw new TypeError("Session user ID is required");
  }

  return jwt.sign({ uid: normalizedUserId }, getAuthSecret(), {
    algorithm: AUTH_SESSION_ALGORITHM,
    audience: AUTH_SESSION_AUDIENCE,
    expiresIn: getSessionTtlSeconds(),
    issuer: AUTH_SESSION_ISSUER,
    jwtid: randomUUID(),
  });
};

const verifySessionToken = (token) =>
  jwt.verify(token, getAuthSecret(), {
    algorithms: [AUTH_SESSION_ALGORITHM],
    audience: AUTH_SESSION_AUDIENCE,
    issuer: AUTH_SESSION_ISSUER,
  });

const getCookieSameSite = () => {
  const configured = String(process.env.AUTH_COOKIE_SAME_SITE || "").trim().toLowerCase();
  if (["lax", "none", "strict"].includes(configured)) return configured;
  return process.env.NODE_ENV === "production" ? "none" : "lax";
};

const getSessionCookieOptions = () => {
  const isProd = process.env.NODE_ENV === "production";
  const sameSite = getCookieSameSite();

  return {
    httpOnly: true,
    secure: isProd || sameSite === "none",
    sameSite,
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
  AUTH_SESSION_ALGORITHM,
  AUTH_SESSION_AUDIENCE,
  AUTH_SESSION_ISSUER,
  issueSessionToken,
  verifySessionToken,
  getSessionCookieOptions,
  getClearCookieOptions,
};
