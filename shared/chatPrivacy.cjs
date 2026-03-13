const crypto = require("node:crypto");

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const RETENTION_DAYS = clamp(
  Number.parseInt(process.env.CHATLOG_RETENTION_DAYS || "60", 10) || 60,
  30,
  90
);

const RETENTION_SECONDS = RETENTION_DAYS * 24 * 60 * 60;

const HASH_SALT =
  process.env.CHAT_HASH_SALT ||
  process.env.CHAT_IP_SALT ||
  "dev-chat-hash-salt-change-in-production";

function hashValue(input) {
  return crypto
    .createHash("sha256")
    .update(`${HASH_SALT}:${String(input || "unknown")}`)
    .digest("hex");
}

function buildPrivacySafeMeta(meta) {
  return {
    ipHash: hashValue(meta.ipAddress || "unknown"),
    userAgentHash: hashValue(meta.userAgent || "unknown"),
    ipAddress: "redacted",
    userAgent: "redacted",
    country: meta.country || "unknown",
    countryCode: meta.countryCode || "unknown",
    city: "redacted",
    region: "redacted",
    timezone: "redacted",
  };
}

function getRetentionPolicy() {
  return {
    version: "2026-03-13",
    summary:
      "Chat analytics store hashed network identifiers and auto-expire documents using a TTL retention window.",
    retentionDays: RETENTION_DAYS,
    storage: {
      ipAddress: "not stored in raw form",
      userAgent: "not stored in raw form",
      ipHash: "SHA-256 salted hash",
      userAgentHash: "SHA-256 salted hash",
      location: "country-level retained; city/region/timezone redacted",
    },
  };
}

module.exports = {
  RETENTION_DAYS,
  RETENTION_SECONDS,
  buildPrivacySafeMeta,
  getRetentionPolicy,
};
