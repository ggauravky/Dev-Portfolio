// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Unauthorized copying, modification, or distribution of this software,
// via any medium, is strictly prohibited without the express written
// consent of the author. See LICENSE for details.
// Source: https://github.com/ggauravky/Dev-Portfolio

const nodemailer = require("nodemailer");
const { logger } = require("./logger");

const normalizeEnvString = (value) => String(value || "").trim();
const DEFAULT_OWNER_EMAIL = "kumar.gaurav.yadav2007@gmail.com";
const EMAIL_OWNER_NAME = "Gaurav Kumar Yadav";

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

const escapeHtml = (value) =>
  String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const sanitizeTagValue = (value, fallback = "na") => {
  const normalized = String(value || fallback)
    .toLowerCase()
    .replaceAll(/[^a-z0-9_-]/g, "-")
    .replaceAll(/-{2,}/g, "-")
    .replaceAll(/^-|-$/g, "")
    .slice(0, 120);

  return normalized || fallback;
};

const parseAddress = (value) => {
  const raw = normalizeEnvString(value);
  if (!raw) {
    return {
      email: "",
      name: "",
    };
  }

  const withName = /^(.*)<([^>]+)>$/.exec(raw);
  if (!withName) {
    return {
      email: raw.toLowerCase(),
      name: "",
    };
  }

  return {
    name: normalizeEnvString(withName[1]).replaceAll(/["']/g, ""),
    email: normalizeEnvString(withName[2]).toLowerCase(),
  };
};

const getDisplayName = (entity) => {
  const givenName = normalizeEnvString(entity?.givenName);
  if (givenName) {
    return givenName;
  }

  const fullName = normalizeEnvString(
    entity?.displayName || entity?.name || entity?.contributorName || entity?.customerName
  );
  if (fullName) {
    return fullName.split(/\s+/)[0];
  }

  const email = normalizeEnvString(entity?.email);
  if (email.includes("@")) {
    return email.split("@")[0];
  }

  return "there";
};

const defaultHomeUrl =
  normalizeEnvString(process.env.FRONTEND_URL).replace(/\/$/, "") || "https://ggauravky.vercel.app";

const EMAIL_APP_NAME = normalizeEnvString(process.env.EMAIL_APP_NAME) || "Gaurav Kumar Portfolio";
const EMAIL_HOME_URL = defaultHomeUrl;
const EMAIL_SUPPORT_URL =
  normalizeEnvString(process.env.EMAIL_SUPPORT_URL) || `${defaultHomeUrl}/contact`;
const EMAIL_BLOG_URL = normalizeEnvString(process.env.EMAIL_BLOG_URL) || `${defaultHomeUrl}/blog`;
let smtpTransporter = null;
let smtpTransporterFingerprint = "";
let testTransporter = null;

const getEmailConfig = () => {
  const isProduction = normalizeEnvString(process.env.NODE_ENV).toLowerCase() === "production";
  const sender = parseAddress(
    process.env.BREVO_SENDER_EMAIL || (!isProduction ? DEFAULT_OWNER_EMAIL : "")
  );
  const replyTo = parseAddress(process.env.BREVO_REPLY_TO_EMAIL || DEFAULT_OWNER_EMAIL);
  const port = Number(process.env.BREVO_SMTP_PORT || 587);

  return {
    enabled: toBoolean(process.env.EMAIL_ENABLED, false),
    host: normalizeEnvString(process.env.BREVO_SMTP_HOST) || "smtp-relay.brevo.com",
    port,
    secure: port === 465,
    user: normalizeEnvString(process.env.BREVO_SMTP_USER),
    pass: normalizeEnvString(process.env.BREVO_SMTP_PASS),
    senderEmail: sender.email,
    senderName:
      normalizeEnvString(process.env.BREVO_SENDER_NAME) ||
      sender.name ||
      EMAIL_OWNER_NAME,
    replyToEmail: replyTo.email,
    replyToName:
      normalizeEnvString(process.env.BREVO_REPLY_TO_NAME) || replyTo.name || EMAIL_OWNER_NAME,
    adminEmail: normalizeEnvString(
      process.env.PAYMENT_ADMIN_EMAIL ||
        process.env.BREVO_ADMIN_NOTIFICATION_EMAIL ||
        DEFAULT_OWNER_EMAIL
    ).toLowerCase(),
    paymentNotificationsEnabled: toBoolean(
      process.env.PAYMENT_EMAIL_NOTIFICATIONS_ENABLED,
      true
    ),
  };
};

const isEmailConfigured = () => {
  const config = getEmailConfig();
  return (
    config.enabled &&
    Boolean(config.host) &&
    Number.isInteger(config.port) &&
    config.port > 0 &&
    config.port <= 65535 &&
    Boolean(config.user) &&
    Boolean(config.pass) &&
    Boolean(config.senderEmail)
  );
};

const getEmailTransporter = () => {
  if (testTransporter) return testTransporter;
  if (!isEmailConfigured()) return null;

  const config = getEmailConfig();
  const fingerprint = [config.host, config.port, config.secure, config.user, config.pass].join("|");
  if (!smtpTransporter || smtpTransporterFingerprint !== fingerprint) {
    smtpTransporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.user,
        pass: config.pass,
      },
      pool: true,
      maxConnections: 3,
      maxMessages: 100,
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 30000,
    });
    smtpTransporterFingerprint = fingerprint;
  }

  return smtpTransporter;
};

