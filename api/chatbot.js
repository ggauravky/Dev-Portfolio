import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const {
  chatbot,
  chatbotPrivacyPolicy,
} = require("../backend/controllers/chatbotController");

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = Number.parseInt(process.env.CHAT_RATE_LIMIT_MAX || "20", 10);
const buckets = new Map();

const cleanupBuckets = () => {
  const now = Date.now();
  for (const [key, timestamps] of buckets.entries()) {
    const active = timestamps.filter((timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS);
    if (active.length === 0) {
      buckets.delete(key);
    } else {
      buckets.set(key, active);
    }
  }
};

const getIpKey = (req) =>
  String(
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
      req.headers["x-real-ip"] ||
      "unknown"
  );

const isRateLimited = (req) => {
  cleanupBuckets();
  const key = getIpKey(req);
  const now = Date.now();
  const timestamps = buckets.get(key) || [];
  const active = timestamps.filter((timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS);

  if (active.length >= RATE_LIMIT_MAX) {
    buckets.set(key, active);
    return true;
  }

  active.push(now);
  buckets.set(key, active);
  return false;
};

const validateBody = (req, res) => {
  const message = String(req.body?.message || "").trim();
  if (!message) {
    res.status(400).json({
      success: false,
      reply: "Message cannot be empty.",
    });
    return false;
  }

  if (message.length > 1000) {
    res.status(400).json({
      success: false,
      reply: "Message must be 1000 characters or less.",
    });
    return false;
  }

  return true;
};

export default async function handler(req, res) {
  if (req.method === "GET") {
    return chatbotPrivacyPolicy(req, res);
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed",
    });
  }

  if (isRateLimited(req)) {
    return res.status(429).json({
      success: false,
      reply: "Too many messages sent. Please slow down and try again in a few minutes.",
    });
  }

  if (!validateBody(req, res)) {
    return undefined;
  }

  return chatbot(req, res);
}
