const normalizeOrigin = (value) => {
  const candidate = String(value || "").trim();
  if (!candidate) return "";

  try {
    return new URL(candidate).origin;
  } catch {
    return "";
  }
};

const getTrustedOrigins = () => {
  const configuredOrigins = [
    process.env.FRONTEND_URL,
    ...String(process.env.AUTH_ALLOWED_ORIGINS || "").split(","),
  ];

  if (process.env.NODE_ENV !== "production") {
    configuredOrigins.push(
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:3000",
      "http://127.0.0.1:5173"
    );
  }

  return [...new Set(configuredOrigins.map(normalizeOrigin).filter(Boolean))];
};

const isTrustedOrigin = (origin) => {
  const normalizedOrigin = normalizeOrigin(origin);
  return Boolean(normalizedOrigin && getTrustedOrigins().includes(normalizedOrigin));
};

const corsOrigin = (origin, callback) => {
  if (!origin || isTrustedOrigin(origin)) {
    callback(null, true);
    return;
  }

  const error = new Error("Origin is not allowed by CORS");
  error.status = 403;
  callback(error);
};

const requireTrustedOrigin = (req, res, next) => {
  const origin = req.get("origin");

  if (!origin) {
    if (process.env.NODE_ENV === "production") {
      return res.status(403).json({
        success: false,
        message: "Request origin is required",
      });
    }

    return next();
  }

  if (!isTrustedOrigin(origin)) {
    return res.status(403).json({
      success: false,
      message: "Request origin is not allowed",
    });
  }

  return next();
};

module.exports = {
  corsOrigin,
  getTrustedOrigins,
  isTrustedOrigin,
  normalizeOrigin,
  requireTrustedOrigin,
};
