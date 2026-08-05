const express = require("express");
const router = express.Router();
const { handleAIChat, handleAIChatStream } = require("../controllers/aiController");
const { handleAIFeedback } = require("../controllers/feedbackController");
const { handleGetAIHealth, handleRebuildEmbeddings } = require("../controllers/adminController");
const { handleInitConversation, handleGetConversation, handleEndConversation } = require("../controllers/conversationController");
const { rateLimiter } = require("../middleware/rateLimiter");

// POST /api/ai/chat — Standard JSON response endpoint (rate limited)
router.post("/chat", rateLimiter, handleAIChat);

// POST /api/ai/stream — Server-Sent Events (SSE) Token Streaming endpoint (rate limited)
router.post("/stream", rateLimiter, handleAIChatStream);
router.get("/stream", handleAIChatStream);

// Conversation Persistence Endpoints
router.post("/conversation", handleInitConversation);
router.get("/conversation/:conversationId", handleGetConversation);
router.patch("/conversation/end/:conversationId", handleEndConversation);

// POST /api/ai/feedback — Response Quality Feedback endpoint
router.post("/feedback", handleAIFeedback);

// GET /api/ai/health — Internal Developer System Health Snapshot
router.get("/health", handleGetAIHealth);

// POST /api/ai/admin/rebuild — Force Re-index Knowledge Embeddings
router.post("/admin/rebuild", handleRebuildEmbeddings);

// GET /api/ai/chat — Basic Status Check
router.get("/chat", (req, res) => {
  res.status(200).json({
    success: true,
    message: "AI Chat API endpoint is active.",
    provider: process.env.AI_PROVIDER || "gemini",
    model: process.env.GEMINI_MODEL || "gemini-2.0-flash-lite",
  });
});

module.exports = router;