const buildIdempotencyKey = (...parts) => parts.map((part) => sanitizeTagValue(part)).join("-");

const buildDetailTable = (detailRows) => {
  const rows = (Array.isArray(detailRows) ? detailRows : [])
    .filter((row) => row?.label && row?.value !== undefined && row?.value !== null && row?.value !== "")
    .map(
      (row) => `<tr>
        <td width="38%" valign="top" style="padding:11px 12px;border-bottom:1px solid #e7e7e4;font-size:12px;line-height:1.45;font-weight:600;color:#66666f;">${escapeHtml(row.label)}</td>
        <td valign="top" style="padding:11px 12px;border-bottom:1px solid #e7e7e4;font-size:13px;line-height:1.45;color:#18181b;word-break:break-word;">${escapeHtml(row.value)}</td>
      </tr>`
    )
    .join("");

  return rows
    ? `<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin:8px 0 20px;border:1px solid #e7e7e4;background:#f8f8f6;">${rows}</table>`
    : "";
};

const buildEmailButton = ({ label, href }) => {
  if (!label || !href) return "";
  return `<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:7px 0 3px;">
    <tr>
      <td style="background:#18181b;border-radius:7px;border-bottom:3px solid #c5f82a;">
        <a href="${escapeHtml(href)}" style="display:inline-block;padding:11px 17px;color:#ffffff;text-decoration:none;font-size:13px;line-height:1.2;font-weight:650;">${escapeHtml(label)}</a>
      </td>
    </tr>
  </table>`;
};

const buildStatusPill = (label) =>
  label
    ? `<span style="display:inline-block;margin:0 0 16px;padding:5px 9px;border:1px solid #d9e8a4;border-radius:999px;background:#f7fbdc;color:#3f4a12;font-size:11px;line-height:1;font-weight:700;letter-spacing:.4px;text-transform:uppercase;">${escapeHtml(label)}</span>`
    : "";

