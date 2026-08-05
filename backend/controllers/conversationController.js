const { conversationService } = require("../services/conversationService");

/**
 * Initialize or get conversation session.
 */
async function handleInitConversation(req, res) {
  try {
    const { conversationId, visitorId, sessionId, currentPage, browser, device, userAgent } = req.body || {};
    const cid = conversationId || `conv_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

    const conversation = await conversationService.getOrCreateConversation(cid, {
      visitorId,
      sessionId,
      currentPage,
      browser,
      device,
      userAgent,
    });

    return res.status(200).json({
      success: true,
      conversationId: cid,
      conversation,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * Fetch conversation history for replay.
 */
async function handleGetConversation(req, res) {
  try {
    const { conversationId } = req.params;
    const history = await conversationService.getConversationHistory(conversationId);
    return res.status(200).json({
      success: true,
      conversationId,
      messages: history,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * Mark conversation as ended.
 */
async function handleEndConversation(req, res) {
  try {
    const { conversationId } = req.params;
    const updated = await conversationService.endConversation(conversationId);
    return res.status(200).json({
      success: true,
      conversationId,
      status: "ended",
      conversation: updated,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

module.exports = {
  handleInitConversation,
  handleGetConversation,
  handleEndConversation,
};
