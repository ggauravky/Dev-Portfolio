const path = require("node:path");
const dns = require("node:dns");
const mongoose = require("mongoose");

require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
dns.setDefaultResultOrder("ipv4first");
dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);

const PaymentTransaction = require("../models/PaymentTransaction");
const { getEmailDiagnostics } = require("../utils/email");
const { reconcilePaymentEmails } = require("../services/payment/paymentFinalizationService");
const { redactStringSecrets } = require("../utils/logger");

const args = new Set(process.argv.slice(2));
const send = args.has("--send");
const getNumericArg = (name, fallback, maximum) => {
  const raw = process.argv.slice(2).find((argument) => argument.startsWith(`${name}=`));
  const value = Number.parseInt(raw?.slice(name.length + 1), 10);
  return Number.isSafeInteger(value) && value > 0 ? Math.min(value, maximum) : fallback;
};
const days = getNumericArg("--days", 90, 365);
const limit = getNumericArg("--limit", 100, 500);

const run = async () => {
  const diagnostics = getEmailDiagnostics();
  console.log(`Mode: ${send ? "SEND" : "DRY RUN"}`);
  console.log(`Window: last ${days} days; limit: ${limit}`);

  if (send && (!diagnostics.configured || !diagnostics.paymentNotificationsEnabled)) {
    throw new Error("Transactional payment email is not structurally configured and enabled");
  }

  await mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 8000,
    socketTimeoutMS: 45000,
    maxPoolSize: 3,
    family: 4,
  });

  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const transactions = await PaymentTransaction.find({
    status: "paid",
    paidAt: { $gte: since },
    $or: [{ receiptEmailSentAt: null }, { adminEmailSentAt: null }],
  })
    .sort({ paidAt: 1 })
    .limit(limit);

  console.log(`Paid transactions missing one or more emails: ${transactions.length}`);
  let processed = 0;
  for (const transaction of transactions) {
    const missing = [
      !transaction.receiptEmailSentAt ? "customer" : "",
      !transaction.adminEmailSentAt ? "admin" : "",
    ].filter(Boolean);
    console.log(`${send ? "Retrying" : "Would retry"}: ${transaction._id} (${missing.join(", ")})`);
    if (send) {
      await reconcilePaymentEmails(transaction);
      processed += 1;
    }
  }
  console.log(send ? `Reconciliation attempted: ${processed}` : "No email was sent. Use --send explicitly to deliver.");
};

run()
  .catch((error) => {
    console.error(`Reconciliation failed: ${redactStringSecrets(error?.message || "unknown error").slice(0, 200)}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect().catch(() => undefined);
  });
