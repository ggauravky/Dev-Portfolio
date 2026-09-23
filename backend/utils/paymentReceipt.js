const { PDFDocument, StandardFonts, rgb } = require("pdf-lib");

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN = 52;

const COLORS = {
  accent: rgb(0.69, 0.9, 0.05),
  accentSoft: rgb(0.96, 0.99, 0.86),
  background: rgb(0.985, 0.982, 0.968),
  border: rgb(0.88, 0.88, 0.85),
  ink: rgb(0.08, 0.08, 0.09),
  muted: rgb(0.4, 0.4, 0.43),
  panel: rgb(0.965, 0.965, 0.95),
  white: rgb(1, 1, 1),
};

const safeText = (value, fallback = "Not provided", maxLength = 500) => {
  const normalized = String(value || "").trim();
  if (!normalized) return fallback;
  return normalized
    .normalize("NFKD")
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/[^\x20-\x7E]/g, "?")
    .slice(0, maxLength);
};

const formatDate = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not available";
  return `${new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
  }).format(date)} IST`;
};

const formatShortDate = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not available";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  }).format(date);
};

const formatInr = (amount) =>
  new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(amount || 0));

const splitLongWord = (word, font, size, maxWidth) => {
  const chunks = [];
  let current = "";
  for (const character of word) {
    const candidate = `${current}${character}`;
    if (current && font.widthOfTextAtSize(candidate, size) > maxWidth) {
      chunks.push(current);
      current = character;
    } else {
      current = candidate;
    }
  }
  if (current) chunks.push(current);
  return chunks;
};

const wrapText = (value, font, size, maxWidth, maxLines = 3) => {
  const sourceWords = safeText(value).split(/\s+/).filter(Boolean);
  const words = sourceWords.flatMap((word) =>
    font.widthOfTextAtSize(word, size) > maxWidth
      ? splitLongWord(word, font, size, maxWidth)
      : [word]
  );
  const lines = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (current && font.widthOfTextAtSize(candidate, size) > maxWidth) {
      lines.push(current);
      current = word;
      if (lines.length === maxLines) break;
    } else {
      current = candidate;
    }
  }

  if (lines.length < maxLines && current) lines.push(current);
  const hasOverflow = words.join(" ").length > lines.join(" ").length;
  if (hasOverflow && lines.length) {
    let last = lines[lines.length - 1];
    while (last && font.widthOfTextAtSize(`${last}...`, size) > maxWidth) {
      last = last.slice(0, -1);
    }
    lines[lines.length - 1] = `${last}...`;
  }
  return lines;
};

const drawWrappedText = (page, value, options) => {
  const { x, y, font, size, color, maxWidth, maxLines = 3, lineHeight = size * 1.35 } = options;
  const lines = wrapText(value, font, size, maxWidth, maxLines);
  lines.forEach((line, index) => {
    page.drawText(line, { x, y: y - index * lineHeight, font, size, color });
  });
  return y - lines.length * lineHeight;
};

const drawRightText = (page, value, { right, y, font, size, color }) => {
  const text = safeText(value);
  page.drawText(text, {
    x: right - font.widthOfTextAtSize(text, size),
    y,
    font,
    size,
    color,
  });
};

const buildReceiptData = (transaction) => {
  const isSupport = transaction.flowType === "support";
  return {
    amount: `INR ${formatInr(transaction.amount)}`,
    customerEmail: safeText(transaction.email),
    customerName: safeText(transaction.customerName),
    internalReference: safeText(transaction.internalReference),
    itemName: isSupport
      ? "Support Contribution"
      : safeText(transaction.serviceName, "Service Booking"),
    orderId: safeText(transaction.razorpayOrderId),
    paidAt: formatDate(transaction.paidAt || transaction.updatedAt),
    paymentId: safeText(transaction.razorpayPaymentId),
    preferredDate: !isSupport && transaction.preferredDate
      ? formatShortDate(transaction.preferredDate)
      : "",
    preferredTime: !isSupport ? safeText(transaction.preferredTime, "") : "",
    receiptNumber: safeText(transaction.receiptNumber),
    transactionId: safeText(transaction._id || transaction.transactionId),
  };
};

