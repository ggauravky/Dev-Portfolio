// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Unauthorized copying, modification, or distribution of this software,
// via any medium, is strictly prohibited without the express written
// consent of the author. See LICENSE for details.
// Source: https://github.com/ggauravky/Dev-Portfolio

const { PDFDocument, StandardFonts, rgb } = require("pdf-lib");

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const PAGE_MARGIN = 48;

const normalizeText = (value) => String(value || "").trim();

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

const humanizeToken = (value, fallback = "Not available") => {
  const raw = String(value || "")
    .trim()
    .replaceAll(/[_-]+/g, " ")
    .replaceAll(/\s{2,}/g, " ");

  if (!raw) {
    return fallback;
  }

  return raw
    .split(" ")
    .map((token) => token.charAt(0).toUpperCase() + token.slice(1).toLowerCase())
    .join(" ");
};

const buildReceiptNumber = ({ prefix, orderId, paymentId }) => {
  const normalizedPrefix = sanitizeToken(prefix, "receipt").toUpperCase();
  const tokenSource = normalizeText(paymentId) || normalizeText(orderId) || Date.now().toString(36);
  const compactToken = sanitizeToken(tokenSource, Date.now().toString(36)).replaceAll("-", "").toUpperCase();
  return `${normalizedPrefix}-${compactToken.slice(0, 16)}`;
};

const sanitizeToken = (value, fallback) => {
  const token = normalizeText(value)
    .toLowerCase()
    .replaceAll(/[^a-z0-9_-]/g, "-")
    .replaceAll(/-{2,}/g, "-")
    .replaceAll(/^-|-$/g, "")
    .slice(0, 48);

  return token || fallback;
};

const splitLongToken = (token, maxCharsPerLine) => {
  const normalizedToken = normalizeText(token);
  if (!normalizedToken || normalizedToken.length <= maxCharsPerLine) {
    return normalizedToken ? [normalizedToken] : [];
  }

  const parts = [];
  for (let index = 0; index < normalizedToken.length; index += maxCharsPerLine) {
    parts.push(normalizedToken.slice(index, index + maxCharsPerLine));
  }

  return parts;
};

const wrapByWords = (text, maxCharsPerLine) => {
  const raw = normalizeText(text);
  if (!raw) {
    return ["-"];
  }

  const lines = [];
  const chunks = raw.split(/\r?\n/);

  for (const chunk of chunks) {
    const words = chunk
      .split(/\s+/)
      .filter(Boolean)
      .flatMap((word) => splitLongToken(word, maxCharsPerLine));

    if (!words.length) {
      lines.push("");
      continue;
    }

    let current = words[0];
    for (let i = 1; i < words.length; i += 1) {
      const candidate = `${current} ${words[i]}`;
      if (candidate.length <= maxCharsPerLine) {
        current = candidate;
      } else {
        lines.push(current);
        current = words[i];
      }
    }
    lines.push(current);
  }

  return lines.length ? lines : ["-"];
};

const drawHeader = ({ page, title, subtitle, fontBold, fontRegular }) => {
  const headerHeight = 74;
  const x = PAGE_MARGIN - 4;
  const y = PAGE_HEIGHT - PAGE_MARGIN - headerHeight;
  const width = PAGE_WIDTH - (PAGE_MARGIN - 4) * 2;

  page.drawRectangle({
    x,
    y,
    width,
    height: headerHeight,
    color: rgb(0.1, 0.26, 0.55),
    borderColor: rgb(0.08, 0.2, 0.43),
    borderWidth: 1,
  });

  page.drawText(title, {
    x: x + 16,
    y: y + 44,
    size: 20,
    font: fontBold,
    color: rgb(1, 1, 1),
  });

  page.drawText(subtitle, {
    x: x + 16,
    y: y + 22,
    size: 10,
    font: fontRegular,
    color: rgb(0.88, 0.93, 1),
  });

  return y - 24;
};