const buildEmailShell = ({
  preheader,
  heading,
  intro,
  bodyParagraphs,
  detailRows,
  actionLabel,
  actionHref,
  footer,
  statusLabel,
}) => {
  const config = getEmailConfig();
  const footerLines = [
    footer,
    `${EMAIL_OWNER_NAME} / Developer Portfolio`,
    config.replyToEmail || DEFAULT_OWNER_EMAIL,
  ].filter(Boolean);
  const safeBody = (Array.isArray(bodyParagraphs) ? bodyParagraphs : [])
    .map(
      (paragraph) =>
        `<p style="margin:0 0 15px;font-size:15px;line-height:1.65;color:#3f3f46;">${escapeHtml(
          paragraph
        )}</p>`
    )
    .join("");

  const detailsTable = buildDetailTable(detailRows);
  const cta = buildEmailButton({ label: actionLabel, href: actionHref });

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(heading)}</title>
  </head>
  <body style="margin:0;padding:0;background:#f5f5f3;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;color:#18181b;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;visibility:hidden;">${escapeHtml(preheader)}</div>
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="padding:24px 10px;background:#f5f5f3;">
      <tr>
        <td align="center">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width:600px;background:#ffffff;border:1px solid #e7e7e4;border-top:4px solid #c5f82a;">
            <tr>
              <td style="padding:23px 28px 17px;border-bottom:1px solid #e7e7e4;">
                <p style="margin:0;color:#18181b;font-size:14px;line-height:1.3;font-weight:700;">${escapeHtml(EMAIL_OWNER_NAME)}</p>
                <p style="margin:3px 0 0;color:#797980;font-size:11px;line-height:1.4;letter-spacing:.5px;text-transform:uppercase;">Developer Portfolio</p>
              </td>
            </tr>
            <tr>
              <td style="padding:27px 28px 25px;">
                ${buildStatusPill(statusLabel)}
                <h1 style="margin:0 0 18px;font-size:23px;line-height:1.25;color:#18181b;font-weight:700;letter-spacing:-.3px;">${escapeHtml(heading)}</h1>
                <p style="margin:0 0 15px;font-size:15px;line-height:1.65;color:#18181b;">${escapeHtml(
                  intro
                )}</p>
                ${safeBody}
                ${detailsTable}
                ${cta}
              </td>
            </tr>
            <tr>
              <td style="padding:18px 28px 23px;border-top:1px solid #e7e7e4;background:#fafaf8;">
                <p style="margin:0;font-size:11px;line-height:1.65;color:#77777f;">${footerLines
                  .map((line) => escapeHtml(line))
                  .join("<br />")}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
};

const normalizeRecipients = (to) => {
  const recipientList = Array.isArray(to) ? to : [to];

  return recipientList
    .map((recipient) => {
      if (typeof recipient === "string") {
        return {
          address: normalizeEnvString(recipient).toLowerCase(),
        };
      }

      const recipientEmail = normalizeEnvString(recipient?.address || recipient?.email).toLowerCase();
      const recipientName = normalizeEnvString(recipient?.name);

      if (!recipientEmail) {
        return null;
      }

      return recipientName
        ? {
            address: recipientEmail,
            name: recipientName,
          }
        : {
            address: recipientEmail,
          };
    })
    .filter(Boolean);
};

const normalizeAttachments = (attachments) =>
  (Array.isArray(attachments) ? attachments : [])
    .map((attachment) => {
      const filename = normalizeEnvString(attachment?.filename || attachment?.name).slice(0, 120);
      const rawContent = attachment?.content ?? attachment?.contentBase64 ?? attachment?.base64;

      if (!filename || rawContent === undefined || rawContent === null || rawContent === "") {
        return null;
      }

      const isExplicitBase64 = !Buffer.isBuffer(rawContent) && Boolean(attachment?.contentBase64 || attachment?.base64);
      const content = isExplicitBase64
        ? Buffer.from(normalizeEnvString(rawContent), "base64")
        : rawContent;

      return {
        filename,
        content,
        contentType: normalizeEnvString(attachment?.contentType) || undefined,
      };
    })
    .filter(Boolean);

