// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Unauthorized copying, modification, or distribution of this software,
// via any medium, is strictly prohibited without the express written
// consent of the author. See LICENSE for details.
// Source: https://github.com/ggauravky/Dev-Portfolio

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

  const provided = req.headers["x-admin-key"];

  // Constant-time comparison to prevent timing attacks
  if (!provided || provided.length !== adminKey.length || !constantTimeEqual(provided, adminKey)) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized.",
    });
  }

  next();
};

/**
 * Simple constant-time string comparison to mitigate timing attacks on the
 * admin key check.  Not cryptographic but sufficient for a static string match.
 */
function constantTimeEqual(a, b) {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= (a.codePointAt(i) ?? 0) ^ (b.codePointAt(i) ?? 0);
  }
  return result === 0;
}
