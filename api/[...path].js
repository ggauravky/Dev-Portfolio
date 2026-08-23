export default async function handler(req, res) {
  // Only handle /api/* paths that weren't matched by other handlers
  const body = {
    success: false,
    error: {
      code: "NOT_FOUND",
      message: "The requested API endpoint does not exist.",
      docs: "/openapi.json",
    },
    discovery: {
      openapi: "https://ggauravky.vercel.app/openapi.json",
      llms: "https://ggauravky.vercel.app/llms.txt",
      sitemap: "https://ggauravky.vercel.app/sitemap.xml",
    },
  };

  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");
  return res.status(404).json(body);
}
