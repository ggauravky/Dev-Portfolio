// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Unauthorized copying, modification, or distribution of this software,
// via any medium, is strictly prohibited without the express written
// consent of the author. See LICENSE for details.
// Source: https://github.com/ggauravky/Dev-Portfolio

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getPublishedBlogs } from "../src/data/blogsData.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import project data
const projectsDataPath = path.join(__dirname, "../src/data/projectsData.js");
const projectsDataContent = fs.readFileSync(projectsDataPath, "utf-8");

// Keep previews and archived routes out of the sitemap while preserving their URLs.
const publishedBlogs = getPublishedBlogs();
const latestBlogDate = publishedBlogs
  .map(({ updatedDate, publishedDate }) => updatedDate || publishedDate)
  .filter(Boolean)
  .sort()
  .at(-1);

// Extract project slugs from the file
const projectSlugMatches = projectsDataContent.match(/slug:\s*["']([^"']+)["']/g);
const projectSlugs = projectSlugMatches
  ? projectSlugMatches.map((match) => match.match(/["']([^"']+)["']/)[1])
  : [];

const SITE_URL = "https://ggauravky.vercel.app";

// Define all static pages
const staticPages = [
  { path: "", priority: "1.0", changefreq: "weekly" },
  { path: "/about", priority: "0.8", changefreq: "monthly" },
  { path: "/journey", priority: "0.8", changefreq: "monthly" },
  { path: "/skills", priority: "0.8", changefreq: "monthly" },
  { path: "/projects", priority: "0.9", changefreq: "weekly" },
  { path: "/services", priority: "0.9", changefreq: "weekly" },
  { path: "/frontend-development", priority: "0.8", changefreq: "weekly" },
  { path: "/backend-development", priority: "0.8", changefreq: "weekly" },
  { path: "/full-stack-development", priority: "0.8", changefreq: "weekly" },
  { path: "/ai-data-science-guidance", priority: "0.8", changefreq: "weekly" },
  { path: "/booknow", priority: "0.8", changefreq: "weekly" },
  { path: "/blog", priority: "0.9", changefreq: "daily", lastmod: latestBlogDate },
  { path: "/contact", priority: "0.8", changefreq: "monthly" },
  { path: "/updates", priority: "0.6", changefreq: "weekly" },
  { path: "/support", priority: "0.6", changefreq: "monthly" },
  { path: "/privacy", priority: "0.3", changefreq: "yearly" },
  { path: "/terms", priority: "0.3", changefreq: "yearly" },
  { path: "/refund", priority: "0.3", changefreq: "yearly" },
];

// Generate blog post URLs
const blogPages = publishedBlogs.map(({ slug, publishedDate, updatedDate }) => ({
  path: `/blog/${slug}`,
  priority: "0.7",
  changefreq: "monthly",
  lastmod: updatedDate || publishedDate,
}));

// Generate project detail URLs
const projectPages = projectSlugs.map((slug) => ({
  path: `/projects/${slug}`,
  priority: "0.8",
  changefreq: "monthly",
}));

// Combine all pages
const allPages = [...staticPages, ...blogPages, ...projectPages];

// Generate sitemap XML
const generateSitemap = () => {
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<!--
  Sitemap for https://ggauravky.vercel.app
  Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
  Origin fingerprint: ggauravky-4f9e-orig-portfolio-2026
  Unauthorized copying or redistribution is strictly prohibited.
-->
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
${allPages
  .map(
    (page) => `    <url>
        <loc>${SITE_URL}${page.path}</loc>
${page.lastmod ? `        <lastmod>${page.lastmod}</lastmod>\n` : ""}        <changefreq>${page.changefreq}</changefreq>
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
  console.log(`   - Project pages: ${projectPages.length}`);
};

// Run the script
try {
  writeSitemap();
} catch (error) {
  console.error("❌ Error generating sitemap:", error);
  process.exit(1);
}