const generatePaymentReceipt = async (transaction) => {
  if (String(transaction?.status || "") !== "paid") {
    const error = new Error("Receipt is available only for paid transactions");
    error.code = "RECEIPT_NOT_AVAILABLE";
    throw error;
  }

  const data = buildReceiptData(transaction);
  const pdf = await PDFDocument.create();
  pdf.setTitle(`Payment receipt ${data.receiptNumber}`);
  pdf.setAuthor("Gaurav Kumar Yadav");
  pdf.setSubject("Payment confirmation receipt");

  const page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const right = PAGE_WIDTH - MARGIN;

  page.drawRectangle({ x: 0, y: 0, width: PAGE_WIDTH, height: PAGE_HEIGHT, color: COLORS.background });
  page.drawRectangle({
    x: MARGIN,
    y: 42,
    width: PAGE_WIDTH - MARGIN * 2,
    height: PAGE_HEIGHT - 84,
    color: COLORS.white,
    borderColor: COLORS.border,
    borderWidth: 0.8,
  });
  page.drawRectangle({ x: MARGIN, y: PAGE_HEIGHT - 46, width: PAGE_WIDTH - MARGIN * 2, height: 4, color: COLORS.accent });

  page.drawText("GAURAV KUMAR YADAV", { x: 76, y: 760, size: 14, font: bold, color: COLORS.ink });
  page.drawText("Developer Portfolio", { x: 76, y: 743, size: 9, font: regular, color: COLORS.muted });
  drawRightText(page, "PAYMENT RECEIPT", { right: right - 24, y: 759, size: 16, font: bold, color: COLORS.ink });
  page.drawRectangle({ x: right - 77, y: 732, width: 53, height: 18, color: COLORS.accentSoft, borderColor: COLORS.accent, borderWidth: 0.6 });
  drawRightText(page, "PAID", { right: right - 42, y: 738, size: 8, font: bold, color: COLORS.ink });

  page.drawLine({ start: { x: 76, y: 716 }, end: { x: right - 24, y: 716 }, thickness: 0.8, color: COLORS.border });

  page.drawText("RECEIPT NUMBER", { x: 76, y: 689, size: 8, font: bold, color: COLORS.muted });
  drawWrappedText(page, data.receiptNumber, { x: 76, y: 674, font: bold, size: 10.5, color: COLORS.ink, maxWidth: 205, maxLines: 2 });
  page.drawText("PAYMENT DATE", { x: 320, y: 689, size: 8, font: bold, color: COLORS.muted });
  drawWrappedText(page, data.paidAt, { x: 320, y: 674, font: regular, size: 10, color: COLORS.ink, maxWidth: 199, maxLines: 2 });

  page.drawText("BILLED TO", { x: 76, y: 625, size: 8, font: bold, color: COLORS.muted });
  const billedNameBottom = drawWrappedText(page, data.customerName, {
    x: 76,
    y: 607,
    font: bold,
    size: 12,
    color: COLORS.ink,
    maxWidth: 443,
    maxLines: 2,
    lineHeight: 15,
  });
  drawWrappedText(page, data.customerEmail, {
    x: 76,
    y: billedNameBottom - 2,
    font: regular,
    size: 9.5,
    color: COLORS.muted,
    maxWidth: 443,
    maxLines: 2,
    lineHeight: 13,
  });

  const tableTop = 548;
  page.drawRectangle({ x: 76, y: tableTop, width: 443, height: 28, color: COLORS.ink });
  page.drawText("DESCRIPTION", { x: 88, y: tableTop + 10, size: 8, font: bold, color: COLORS.white });
  drawRightText(page, "AMOUNT", { right: 507, y: tableTop + 10, size: 8, font: bold, color: COLORS.white });
  page.drawRectangle({ x: 76, y: 474, width: 443, height: 74, color: COLORS.panel, borderColor: COLORS.border, borderWidth: 0.5 });
  drawWrappedText(page, data.itemName, { x: 88, y: 519, font: bold, size: 11, color: COLORS.ink, maxWidth: 280, maxLines: 2, lineHeight: 15 });
  page.drawText("Payment confirmed", { x: 88, y: 489, size: 8.5, font: regular, color: COLORS.muted });
  drawRightText(page, data.amount, { right: 507, y: 510, size: 11, font: bold, color: COLORS.ink });

  page.drawText("TOTAL PAID", { x: 350, y: 443, size: 8, font: bold, color: COLORS.muted });
  drawRightText(page, data.amount, { right: 507, y: 420, size: 19, font: bold, color: COLORS.ink });
  page.drawLine({ start: { x: 350, y: 409 }, end: { x: 519, y: 409 }, thickness: 2, color: COLORS.accent });

  page.drawText("PAYMENT DETAILS", { x: 76, y: 378, size: 8, font: bold, color: COLORS.muted });
  const details = [
    ["Provider", "Razorpay"],
    ["Payment ID", data.paymentId],
    ["Order ID", data.orderId],
    ["Transaction", data.transactionId],
    ["Reference", data.internalReference],
    ...(data.preferredDate ? [["Preferred date", data.preferredDate]] : []),
    ...(data.preferredTime ? [["Preferred time", data.preferredTime]] : []),
  ];

  let detailY = 354;
  details.forEach(([label, value]) => {
    page.drawText(safeText(label), { x: 76, y: detailY, size: 8.5, font: bold, color: COLORS.muted });
    const lines = wrapText(value, regular, 8.8, 320, 2);
    lines.forEach((line, index) => {
      page.drawText(line, { x: 190, y: detailY - index * 11, size: 8.8, font: regular, color: COLORS.ink });
    });
    detailY -= Math.max(24, lines.length * 11 + 8);
  });

  page.drawLine({ start: { x: 76, y: 112 }, end: { x: right - 24, y: 112 }, thickness: 0.8, color: COLORS.border });
  page.drawText("Thanks for your payment.", { x: 76, y: 89, size: 10, font: bold, color: COLORS.ink });
  page.drawText("This receipt confirms payment only.", { x: 76, y: 73, size: 8, font: regular, color: COLORS.muted });
  drawRightText(page, "ggauravky.vercel.app/contact", { right: right - 24, y: 73, size: 8, font: regular, color: COLORS.muted });

  return Buffer.from(await pdf.save());
};

module.exports = {
  formatInr,
  generatePaymentReceipt,
  _test: {
    buildReceiptData,
    safeText,
    wrapText,
  },
};
