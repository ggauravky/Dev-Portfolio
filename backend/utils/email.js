// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Unauthorized copying, modification, or distribution of this software,
// via any medium, is strictly prohibited without the express written
// consent of the author. See LICENSE for details.
// Source: https://github.com/ggauravky/Dev-Portfolio

const { BrevoClient } = require("@getbrevo/brevo");
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

const formatDateTime = (value) => {
  const parsed = new Date(value || Date.now());
  if (Number.isNaN(parsed.getTime())) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  }).format(parsed);
};

const formatDate = (value) => {
  const parsed = new Date(value || Date.now());
  if (Number.isNaN(parsed.getTime())) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeZone: "Asia/Kolkata",
  }).format(parsed);
};

const formatCurrencyInr = (value) => {
  const amount = Number(value || 0);
  if (!Number.isFinite(amount)) {
    return "INR 0";
  }

  return `INR ${amount.toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
};

const getDisplayName = (entity) => {
  const givenName = normalizeEnvString(entity?.givenName);
  if (givenName) {
    return givenName;
  }

  const fullName = normalizeEnvString(entity?.name || entity?.contributorName);
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

const parsedSender = parseAddress(process.env.BREVO_SENDER_EMAIL);
const parsedReplyTo = parseAddress(process.env.BREVO_REPLY_TO_EMAIL);

const BREVO_ENABLED = toBoolean(process.env.BREVO_ENABLED, true);
const BREVO_API_KEY = normalizeEnvString(process.env.BREVO_API_KEY);
const BREVO_SENDER_EMAIL = parsedSender.email;
const BREVO_SENDER_NAME =
  normalizeEnvString(process.env.BREVO_SENDER_NAME) ||
  parsedSender.name ||
  normalizeEnvString(process.env.EMAIL_APP_NAME) ||
  "Gaurav Kumar Portfolio";
const BREVO_REPLY_TO_EMAIL = parsedReplyTo.email;
const BREVO_REPLY_TO_NAME = normalizeEnvString(process.env.BREVO_REPLY_TO_NAME) || parsedReplyTo.name;
const BREVO_ADMIN_NOTIFICATION_EMAIL = normalizeEnvString(process.env.BREVO_ADMIN_NOTIFICATION_EMAIL).toLowerCase();

const EMAIL_APP_NAME = normalizeEnvString(process.env.EMAIL_APP_NAME) || "Gaurav Kumar Portfolio";
const EMAIL_HOME_URL = defaultHomeUrl;
const EMAIL_SUPPORT_URL =
  normalizeEnvString(process.env.EMAIL_SUPPORT_URL) || `${defaultHomeUrl}/contact`;
const EMAIL_SERVICES_URL =
  normalizeEnvString(process.env.EMAIL_SERVICES_URL) || `${defaultHomeUrl}/services`;
const EMAIL_BLOG_URL = normalizeEnvString(process.env.EMAIL_BLOG_URL) || `${defaultHomeUrl}/blog`;

let brevoClient = null;

const isBrevoConfigured = () => BREVO_ENABLED && Boolean(BREVO_API_KEY) && Boolean(BREVO_SENDER_EMAIL);

const getBrevoClient = () => {
  if (!isBrevoConfigured()) {
    return null;
  }

  if (!brevoClient) {
    brevoClient = new BrevoClient({
      apiKey: BREVO_API_KEY,
      timeoutInSeconds: 30,
      maxRetries: 2,
    });
  }

  return brevoClient;
};

const shouldSendWelcomeBackEmail = (user) => {
  const lastSentAt = user?.lastWelcomeBackEmailAt ? new Date(user.lastWelcomeBackEmailAt) : null;

  if (!lastSentAt || Number.isNaN(lastSentAt.getTime())) {
    return true;
  }

  return Date.now() - lastSentAt.getTime() >= ONE_DAY_MS;
};

const buildIdempotencyKey = (...parts) => parts.map((part) => normalizeTagValue(part, "na")).join("-");

const buildEmailLayout = ({
  preheader,
  heading,
  intro,
  bodyParagraphs,
  detailRows,
  actionLabel,
  actionHref,
  footer,
}) => {
  const safeBody = (Array.isArray(bodyParagraphs) ? bodyParagraphs : [])
    .map((paragraph) => `<p style="margin:0 0 14px;font-size:15px;line-height:1.7;color:#1f2937;">${escapeHtml(paragraph)}</p>`)
    .join("");

  const safeDetails = (Array.isArray(detailRows) ? detailRows : [])
    .map(
      (row) =>
        `<tr>
          <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;font-size:13px;font-weight:700;color:#0f172a;white-space:nowrap;">${escapeHtml(
            row.label
          )}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;font-size:13px;color:#334155;">${escapeHtml(
            row.value
          )}</td>
        </tr>`
    )
    .join("");

  const detailsTable = safeDetails
    ? `<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin:8px 0 18px;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">${safeDetails}</table>`
    : "";

  const cta =
    actionLabel && actionHref
      ? `<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:8px 0 4px;">
          <tr>
            <td style="border-radius:10px;background:#0f172a;">
              <a href="${escapeHtml(actionHref)}" style="display:inline-block;padding:12px 20px;color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;">${escapeHtml(
                actionLabel
              )}</a>
            </td>
          </tr>
        </table>`
      : "";

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(heading)}</title>
  </head>
  <body style="margin:0;padding:0;background:#f8fafc;font-family:Arial,sans-serif;color:#0f172a;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;visibility:hidden;">${escapeHtml(preheader)}</div>
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="padding:22px 10px;background:#f8fafc;">
      <tr>
        <td align="center">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width:620px;background:#ffffff;border:1px solid #dbeafe;border-radius:16px;overflow:hidden;">
            <tr>
              <td style="background:linear-gradient(135deg,#0284c7,#1d4ed8);padding:26px 30px;">
                <p style="margin:0;color:#dbeafe;font-size:12px;letter-spacing:1px;text-transform:uppercase;font-weight:700;">${escapeHtml(
                  EMAIL_APP_NAME
                )}</p>
                <h1 style="margin:8px 0 0;font-size:26px;line-height:1.25;color:#ffffff;">${escapeHtml(
                  heading
                )}</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 30px;">
                <p style="margin:0 0 16px;font-size:16px;line-height:1.7;color:#111827;">${escapeHtml(intro)}</p>
                ${safeBody}
                ${detailsTable}
                ${cta}
              </td>
            </tr>
            <tr>
              <td style="padding:0 30px 22px;">
                <p style="margin:0;font-size:12px;line-height:1.6;color:#64748b;">${escapeHtml(footer)}</p>
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
          email: normalizeEnvString(recipient).toLowerCase(),
        };
      }

      const recipientEmail = normalizeEnvString(recipient?.email).toLowerCase();
      const recipientName = normalizeEnvString(recipient?.name);

      if (!recipientEmail) {
        return null;
      }

      return recipientName
        ? {
            email: recipientEmail,
            name: recipientName,
          }
        : {
            email: recipientEmail,
          };
    })
    .filter(Boolean);
};

