// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Unauthorized copying, modification, or distribution of this software,
// via any medium, is strictly prohibited without the express written
// consent of the author. See LICENSE for details.
// Source: https://github.com/ggauravky/Dev-Portfolio

const normalizeText = (value) => String(value || "").trim();

const escapeXml = (value) =>
  String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

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

const buildReceiptImageSvg = ({ title, subtitle, fields, footer }) => {
  const width = 1200;
  const marginX = 54;
  const contentStartY = 190;
  const labelX = marginX + 16;
  const valueX = marginX + 320;
  const lineHeight = 30;
  const rowTopPadding = 22;
  const rowBottomPadding = 14;

  const rows = [];
  let currentY = contentStartY;

  for (const field of fields) {
    const label = normalizeText(field.label) || "Detail";
    const valueLines = wrapByWords(field.value, 74);
    const rowHeight = rowTopPadding + rowBottomPadding + valueLines.length * lineHeight;

    rows.push({
      y: currentY,
      rowHeight,
      label,
      valueLines,
    });

    currentY += rowHeight + 14;
  }

  const footerStartY = currentY + 20;
  const footerLines = wrapByWords(footer, 102);
  const height = footerStartY + footerLines.length * 22 + 56;

  const rowSvg = rows
    .map((row) => {
      const linesSvg = row.valueLines
        .map(
          (line, index) =>
            `<text x="${valueX}" y="${row.y + rowTopPadding + 6 + index * lineHeight}" font-size="22" font-family="Arial, sans-serif" fill="#1f2a3a">${escapeXml(
              line
            )}</text>`
        )
        .join("");

      return `<rect x="${marginX}" y="${row.y}" width="${width - marginX * 2}" height="${row.rowHeight}" rx="16" fill="#f6f8ff" stroke="#d9e4f2" />
<text x="${labelX}" y="${row.y + rowTopPadding + 6}" font-size="22" font-family="Arial, sans-serif" font-weight="700" fill="#0f172a">${escapeXml(
        `${row.label}:`
      )}</text>
${linesSvg}`;
    })
    .join("\n");

  const footerSvg = footerLines
    .map(
      (line, index) =>
        `<text x="${marginX}" y="${footerStartY + index * 22}" font-size="17" font-family="Arial, sans-serif" fill="#546175">${escapeXml(
          line
        )}</text>`
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="Receipt image">
  <defs>
    <linearGradient id="headerGradient" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0b3b8f"/>
      <stop offset="100%" stop-color="#0c5ec9"/>
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="#eef3fb" />
  <rect x="${marginX - 6}" y="48" width="${width - (marginX - 6) * 2}" height="110" rx="18" fill="url(#headerGradient)" />
  <text x="${marginX + 18}" y="108" font-size="44" font-family="Arial, sans-serif" font-weight="700" fill="#ffffff">${escapeXml(
    title
  )}</text>
  <text x="${marginX + 18}" y="140" font-size="18" font-family="Arial, sans-serif" fill="#dce9ff">${escapeXml(
    subtitle
  )}</text>
${rowSvg}
  <line x1="${marginX}" y1="${footerStartY - 20}" x2="${width - marginX}" y2="${footerStartY - 20}" stroke="#c8d5e8" stroke-width="1" />
${footerSvg}
</svg>`;
};

const generateServiceConfirmationImage = async ({ booking }) => {
  const orderId = normalizeText(booking?.orderId) || "service-order";
  const fileToken = sanitizeToken(orderId, `service-${Date.now().toString(36)}`);

  const fields = [
    { label: "Customer Name", value: normalizeText(booking?.name) || "Not available" },
    { label: "Customer Email", value: normalizeText(booking?.email) || "Not available" },
    { label: "Service", value: normalizeText(booking?.service) || "Not available" },
    { label: "Amount Paid", value: formatCurrencyInr(booking?.amount) },
    { label: "Order ID", value: orderId },
    { label: "Payment ID", value: normalizeText(booking?.paymentId) || "Not available" },
    { label: "Preferred Date", value: formatDate(booking?.preferredDate) },
    { label: "Preferred Time", value: normalizeText(booking?.preferredTime) || "Not available" },
    { label: "Paid At", value: formatDateTime(booking?.paidAt || booking?.updatedAt || Date.now()) },
    { label: "Project Brief", value: normalizeText(booking?.projectBrief) || "No brief provided" },
  ];

  const svg = buildReceiptImageSvg({
    title: "Service Booking Confirmation",
    subtitle: `Generated on ${formatDateTime(Date.now())}`,
    fields,
    footer:
      "This image receipt was generated automatically after successful payment verification. Keep it for your records.",
  });

  return {
    name: `service-confirmation-${fileToken}.svg`,
    contentBase64: Buffer.from(svg, "utf8").toString("base64"),
  };
};

const generateSupportReceiptImage = async ({ supportPayment }) => {
  const orderId = normalizeText(supportPayment?.orderId) || "support-order";
  const fileToken = sanitizeToken(orderId, `support-${Date.now().toString(36)}`);

  const fields = [
    { label: "Contributor", value: normalizeText(supportPayment?.contributorName) || "Not available" },
    { label: "Contributor Email", value: normalizeText(supportPayment?.email) || "Not available" },
    { label: "Amount", value: formatCurrencyInr(supportPayment?.amount) },
    { label: "Order ID", value: orderId },
    { label: "Payment ID", value: normalizeText(supportPayment?.paymentId) || "Not available" },
    { label: "Paid At", value: formatDateTime(supportPayment?.paidAt || supportPayment?.updatedAt || Date.now()) },
    { label: "Message", value: normalizeText(supportPayment?.message) || "No message provided" },
  ];

  const svg = buildReceiptImageSvg({
    title: "Support Contribution Receipt",
    subtitle: `Generated on ${formatDateTime(Date.now())}`,
    fields,
    footer: "Thank you for supporting this work. This image receipt confirms your contribution was received.",
  });

  return {
    name: `support-receipt-${fileToken}.svg`,
    contentBase64: Buffer.from(svg, "utf8").toString("base64"),
  };
};

module.exports = {
  generateServiceConfirmationImage,
  generateSupportReceiptImage,
};
