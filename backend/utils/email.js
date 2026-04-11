// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Unauthorized copying, modification, or distribution of this software,
// via any medium, is strictly prohibited without the express written
// consent of the author. See LICENSE for details.
// Source: https://github.com/ggauravky/Dev-Portfolio

const { Resend } = require("resend");
const { logger } = require("./logger");

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

const normalizeEnvString = (value) => String(value || "").trim();
const toBoolean = (value, fallback) => {
  const normalized = normalizeEnvString(value).toLowerCase();
  if (!normalized) {
    return fallback;
  }

  if (["1", "true", "yes", "on"].includes(normalized)) {
    return true;
  }
  if (["0", "false", "no", "off"].includes(normalized)) {
    return false;
  }

  return fallback;
};

const RESEND_ENABLED = toBoolean(process.env.RESEND_ENABLED, true);
const RESEND_API_KEY = normalizeEnvString(process.env.RESEND_API_KEY);
const RESEND_FROM_EMAIL = normalizeEnvString(process.env.RESEND_FROM_EMAIL);
const RESEND_REPLY_TO = normalizeEnvString(process.env.RESEND_REPLY_TO);
const EMAIL_APP_NAME = normalizeEnvString(process.env.EMAIL_APP_NAME) || "Gaurav Kumar Portfolio";
const EMAIL_SUPPORT_URL =
  normalizeEnvString(process.env.EMAIL_SUPPORT_URL) ||
  `${normalizeEnvString(process.env.FRONTEND_URL || "https://ggauravky.vercel.app").replace(/\/$/, "")}/contact`;
const EMAIL_HOME_URL = normalizeEnvString(process.env.FRONTEND_URL || "https://ggauravky.vercel.app").replace(
  /\/$/,
  ""
);

let resendClient = null;

const escapeHtml = (value) =>
  String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const normalizeTagValue = (value, fallback) => {
  const normalized = String(value || fallback || "")
    .toLowerCase()
    .replaceAll(/[^a-z0-9_-]/g, "-")
    .replaceAll(/-{2,}/g, "-")
    .replaceAll(/^-|-$/g, "")
    .slice(0, 128);
  return normalized || fallback;
};

const getDisplayName = (user) => {
  const givenName = normalizeEnvString(user?.givenName);
  if (givenName) {
    return givenName;
  }

  const fullName = normalizeEnvString(user?.name);
  if (fullName) {
    return fullName.split(/\s+/)[0];
  }

  const email = normalizeEnvString(user?.email);
  if (email.includes("@")) {
    return email.split("@")[0];
  }

  return "there";
};

const isResendConfigured = () => RESEND_ENABLED && Boolean(RESEND_API_KEY) && Boolean(RESEND_FROM_EMAIL);

const getResendClient = () => {
  if (!isResendConfigured()) {
    return null;
  }

  if (!resendClient) {
    resendClient = new Resend(RESEND_API_KEY);
  }

  return resendClient;
};

const shouldSendWelcomeBackEmail = (user) => {
  const lastSentAt = user?.lastWelcomeBackEmailAt ? new Date(user.lastWelcomeBackEmailAt) : null;

  if (!lastSentAt || Number.isNaN(lastSentAt.getTime())) {
    return true;
  }

  return Date.now() - lastSentAt.getTime() >= ONE_DAY_MS;
};

const buildIdempotencyKey = (type, userId) => {
  const safeUserId = normalizeTagValue(userId, "unknown-user");

  if (type === "welcome") {
    return `welcome-user/${safeUserId}`;
  }

  const dayBucket = Math.floor(Date.now() / ONE_DAY_MS);
  return `welcome-back/${safeUserId}/${dayBucket}`;
};

const buildHtmlTemplate = ({ preheader, heading, intro, body, actionLabel, actionHref, footer }) => {
  const escapedPreheader = escapeHtml(preheader);
  const escapedHeading = escapeHtml(heading);
  const escapedIntro = escapeHtml(intro);
  const escapedBody = escapeHtml(body);
  const escapedActionLabel = escapeHtml(actionLabel);
  const escapedFooter = escapeHtml(footer);

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapedHeading}</title>
  </head>
  <body style="margin:0;padding:0;background:#f5f8ff;font-family:Arial,sans-serif;color:#0f172a;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;visibility:hidden;">${escapedPreheader}</div>
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background:#f5f8ff;padding:24px 10px;">
      <tr>
        <td align="center">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #dbeafe;">
            <tr>
              <td style="background:linear-gradient(135deg,#0ea5e9,#2563eb);padding:28px 30px;text-align:left;">
                <p style="margin:0;color:#cffafe;font-size:12px;letter-spacing:1px;text-transform:uppercase;font-weight:700;">${escapeHtml(
                  EMAIL_APP_NAME
                )}</p>
                <h1 style="margin:10px 0 0;font-size:26px;line-height:1.25;color:#ffffff;">${escapedHeading}</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:30px;">
                <p style="margin:0 0 14px;font-size:16px;line-height:1.7;color:#1e293b;">${escapedIntro}</p>
                <p style="margin:0 0 22px;font-size:15px;line-height:1.75;color:#334155;">${escapedBody}</p>
                <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                  <tr>
                    <td style="border-radius:10px;background:#0f172a;">
                      <a href="${escapeHtml(actionHref)}" style="display:inline-block;padding:12px 20px;color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;">${escapedActionLabel}</a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:0 30px 24px;">
                <p style="margin:0;font-size:13px;line-height:1.6;color:#64748b;">${escapedFooter}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
};