const normalizeAttachments = (attachments) =>
  (Array.isArray(attachments) ? attachments : [])
    .map((attachment) => {
      const name = normalizeEnvString(attachment?.name).slice(0, 120);
      const rawContent = attachment?.contentBase64 || attachment?.content || attachment?.base64;

      if (!name || !rawContent) {
        return null;
      }

      const contentBase64 = Buffer.isBuffer(rawContent)
        ? rawContent.toString("base64")
        : normalizeEnvString(rawContent);

      if (!contentBase64) {
        return null;
      }

      return {
        name,
        content: contentBase64,
      };
    })
    .filter(Boolean);

const serializeProviderError = (error) => {
  const responseData = error?.response?.data || error?.body || null;

  return {
    message: normalizeEnvString(error?.message) || "Unknown email provider error",
    statusCode: Number(error?.statusCode || error?.response?.status || 0) || undefined,
    code: normalizeEnvString(error?.code) || undefined,
    details:
      responseData?.message ||
      responseData?.code ||
      responseData?.error ||
      (typeof responseData === "string" ? responseData : undefined),
  };
};

const sendTransactionalEmail = async ({
  to,
  subject,
  htmlContent,
  textContent,
  tags = [],
  attachments = [],
  idempotencyKey,
}) => {
  const recipients = normalizeRecipients(to);
  if (!recipients.length) {
    return {
      sent: false,
      skipped: true,
      reason: "missing_recipient",
    };
  }

  const brevo = getBrevoClient();
  if (!brevo) {
    logger.debug(
      {
        brevoEnabled: BREVO_ENABLED,
        hasApiKey: Boolean(BREVO_API_KEY),
        hasSenderEmail: Boolean(BREVO_SENDER_EMAIL),
      },
      "Transactional email skipped: Brevo is not configured"
    );

    return {
      sent: false,
      skipped: true,
      reason: "brevo_not_configured",
    };
  }

  const normalizedTags = (Array.isArray(tags) ? tags : [])
    .map((tag) => normalizeTagValue(tag, "email"))
    .filter(Boolean)
    .slice(0, 12);
  const attachmentList = normalizeAttachments(attachments);

  const payload = {
    sender: {
      email: BREVO_SENDER_EMAIL,
      name: BREVO_SENDER_NAME,
    },
    to: recipients,
    subject: normalizeEnvString(subject),
    htmlContent,
    textContent,
    tags: normalizedTags,
  };

  if (BREVO_REPLY_TO_EMAIL) {
    payload.replyTo = BREVO_REPLY_TO_NAME
      ? {
          email: BREVO_REPLY_TO_EMAIL,
          name: BREVO_REPLY_TO_NAME,
        }
      : {
          email: BREVO_REPLY_TO_EMAIL,
        };
  }

  if (attachmentList.length) {
    payload.attachment = attachmentList;
  }

  if (idempotencyKey) {
    payload.headers = {
      "Idempotency-Key": idempotencyKey,
    };
  }

  try {
    const response = await brevo.transactionalEmails.sendTransacEmail(payload);
    const messageId =
      normalizeEnvString(response?.messageId) ||
      normalizeEnvString(response?.messageIds?.[0]) ||
      normalizeEnvString(response?.data?.messageId) ||
      normalizeEnvString(response?.data?.messageIds?.[0]);

    return {
      sent: true,
      skipped: false,
      reason: "sent",
      messageId,
      providerId: messageId,
      idempotencyKey: normalizeEnvString(idempotencyKey),
    };
  } catch (error) {
    return {
      sent: false,
      skipped: false,
      reason: "provider_error",
      error: serializeProviderError(error),
      idempotencyKey: normalizeEnvString(idempotencyKey),
    };
  }
};

