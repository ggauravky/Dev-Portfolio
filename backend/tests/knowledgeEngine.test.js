const { test, describe } = require("node:test");
const assert = require("node:assert");
const { livingKnowledgeService } = require("../services/livingKnowledgeService");

describe("Phase 9 — Living Knowledge Engine Test Suite", () => {
  test("1. livingKnowledgeService runs incremental ingestion and quality audit", () => {
    const res = livingKnowledgeService.runIncrementalIngestion();
    assert.strictEqual(res.status, "synced");
    assert.ok(res.processedDocuments > 0);
    assert.ok(res.qualityReport.qualityScore >= 80);
  });

  test("2. livingKnowledgeService logs knowledge changelogs", () => {
    const entry = livingKnowledgeService.logChangelog("ADD_PROJECT", "Added InstaX social app");
    assert.ok(entry.id.startsWith("change_"));
    assert.strictEqual(entry.action, "ADD_PROJECT");
  });
});