const sanitizeSmtpText = (value, maxLength = 500) => {
  let output = normalizeEnvString(value).replaceAll(/[\r\n]+/g, " ");
  for (const secret of [process.env.BREVO_SMTP_USER, process.env.BREVO_SMTP_PASS]) {
    const normalizedSecret = normalizeEnvString(secret);
    if (normalizedSecret) output = output.replaceAll(normalizedSecret, "[REDACTED]");
  }
  return output.slice(0, maxLength);
};

const buildEmailLayout = buildEmailShell;

const serializeSmtpError = (error) => {
  const response = sanitizeSmtpText(error?.response);
  return {
    message: sanitizeSmtpText(error?.message) || "Unknown SMTP error",
    code: normalizeEnvString(error?.code) || undefined,
    responseCode: Number(error?.responseCode || 0) || undefined,
    command: normalizeEnvString(error?.command).slice(0, 80) || undefined,
    ...(response && { response }),
  };
};

const normalizeReplyTo = (value) => {
  if (!value) return null;
  if (typeof value === "string") {
    const parsed = parseAddress(value);
    return parsed.email ? { address: parsed.email, ...(parsed.name && { name: parsed.name }) } : null;
  }
  const address = normalizeEnvString(value.address || value.email).toLowerCase();
  const name = normalizeEnvString(value.name);
  return address ? { address, ...(name && { name }) } : null;
};

const normalizeHeaders = (headers) => {
  if (!headers || typeof headers !== "object" || Array.isArray(headers)) return {};

  return Object.fromEntries(
    Object.entries(headers)
      .filter(([key, value]) => /^[a-z0-9-]{1,80}$/i.test(key) && value !== undefined && value !== null)
      .map(([key, value]) => [
        key,
        normalizeEnvString(value).replaceAll(/[\r\n]+/g, " ").slice(0, 500),
      ])
      .filter(([, value]) => Boolean(value))
  );
};

const sendTransactionalEmail = async ({
  to,
  subject,
  html,
  text,
  htmlContent,
  textContent,
  tags = [],
  attachments = [],
  idempotencyKey,
  replyTo,
  headers: customHeaders,
}) => {
  const recipients = normalizeRecipients(to);
  if (!recipients.length) {
    return {
      sent: false,
      skipped: true,
      reason: "missing_recipient",
    };
  }

  const transporter = getEmailTransporter();
  if (!transporter) {
    const config = getEmailConfig();
    logger.debug(
      {
        emailEnabled: config.enabled,
        hasSmtpHost: Boolean(config.host),
        hasSmtpUser: Boolean(config.user),
        hasSmtpPass: Boolean(config.pass),
        hasSenderEmail: Boolean(config.senderEmail),
      },
      "Transactional email skipped: SMTP is not configured"
    );

    return {
      sent: false,
      skipped: true,
      reason: "smtp_not_configured",
    };
  }

  const config = getEmailConfig();
  const normalizedTags = (Array.isArray(tags) ? tags : [])
    .map((tag) => sanitizeTagValue(tag, "email"))
    .filter(Boolean)
    .slice(0, 12);

  const payload = {
    from: {
      address: config.senderEmail,
      name: config.senderName,
    },
    to: recipients,
    subject: normalizeEnvString(subject),
    html: htmlContent ?? html,
    text: textContent ?? text,
  };

  const normalizedAttachments = normalizeAttachments(attachments);
  if (normalizedAttachments.length) {
    payload.attachments = normalizedAttachments;
  }

  const configuredReplyTo = config.replyToEmail
    ? { address: config.replyToEmail, ...(config.replyToName && { name: config.replyToName }) }
    : null;
  const resolvedReplyTo = normalizeReplyTo(replyTo) || configuredReplyTo;
  if (resolvedReplyTo) {
    payload.replyTo = resolvedReplyTo;
  }

  const headers = normalizeHeaders(customHeaders);
  if (idempotencyKey) headers["X-Email-Idempotency-Key"] = normalizeEnvString(idempotencyKey);
  if (normalizedTags.length) headers["X-Email-Tags"] = normalizedTags.join(",");
  if (Object.keys(headers).length) {
    payload.headers = headers;
  }

  try {
    const response = await transporter.sendMail(payload);
    const messageId = normalizeEnvString(response?.messageId);

    return {
      sent: true,
      skipped: false,
      reason: "sent",
      messageId,
      providerId: messageId,
      idempotencyKey: normalizeEnvString(idempotencyKey),
    };
  } catch (error) {
    const safeError = serializeSmtpError(error);
    logger.warn(safeError, "Transactional email delivery failed");
    return {
      sent: false,
      skipped: false,
      reason: "smtp_error",
      error: safeError,
      idempotencyKey: normalizeEnvString(idempotencyKey),
    };
  }
};

