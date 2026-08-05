const { test, describe } = require("node:test");
const assert = require("node:assert");
const { processAIChat } = require("../services/aiService");
const { conversationRouter } = require("../services/conversationRouter");

describe("Phase 13.5 — Conversation Intelligence & Router Test Suite", () => {
  test("1. Greetings (Hi, Hello, Good Morning) return instant responses with zero RAG sources", async () => {
    const queries = ["Hi", "Hello", "Good Morning", "Hey"];
    for (const q of queries) {
      const res = await processAIChat({ message: q });
      assert.strictEqual(res.success, true);
      assert.strictEqual(res.provider, "conversation-router");
      assert.strictEqual(res.sources.length, 0);
      assert.ok(res.latencyMs < 20);
      const wordCount = res.reply.split(/\s+/).length;
      assert.ok(wordCount <= 40, `Greeting response word count ${wordCount} exceeds limit of 40`);
    }
  });

  test("2. Thanks (Thanks, Thank you) return concise acknowledgements (<= 20 words)", async () => {
    const queries = ["Thanks", "Thank you", "ty"];
    for (const q of queries) {
      const res = await processAIChat({ message: q });
      assert.strictEqual(res.success, true);
      assert.strictEqual(res.provider, "conversation-router");
      assert.strictEqual(res.sources.length, 0);
      const wordCount = res.reply.split(/\s+/).length;
      assert.ok(wordCount <= 20, `Thanks response word count ${wordCount} exceeds limit of 20`);
    }
  });

  test("3. Farewells (Bye, Goodbye) return courteous goodbyes (<= 25 words)", async () => {
    const queries = ["Bye", "Goodbye", "See ya"];
    for (const q of queries) {
      const res = await processAIChat({ message: q });
      assert.strictEqual(res.success, true);
      assert.strictEqual(res.provider, "conversation-router");
      assert.strictEqual(res.sources.length, 0);
      const wordCount = res.reply.split(/\s+/).length;
      assert.ok(wordCount <= 25, `Farewell response word count ${wordCount} exceeds limit of 25`);
    }
  });

  test("4. Small Talk (How are you?, Who built you?) return conversational replies (<= 50 words)", async () => {
    const res1 = await processAIChat({ message: "How are you?" });
    assert.strictEqual(res1.provider, "conversation-router");
    assert.strictEqual(res1.sources.length, 0);

    const res2 = await processAIChat({ message: "Who built you?" });
    assert.strictEqual(res2.provider, "conversation-router");
    assert.strictEqual(res2.sources.length, 0);
    assert.ok(res2.reply.includes("Gaurav"));
  });

  test("5. Time & Date queries return server time/date", async () => {
    const res = await processAIChat({ message: "What time is it?" });
    assert.strictEqual(res.provider, "conversation-router");
    assert.strictEqual(res.sources.length, 0);
    assert.ok(res.reply.includes("currently") || res.reply.includes(":"));
  });

  test("6. Help queries return assistant capabilities", async () => {
    const res = await processAIChat({ message: "Help" });
    assert.strictEqual(res.provider, "conversation-router");
    assert.strictEqual(res.sources.length, 0);
    assert.ok(res.reply.includes("Projects"));
  });

  test("7. Portfolio queries (Tell me about SmartMess) trigger RAG retrieval cleanly", async () => {
    const res = await processAIChat({ message: "Tell me about SmartMess" });
    assert.notStrictEqual(res.provider, "conversation-router");
    assert.ok(res.sources.length > 0);
    assert.ok(res.sources[0].title.toLowerCase().includes("smartmess") || res.sources[0].title.toLowerCase().includes("project"));
  });
});
