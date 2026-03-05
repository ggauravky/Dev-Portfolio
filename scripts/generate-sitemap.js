// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Unauthorized copying, modification, or distribution of this software,
// via any medium, is strictly prohibited without the express written
// consent of the author. See LICENSE for details.
// Source: https://github.com/ggauravky/Dev-Portfolio

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import blog data
const blogsDataPath = path.join(__dirname, "../src/data/blogsData.js");
const blogsDataContent = fs.readFileSync(blogsDataPath, "utf-8");

// Extract blog slugs from the file
const slugMatches = blogsDataContent.match(/slug:\s*["']([^"']+)["']/g);
const blogSlugs = slugMatches
  ? slugMatches.map((match) => match.match(/["']([^"']+)["']/)[1])
  : [];

const SITE_URL = "https://ggauravky.vercel.app";

// Define all static pages
const staticPages = [
  { path: "", priority: "1.0", changefreq: "weekly" },
  { path: "/about", priority: "0.8", changefreq: "monthly" },
  { path: "/skills", priority: "0.8", changefreq: "monthly" },
  { path: "/projects", priority: "0.9", changefreq: "weekly" },
  { path: "/blog", priority: "0.9", changefreq: "daily" },
  { path: "/contact", priority: "0.8", changefreq: "monthly" },
  { path: "/links", priority: "0.6", changefreq: "monthly" },
  { path: "/privacy", priority: "0.3", changefreq: "yearly" },
  { path: "/terms", priority: "0.3", changefreq: "yearly" },
];

// Generate blog post URLs
const blogPages = blogSlugs.map((slug) => ({
  path: `/blog/${slug}`,
  priority: "0.7",
  changefreq: "monthly",
}));

// Combine all pages
const allPages = [...staticPages, ...blogPages];

// Generate sitemap XML
const generateSitemap = () => {
  const today = new Date().toISOString().split("T")[0];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
${allPages
  .map(
    (page) => `    <url>
        <loc>${SITE_URL}${page.path}</loc>
        <lastmod>${today}</lastmod>
        <changefreq>${page.changefreq}</changefreq>
        <priority>${page.priority}</priority>
    </url>`
  )
  .join("\n")}
</urlset>`;

  return sitemap;
};

// Write sitemap to public folder
const writeSitemap = () => {
  const sitemap = generateSitemap();
  const publicDir = path.join(__dirname, "../public");
  const sitemapPath = path.join(publicDir, "sitemap.xml");

  // Ensure public directory exists
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  fs.writeFileSync(sitemapPath, sitemap);
  console.log(`✅ Sitemap generated successfully!`);
  console.log(`📍 Location: ${sitemapPath}`);
  console.log(`📊 Total URLs: ${allPages.length}`);
  console.log(`   - Static pages: ${staticPages.length}`);
  console.log(`   - Blog posts: ${blogPages.length}`);
};

// Run the script
try {
  writeSitemap();
} catch (error) {
  console.error("❌ Error generating sitemap:", error);
  process.exit(1);
}