const verifyEmailTransport = async () => {
  const transporter = getEmailTransporter();
  if (!transporter) {
    return { verified: false, skipped: true, reason: "smtp_not_configured" };
  }

  try {
    await transporter.verify();
    return { verified: true, skipped: false };
  } catch (error) {
    const safeError = serializeSmtpError(error);
    logger.warn(safeError, "SMTP connection verification failed");
    return { verified: false, skipped: false, reason: "smtp_error", error: safeError };
  }
};

const buildWelcomePayload = (user) => {
  const displayName = getDisplayName(user);

  const text = [
    `Hi ${displayName},`,
    "",
    "Thanks for signing in to my portfolio.",
    "You can now keep your bookings, payment receipts, and account activity in one place.",
    "I created your profile using your Google account, and you can personalize it anytime from My Activity.",
    "",
    `Open My Activity: ${EMAIL_HOME_URL}/my-activity`,
    "",
    "Thanks,",
    EMAIL_OWNER_NAME,
  ].join("\n");

  const html = buildEmailShell({
    preheader: "Your portfolio profile is ready",
    heading: "Good to have you here",
    intro: `Hi ${displayName},`,
    bodyParagraphs: [
      "Thanks for signing in to my portfolio.",
      "You can now keep your bookings, payment receipts, and account activity in one place.",
      "I created your profile using your Google account, and you can personalize it anytime from My Activity.",
    ],
    actionLabel: "Open My Activity",
    actionHref: `${EMAIL_HOME_URL}/my-activity`,
    footer: "You received this because you signed in with Google.",
  });

  return {
    subject: "Welcome \u2014 good to have you here",
    text,
    html,
  };
};

const buildWelcomeBackPayload = (user) => {
  const displayName = getDisplayName(user);
  const accountEmail = normalizeEnvString(user?.email).toLowerCase();
  const formattedLoginTime = formatIndiaDateTime(user?.loginAt || Date.now());
  const loginTime = formattedLoginTime === "Not available" ? formattedLoginTime : `${formattedLoginTime} IST`;

  const text = [
    `Hi ${displayName},`,
    "",
    "A sign-in to your portfolio account was completed successfully.",
    "",
    `Account: ${accountEmail}`,
    `Time: ${loginTime}`,
    "",
    "If this was you, nothing else is needed.",
    "",
    "Thanks,",
    EMAIL_OWNER_NAME,
  ].join("\n");

  const html = buildEmailShell({
    preheader: "A successful sign-in to your portfolio account",
    heading: "Sign-in completed",
    intro: `Hi ${displayName},`,
    bodyParagraphs: [
      "A sign-in to your portfolio account was completed successfully.",
      "If this was you, nothing else is needed.",
    ],
    detailRows: [
      { label: "Account", value: accountEmail },
      { label: "Time", value: loginTime },
    ],
    actionLabel: "View My Activity",
    actionHref: `${EMAIL_HOME_URL}/my-activity?tab=sign-ins`,
    footer: "You received this security note after signing in with Google.",
    statusLabel: "Successful sign-in",
  });

  return {
    subject: "You signed in to Gaurav's portfolio",
    text,
    html,
  };
};