const buildWelcomePayload = (user) => {
  const displayName = getDisplayName(user);

  const text = [
    `Hi ${displayName},`,
    "",
    `Welcome to ${EMAIL_APP_NAME}. Your account is now active and ready.`,
    "",
    `Open your portfolio: ${EMAIL_HOME_URL}`,
    `Need help? ${EMAIL_SUPPORT_URL}`,
    "",
    "Thanks,",
    "Gaurav Kumar",
  ].join("\n");

  const html = buildEmailLayout({
    preheader: `Welcome to ${EMAIL_APP_NAME}`,
    heading: `Welcome, ${displayName}`,
    intro: `Hi ${displayName}, your account is now ready.`,
    bodyParagraphs: [
      "Thanks for signing in. Your profile is active and your support actions are now linked to your account.",
      "You can continue reading blogs, track your activity, and support content anytime.",
    ],
    actionLabel: "Open Portfolio",
    actionHref: EMAIL_HOME_URL,
    footer: `Need help? Reach us at ${EMAIL_SUPPORT_URL}`,
  });

  return {
    subject: `Welcome to ${EMAIL_APP_NAME}`,
    text,
    html,
  };
};

const buildWelcomeBackPayload = (user) => {
  const displayName = getDisplayName(user);

  const text = [
    `Hi ${displayName},`,
    "",
    `Welcome back to ${EMAIL_APP_NAME}. Your account is active and ready.`,
    "",
    `Continue from here: ${EMAIL_HOME_URL}`,
    `Need anything? ${EMAIL_SUPPORT_URL}`,
    "",
    "Regards,",
    "Gaurav Kumar",
  ].join("\n");

  const html = buildEmailLayout({
    preheader: `Welcome back to ${EMAIL_APP_NAME}`,
    heading: `Welcome back, ${displayName}`,
    intro: `Hi ${displayName}, great to have you back.`,
    bodyParagraphs: [
      "Your account is active and linked to your latest support activity.",
      "Continue from where you left off and keep learning.",
    ],
    actionLabel: "Continue",
    actionHref: EMAIL_HOME_URL,
    footer: `Need support? Contact us at ${EMAIL_SUPPORT_URL}`,
  });

  return {
    subject: `Welcome back to ${EMAIL_APP_NAME}`,
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

const buildServiceConfirmationPayload = (booking) => {
  const customerName = getDisplayName(booking);
  const preferredSlot = `${formatDate(booking?.preferredDate)} at ${normalizeEnvString(
    booking?.preferredTime
  )}`;

  const detailRows = [
    {
      label: "Service",
      value: normalizeEnvString(booking?.service) || "Not available",
    },
    {
      label: "Amount Paid",
      value: formatCurrencyInr(booking?.amount),
    },
    {
      label: "Order ID",
      value: normalizeEnvString(booking?.orderId) || "Not available",
    },
    {
      label: "Payment ID",
      value: normalizeEnvString(booking?.paymentId) || "Not available",
    },
    {
      label: "Preferred Slot",
      value: preferredSlot,
    },
    {
      label: "Paid At",
      value: formatDateTime(booking?.paidAt || booking?.updatedAt || Date.now()),
    },
  ];

  const text = [
    `Hi ${customerName},`,
    "",
    "Your service booking payment has been confirmed.",
    `Service: ${normalizeEnvString(booking?.service) || "Not available"}`,
    `Amount: ${formatCurrencyInr(booking?.amount)}`,
    `Order ID: ${normalizeEnvString(booking?.orderId) || "Not available"}`,
    `Payment ID: ${normalizeEnvString(booking?.paymentId) || "Not available"}`,
    `Preferred Slot: ${preferredSlot}`,
    `Paid At: ${formatDateTime(booking?.paidAt || booking?.updatedAt || Date.now())}`,
    "",
    "A confirmation PDF is attached for your records.",
    "",
    `Services page: ${EMAIL_SERVICES_URL}`,
    `Support: ${EMAIL_SUPPORT_URL}`,
    "",
    "Thanks,",
    "Gaurav Kumar",
  ].join("\n");

  const html = buildEmailLayout({
    preheader: "Service booking payment confirmed",
    heading: "Booking Confirmed",
    intro: `Hi ${customerName}, your payment was successful.`,
    bodyParagraphs: [
      "Your service request is now confirmed. The team will reach out if any additional details are needed.",
      "A confirmation PDF is attached for your records.",
    ],
    detailRows,
    actionLabel: "View Services",
    actionHref: EMAIL_SERVICES_URL,
    footer: `Need support? Contact us at ${EMAIL_SUPPORT_URL}`,
  });

  return {
    customer: {
      subject: `Booking confirmed: ${normalizeEnvString(booking?.service) || "Service"}`,
      text,
      html,
    },
    admin: {
      subject: `New paid booking: ${normalizeEnvString(booking?.service) || "Service"}`,
      text: [
        "A booking has been paid.",
        `Name: ${normalizeEnvString(booking?.name) || "Not available"}`,
        `Email: ${normalizeEnvString(booking?.email) || "Not available"}`,
        `Phone: ${normalizeEnvString(booking?.phone) || "Not available"}`,
        `Service: ${normalizeEnvString(booking?.service) || "Not available"}`,
        `Amount: ${formatCurrencyInr(booking?.amount)}`,
        `Order ID: ${normalizeEnvString(booking?.orderId) || "Not available"}`,
        `Payment ID: ${normalizeEnvString(booking?.paymentId) || "Not available"}`,
        `Preferred Slot: ${preferredSlot}`,
        `Paid At: ${formatDateTime(booking?.paidAt || booking?.updatedAt || Date.now())}`,
        `Project Brief: ${normalizeEnvString(booking?.projectBrief) || "-"}`,
      ].join("\n"),
      html: buildEmailLayout({
        preheader: "New paid booking",
        heading: "New Paid Booking",
        intro: "A service booking was marked as paid.",
        bodyParagraphs: [
          `Customer: ${normalizeEnvString(booking?.name) || "Not available"} (${normalizeEnvString(
            booking?.email
          ) || "Not available"})`,
          `Project brief: ${normalizeEnvString(booking?.projectBrief) || "No project brief provided."}`,
        ],
        detailRows,
        actionLabel: "Open Contact Page",
        actionHref: EMAIL_SUPPORT_URL,
        footer: "Admin notification from booking workflow.",
      }),
    },
  };
};

const buildSupportThankYouPayload = (supportPayment) => {
  const displayName = getDisplayName(supportPayment);

  const detailRows = [
    {
      label: "Amount",
      value: formatCurrencyInr(supportPayment?.amount),
    },
    {
      label: "Order ID",
      value: normalizeEnvString(supportPayment?.orderId) || "Not available",
    },
    {
      label: "Payment ID",
      value: normalizeEnvString(supportPayment?.paymentId) || "Not available",
    },
    {
      label: "Paid At",
      value: formatDateTime(supportPayment?.paidAt || supportPayment?.updatedAt || Date.now()),
    },
  ];

  const text = [
    `Hi ${displayName},`,
    "",
    "Thank you for your support contribution.",
    `Amount: ${formatCurrencyInr(supportPayment?.amount)}`,
    `Order ID: ${normalizeEnvString(supportPayment?.orderId) || "Not available"}`,
    `Payment ID: ${normalizeEnvString(supportPayment?.paymentId) || "Not available"}`,
    "",
    "A support receipt PDF is attached for your records.",
    "",
    `Home: ${EMAIL_HOME_URL}`,
    `Contact: ${EMAIL_SUPPORT_URL}`,
    "",
    "With gratitude,",
    "Gaurav Kumar",
  ].join("\n");

  const html = buildEmailLayout({
    preheader: "Support payment received",
    heading: "Thank You For Supporting",
    intro: `Hi ${displayName}, your support means a lot.`,
    bodyParagraphs: [
      "Your contribution directly helps in creating better resources and more hands-on content.",
      "A support receipt PDF is attached for your records.",
    ],
    detailRows,
    actionLabel: "Visit Portfolio",
    actionHref: EMAIL_HOME_URL,
    footer: `Questions? Reach us at ${EMAIL_SUPPORT_URL}`,
  });

  return {
    subject: `Thank you for supporting ${EMAIL_APP_NAME}`,
    text,
    html,
  };
};

const buildServiceAcknowledgementPayload = (booking) => {
  const displayName = getDisplayName(booking);

  const detailRows = [
    {
      label: "Service",
      value: normalizeEnvString(booking?.service) || "Not available",
    },
    {
      label: "Amount",
      value: formatCurrencyInr(booking?.amount),
    },
    {
      label: "Order ID",
      value: normalizeEnvString(booking?.orderId) || "Not available",
    },
    {
      label: "Status",
      value: "Payment received. Final confirmation in progress.",
    },
  ];

  const text = [
    `Hi ${displayName},`,
    "",
    "We received your booking payment request and are confirming it with the gateway.",
    `Service: ${normalizeEnvString(booking?.service) || "Not available"}`,
    `Amount: ${formatCurrencyInr(booking?.amount)}`,
    `Order ID: ${normalizeEnvString(booking?.orderId) || "Not available"}`,
    "",
    "You will receive a final confirmation email with receipt shortly after verification completes.",
    "",
    `Need help? ${EMAIL_SUPPORT_URL}`,
    "",
    "Thanks,",
    "Gaurav Kumar",
  ].join("\n");

  const html = buildEmailLayout({
    preheader: "Payment received. Final confirmation is in progress.",
    heading: "Payment Received",
    intro: `Hi ${displayName}, we received your payment request and started verification.`,
    bodyParagraphs: [
      "No action is needed from your side. Final confirmation and receipt will be sent as soon as reconciliation completes.",
    ],
    detailRows,
    actionLabel: "Open Portfolio",
    actionHref: EMAIL_HOME_URL,
    footer: `Need support? Reach us at ${EMAIL_SUPPORT_URL}`,
  });

  return {
    subject: `Payment received: ${normalizeEnvString(booking?.service) || "Service booking"}`,
    text,
    html,
  };
};

const buildSupportAcknowledgementPayload = (supportPayment) => {
  const displayName = getDisplayName(supportPayment);

  const detailRows = [
    {
      label: "Amount",
      value: formatCurrencyInr(supportPayment?.amount),
    },
    {
      label: "Order ID",
      value: normalizeEnvString(supportPayment?.orderId) || "Not available",
    },
    {
      label: "Status",
      value: "Contribution received. Final confirmation in progress.",
    },
  ];

  const text = [
    `Hi ${displayName},`,
    "",
    "We received your support contribution and started payment verification.",
    `Amount: ${formatCurrencyInr(supportPayment?.amount)}`,
    `Order ID: ${normalizeEnvString(supportPayment?.orderId) || "Not available"}`,
    "",
    "You will receive the final support receipt once confirmation completes.",
    "",
    `Need help? ${EMAIL_SUPPORT_URL}`,
    "",
    "With gratitude,",
    "Gaurav Kumar",
  ].join("\n");

  const html = buildEmailLayout({
    preheader: "Support payment received. Final confirmation is in progress.",
    heading: "Support Payment Received",
    intro: `Hi ${displayName}, your support payment request was received.`,
    bodyParagraphs: [
      "We are reconciling this payment in the background. You will receive your final receipt as soon as verification completes.",
    ],
    detailRows,
    actionLabel: "Open Portfolio",
    actionHref: EMAIL_HOME_URL,
    footer: `Questions? Reach us at ${EMAIL_SUPPORT_URL}`,
  });

  return {
    subject: `Support payment received: ${formatCurrencyInr(supportPayment?.amount)}`,
    text,
    html,
  };
};

const sendLifecycleEmail = async ({ type, user }) => {
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
  const dayBucket = Math.floor(Date.now() / ONE_DAY_MS);
  const idempotencyKey =
    type === "welcome"
      ? buildIdempotencyKey("welcome", userId)
      : buildIdempotencyKey("welcome-back", userId, String(dayBucket));

  return sendTransactionalEmail({
    to: [{ email, name: normalizeEnvString(user?.name) }],
    subject: template.subject,
    htmlContent: template.html,
    textContent: template.text,
    tags: ["auth", type, EMAIL_APP_NAME],
    idempotencyKey,
  });
};

const sendWelcomeEmail = async ({ user }) => sendLifecycleEmail({ type: "welcome", user });

const sendWelcomeBackEmail = async ({ user }) => sendLifecycleEmail({ type: "welcome_back", user });

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

const sendServiceBookingConfirmationEmail = async ({ booking, attachments = [] }) => {
  const recipientEmail = normalizeEnvString(booking?.email).toLowerCase();
  if (!recipientEmail) {
    return {
      customer: {
        sent: false,
        skipped: true,
        reason: "missing_recipient",
      },
      admin: {
        sent: false,
        skipped: true,
        reason: "missing_admin_recipient",
      },
    };
  }

  const template = buildServiceConfirmationPayload(booking);
  const dedupeSeed = normalizeEnvString(booking?.orderId || booking?._id || booking?.paymentId || recipientEmail);

  const customer = await sendTransactionalEmail({
    to: [{ email: recipientEmail, name: normalizeEnvString(booking?.name) }],
    subject: template.customer.subject,
    htmlContent: template.customer.html,
    textContent: template.customer.text,
    tags: ["booking", "payment", "customer"],
    attachments,
    idempotencyKey: buildIdempotencyKey("service", "customer", dedupeSeed),
  });

  let admin = {
    sent: false,
    skipped: true,
    reason: "admin_not_configured",
  };

  if (BREVO_ADMIN_NOTIFICATION_EMAIL && BREVO_ADMIN_NOTIFICATION_EMAIL !== recipientEmail) {
    admin = await sendTransactionalEmail({
      to: [{ email: BREVO_ADMIN_NOTIFICATION_EMAIL, name: "Admin" }],
      subject: template.admin.subject,
      htmlContent: template.admin.html,
      textContent: template.admin.text,
      tags: ["booking", "payment", "admin"],
      attachments,
      idempotencyKey: buildIdempotencyKey("service", "admin", dedupeSeed),
    });
  }

  return {
    customer,
    admin,
  };
};

const sendSupportThankYouEmail = async ({ supportPayment, attachments = [] }) => {
  const recipientEmail = normalizeEnvString(supportPayment?.email).toLowerCase();
  if (!recipientEmail) {
    return {
      sent: false,
      skipped: true,
      reason: "missing_recipient",
    };
  }

  const template = buildSupportThankYouPayload(supportPayment);
  const dedupeSeed = normalizeEnvString(
    supportPayment?.orderId || supportPayment?._id || supportPayment?.paymentId || recipientEmail
  );

  return sendTransactionalEmail({
    to: [{ email: recipientEmail, name: normalizeEnvString(supportPayment?.contributorName) }],
    subject: template.subject,
    htmlContent: template.html,
    textContent: template.text,
    tags: ["support", "payment", "thanks"],
    attachments,
    idempotencyKey: buildIdempotencyKey("support", "thank-you", dedupeSeed),
  });
};

const sendServicePaymentAcknowledgementEmail = async ({ booking }) => {
  const recipientEmail = normalizeEnvString(booking?.email).toLowerCase();
  if (!recipientEmail) {
    return {
      sent: false,
      skipped: true,
      reason: "missing_recipient",
    };
  }

  const template = buildServiceAcknowledgementPayload(booking);
  const dedupeSeed = normalizeEnvString(booking?.orderId || booking?._id || recipientEmail);

  return sendTransactionalEmail({
    to: [{ email: recipientEmail, name: normalizeEnvString(booking?.name) }],
    subject: template.subject,
    htmlContent: template.html,
    textContent: template.text,
    tags: ["booking", "payment", "acknowledged"],
    idempotencyKey: buildIdempotencyKey("service", "ack", dedupeSeed),
  });
};

const sendSupportPaymentAcknowledgementEmail = async ({ supportPayment }) => {
  const recipientEmail = normalizeEnvString(supportPayment?.email).toLowerCase();
  if (!recipientEmail) {
    return {
      sent: false,
      skipped: true,
      reason: "missing_recipient",
    };
  }

  const template = buildSupportAcknowledgementPayload(supportPayment);
  const dedupeSeed = normalizeEnvString(
    supportPayment?.orderId || supportPayment?._id || recipientEmail
  );

  return sendTransactionalEmail({
    to: [{ email: recipientEmail, name: normalizeEnvString(supportPayment?.contributorName) }],
    subject: template.subject,
    htmlContent: template.html,
    textContent: template.text,
    tags: ["support", "payment", "acknowledged"],
    idempotencyKey: buildIdempotencyKey("support", "ack", dedupeSeed),
  });
};

module.exports = {
  ONE_DAY_MS,
  isBrevoConfigured,
  shouldSendWelcomeBackEmail,
  sendWelcomeEmail,
  sendWelcomeBackEmail,
  sendNewsletterThankYouEmail,
  sendServicePaymentAcknowledgementEmail,
  sendSupportPaymentAcknowledgementEmail,
  sendServiceBookingConfirmationEmail,
  sendSupportThankYouEmail,
};
