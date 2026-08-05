const { telemetryService } = require("../telemetry/telemetryService");
const { logger } = require("../utils/logger");

/**
 * Handle user response feedback (POST /api/ai/feedback).
 */
exports.handleAIFeedback = async (req, res) => {
  try {
    const { rating, issueType, message, query } = req.body || {};

    if (!rating || !["helpful", "not_helpful", "report_issue"].includes(rating)) {
      return res.status(400).json({
        success: false,
        error: {
          code: "INVALID_RATING",
          message: "Rating parameter must be 'helpful', 'not_helpful', or 'report_issue'.",
        },
      });
    }

    const entry = telemetryService.recordFeedback({
      rating,
      issueType,
      message,
      query,
    });

    logger.info({ rating, issueType }, "AI Feedback recorded");

    return res.status(200).json({
      success: true,
      message: "Feedback recorded successfully.",
      feedbackId: entry.feedbackId,
    });
  } catch (err) {
    logger.error({ err }, "Failed to process AI feedback");
    return res.status(500).json({
      success: false,
      error: { code: "FEEDBACK_ERROR", message: "Internal error processing feedback." },
    });
  }
};