const buildNewsletterPayload = (email) => {
  const displayName = getDisplayName({ email });

  const text = [
    `Hi ${displayName},`,
    "",
    `Thanks for subscribing to ${EMAIL_APP_NAME}.`,
    "You will receive updates whenever new blog posts are published.",
    "",
    `Read the latest posts: ${EMAIL_BLOG_URL}`,
    `Need support? ${EMAIL_SUPPORT_URL}`,
    "",
    "Thanks,",
    "Gaurav Kumar",
  ].join("\n");

  const html = buildEmailLayout({
    preheader: "Newsletter subscription confirmed",
    heading: "Subscription Confirmed",
    intro: `Hi ${displayName}, thanks for subscribing.`,
    bodyParagraphs: [
      "You are now on the list for blog updates, learning notes, and new content announcements.",
      "No spam. Only meaningful updates.",
    ],
    actionLabel: "Read Blog",
    actionHref: EMAIL_BLOG_URL,
    footer: `Need support? Reach us at ${EMAIL_SUPPORT_URL}`,
  });

  return {
    subject: `Thanks for subscribing to ${EMAIL_APP_NAME}`,
    text,
    html,
  };
};

const sendLifecycleEmail = async ({ type, user, deliveryToken, subjectPrefix = "" }) => {
  const email = normalizeEnvString(user?.email).toLowerCase();
  const userId = normalizeEnvString(user?._id || user?.id || email);

  if (!email) {
    return {
      sent: false,
      skipped: true,
      reason: "missing_recipient",
    };
  }

  const template = type === "welcome" ? buildWelcomePayload(user) : buildWelcomeBackPayload(user);
  const resolvedDeliveryToken = normalizeEnvString(deliveryToken || `${Date.now()}`);
  const idempotencyKey =
    type === "welcome"
      ? buildIdempotencyKey("welcome", userId)
      : buildIdempotencyKey("welcome-back", userId, resolvedDeliveryToken);

  return sendTransactionalEmail({
    to: [{ email, name: normalizeEnvString(user?.name) }],
    subject: `${normalizeEnvString(subjectPrefix)}${template.subject}`,
    htmlContent: template.html,
    textContent: template.text,
    tags: ["auth", type, EMAIL_APP_NAME],
    idempotencyKey,
  });
};

const sendWelcomeEmail = async ({ user, loginEventId, subjectPrefix }) =>
  sendLifecycleEmail({ type: "welcome", user, deliveryToken: loginEventId, subjectPrefix });

const sendWelcomeBackEmail = async ({ user, loginEventId, subjectPrefix }) =>
  sendLifecycleEmail({
    type: "welcome_back",
    user,
    deliveryToken: loginEventId,
    subjectPrefix,
  });

const sendNewsletterThankYouEmail = async ({ email }) => {
  const normalizedEmail = normalizeEnvString(email).toLowerCase();
  if (!normalizedEmail) {
    return {
      sent: false,
      skipped: true,
      reason: "missing_recipient",
    };
  }

  const template = buildNewsletterPayload(normalizedEmail);

  return sendTransactionalEmail({
    to: [{ email: normalizedEmail }],
    subject: template.subject,
    htmlContent: template.html,
    textContent: template.text,
    tags: ["newsletter", "subscription", EMAIL_APP_NAME],
    idempotencyKey: buildIdempotencyKey("newsletter", normalizedEmail, String(Date.now()).slice(0, 10)),
  });
};

const formatPaymentAmount = (amount) =>
  new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(amount || 0));

const formatIndiaDateTime = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not available";
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  }).format(date);
};

