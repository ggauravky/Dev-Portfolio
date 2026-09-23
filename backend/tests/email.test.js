const assert = require("node:assert/strict");
const test = require("node:test");

process.env.EMAIL_ENABLED = "true";
process.env.BREVO_SMTP_HOST = "smtp-relay.brevo.com";
process.env.BREVO_SMTP_PORT = "587";
process.env.BREVO_SMTP_USER = "smtp-login@example.test";
process.env.BREVO_SMTP_PASS = "smtp-test-key";
process.env.BREVO_SENDER_EMAIL = "verified-sender@example.test";
process.env.BREVO_SENDER_NAME = "Gaurav Kumar Yadav";
process.env.BREVO_REPLY_TO_EMAIL = "reply@example.test";
process.env.BREVO_REPLY_TO_NAME = "Portfolio Support";
process.env.PAYMENT_ADMIN_EMAIL = "admin@example.test";
process.env.PAYMENT_EMAIL_NOTIFICATIONS_ENABLED = "true";

const email = require("../utils/email");

const sentMessages = [];
const mockTransporter = {
  verify: async () => true,
  sendMail: async (message) => {
    sentMessages.push(message);
    return { messageId: `message-${sentMessages.length}` };
  },
};

test.beforeEach(() => {
  sentMessages.length = 0;
  email._test.resetTransporter();
  email._test.setTransporter(mockTransporter);
});

test.after(() => {
  email._test.resetTransporter();
});

test("SMTP configuration uses port 587 without implicit TLS", () => {
  const config = email._test.getEmailConfig();
  assert.equal(email.isEmailConfigured(), true);
  assert.equal(config.host, "smtp-relay.brevo.com");
  assert.equal(config.port, 587);
  assert.equal(config.secure, false);
});

test("SMTP configuration enables implicit TLS only for port 465", () => {
  const originalPort = process.env.BREVO_SMTP_PORT;
  process.env.BREVO_SMTP_PORT = "465";
  try {
    const config = email._test.getEmailConfig();
    assert.equal(config.port, 465);
    assert.equal(config.secure, true);
  } finally {
    process.env.BREVO_SMTP_PORT = originalPort;
  }
});

test("incomplete SMTP configuration skips safely", async () => {
  const originalEnabled = process.env.EMAIL_ENABLED;
  process.env.EMAIL_ENABLED = "false";
  email._test.resetTransporter();
  try {
    assert.equal(email.isEmailConfigured(), false);
    const result = await email.sendTransactionalEmail({
      to: "user@example.test",
      subject: "Disabled test",
      textContent: "Test",
    });
    assert.deepEqual(result, { sent: false, skipped: true, reason: "smtp_not_configured" });
  } finally {
    process.env.EMAIL_ENABLED = originalEnabled;
    email._test.setTransporter(mockTransporter);
  }
});

test("generic sender supports multiple recipients and configured reply-to", async () => {
  const result = await email.sendTransactionalEmail({
    to: ["one@example.test", { email: "two@example.test", name: "Two" }],
    subject: "Test subject",
    textContent: "Plain text",
    htmlContent: "<p>HTML</p>",
    headers: { "X-Correlation-ID": "test-123\r\nignored" },
  });

  assert.equal(result.sent, true);
  assert.equal(sentMessages[0].to.length, 2);
  assert.equal(sentMessages[0].from.address, "verified-sender@example.test");
  assert.notEqual(sentMessages[0].from.address, process.env.BREVO_SMTP_USER);
  assert.equal(sentMessages[0].replyTo.address, "reply@example.test");
  assert.equal(sentMessages[0].text, "Plain text");
  assert.equal(sentMessages[0].html, "<p>HTML</p>");
  assert.equal(sentMessages[0].headers["X-Correlation-ID"], "test-123 ignored");
});

test("welcome and welcome-back emails retain both content formats", async () => {
  await email.sendWelcomeEmail({ user: { _id: "user-1", email: "user@example.test", name: "Test User" } });
  await email.sendWelcomeBackEmail({
    user: { _id: "user-1", email: "user@example.test", name: "Test User" },
    loginEventId: "login-1",
  });

  assert.equal(sentMessages.length, 2);
  assert.equal(sentMessages[0].subject, "Welcome — good to have you here");
  assert.equal(sentMessages[1].subject, "You signed in to Gaurav's portfolio");
  assert.ok(sentMessages.every((message) => message.text && message.html));
  assert.ok(sentMessages.every((message) => !message.html.includes("linear-gradient")));
});

test("newsletter email uses the shared SMTP sender", async () => {
  const result = await email.sendNewsletterThankYouEmail({ email: "reader@example.test" });
  assert.equal(result.sent, true);
  assert.match(sentMessages[0].subject, /subscribing/);
  assert.equal(sentMessages[0].to[0].address, "reader@example.test");
});

test("payment receipt sends the PDF Buffer directly", async () => {
  const pdf = Buffer.from("%PDF-test-receipt");
  const result = await email.sendPaymentReceiptEmail({
    transaction: {
      _id: "transaction-1",
      customerName: "Test Customer",
      email: "customer@example.test",
      serviceName: "Mentorship",
      amount: 49,
      receiptNumber: "GKY-2026-TEST",
      razorpayPaymentId: "pay_test123456",
      status: "paid",
    },
    receiptPdf: pdf,
  });

  assert.equal(result.sent, true);
  assert.equal(sentMessages[0].subject, "Payment received — Mentorship");
  assert.equal(sentMessages[0].attachments[0].filename, "receipt-GKY-2026-TEST.pdf");
  assert.equal(sentMessages[0].attachments[0].content, pdf);
  assert.equal(sentMessages[0].attachments[0].contentType, "application/pdf");
  assert.ok(sentMessages[0].text && sentMessages[0].html);
});

