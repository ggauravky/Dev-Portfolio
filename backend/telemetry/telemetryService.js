/**
 * Backend AI Telemetry, Metrics & Cost Optimization Service.
 */

// Pricing Models per 1,000 tokens
const PRICING = {
  embeddingPer1k: 0.00002,     // text-embedding-004
  inputPer1k: 0.000075,         // Gemini 2.0 Flash Lite input
  outputPer1k: 0.0003,          // Gemini 2.0 Flash Lite output
};

class TelemetryService {
  constructor() {
    this.metrics = {
      totalQueries: 0,
      successfulQueries: 0,
      failedQueries: 0,
      totalLatencyMs: 0,
      totalPromptTokens: 0,
      totalCompletionTokens: 0,
      totalCostUSD: 0,
      cacheHits: 0,
      cacheMisses: 0,
      weakRetrievalsCount: 0,
      lastQueryTimestamp: null,
    };
    this.weakRetrievals = [];
    this.feedbackLogs = [];
  }

  /**
   * Calculate USD cost based on token counts.
   */
  calculateCost(promptTokens = 0, completionTokens = 0, embeddingTokens = 0) {
    const embedCost = (embeddingTokens / 1000) * PRICING.embeddingPer1k;
    const inputCost = (promptTokens / 1000) * PRICING.inputPer1k;
    const outputCost = (completionTokens / 1000) * PRICING.outputPer1k;
    return Number((embedCost + inputCost + outputCost).toFixed(6));
  }

  /**
   * Record query telemetry metrics.
   */
  recordQuery({
    latencyMs = 0,
    promptTokens = 0,
    completionTokens = 0,
    confidenceScore = 0.5,
    query = "",
    success = true,
    cacheHit = false,
  }) {
    this.metrics.totalQueries += 1;
    this.metrics.lastQueryTimestamp = new Date().toISOString();

    if (success) {
      this.metrics.successfulQueries += 1;
    } else {
      this.metrics.failedQueries += 1;
    }

    if (cacheHit) {
      this.metrics.cacheHits += 1;
    } else {
      this.metrics.cacheMisses += 1;
    }

    this.metrics.totalLatencyMs += latencyMs;
    this.metrics.totalPromptTokens += promptTokens;
    this.metrics.totalCompletionTokens += completionTokens;

    const queryCost = this.calculateCost(promptTokens, completionTokens);
    this.metrics.totalCostUSD = Number((this.metrics.totalCostUSD + queryCost).toFixed(6));

    // Flag weak retrieval queries (< 0.4 confidence)
    if (confidenceScore < 0.4) {
      this.metrics.weakRetrievalsCount += 1;
      this.weakRetrievals.push({
        query,
        confidenceScore,
        timestamp: new Date().toISOString(),
      });
      if (this.weakRetrievals.length > 100) {
        this.weakRetrievals.shift();
      }
    }
  }

  /**
   * Log anonymous feedback entry.
   */
  recordFeedback({ rating, issueType, message, query }) {
    const feedbackEntry = {
      feedbackId: `fb_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      rating, // 'helpful' | 'not_helpful' | 'report_issue'
      issueType: issueType || 'general',
      message: message || '',
      query: query || '',
      timestamp: new Date().toISOString(),
    };
    this.feedbackLogs.push(feedbackEntry);
    return feedbackEntry;
  }

  /**
   * Get full telemetry snapshot.
   */
  getTelemetrySnapshot() {
    const avgLatency =
      this.metrics.totalQueries > 0
        ? Math.round(this.metrics.totalLatencyMs / this.metrics.totalQueries)
        : 0;

    const cacheHitRate =
      this.metrics.totalQueries > 0
        ? Number(((this.metrics.cacheHits / this.metrics.totalQueries) * 100).toFixed(1))
        : 0;

    return {
      metrics: {
        ...this.metrics,
        averageLatencyMs: avgLatency,
        cacheHitRatePercent: cacheHitRate,
      },
      weakRetrievals: [...this.weakRetrievals],
      feedbackLogsCount: this.feedbackLogs.length,
      pricingModels: PRICING,
    };
  }

  /**
   * Clear recorded telemetry.
   */
  reset() {
    this.metrics = {
      totalQueries: 0,
      successfulQueries: 0,
      failedQueries: 0,
      totalLatencyMs: 0,
      totalPromptTokens: 0,
      totalCompletionTokens: 0,
      totalCostUSD: 0,
      cacheHits: 0,
      cacheMisses: 0,
      weakRetrievalsCount: 0,
      lastQueryTimestamp: null,
    };
    this.weakRetrievals = [];
    this.feedbackLogs = [];
  }
}

const telemetryService = new TelemetryService();

module.exports = {
  telemetryService,
  PRICING,
};
