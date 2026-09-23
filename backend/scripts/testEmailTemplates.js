require("dotenv").config();

const {
  isEmailConfigured,
  sendPaymentReceiptEmail,
  sendWelcomeEmail,
  verifyEmailTransport,
} = require("../utils/email");
const { generatePaymentReceipt } = require("../utils/paymentReceipt");

const normalize = (value) => String(value || "").trim();

const maskEmail = (email) => {
  const [local, domain] = normalize(email).split("@");
  if (!local || !domain) return "not configured";
  return `${local.slice(0, 2)}***@${domain}`;
};

const formatSafeError = (error) =>
  [normalize(error?.code), Number(error?.responseCode) || "", normalize(error?.message)]
    .filter(Boolean)
    .map((value) => String(value).slice(0, 200))
    .join(" | ") || "Unknown email error";

const requireSent = (label, result) => {
  if (!result?.sent) {
    throw new Error(`${label} failed: ${formatSafeError(result?.error || { message: result?.reason })}`);
  }
  console.log(`${label}: PASS (${result.messageId || "message ID not returned"})`);
};

const buildTransaction = ({ flowType, amount }) => ({
  _id: `test-email-${flowType}`,
  userId: "000000000000000000000001",
  flowType,
  serviceSlug: flowType === "support" ? "support" : "portfolio-review",
  serviceName: flowType === "support" ? "Support Contribution" : "Portfolio Review",
  customerName: "Email Test User",
  contributorName: "Email Test User",
  email: normalize(process.env.TEST_EMAIL_TO).toLowerCase(),
  phone: "9999999999",
  preferredDate: flowType === "service" ? new Date("2026-10-10T10:00:00+05:30") : null,
  preferredTime: flowType === "service" ? "10:00" : "",
  amount,
  amountPaise: amount * 100,
  currency: "INR",
  provider: "razorpay",
  internalReference: `TEST-EMAIL-${flowType.toUpperCase()}`,
  razorpayOrderId: "order_TEST_EMAIL_PREVIEW",
  razorpayPaymentId: "pay_TEST_EMAIL_PREVIEW",
  status: "paid",
  receiptNumber: "GKY-TEST-001",
  paidAt: new Date(),
});

const run = async () => {
  const recipient = normalize(process.env.TEST_EMAIL_TO).toLowerCase();
  console.log(`Template test recipient: ${maskEmail(recipient)}`);
  if (!recipient || !isEmailConfigured()) {
    console.error("Template email test: FAIL (SMTP configuration is incomplete)");
    process.exitCode = 1;
    return;
  }

  const verification = await verifyEmailTransport();
  if (!verification.verified) {
    console.error(`SMTP connection: FAIL (${formatSafeError(verification.error)})`);
    process.exitCode = 1;
    return;
  }
  console.log("SMTP connection: PASS");

  const loginResult = await sendWelcomeEmail({
    user: { _id: "email-template-user", name: "Email Test User", email: recipient },
    loginEventId: `test-preview-${Date.now()}`,
    subjectPrefix: "[TEST / PREVIEW] ",
  });
  requireSent("Login template", loginResult);

  const support = buildTransaction({ flowType: "support", amount: 199 });
  const supportResult = await sendPaymentReceiptEmail({
    transaction: support,
    receiptPdf: await generatePaymentReceipt(support),
    subjectPrefix: "[TEST / PREVIEW] ",
  });
  requireSent("Support template with PDF", supportResult);

  const service = buildTransaction({ flowType: "service", amount: 499 });
  const serviceResult = await sendPaymentReceiptEmail({
    transaction: service,
    receiptPdf: await generatePaymentReceipt(service),
    subjectPrefix: "[TEST / PREVIEW] ",
  });
  requireSent("Service template with PDF", serviceResult);

  console.log("Template email delivery: PASS (3 messages accepted by SMTP)");
};

run().catch((error) => {
  console.error(`Template email test: FAIL (${formatSafeError(error)})`);
  process.exitCode = 1;
});
