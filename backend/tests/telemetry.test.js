const { test, describe, beforeEach } = require("node:test");
const assert = require("node:assert");
const { telemetryService } = require("../telemetry/telemetryService");

describe("Phase 8 — Telemetry, Cost & Observability Test Suite", () => {
  beforeEach(() => {
    telemetryService.reset();
  });

  test("1. calculateCost computes correct USD estimates", () => {
    // 1000 prompt tokens ($0.000075) + 1000 completion tokens ($0.0003) = $0.000375
    const cost = telemetryService.calculateCost(1000, 1000, 0);
    assert.strictEqual(cost, 0.000375);
  });

  test("2. recordQuery accumulates latency, tokens, and cost metrics", () => {
    telemetryService.recordQuery({
      latencyMs: 300,
      promptTokens: 500,
      completionTokens: 200,
      confidenceScore: 0.85,
      query: "What is TaskNexus?",
      success: true,
    });

    const snapshot = telemetryService.getTelemetrySnapshot();
    assert.strictEqual(snapshot.metrics.totalQueries, 1);
    assert.strictEqual(snapshot.metrics.successfulQueries, 1);
    assert.strictEqual(snapshot.metrics.averageLatencyMs, 300);
    assert.ok(snapshot.metrics.totalCostUSD > 0);
  });

  test("3. recordQuery flags weak retrievals (< 0.4 confidence)", () => {
    telemetryService.recordQuery({
      latencyMs: 250,
      promptTokens: 100,
      completionTokens: 50,
      confidenceScore: 0.25,
      query: "Uncertain question?",
      success: true,
    });

    const snapshot = telemetryService.getTelemetrySnapshot();
    assert.strictEqual(snapshot.metrics.weakRetrievalsCount, 1);
    assert.strictEqual(snapshot.weakRetrievals.length, 1);
    assert.strictEqual(snapshot.weakRetrievals[0].query, "Uncertain question?");
  });

  test("4. recordFeedback records anonymous feedback submission", () => {
    const entry = telemetryService.recordFeedback({
      rating: "helpful",
      issueType: "general",
      message: "Great response!",
      query: "Tell me about Gaurav",
    });

    assert.ok(entry.feedbackId.startsWith("fb_"));
    assert.strictEqual(entry.rating, "helpful");

    const snapshot = telemetryService.getTelemetrySnapshot();
    assert.strictEqual(snapshot.feedbackLogsCount, 1);
  });
});