const drawFieldBlock = ({ page, y, label, valueLines, fontBold, fontRegular }) => {
  const lineHeight = 15;
  const topPadding = 12;
  const bottomPadding = 10;
  const rowHeight = topPadding + bottomPadding + Math.max(valueLines.length, 1) * lineHeight;

  page.drawRectangle({
    x: PAGE_MARGIN,
    y: y - rowHeight,
    width: PAGE_WIDTH - PAGE_MARGIN * 2,
    height: rowHeight,
    color: rgb(0.97, 0.98, 1),
    borderColor: rgb(0.87, 0.9, 0.95),
    borderWidth: 1,
  });

  const labelX = PAGE_MARGIN + 12;
  const labelY = y - topPadding - 2;
  const valueX = PAGE_MARGIN + 175;

  page.drawText(`${label}:`, {
    x: labelX,
    y: labelY,
    size: 10.5,
    font: fontBold,
    color: rgb(0.1, 0.15, 0.25),
  });

  for (let i = 0; i < valueLines.length; i += 1) {
    page.drawText(valueLines[i], {
      x: valueX,
      y: labelY - i * lineHeight,
      size: 10.5,
      font: fontRegular,
      color: rgb(0.2, 0.27, 0.36),
    });
  }

  return y - rowHeight - 8;
};

const createReceiptPdfBuffer = async ({ title, subtitle, fields, footer }) => {
  const pdfDoc = await PDFDocument.create();
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let y = drawHeader({ page, title, subtitle, fontBold, fontRegular });

  for (const field of fields) {
    const valueLines = wrapByWords(field.value, 58);
    const estimatedHeight = 12 + 10 + Math.max(valueLines.length, 1) * 15 + 8;

    if (y - estimatedHeight < PAGE_MARGIN + 56) {
      page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      y = drawHeader({ page, title, subtitle, fontBold, fontRegular });
    }

    y = drawFieldBlock({
      page,
      y,
      label: normalizeText(field.label) || "Detail",
      valueLines,
      fontBold,
      fontRegular,
    });
  }

  const footerLines = wrapByWords(footer, 86);
  const footerStartY = Math.max(PAGE_MARGIN + 10, y - 18);

  page.drawLine({
    start: { x: PAGE_MARGIN, y: footerStartY + 16 },
    end: { x: PAGE_WIDTH - PAGE_MARGIN, y: footerStartY + 16 },
    thickness: 1,
    color: rgb(0.86, 0.9, 0.95),
  });

  for (let i = 0; i < footerLines.length; i += 1) {
    page.drawText(footerLines[i], {
      x: PAGE_MARGIN,
      y: footerStartY - i * 13,
      size: 9,
      font: fontRegular,
      color: rgb(0.4, 0.46, 0.56),
    });
  }

  const bytes = await pdfDoc.save();
  return Buffer.from(bytes);
};

