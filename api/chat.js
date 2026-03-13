import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const {
  chat,
  chatPrivacyPolicy,
} = require("../backend/controllers/chatController");

export default async function handler(req, res) {
  if (req.method === "GET") {
    return chatPrivacyPolicy(req, res);
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed",
    });
  }

  return chat(req, res);
}
