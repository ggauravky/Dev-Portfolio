// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Unauthorized copying, modification, or distribution of this software,
// via any medium, is strictly prohibited without the express written
// consent of the author. See LICENSE for details.
// Source: https://github.com/ggauravky/Dev-Portfolio

const { createHash, randomUUID } = require("node:crypto");
const { OAuth2Client } = require("google-auth-library");
const User = require("../models/User");
const { logger } = require("../utils/logger");
const {
  classifyEmailDeliveryResult,
  classifySmtpError,
  sendWelcomeEmail,
  sendWelcomeBackEmail,
} = require("../utils/email");
const { scheduleBackgroundTask, waitForBackgroundTasks } = require("../utils/backgroundTasks");
const { recordActivityEvent } = require("../services/activityService");
const {
  PROFILE_SELECT,
  buildProfileUpdate,
  serializeUser,
} = require("../services/auth/userProfileService");
const {
  GoogleAccountError,
  reconcileGoogleAccount,
} = require("../services/auth/googleAccountService");
const {
  AUTH_COOKIE_NAME,
  issueSessionToken,
  getSessionCookieOptions,
  getClearCookieOptions,
} = require("../utils/authSession");

let googleClient = null;
let googleClientIdForClient = "";

const getGoogleClientId = () => String(process.env.GOOGLE_CLIENT_ID || "").trim();

const requireGoogleClientId = () => {
  const clientId = getGoogleClientId();
  if (!clientId) {
    const error = new Error("Google authentication is not configured");
    error.code = "GOOGLE_AUTH_CONFIG_MISSING";
    error.status = 503;
    throw error;
  }
  return clientId;
};

const getGoogleClient = (clientId) => {
  if (!googleClient || googleClientIdForClient !== clientId) {
    googleClient = new OAuth2Client(clientId);
    googleClientIdForClient = clientId;
  }
  return googleClient;
};

const defaultDependencies = {
  claimLoginEmailEvent: (input) => claimLoginEmailEvent(input),
  markLifecycleEmailSent: (input) => markLifecycleEmailSent(input),
  reconcileGoogleAccount,
  recordActivityEvent,
  sendWelcomeBackEmail,
  sendWelcomeEmail,
  verifyGoogleCredential: async (credential, clientId) => {
    const ticket = await getGoogleClient(clientId).verifyIdToken({
      idToken: credential,
      audience: clientId,
    });
    return ticket.getPayload();
  },
};

let authDependencies = { ...defaultDependencies };

const normalizeText = (value, maxLength) =>
  String(value || "").trim().slice(0, maxLength);

const getLoginEmailMaxAttempts = () =>
  Math.max(1, Number.parseInt(process.env.LOGIN_EMAIL_MAX_ATTEMPTS, 10) || 3);
const getLoginEmailRetryBaseMs = () => {
  const value = Number.parseInt(process.env.LOGIN_EMAIL_RETRY_BASE_MS, 10);
  return Number.isFinite(value) ? Math.max(0, value) : 2000;
};

// The client event distinguishes explicit sign-ins; the credential digest keeps retried POSTs idempotent.
const buildLoginEventId = (credential, clientEventId = "") =>
  `google-${createHash("sha256")
    .update(`${credential}:${normalizeText(clientEventId, 80)}`)
    .digest("hex")
    .slice(0, 48)}`;

const buildAuthLifecycleMessage = (isNewUser) => ({
  type: isNewUser ? "welcome" : "welcome_back",
  isNewUser: Boolean(isNewUser),
  text: isNewUser ? "Welcome to the portfolio." : "Welcome back.",
});

const claimLoginEmailEvent = async ({ userId, loginEventId }) => {
  const eventId = normalizeText(loginEventId, 80);
  if (!userId || !eventId) return false;

  const result = await User.updateOne(
    { _id: userId, recentLoginEmailEventIds: { $ne: eventId } },
    {
      $push: {
        recentLoginEmailEventIds: {
          $each: [eventId],
          $slice: -24,
        },
      },
    }
  );
  return Number(result?.modifiedCount || 0) === 1;
};

const markLifecycleEmailSent = async ({ userId, type, providerId, loginEventId }) => {
  const now = new Date();

  if (type === "welcome") {
    await User.updateOne(
      { _id: userId },
      {
        $set: {
          lastWelcomeEmailAt: now,
          lastLoginEmailType: "welcome",
          lastLoginEmailProviderId: String(providerId || ""),
          lastLoginEmailEventId: normalizeText(loginEventId, 80),
        },
        $inc: { welcomeEmailSentCount: 1 },
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
        lastLoginEmailEventId: normalizeText(loginEventId, 80),
      },
      $inc: { welcomeBackEmailSentCount: 1 },
    }
  );
};

const delay = (milliseconds) =>
  new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });

