require("dotenv").config();

const {
  isEmailConfigured,
  sendTransactionalEmail,
  verifyEmailTransport,
  _test: { getEmailConfig },
} = require("../utils/email");

const normalize = (value) => String(value || "").trim();

const maskEmail = (email) => {
  const [local, domain] = normalize(email).split("@");
  if (!local || !domain) return "not configured";
  return `${local.slice(0, 2)}***@${domain}`;
};

const formatSafeError = (error) => {
  const parts = [normalize(error?.code), Number(error?.responseCode) || "", normalize(error?.message)]
    .filter(Boolean)
    .map((value) => String(value).slice(0, 200));
  return parts.join(" | ") || "Unknown SMTP error";
};

const printSafeConfiguration = () => {
  const config = getEmailConfig();
  console.log(`Email enabled: ${config.enabled ? "yes" : "no"}`);
  console.log(`SMTP host configured: ${config.host ? "yes" : "no"}`);
  console.log(`SMTP user configured: ${config.user ? "yes" : "no"}`);
  console.log(`SMTP key configured: ${config.pass ? "yes" : "no"}`);
  console.log(`Sender configured: ${config.senderEmail ? "yes" : "no"}`);
};

const run = async () => {
  const recipient = normalize(process.env.TEST_EMAIL_TO).toLowerCase();
  printSafeConfiguration();
  console.log(`Test recipient: ${maskEmail(recipient)}`);

  if (!recipient || !isEmailConfigured()) {
    console.error("SMTP configuration: FAIL (complete the missing backend-only values)");
    process.exitCode = 1;
    return;
  }

  console.log("SMTP configuration found");
  const verification = await verifyEmailTransport();
  if (!verification.verified) {
    console.error(`SMTP connection: FAIL (${formatSafeError(verification.error)})`);
    process.exitCode = 1;
    return;
  }
  console.log("SMTP connection: PASS");

  const text = [
    "Hi,",
    "",
    "This is a test email from the Dev Portfolio transactional email system.",
    "",
    "NodeMailer:",
    "Working",
    "",
    "Brevo SMTP:",
    "Working",
    "",
    "Sender:",
    "Gaurav Kumar Yadav",
    "",
    "If you received this message, SMTP delivery is configured correctly.",
    "",
    "Thanks,",
    "Gaurav Kumar Yadav",
  ].join("\n");

  const result = await sendTransactionalEmail({
    to: recipient,
    subject: "Dev Portfolio — SMTP Test Successful",
    text,
    html: `<p>Hi,</p><p>This is a test email from the Dev Portfolio transactional email system.</p><p><strong>NodeMailer:</strong> Working<br /><strong>Brevo SMTP:</strong> Working<br /><strong>Sender:</strong> Gaurav Kumar Yadav</p><p>If you received this message, SMTP delivery is configured correctly.</p><p>Thanks,<br />Gaurav Kumar Yadav</p>`,
    idempotencyKey: `smtp-test-${Date.now()}`,
    headers: { "X-Email-Test": "smtp" },
  });

  if (!result.sent) {
    console.error(`Email delivery: FAIL (${formatSafeError(result.error)})`);
    process.exitCode = 1;
    return;
  }

  console.log("Email delivery: PASS");
  console.log(`Message ID: ${result.messageId || "not returned"}`);
};

run().catch((error) => {
  console.error(`Email test failed: ${formatSafeError(error)}`);
  process.exitCode = 1;
});
