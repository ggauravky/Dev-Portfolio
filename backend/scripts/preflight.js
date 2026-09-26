const path = require("node:path");

require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const { validateEnvironment } = require("../config/env");

const checks = [];
const record = (label, passed, detail = "") => {
  checks.push({ label, passed, detail });
};

const isSupportedNodeVersion = (version) => {
  const [major, minor] = String(version || "")
    .split(".")
    .map((part) => Number.parseInt(part, 10));
  if (major === 20) return minor >= 19;
  if (major === 22) return minor >= 12;
  if (major === 23) return minor >= 2;
  return major > 23;
};

console.log("Production preflight\n");

let report;
try {
  report = validateEnvironment({ strict: true, environment: "production" });
  record("Environment validation", true);
} catch (error) {
  report = error?.details;
  const issueKeys = [...(report?.missingKeys || []), ...(report?.invalidKeys || [])];
  record(
    "Environment validation",
    false,
    issueKeys.length ? `check: ${[...new Set(issueKeys)].sort().join(", ")}` : "configuration invalid"
  );
}

const flags = report?.flags || {};
record("Google Auth config", Boolean(flags.authConfigured));
record("Session config", Boolean(flags.authConfigured));
record(
  "Razorpay config",
  !flags.razorpayEnabled || ["test", "live"].includes(flags.razorpayMode),
  flags.razorpayEnabled ? `mode: ${flags.razorpayMode}` : "disabled"
);
record(
  "SMTP config",
  !flags.emailEnabled || Boolean(flags.emailConfigured),
  flags.emailEnabled ? "enabled" : "disabled"
);
record(
  "Cloudinary config",
  true,
  flags.cloudinaryConfigured ? "configured" : "optional, not configured"
);
record("Admin route config", Boolean(flags.adminConfigured));
record("Node.js compatibility", isSupportedNodeVersion(process.versions.node));

try {
  [
    "../config/trustedOrigins",
    "../utils/authSession",
    "../services/payment/razorpayGateway",
    "../utils/email",
    "../services/auth/avatarService",
  ].forEach((modulePath) => require(modulePath));
  record("Required modules", true);
} catch {
  record("Required modules", false, "module load failed");
}

const labelWidth = Math.max(...checks.map(({ label }) => label.length)) + 2;
for (const check of checks) {
  const state = check.passed ? "PASS" : "FAIL";
  console.log(`${check.label.padEnd(labelWidth)}${state}${check.detail ? ` (${check.detail})` : ""}`);
}

if (checks.some(({ passed }) => !passed)) {
  process.exitCode = 1;
}
