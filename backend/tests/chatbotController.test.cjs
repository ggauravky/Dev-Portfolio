// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Unauthorized copying, modification, or distribution of this software,
// via any medium, is strictly prohibited without the express written
// consent of the author. See LICENSE for details.
// Source: https://github.com/ggauravky/Dev-Portfolio

const test = require("node:test");
const assert = require("node:assert/strict");

process.env.GEMINI_API_KEY = process.env.GEMINI_API_KEY || "test-gemini-key";
process.env.GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash-lite";

let mockResponseText = "Mocked response";
let mockErrorToThrow = null;

// Mock the @google/generative-ai package before requiring the controller
require.cache[require.resolve("@google/generative-ai")] = {
  exports: {
    GoogleGenerativeAI: class {
      constructor(apiKey) {
        this.apiKey = apiKey;
      }
      getGenerativeModel() {
        return {
          startChat() {
            return {
              async sendMessage(message) {
                if (mockErrorToThrow) {
                  throw mockErrorToThrow;
                }
                return {
                  response: {
                    text() {
                      return mockResponseText;
                    }
                  }
                };
              }
            };
          }
        };
      }
    }
  }
};

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

async function runChatbot({ message, history = [] }) {
  const req = createMockReq({
    message,
    history,
    sessionId: `session-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  });
  const res = createMockRes();
  await chatbot(req, res);

  // Reset mocks
  mockErrorToThrow = null;

  return {
    statusCode: res.getStatusCode(),
    payload: res.getPayload(),
  };
}

test("projects query returns success response", async () => {
  mockResponseText = "I have built SmartMess, BuildMyTeam, and a Real-Time Chat App.";
  const result = await runChatbot({
    message: "What projects have you built?",
  });

  assert.equal(result.statusCode, 200);
  assert.equal(result.payload.success, true);
  assert.equal(result.payload.provider, "gemini");
  assert.ok(String(result.payload.reply || "").length > 10);
});

test("skills query returns success response", async () => {
  mockResponseText = "I mainly use Python, React, Node.js, Express, MongoDB, and related tooling.";
  const result = await runChatbot({
    message: "What tech stack do you use?",
  });

  assert.equal(result.statusCode, 200);
  assert.equal(result.payload.success, true);
  assert.equal(result.payload.provider, "gemini");
  assert.ok(String(result.payload.reply || "").toLowerCase().includes("python"));
});

test("unrelated query is handled by gemini and blocked by instructions", async () => {
  mockResponseText = "I am Gaurav's engineering assistant. I'm here to discuss his portfolio, software development, and technical projects. Let's get back to tech!";
  const result = await runChatbot({
    message: "What is the weather in Tokyo today?",
  });

  assert.equal(result.statusCode, 200);
  assert.equal(result.payload.success, true);
  assert.equal(result.payload.provider, "gemini");
  assert.ok(String(result.payload.reply || "").toLowerCase().includes("engineering assistant"));
});

test("empty input returns validation error", async () => {
  const result = await runChatbot({
    message: "   ",
  });

  assert.equal(result.statusCode, 400);
  assert.equal(result.payload.success, false);
  assert.ok(String(result.payload.reply || "").toLowerCase().includes("cannot be empty"));
});

test("long question remains stable and returns response", async () => {
  mockResponseText = "I can help with project details from my portfolio.";
  const longMessage = "project ".repeat(280);
  const result = await runChatbot({
    message: longMessage,
  });

  assert.equal(result.statusCode, 200);
  assert.equal(result.payload.success, true);
  assert.ok(String(result.payload.reply || "").length > 0);
});

test("technical/coding query returns success response", async () => {
  mockResponseText = "Here is a Javascript function to sort an array:\n```javascript\nfunction sortArray(arr) {\n  return arr.sort((a, b) => a - b);\n}\n```";
  const result = await runChatbot({
    message: "write a javascript function to sort an array",
  });

  assert.equal(result.statusCode, 200);
  assert.equal(result.payload.success, true);
  assert.equal(result.payload.provider, "gemini");
  assert.ok(result.payload.reply.includes("```javascript"));
});

test("irrelevant query is politely redirected by assistant redirection response", async () => {
  mockResponseText = "I am Gaurav's engineering assistant. I'm here to discuss his portfolio, software development, and technical projects. Let's get back to tech!";
  const result = await runChatbot({
    message: "give me a cake recipe",
  });

  assert.equal(result.statusCode, 200);
  assert.equal(result.payload.success, true);
  assert.equal(result.payload.provider, "gemini");
  assert.ok(result.payload.reply.includes("engineering assistant"));
});

test("rate limit error 429 returns rate limit fallback message", async () => {
  const err = new Error("Resource has been exhausted (e.g. API quota exceeded)");
  err.status = 429;
  mockErrorToThrow = err;

  const result = await runChatbot({
    message: "What projects have you built?",
  });

  assert.equal(result.statusCode, 200);
  assert.equal(result.payload.success, true);
  assert.equal(result.payload.provider, "gemini-error");
  assert.ok(result.payload.reply.includes("rate limit"));
});

test("general error returns the exact error message", async () => {
  const err = new Error("API key is expired or invalid");
  err.status = 401;
  mockErrorToThrow = err;

  const result = await runChatbot({
    message: "What projects have you built?",
  });

  assert.equal(result.statusCode, 200);
  assert.equal(result.payload.success, true);
  assert.equal(result.payload.provider, "gemini-error");
  assert.ok(result.payload.reply.includes("API key is expired or invalid"));
});
