const pino = require("pino");
const pinoHttp = require("pino-http");
const { randomUUID } = require("node:crypto");

const isProd = process.env.NODE_ENV === "production";
const REDACTED = "[REDACTED]";
const SENSITIVE_KEY_PATTERN = /(?:admin[_-]?key|api[_-]?secret|auth[_-]?jwt|authorization|cookie|credential|key[_-]?secret|mongodb[_-]?uri|pass(?:word)?|smtp[_-]?pass|token|webhook[_-]?secret)/i;
const SECRET_ENV_KEYS = [
  "ADMIN_KEY",
  "AUTH_JWT_SECRET",
  "MONGODB_URI",
  "BREVO_SMTP_PASS",
  "RAZORPAY_KEY_SECRET",
  "RAZORPAY_WEBHOOK_SECRET",
  "CLOUDINARY_API_SECRET",
];

const redactStringSecrets = (value) =>
  SECRET_ENV_KEYS.reduce((result, key) => {
    const secret = String(process.env[key] || "");
    return secret.length >= 6 ? result.split(secret).join(REDACTED) : result;
  }, String(value));

const redactSensitiveData = (value, seen = new WeakSet()) => {
  if (typeof value === "string") return redactStringSecrets(value);
  if (!value || typeof value !== "object") return value;
  if (seen.has(value)) return "[Circular]";
  seen.add(value);

  if (Array.isArray(value)) {
    return value.map((item) => redactSensitiveData(item, seen));
  }

  return Object.fromEntries(
    Object.entries(value).map(([key, nestedValue]) => [
      key,
      SENSITIVE_KEY_PATTERN.test(key) ? REDACTED : redactSensitiveData(nestedValue, seen),
    ])
  );
};

const logger = pino({
  level: process.env.LOG_LEVEL || (isProd ? "info" : "debug"),
  redact: {
    paths: [
      "req.headers.authorization",
      "req.headers.cookie",
      "req.headers['x-admin-key']",
      "headers.authorization",
      "headers.cookie",
      "headers['x-admin-key']",
    ],
    censor: REDACTED,
  },
  transport: isProd
    ? undefined
    : {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "SYS:standard",
          ignore: "pid,hostname",
        },
      },
  base: {
    service: "portfolio-backend",
    env: process.env.NODE_ENV || "development",
  },
  serializers: {
    err(error) {
      return redactSensitiveData(pino.stdSerializers.err(error));
    },
  },
});

const requestLogger = pinoHttp({
  logger,
  genReqId: (req, res) => {
    const existing = req.headers["x-request-id"];
    const reqId = existing || randomUUID();
    res.setHeader("x-request-id", reqId);
    return reqId;
  },
  customLogLevel: (req, res, err) => {
    if (err || res.statusCode >= 500) return "error";
    if (res.statusCode >= 400) return "warn";
    return "info";
  },
  serializers: {
    req(req) {
      return {
        id: req.id,
        method: req.method,
        url: req.url,
      };
    },
    res(res) {
      return {
        statusCode: res.statusCode,
      };
    },
  },
});

module.exports = {
  logger,
  redactSensitiveData,
  redactStringSecrets,
  requestLogger,
};