const dispatchLifecycleEmailWithRetry = async ({ isNewUser, userSnapshot, reqLogger }) => {
  let lastResult = { sent: false, skipped: true, reason: "not_attempted" };
  const maxAttempts = getLoginEmailMaxAttempts();
  const emailType = isNewUser ? "welcome" : "welcome_back";

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    let result;
    try {
      result = isNewUser
        ? await authDependencies.sendWelcomeEmail({
            user: userSnapshot,
            loginEventId: userSnapshot.loginEventId,
          })
        : await authDependencies.sendWelcomeBackEmail({
            user: userSnapshot,
            loginEventId: userSnapshot.loginEventId,
          });
    } catch (error) {
      result = { sent: false, skipped: false, reason: "delivery_error", error };
    }

    lastResult = { ...result, attempt };
    const delivery = classifyEmailDeliveryResult(result);
    const classification = result.error?.category
      ? result.error
      : delivery.outcome === "failed"
        ? { ...classifySmtpError(result.error || {}), ...delivery }
        : delivery;
    const context = {
      userId: userSnapshot._id,
      emailType,
      attempt,
      messageId: result.sent ? String(result.messageId || result.providerId || "") : undefined,
      smtpCode: delivery.outcome === "failed" ? result.error?.code : undefined,
      smtpCategory: delivery.outcome === "failed" ? classification?.category : undefined,
    };
    if (delivery.outcome === "sent") reqLogger.info({ ...context, event: "email.login.sent" }, "Login email sent");
    else if (delivery.outcome === "skipped") reqLogger.info({ ...context, event: "email.login.skipped" }, "Login email skipped");
    else reqLogger.warn({ ...context, event: "email.login.failed" }, "Login email attempt failed");

    if (delivery.outcome !== "failed" || classification?.retryable === false) return lastResult;

    if (attempt < maxAttempts) {
      await delay(getLoginEmailRetryBaseMs() * attempt);
    }
  }

  return lastResult;
};

const processLifecycleEmail = async ({ userSnapshot, isNewUser, reqLogger }) => {
  try {
    const claimed = await authDependencies.claimLoginEmailEvent({
      userId: userSnapshot._id,
      loginEventId: userSnapshot.loginEventId,
    });
    if (!claimed) return;

    const result = await dispatchLifecycleEmailWithRetry({ isNewUser, userSnapshot, reqLogger });

    if (!result.sent) {
      if (!result.skipped) {
        reqLogger.warn(
          {
            userId: userSnapshot._id,
            category: result.reason || "EMAIL_DELIVERY_FAILED",
            attempt: result.attempt,
          },
          "Authentication lifecycle email was not delivered"
        );
      }
      return;
    }

    await authDependencies.markLifecycleEmailSent({
      userId: userSnapshot._id,
      type: isNewUser ? "welcome" : "welcome_back",
      providerId: result.providerId || result.messageId,
      loginEventId: userSnapshot.loginEventId,
    });
  } catch (error) {
    reqLogger.warn(
      { userId: userSnapshot._id, category: error?.code || error?.name || "EMAIL_FAILED" },
      "Authentication lifecycle email processing failed"
    );
  }
};

const schedulePostLoginTasks = ({ user, isNewUser, loginEventId, selectBy, reqLogger }) => {
  const userSnapshot = {
    _id: String(user._id),
    id: String(user._id),
    email: user.email,
    name: user.name,
    givenName: user.givenName,
    familyName: user.familyName,
    picture: user.picture,
    loginAt: new Date(),
    loginEventId,
  };

  reqLogger.info(
    {
      userId: String(user._id),
      emailType: isNewUser ? "welcome" : "welcome_back",
      event: "email.login.queued",
    },
    "Login email queued"
  );

  scheduleBackgroundTask({
    name: "post-login",
    context: { userId: String(user._id) },
    taskLogger: reqLogger,
    task: async () => {
      Promise.resolve(
        authDependencies.recordActivityEvent({
          eventKey: `auth:login:${loginEventId}`,
          userId: user._id,
          userEmail: user.email,
          domain: "auth",
          actionType: "login_success",
          title: isNewUser
            ? "Google sign-in completed (new account)"
            : "Google sign-in completed",
          status: "success",
          metadata: {
            provider: "google",
            isNewUser: Boolean(isNewUser),
            selectBy,
          },
        })
      ).catch((error) => {
        reqLogger.warn(
          { userId: String(user._id), category: error?.code || error?.name || "ACTIVITY_FAILED" },
          "Failed to persist login activity event"
        );
      });

      await processLifecycleEmail({ userSnapshot, isNewUser, reqLogger });
    },
  });
};

