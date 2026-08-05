const { telemetryService } = require("../telemetry/telemetryService");
const { ingestionService } = require("../services/ingestionService");
const { logger } = require("../utils/logger");

/**
 * GET /api/ai/health — Internal Developer System Health Snapshot
 */
exports.handleGetAIHealth = async (req, res) => {
  try {
    ingestionService.initialize();
    const docs = ingestionService.getDocuments();
    const chunks = ingestionService.getChunks();
    const telemetry = telemetryService.getTelemetrySnapshot();

    return res.status(200).json({
      success: true,
      status: "healthy",
      timestamp: new Date().toISOString(),
      knowledge: {
        totalDocuments: docs.length,
        totalChunks: chunks.length,
        embeddingModel: "text-embedding-004",
        vectorStore: "In-Memory Cosine Store",
      },
      telemetry: telemetry.metrics,
      weakRetrievals: telemetry.weakRetrievals,
      pricing: telemetry.pricingModels,
    });
  } catch (err) {
    logger.error({ err }, "Failed to fetch AI health snapshot");
    return res.status(500).json({
      success: false,
      status: "degraded",
      error: err.message,
    });
  }
};

/**
 * POST /api/ai/admin/rebuild — Force Re-index Knowledge Embeddings
 */
exports.handleRebuildEmbeddings = async (req, res) => {
  try {
    ingestionService.isInitialized = false;
    ingestionService.initialize();
    const chunks = ingestionService.getChunks();

    logger.info({ chunkCount: chunks.length }, "Knowledge embeddings re-indexed");

    return res.status(200).json({
      success: true,
      message: "Knowledge embeddings successfully rebuilt.",
      reindexedChunks: chunks.length,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    logger.error({ err }, "Failed to rebuild embeddings");
    return res.status(500).json({
      success: false,
      error: "Failed to rebuild knowledge embeddings.",
    });
  }
};
