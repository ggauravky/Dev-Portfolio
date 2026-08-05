const { test, describe } = require("node:test");
const assert = require("node:assert");
const { processAIChat } = require("../services/aiService");

describe("Phase 5 — Intelligence Layer RAG & Intent Verification", () => {
  const sessionId = `test-session-${Date.now()}`;

  test("1. Query: 'Who is Gaurav?' returns profile & bio details", async () => {
    const res = await processAIChat({
      message: "Who is Gaurav?",
      sessionId,
    });

    assert.strictEqual(res.success, true);
    assert.strictEqual(res.intent, "who_is_gaurav");
    assert.ok(res.reply.length > 20);
    assert.ok(res.reply.includes("Gaurav") || res.reply.includes("BBDU"));
  });

  test("2. Query: 'What technologies has Gaurav used?' returns skills attribution", async () => {
    const res = await processAIChat({
      message: "What technologies has Gaurav used?",
      sessionId,
    });

    assert.strictEqual(res.success, true);
    assert.strictEqual(res.intent, "skills");
    assert.ok(res.sources.length > 0);
  });

  test("3. Query: 'Which projects are collaborative?' returns project details", async () => {
    const res = await processAIChat({
      message: "Which projects are collaborative?",
      sessionId,
    });

    assert.strictEqual(res.success, true);
    assert.strictEqual(res.intent, "projects");
    assert.ok(res.reply.length > 30);
  });

  test("4. Query: 'Show only AI projects' filters AI builds", async () => {
    const res = await processAIChat({
      message: "Show only AI projects",
      sessionId,
    });

    assert.strictEqual(res.success, true);
    assert.strictEqual(res.intent, "projects");
    assert.ok(res.reply.toLowerCase().includes("ai") || res.reply.includes("TaskNexus"));
  });

  test("5. Query: 'Which internship gave industrial exposure?' retrieves experience context", async () => {
    const res = await processAIChat({
      message: "Which internship gave industrial exposure?",
      sessionId,
    });

    assert.strictEqual(res.success, true);
    assert.strictEqual(res.intent, "experience");
  });

  test("6. Query: 'Summarize the Journey page' retrieves journey history", async () => {
    const res = await processAIChat({
      message: "Summarize the Journey page",
      sessionId,
    });

    assert.strictEqual(res.success, true);
    assert.ok(res.reply.length > 20);
  });

  test("7. Query: 'Recommend projects for a recruiter hiring a MERN developer'", async () => {
    const res = await processAIChat({
      message: "Recommend projects for a recruiter hiring a MERN developer",
      sessionId,
    });

    assert.strictEqual(res.success, true);
    assert.ok(res.reply.length > 30);
  });

  test("8. Query: 'Recommend projects for an AI recruiter'", async () => {
    const res = await processAIChat({
      message: "Recommend projects for an AI recruiter",
      sessionId,
    });

    assert.strictEqual(res.success, true);
    assert.ok(res.reply.length > 30);
  });

  test("9. Query: 'Which blogs explain RAG?' retrieves blog context", async () => {
    const res = await processAIChat({
      message: "Which blogs explain RAG?",
      sessionId,
    });

    assert.strictEqual(res.success, true);
    assert.strictEqual(res.intent, "blogs");
  });

  test("10. Query: 'How can I contact Gaurav?' returns email & contact links", async () => {
    const res = await processAIChat({
      message: "How can I contact Gaurav?",
      sessionId,
    });

    assert.strictEqual(res.success, true);
    assert.strictEqual(res.intent, "contact");
    assert.ok(res.reply.length > 10);
  });

  test("11. Query: 'Download the resume' returns resume intent", async () => {
    const res = await processAIChat({
      message: "Download the resume",
      sessionId,
    });

    assert.strictEqual(res.success, true);
    assert.strictEqual(res.intent, "resume");
  });

  test("12. Out-of-scope Query: 'What is the capital of France?' is handled gracefully", async () => {
    const res = await processAIChat({
      message: "What is the capital of France?",
      sessionId,
    });

    assert.strictEqual(res.success, true);
    assert.strictEqual(res.intent, "out_of_scope");
    assert.ok(res.reply.length > 10);
  });
});