test("payment receipt email is refused unless the transaction is paid", async () => {
  const result = await email.sendPaymentReceiptEmail({
    transaction: { status: "pending" },
    receiptPdf: Buffer.from("%PDF-test-receipt"),
  });
  assert.deepEqual(result, { sent: false, skipped: true, reason: "payment_not_paid" });
  assert.equal(sentMessages.length, 0);
});

test("support payment email uses contribution wording and attaches one PDF", async () => {
  const pdf = Buffer.from("%PDF-support-receipt");
  const result = await email.sendPaymentReceiptEmail({
    transaction: {
      _id: "support-transaction-1",
      flowType: "support",
      customerName: "Test Supporter",
      email: "supporter@example.test",
      serviceName: "Support Contribution",
      amount: 199,
      receiptNumber: "GKY-2026-SUPPORT",
      razorpayPaymentId: "pay_support123456",
      status: "paid",
    },
    receiptPdf: pdf,
  });

  assert.equal(result.sent, true);
  assert.equal(sentMessages.length, 1);
  assert.match(sentMessages[0].subject, /Thanks for the support/);
  assert.match(sentMessages[0].text, /attached the receipt/i);
  assert.match(sentMessages[0].text, /Thank you for supporting my work/i);
  assert.equal(sentMessages[0].attachments[0].content, pdf);
});

test("shared email shell escapes dynamic customer fields", () => {
  const html = email._test.buildEmailShell({
    preheader: '<script>alert("preheader")</script>',
    heading: '<img src=x onerror=alert("heading")>',
    intro: '<b>unsafe intro</b>',
    bodyParagraphs: ['<a href="javascript:alert(1)">unsafe</a>'],
    detailRows: [{ label: '<script>label</script>', value: '<svg onload=alert(1)>' }],
    actionLabel: '<b>Open</b>',
    actionHref: 'https://example.test/?q=<unsafe>',
    footer: '<script>footer</script>',
  });

  assert.doesNotMatch(html, /<script>|<img src=x|<svg onload/);
  assert.match(html, /&lt;script&gt;/);
  assert.match(html, /&lt;b&gt;unsafe intro&lt;\/b&gt;/);
});

test("admin payment notification uses the shared SMTP sender", async () => {
  const result = await email.sendAdminPaymentEmail({
    transaction: {
      _id: "transaction-1",
      customerName: "Test Customer",
      serviceName: "Mentorship",
      amount: 49,
      receiptNumber: "GKY-2026-TEST",
      razorpayPaymentId: "pay_test123456",
      preferredDate: new Date("2026-10-10T00:00:00.000Z"),
      preferredTime: "10:00",
      status: "paid",
    },
  });

  assert.equal(result.sent, true);
  assert.match(sentMessages[0].subject, /New paid booking/);
  assert.equal(sentMessages[0].to[0].address, "admin@example.test");
});

test("support admin notification omits booking schedule fields", async () => {
  const result = await email.sendAdminPaymentEmail({
    transaction: {
      _id: "support-transaction-1",
      flowType: "support",
      customerName: "Test Supporter",
      serviceName: "Support Contribution",
      amount: 199,
      receiptNumber: "GKY-2026-SUPPORT",
      razorpayPaymentId: "pay_support123456",
      status: "paid",
    },
  });

  assert.equal(result.sent, true);
  assert.match(sentMessages[0].subject, /New support payment/);
  assert.doesNotMatch(sentMessages[0].text, /Preferred date|Preferred time/);
});

test("failed and pending transactions send no customer or admin success email", async () => {
  for (const status of ["failed", "pending"]) {
    const transaction = { status, email: "customer@example.test" };
    const customer = await email.sendPaymentReceiptEmail({
      transaction,
      receiptPdf: Buffer.from("%PDF-test"),
    });
    const admin = await email.sendAdminPaymentEmail({ transaction });
    assert.equal(customer.reason, "payment_not_paid");
    assert.equal(admin.reason, "payment_not_paid");
  }
  assert.equal(sentMessages.length, 0);
});

test("generic API accepts text/html aliases and central sender/reply-to", async () => {
  await email.sendTransactionalEmail({
    to: "alias@example.test",
    subject: "Alias fields",
    text: "Plain alias",
    html: "<p>HTML alias</p>",
  });
  assert.equal(sentMessages[0].text, "Plain alias");
  assert.equal(sentMessages[0].html, "<p>HTML alias</p>");
  assert.equal(sentMessages[0].from.address, email._test.getEmailConfig().senderEmail);
  assert.equal(sentMessages[0].replyTo.address, email._test.getEmailConfig().replyToEmail);
});

test("SMTP verification uses the existing transporter", async () => {
  const result = await email.verifyEmailTransport();
  assert.deepEqual(result, { verified: true, skipped: false });
});

test("SMTP failures return safe diagnostic fields", async () => {
  email._test.setTransporter({
    sendMail: async () => {
      const error = new Error("Authentication failed");
      error.code = "EAUTH";
      error.responseCode = 535;
      error.command = "AUTH PLAIN";
      error.response = "535 smtp-login@example.test rejected smtp-test-key";
      throw error;
    },
  });

  const result = await email.sendTransactionalEmail({
    to: "user@example.test",
    subject: "Failure test",
    textContent: "Test",
  });
  assert.equal(result.sent, false);
  assert.equal(result.reason, "smtp_error");
  assert.deepEqual(result.error, {
    message: "Authentication failed",
    code: "EAUTH",
    responseCode: 535,
    command: "AUTH PLAIN",
    response: "535 [REDACTED] rejected [REDACTED]",
  });
  assert.doesNotMatch(JSON.stringify(result), /smtp-test-key/);
});
