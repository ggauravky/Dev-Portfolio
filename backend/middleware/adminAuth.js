// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Unauthorized copying, modification, or distribution of this software,
// via any medium, is strictly prohibited without the express written
// consent of the author. See LICENSE for details.
// Source: https://github.com/ggauravky/Dev-Portfolio

const crypto = require("node:crypto");

/**
 * Simple static API-key guard for private/admin routes.
 * Set ADMIN_KEY in your .env (backend) and pass it in the
 * `x-admin-key` request header when calling protected endpoints.
 *
 * If ADMIN_KEY is not configured the server will refuse to start
 * (logged as a warning) and all guarded routes will return 503.
 */
exports.requireAdminKey = (req, res, next) => {
  const adminKey = process.env.ADMIN_KEY;

  if (!adminKey) {
    // Misconfiguration — do not expose internal routes without a key
    return res.status(503).json({
      success: false,
      message: "Admin access is not configured on this server.",
    });
  }

  const provided = String(req.headers["x-admin-key"] || "");

  // Constant-time comparison to prevent timing attacks.
  if (!provided.length || !constantTimeEqual(provided, adminKey)) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized.",
    });
  }

  next();
};

/**
 * Constant-time string comparison using fixed-length buffers.
 */
function constantTimeEqual(a, b) {
  const left = Buffer.from(String(a || ""), "utf8");
  const right = Buffer.from(String(b || ""), "utf8");
  const maxLength = Math.max(left.length, right.length);

  if (maxLength === 0) {
    return false;
  }

  const leftPadded = Buffer.alloc(maxLength);
  const rightPadded = Buffer.alloc(maxLength);
  left.copy(leftPadded);
  right.copy(rightPadded);

  const isEqual = crypto.timingSafeEqual(leftPadded, rightPadded);
  return isEqual && left.length === right.length;
}
