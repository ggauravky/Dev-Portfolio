const test = require("node:test");
const assert = require("node:assert/strict");

process.env.DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || "test-key";
process.env.DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL || "deepseek-v4-flash";

const { chatbot } = require("../controllers/chatbotController");

function createMockReq({ message, history = [], sessionId = "test-session", headers = {} }) {
  return {
    body: {
      message,
      history,
      sessionId,
    },
    headers,
    socket: {
      remoteAddress: "127.0.0.1",
    },
    log: {
      info() {},
      warn() {},
      error() {},
    },
  };
}

function createMockRes() {
  let statusCode = 200;
  let payload = null;

  return {
    status(code) {
      statusCode = code;
      return this;
    },
    json(data) {
      payload = data;
      return this;
    },
    getStatusCode() {
      return statusCode;
    },
    getPayload() {
      return payload;
    },
  };
}

async function runChatbot({ message, history = [], fetchPayload, fetchOk = true }) {
  let fetchCalls = 0;
  const originalFetch = globalThis.fetch;

  globalThis.fetch = async () => {
    fetchCalls += 1;
    return {
      ok: fetchOk,
      status: fetchOk ? 200 : 503,
      json: async () => fetchPayload,
    };
  };

  try {
    const req = createMockReq({
      message,
      history,
      sessionId: `session-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    });
    const res = createMockRes();
    await chatbot(req, res);

    return {
      statusCode: res.getStatusCode(),
      payload: res.getPayload(),
      fetchCalls,
    };
  } finally {
    globalThis.fetch = originalFetch;
  }
}

test("projects query returns success response", async () => {
  const result = await runChatbot({
    message: "What projects have you built?",
    fetchPayload: {
      choices: [
        {
          message: {
            content: "I have built SmartMess, BuildMyTeam, and a Real-Time Chat App.",
          },
        },
      ],
    },
  });

  assert.equal(result.statusCode, 200);
  assert.equal(result.payload.success, true);
  assert.ok(String(result.payload.reply || "").length > 10);
});

test("skills query returns success response", async () => {
  const result = await runChatbot({
    message: "What tech stack do you use?",
    fetchPayload: {
      choices: [
        {
          message: {
            content: "I mainly use Python, React, Node.js, Express, MongoDB, and related tooling.",
          },
        },
      ],
    },
  });

  assert.equal(result.statusCode, 200);
  assert.equal(result.payload.success, true);
  assert.ok(String(result.payload.reply || "").toLowerCase().includes("python"));
});

test("unrelated query is blocked by guardrail", async () => {
  const result = await runChatbot({
    message: "What is the weather in Tokyo today?",
    fetchPayload: {
      choices: [
        {
          message: {
            content: "This should not be used for out-of-scope questions.",
          },
        },
      ],
    },
  });

  assert.equal(result.statusCode, 200);
  assert.equal(result.payload.success, true);
  assert.equal(result.payload.provider, "guardrail");
  assert.ok(String(result.payload.reply || "").toLowerCase().includes("only help"));
  assert.equal(result.fetchCalls, 0);
});

test("empty input returns validation error", async () => {
  const result = await runChatbot({
    message: "   ",
    fetchPayload: {
      choices: [
        {
          message: {
            content: "This should not run for empty input.",
          },
        },
      ],
    },
  });

  assert.equal(result.statusCode, 400);
  assert.equal(result.payload.success, false);
  assert.ok(String(result.payload.reply || "").toLowerCase().includes("cannot be empty"));
  assert.equal(result.fetchCalls, 0);
});

test("long question remains stable and returns response", async () => {
  const longMessage = "project ".repeat(280);
  const result = await runChatbot({
    message: longMessage,
    fetchPayload: {
      choices: [
        {
          message: {
            content: "I can help with project details from my portfolio.",
          },
        },
      ],
    },
  });

  assert.equal(result.statusCode, 200);
  assert.equal(result.payload.success, true);
  assert.ok(String(result.payload.reply || "").length > 0);
});
