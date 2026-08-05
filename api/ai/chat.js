import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { handleAIChat } = require("../../backend/controllers/aiController");

export default async function handler(req, res) {
  if (req.method === "GET") {
    return res.status(200).json({
      success: true,
      message: "Vercel AI Chat API endpoint is active.",
    });
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      error: {
        code: "METHOD_NOT_ALLOWED",
        message: "Method not allowed. Use POST for AI chat requests.",
      },
    });
  }

  return handleAIChat(req, res);
}