const sendPaymentReceiptEmail = async ({ transaction, receiptPdf, subjectPrefix = "" }) => {
  const config = getEmailConfig();
  if (!config.paymentNotificationsEnabled) {
    return { sent: false, skipped: true, reason: "payment_email_disabled" };
  }
  if (String(transaction?.status || "").trim().toLowerCase() !== "paid") {
    return { sent: false, skipped: true, reason: "payment_not_paid" };
  }
  if (!Buffer.isBuffer(receiptPdf) || !receiptPdf.length) {
    return { sent: false, skipped: true, reason: "receipt_pdf_missing" };
  }

  const email = normalizeEnvString(transaction?.email).toLowerCase();
  const receiptNumber = normalizeEnvString(transaction?.receiptNumber);
  const serviceName = normalizeEnvString(transaction?.serviceName) || "Service Booking";
  const paymentId = normalizeEnvString(transaction?.razorpayPaymentId);
  const amount = formatPaymentAmount(transaction?.amount);
  const name = getDisplayName(transaction);
  const isSupport = transaction?.flowType === "support";
  const preferredDate = transaction?.preferredDate
    ? formatIndiaDateTime(transaction.preferredDate).split(",")[0]
    : "";
  const preferredTime = normalizeEnvString(transaction?.preferredTime);
  const formattedPaymentDate = formatIndiaDateTime(transaction?.paidAt || transaction?.updatedAt);
  const paymentDate = formattedPaymentDate === "Not available"
    ? formattedPaymentDate
    : `${formattedPaymentDate} IST`;
  const amountLabel = `\u20B9${amount}`;

  const text = [
    `Hi ${name},`,
    "",
    isSupport
      ? "Thank you for supporting my work. I really appreciate it."
      : `I received your payment for ${serviceName}.`,
    "",
    ...(isSupport ? [] : [`Service: ${serviceName}`]),
    `Amount: ${amountLabel}`,
    `Receipt: ${receiptNumber}`,
    `Razorpay Payment ID: ${paymentId}`,
    `Date: ${paymentDate}`,
    ...(!isSupport && preferredDate ? [`Preferred Date: ${preferredDate}`] : []),
    ...(!isSupport && preferredTime ? [`Preferred Time: ${preferredTime}`] : []),
    "",
    isSupport
      ? `Your ${amountLabel} payment went through successfully, and I attached the receipt to this email.`
      : "Your receipt is attached. I'll follow up with the next steps.",
    "",
    "Thanks,",
    "Gaurav Kumar Yadav",
  ].join("\n");

  const html = buildEmailShell({
    preheader: `Payment received for ${serviceName}`,
    heading: isSupport ? "Thanks for the support" : "Payment received",
    intro: `Hi ${name},`,
    bodyParagraphs: isSupport
      ? [
          "Thank you for supporting my work. I really appreciate it.",
          `Your ${amountLabel} payment went through successfully, and I attached the receipt to this email.`,
        ]
      : [
          `I received your payment for ${serviceName}. Here are the details for your records.`,
          "Your receipt is attached. I'll follow up with the next steps.",
        ],
    detailRows: [
      { label: isSupport ? "Type" : "Service", value: serviceName },
      { label: "Amount", value: amountLabel },
      { label: "Receipt", value: receiptNumber },
      { label: "Razorpay Payment ID", value: paymentId },
      { label: "Date", value: paymentDate },
      ...(!isSupport && preferredDate ? [{ label: "Preferred Date", value: preferredDate }] : []),
      ...(!isSupport && preferredTime ? [{ label: "Preferred Time", value: preferredTime }] : []),
    ],
    actionLabel: "View My Activity",
    actionHref: `${EMAIL_HOME_URL}/my-activity?tab=payments`,
    footer: `Questions about this payment? ${EMAIL_SUPPORT_URL}`,
    statusLabel: "Paid",
  });

  return sendTransactionalEmail({
    to: [{ email, name: normalizeEnvString(transaction?.customerName) }],
    subject: `${normalizeEnvString(subjectPrefix)}${
      isSupport
        ? `Thanks for the support \u2014 ${amountLabel}`
        : `Payment received \u2014 ${serviceName}`
    }`,
    htmlContent: html,
    textContent: text,
    tags: ["payment", "receipt", "razorpay"],
    attachments: [{
      filename: `receipt-${receiptNumber}.pdf`,
      content: receiptPdf,
      contentType: "application/pdf",
    }],
    idempotencyKey: buildIdempotencyKey("payment-receipt", receiptNumber),
  });
};

