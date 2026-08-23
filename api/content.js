import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default async function handler(req, res) {
  const accept = req.headers["accept"] || "";
  const wantsMarkdown =
    accept.includes("text/markdown") || accept.includes("text/plain");

  // CORS + Vary
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Vary", "Accept");

  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Accept, Content-Type");
    return res.status(204).end();
  }

  if (req.method !== "GET") {
    return res.status(405).json({
      success: false,
      error: { code: "METHOD_NOT_ALLOWED", message: "Use GET." },
    });
  }

  try {
    const filePath = join(__dirname, "../public/llms-full.txt");
    const content = readFileSync(filePath, "utf-8");

    if (wantsMarkdown) {
      // Return raw Markdown with proper content type
      res.setHeader("Content-Type", "text/markdown; charset=utf-8");
      res.setHeader("Cache-Control", "public, max-age=3600, must-revalidate");
      return res.status(200).send(content);
    }

    // Default: JSON wrapper with a snippet
    const lines = content.split("\n");
    const title = lines[0].replace(/^#\s*/, "").trim();
    const description = lines
      .slice(2, 5)
      .join(" ")
      .replace(/[>*]/g, "")
      .trim();

    return res.status(200).json({
      success: true,
      title,
      description,
      markdown_url: "https://ggauravky.vercel.app/llms-full.txt",
      openapi_url: "https://ggauravky.vercel.app/openapi.json",
      mcp_url: "https://ggauravky.vercel.app/.well-known/mcp.json",
      note: "Send Accept: text/markdown to receive the full Markdown knowledge base.",
    });
  } catch {
    return res.status(500).json({
      success: false,
      error: { code: "READ_ERROR", message: "Failed to read content file." },
    });
  }
}
