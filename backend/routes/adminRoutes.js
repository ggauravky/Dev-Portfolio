const express = require("express");
const router = express.Router();
const { handleGetAIHealth, handleRebuildEmbeddings } = require("../controllers/adminController");

// GET /api/ai/health
router.get("/health", handleGetAIHealth);

// POST /api/ai/admin/rebuild
router.post("/admin/rebuild", handleRebuildEmbeddings);

module.exports = router;