const sendAdminPaymentEmail = async ({ transaction, subjectPrefix = "" }) => {
  const config = getEmailConfig();
  if (!config.paymentNotificationsEnabled || !config.adminEmail) {
    return { sent: false, skipped: true, reason: "admin_email_not_configured" };
  }
  if (String(transaction?.status || "").trim().toLowerCase() !== "paid") {
    return { sent: false, skipped: true, reason: "payment_not_paid" };
  }

  const isSupport = transaction?.flowType === "support";
  const detailRows = [
    { label: "Customer", value: normalizeEnvString(transaction?.customerName) },
    { label: "Email", value: normalizeEnvString(transaction?.email).toLowerCase() },
    ...(transaction?.phone ? [{ label: "Phone", value: normalizeEnvString(transaction.phone) }] : []),
    { label: isSupport ? "Type" : "Service", value: normalizeEnvString(transaction?.serviceName) },
    { label: "Amount", value: `INR ${formatPaymentAmount(transaction?.amount)}` },
    { label: "Transaction", value: normalizeEnvString(transaction?._id) },
    { label: "Payment ID", value: normalizeEnvString(transaction?.razorpayPaymentId) },
    { label: "Receipt", value: normalizeEnvString(transaction?.receiptNumber) },
    { label: "Timestamp", value: formatIndiaDateTime(transaction?.paidAt || transaction?.updatedAt) },
    ...(!isSupport
      ? [
          {
            label: "Preferred date",
            value: formatIndiaDateTime(transaction?.preferredDate).split(",")[0],
          },
          { label: "Preferred time", value: normalizeEnvString(transaction?.preferredTime) },
        ]
      : []),
  ];

  return sendTransactionalEmail({
    to: [{ email: config.adminEmail }],
    subject: `${normalizeEnvString(subjectPrefix)}${
      isSupport
        ? `New support payment - INR ${formatPaymentAmount(transaction?.amount)}`
        : `New paid booking - ${normalizeEnvString(transaction?.serviceName)}`
    }`,
    htmlContent: buildEmailShell({
      preheader: isSupport ? "A support payment was confirmed" : "A service booking payment was confirmed",
      heading: isSupport ? "NEW SUPPORT PAYMENT" : "NEW PAID BOOKING",
      intro: isSupport
        ? "A Razorpay support payment has been verified."
        : "A Razorpay payment has been verified and the booking is ready for follow-up.",
      detailRows,
      footer: "Private administrative notification.",
      statusLabel: "Verified",
    }),
    textContent: detailRows.map((row) => `${row.label}: ${row.value}`).join("\n"),
    tags: ["payment", "admin", "razorpay"],
    idempotencyKey: buildIdempotencyKey("payment-admin", transaction?.receiptNumber),
  });
};

module.exports = {
  isEmailConfigured,
  sendTransactionalEmail,
  sendAdminPaymentEmail,
  sendPaymentReceiptEmail,
  sendWelcomeEmail,
  sendWelcomeBackEmail,
  sendNewsletterThankYouEmail,
  verifyEmailTransport,
  _test: {
    buildDetailTable,
    buildEmailButton,
    buildEmailShell,
    buildEmailLayout,
    buildWelcomeBackPayload,
    buildWelcomePayload,
    getEmailConfig,
    normalizeAttachments,
    normalizeHeaders,
    resetTransporter: () => {
      smtpTransporter = null;
      smtpTransporterFingerprint = "";
      testTransporter = null;
    },
    setTransporter: (transporter) => {
      testTransporter = transporter;
    },
  },
};
