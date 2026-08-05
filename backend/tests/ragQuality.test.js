const { test, describe } = require("node:test");
const assert = require("node:assert");
const { processAIChat } = require("../services/aiService");

describe("Phase 13 — RAG Quality & Precision Test Suite", () => {
  test("1. Specific entity query (SmartMess) returns ONLY SmartMess context", async () => {
    const query = "Tell me about SmartMess";
    const res = await processAIChat({ message: query });

    assert.strictEqual(res.success, true);
    assert.ok(res.sources.length <= 3);

    // Verify sources contain SmartMess and NOT unrelated projects
    const titles = res.sources.map((s) => s.title.toLowerCase());
    for (const title of titles) {
      assert.ok(title.includes("smartmess") || title.includes("project"));
      assert.ok(!title.includes("chatbot"));
    }
  });

  test("2. Answers contain ZERO raw metadata key leakage", async () => {
    const query = "Tell me about Gaurav's skills";
    const res = await processAIChat({ message: query });

    assert.strictEqual(res.success, true);
    assert.ok(!res.reply.includes("identity:"));
    assert.ok(!res.reply.includes("tone:"));
    assert.ok(!res.reply.includes("workStyle:"));
  });

  test("3. Precision chunk trimming caps candidate sources at 3", async () => {
    const query = "What MERN projects has Gaurav built?";
    const res = await processAIChat({ message: query });

    assert.strictEqual(res.success, true);
    assert.ok(res.sources.length <= 3);
  });
});