const generateServiceConfirmationPdf = async ({ booking }) => {
  const orderId = normalizeText(booking?.orderId) || "service-order";
  const paymentId = normalizeText(booking?.paymentId) || "Not available";
  const paidAt = formatDateTime(booking?.paidAt || booking?.updatedAt || Date.now());
  const issuedAt = formatDateTime(Date.now());
  const preferredDate = formatDate(booking?.preferredDate);
  const preferredTime = normalizeText(booking?.preferredTime) || "Not available";
  const fileToken = sanitizeToken(orderId, `service-${Date.now().toString(36)}`);

  const fields = [
    {
      label: "Receipt Number",
      value: buildReceiptNumber({
        prefix: "svc",
        orderId,
        paymentId,
      }),
    },
    {
      label: "Customer Name",
      value: normalizeText(booking?.name) || "Not available",
    },
    {
      label: "Customer Email",
      value: normalizeText(booking?.email) || "Not available",
    },
    {
      label: "Service",
      value: normalizeText(booking?.service) || "Not available",
    },
    {
      label: "Amount Paid",
      value: formatCurrencyInr(booking?.amount),
    },
    {
      label: "Currency",
      value: "INR",
    },
    {
      label: "Payment Gateway",
      value: "Cashfree",
    },
    {
      label: "Order ID",
      value: orderId,
    },
    {
      label: "Transaction ID",
      value: paymentId,
    },
    {
      label: "Payment Status",
      value: humanizeToken(booking?.paymentStatus, "Paid"),
    },
    {
      label: "Verification Status",
      value: humanizeToken(booking?.reconciliationStatus, "Paid"),
    },
    {
      label: "Preferred Date",
      value: preferredDate,
    },
    {
      label: "Preferred Time",
      value: preferredTime,
    },
    {
      label: "Preferred Slot",
      value: `${preferredDate}, ${preferredTime}`,
    },
    {
      label: "Paid At",
      value: `${paidAt} (IST)`,
    },
    {
      label: "Receipt Issued At",
      value: `${issuedAt} (IST)`,
    },
    {
      label: "Project Brief",
      value: normalizeText(booking?.projectBrief) || "No brief provided",
    },
  ];

  const buffer = await createReceiptPdfBuffer({
    title: "Service Booking Confirmation",
    subtitle: `Issued on ${issuedAt} | Mode: Online Payment`,
    fields,
    footer:
      "This service confirmation was generated after successful payment verification. Keep this receipt number and transaction ID for support and future reference.",
  });

  return {
    name: `service-confirmation-${fileToken}.pdf`,
    contentBase64: buffer.toString("base64"),
  };
};

const generateSupportReceiptPdf = async ({ supportPayment }) => {
  const orderId = normalizeText(supportPayment?.orderId) || "support-order";
  const paymentId = normalizeText(supportPayment?.paymentId) || "Not available";
  const paidAt = formatDateTime(supportPayment?.paidAt || supportPayment?.updatedAt || Date.now());
  const issuedAt = formatDateTime(Date.now());
  const fileToken = sanitizeToken(orderId, `support-${Date.now().toString(36)}`);

  const fields = [
    {
      label: "Receipt Number",
      value: buildReceiptNumber({
        prefix: "sup",
        orderId,
        paymentId,
      }),
    },
    {
      label: "Contributor",
      value: normalizeText(supportPayment?.contributorName) || "Not available",
    },
    {
      label: "Contributor Email",
      value: normalizeText(supportPayment?.email) || "Not available",
    },
    {
      label: "Amount",
      value: formatCurrencyInr(supportPayment?.amount),
    },
    {
      label: "Currency",
      value: "INR",
    },
    {
      label: "Payment Gateway",
      value: "Cashfree",
    },
    {
      label: "Order ID",
      value: orderId,
    },
    {
      label: "Transaction ID",
      value: paymentId,
    },
    {
      label: "Payment Status",
      value: humanizeToken(supportPayment?.paymentStatus, "Paid"),
    },
    {
      label: "Verification Status",
      value: humanizeToken(supportPayment?.reconciliationStatus, "Paid"),
    },
    {
      label: "Paid At",
      value: `${paidAt} (IST)`,
    },
    {
      label: "Receipt Issued At",
      value: `${issuedAt} (IST)`,
    },
    {
      label: "Message",
      value: normalizeText(supportPayment?.message) || "No message provided",
    },
  ];

  const buffer = await createReceiptPdfBuffer({
    title: "Support Contribution Receipt",
    subtitle: `Issued on ${issuedAt} | Thank you for your support`,
    fields,
    footer:
      "This contribution receipt confirms your payment was received successfully. Keep this receipt number and transaction ID for future reference.",
  });

  return {
    name: `support-receipt-${fileToken}.pdf`,
    contentBase64: buffer.toString("base64"),
  };
};

module.exports = {
  generateServiceConfirmationPdf,
  generateSupportReceiptPdf,
};
