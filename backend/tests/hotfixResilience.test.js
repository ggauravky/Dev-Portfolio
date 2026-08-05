const { test, describe } = require("node:test");
const assert = require("node:assert");
const { processAIChat } = require("../services/aiService");

describe("Hotfix — Rate Limit & Resilience Test Suite", () => {
  test("1. Identical queries utilize In-Memory Response Cache", async () => {
    const query = "What core technologies does Gaurav use?";

    const res1 = await processAIChat({ message: query });
    assert.strictEqual(res1.success, true);
    assert.ok(res1.reply.length > 10);

    const res2 = await processAIChat({ message: query });
    assert.strictEqual(res2.success, true);
    assert.strictEqual(res2.provider, "cache-hit");
  });

  test("2. Grounded RAG Fallback synthesizes context without rate limit errors", async () => {
    const query = "Tell me about TaskNexus project";
    const res = await processAIChat({ message: query });

    assert.strictEqual(res.success, true);
    assert.ok(!res.reply.includes("high volume of requests"));
    assert.ok(!res.reply.includes("hit my rate limit"));
  });
});
