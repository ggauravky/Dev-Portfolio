const express = require("express");
const router = express.Router();
const { handleAIFeedback } = require("../controllers/feedbackController");

// POST /api/ai/feedback
router.post("/feedback", handleAIFeedback);

module.exports = router;
