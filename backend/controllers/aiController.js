const { processAIChat, processAIChatStream } = require("../services/aiService");
const { logger } = require("../utils/logger");

/**
 * Controller handler for POST /api/ai/chat
 */
exports.handleAIChat = async (req, res) => {
  const reqLogger = req.log || logger;
  const startTime = Date.now();

  try {
    const message = String(req.body?.message || "").trim();
    const sessionId = String(
      req.headers["x-session-id"] || req.body?.sessionId || `session-${Date.now()}`
    ).trim();
    const history = Array.isArray(req.body?.history) ? req.body.history : [];

    if (!message) {
      return res.status(400).json({
        success: false,
        error: {
          code: "INVALID_REQUEST",
          message: "Message parameter is required and cannot be empty.",
        },
      });
    }

    if (message.length > 1000) {
      return res.status(400).json({
        success: false,
        error: {
          code: "MESSAGE_TOO_LONG",
          message: "Message exceeds maximum allowed length of 1000 characters.",
        },
      });
    }

    const result = await processAIChat({ message, sessionId, history });

    reqLogger.info(
      {
        sessionId,
        provider: result.provider,
        degraded: result.degraded,
        sourcesCount: result.sources.length,
        latencyMs: result.latencyMs,
      },
      "AI Chat request processed successfully"
    );

    return res.status(200).json(result);
  } catch (err) {
    const latencyMs = Date.now() - startTime;
    reqLogger.error({ err, latencyMs }, "AI Chat controller execution failed");

    const statusCode = err.code === "INVALID_REQUEST" ? 400 : 500;
    const errorCode = err.code || "AI_PROVIDER_ERROR";
    const errorMessage =
      process.env.NODE_ENV === "production" && statusCode === 500
        ? "An internal error occurred while processing your AI request."
        : err.message || "Failed to generate AI response.";

    return res.status(statusCode).json({
      success: false,
      error: {
        code: errorCode,
        message: errorMessage,
      },
    });
  }
};

/**
 * Controller handler for SSE streaming POST /api/ai/stream
 */
exports.handleAIChatStream = async (req, res) => {
  try {
    const message = String(req.body?.message || req.query?.message || "").trim();
    const sessionId = String(
      req.headers["x-session-id"] || req.body?.sessionId || req.query?.sessionId || `session-${Date.now()}`
    ).trim();
    const history = Array.isArray(req.body?.history) ? req.body.history : [];

    await processAIChatStream(res, { message, sessionId, history });
  } catch (err) {
    logger.error({ err }, "AI Chat stream execution failed");
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        error: { code: "STREAM_ERROR", message: "Failed to stream AI response." },
      });
    }
  }
};