const buildWelcomePayload = (user) => {
  const displayName = getDisplayName(user);
  const intro = `Hi ${displayName}, your account is now ready.`;

  return {
    subject: `Welcome to ${EMAIL_APP_NAME}`,
    text: [
      `Hi ${displayName},`,
      "",
      `Welcome to ${EMAIL_APP_NAME}. You are now signed in and can support posts, track your activity, and continue learning resources anytime.`,
      "",
      `Open your portfolio: ${EMAIL_HOME_URL}`,
      `Need help? ${EMAIL_SUPPORT_URL}`,
      "",
      "Thanks,",
      "Gaurav Kumar",
    ].join("\n"),
    html: buildHtmlTemplate({
      preheader: `Welcome to ${EMAIL_APP_NAME}`,
      heading: `Welcome, ${displayName}`,
      intro,
      body: "Thanks for signing in. Your profile is active and your support actions are now linked to your account for a better experience.",
      actionLabel: "Open Portfolio",
      actionHref: EMAIL_HOME_URL,
      footer: `Need help? Reach us at ${EMAIL_SUPPORT_URL}`,
    }),
  };
};

const buildWelcomeBackPayload = (user) => {
  const displayName = getDisplayName(user);
  const intro = `Hi ${displayName}, great to have you back.`;

  return {
    subject: `Welcome back to ${EMAIL_APP_NAME}`,
    text: [
      `Hi ${displayName},`,
      "",
      `Welcome back to ${EMAIL_APP_NAME}. Your account is active and ready.`,
      "",
      `Continue from here: ${EMAIL_HOME_URL}`,
      `Need anything? ${EMAIL_SUPPORT_URL}`,
      "",
      "Regards,",
      "Gaurav Kumar",
    ].join("\n"),
    html: buildHtmlTemplate({
      preheader: `Welcome back to ${EMAIL_APP_NAME}`,
      heading: `Welcome back, ${displayName}`,
      intro,
      body: "You can continue supporting blog posts and track your activity from your account dashboard whenever you sign in.",
      actionLabel: "Continue",
      actionHref: EMAIL_HOME_URL,
      footer: `Need support? Contact us at ${EMAIL_SUPPORT_URL}`,
    }),
  };
};

const sendLifecycleEmail = async ({ type, user }) => {
  const email = normalizeEnvString(user?.email).toLowerCase();
  const userId = normalizeEnvString(user?._id || user?.id);

  if (!email) {
    return {
      sent: false,
      skipped: true,
      reason: "missing_recipient",
    };
  }

  const resend = getResendClient();

  if (!resend) {
    logger.debug(
      {
        resendEnabled: RESEND_ENABLED,
        hasApiKey: Boolean(RESEND_API_KEY),
        hasFromEmail: Boolean(RESEND_FROM_EMAIL),
      },
      "Lifecycle email skipped: Resend is not configured"
    );

    return {
      sent: false,
      skipped: true,
      reason: "resend_not_configured",
    };
  }

  const template = type === "welcome" ? buildWelcomePayload(user) : buildWelcomeBackPayload(user);
  const idempotencyKey = buildIdempotencyKey(type, userId || email);

  const payload = {
    from: RESEND_FROM_EMAIL,
    to: [email],
    subject: template.subject,
    html: template.html,
    text: template.text,
    tags: [
      {
        name: "email_type",
        value: normalizeTagValue(type, "welcome"),
      },
      {
        name: "app",
        value: normalizeTagValue(EMAIL_APP_NAME, "portfolio"),
      },
    ],
  };

  if (RESEND_REPLY_TO) {
    payload.replyTo = RESEND_REPLY_TO;
  }

  const { data, error } = await resend.emails.send(payload, { idempotencyKey });

  if (error) {
    return {
      sent: false,
      skipped: false,
      reason: "provider_error",
      error,
      idempotencyKey,
    };
  }

  return {
    sent: true,
    skipped: false,
    reason: "sent",
    providerId: data?.id || "",
    idempotencyKey,
  };
};

const sendWelcomeEmail = async ({ user }) => {
  return sendLifecycleEmail({ type: "welcome", user });
};

const sendWelcomeBackEmail = async ({ user }) => {
  return sendLifecycleEmail({ type: "welcome_back", user });
};

module.exports = {
  ONE_DAY_MS,
  shouldSendWelcomeBackEmail,
  sendWelcomeEmail,
  sendWelcomeBackEmail,
};