const scheduleLogoutActivity = ({ user, reqLogger }) => {
  if (!user?.id) return;

  setImmediate(() => {
    Promise.resolve(
      authDependencies.recordActivityEvent({
        eventKey: `auth:logout:${randomUUID()}`,
        userId: user.id,
        userEmail: user.email,
        domain: "auth",
        actionType: "logout_success",
        title: "Signed out",
        status: "success",
        metadata: { provider: "google" },
      })
    ).catch((error) => {
      reqLogger.warn(
        { userId: user.id, category: error?.code || error?.name || "ACTIVITY_FAILED" },
        "Failed to persist logout activity event"
      );
    });
  });
};

const getFailureResponse = (error) => {
  if (error?.code === "GOOGLE_AUTH_CONFIG_MISSING" || error?.code === "AUTH_CONFIG_MISSING") {
    return { status: 503, message: "Google Sign-In is not configured on server" };
  }

  if (error instanceof GoogleAccountError) {
    return { status: error.status, message: error.message };
  }

  return { status: 401, message: "Google sign-in failed. Please try again" };
};

exports.getPublicAuthConfig = async (req, res) => {
  const googleClientId = getGoogleClientId();
  return res.status(200).json({
    success: true,
    message: "Auth config fetched",
    data: {
      googleClientId,
      googleAuthEnabled: Boolean(googleClientId),
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

    const clientId = requireGoogleClientId();
    const googlePayload = await authDependencies.verifyGoogleCredential(credential, clientId);
    const { user, isNewUser } = await authDependencies.reconcileGoogleAccount(googlePayload);
    const sessionToken = issueSessionToken({ uid: String(user._id) });
    const loginEventId = buildLoginEventId(credential, req.body?.loginEventId);
    const selectBy = normalizeText(req.body?.selectBy, 40);

    res.cookie(AUTH_COOKIE_NAME, sessionToken, getSessionCookieOptions());
    const response = res.status(200).json({
      success: true,
      message: "Signed in successfully",
      data: {
      user: serializeUser(user),
        authMessage: buildAuthLifecycleMessage(isNewUser),
      },
    });

    reqLogger.info(
      {
        requestId: req.id || req.headers?.["x-request-id"],
        userId: String(user._id),
        provider: "google",
        accountStatus: isNewUser ? "new" : "returning",
      },
      "Google sign-in completed"
    );

    schedulePostLoginTasks({ user, isNewUser, loginEventId, selectBy, reqLogger });
    return response;
  } catch (error) {
    const failure = getFailureResponse(error);
    reqLogger.warn(
      {
        requestId: req.id || req.headers?.["x-request-id"],
        provider: "google",
        category: error?.code || error?.name || "GOOGLE_SIGN_IN_FAILED",
      },
      "Google sign-in rejected"
    );

    return res.status(failure.status).json({
      success: false,
      message: failure.message,
    });
  }
};

exports.getCurrentSession = async (req, res) => {
  res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
  res.set("Pragma", "no-cache");

  return res.status(200).json({
    success: true,
    message: req.authUser ? "Session fetched successfully" : "No active session",
    data: { user: req.authUser || null },
  });
};

exports.getProfile = async (req, res) => {
  if (!req.authUser?.id) {
    return res.status(401).json({ success: false, message: "Please sign in first" });
  }

  const user = await User.findById(req.authUser.id).select(PROFILE_SELECT);
  if (!user) {
    return res.status(404).json({ success: false, message: "User profile not found" });
  }

  return res.status(200).json({
    success: true,
    message: "Profile fetched successfully",
    data: { user: serializeUser(user) },
  });
};

exports.updateProfile = async (req, res) => {
  if (!req.authUser?.id) {
    return res.status(401).json({ success: false, message: "Please sign in first" });
  }

  let profileUpdate;
  try {
    profileUpdate = buildProfileUpdate(req.body);
  } catch (error) {
    return res.status(error.status || 400).json({
      success: false,
      code: error.code,
      message: error.message,
    });
  }

  const user = await User.findByIdAndUpdate(
    req.authUser.id,
    { $set: profileUpdate },
    { new: true, runValidators: true, fields: PROFILE_SELECT }
  );

  if (!user) {
    return res.status(404).json({ success: false, message: "User profile not found" });
  }

  return res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    data: { user: serializeUser(user) },
  });
};

exports.logout = async (req, res) => {
  const reqLogger = req.log || logger;
  const authenticatedUser = req.authUser;

  res.clearCookie(AUTH_COOKIE_NAME, getClearCookieOptions());
  res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
  res.set("Pragma", "no-cache");

  const response = res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });

  scheduleLogoutActivity({ user: authenticatedUser, reqLogger });
  return response;
};

exports._test = {
  buildUserPayload: serializeUser,
  buildLoginEventId,
  claimLoginEmailEvent,
  getFailureResponse,
  resetDependencies() {
    authDependencies = { ...defaultDependencies };
  },
  schedulePostLoginTasks,
  setDependencies(overrides) {
    authDependencies = { ...authDependencies, ...overrides };
  },
  processLifecycleEmail,
  dispatchLifecycleEmailWithRetry,
  waitForBackgroundTasks,
};
