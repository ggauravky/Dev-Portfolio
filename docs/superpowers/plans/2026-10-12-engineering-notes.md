# Engineering Notes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the portfolio blog as a premium engineering publication with one honest Uber preview and backward-compatible archived articles.

**Architecture:** Separate active and archived content behind tested selectors, then build reusable listing and reader components on those interfaces. Preserve trusted legacy HTML, newsletter requests, and support identities while narrowing SEO, sitemap, homepage, and command-palette discovery to intentional public states.

**Tech Stack:** React 18, React Router 7, Vite 5, existing Tailwind/CSS, Node built-in test runner

**Spec:** `docs/superpowers/specs/2026-10-12-engineering-notes-design.md`

## Global Constraints

- Add exactly one preview article and no fake publication date or reading time.
- Preserve all seven archived records and slugs verbatim.
- Add no UI library, CMS, Markdown engine, or heavy syntax highlighter.
- Keep backend, authentication, payment, support APIs, and unrelated pages unchanged.
- Do not commit or push.

## Review Focus

- Unknown slug must retain the existing not-found behavior.
- Archived slugs must resolve without entering public discovery.
- Empty published content must omit Latest writing entirely.
- Category filters must hide a featured preview from unrelated categories.
- Long code, tables, diagrams, and titles must not create document-level horizontal overflow.

---

### Task 1: Content states and archive compatibility

**Files:** `src/data/archivedBlogsData.js`, `src/data/blogsData.js`, `scripts/blog-data.test.mjs`, `package.json`

- [ ] Write failing selector tests for the preview, seven archived slugs, category filtering, publishing visibility, and related exclusion.
- [ ] Move existing records unchanged into the archive module and implement `BLOG_CATEGORIES`, `blogsData`, `getBlogBySlug`, `getPublicBlogs`, `getPublishedBlogs`, `getFeaturedBlogs`, `getBlogsByCategory`, and `getRelatedBlogs`.
- [ ] Run the selector test and confirm it passes.

### Task 2: Editorial homepage

**Files:** `src/components/blog/BlogCategoryNav.jsx`, `src/components/blog/FeaturedArticle.jsx`, `src/components/blog/TopicExplorer.jsx`, `src/pages/Blog.jsx`, `src/pages/Blog.css`

- [ ] Implement semantic tabs, featured preview, topics, search empty state, and preserved newsletter submission.
- [ ] Make categories filter both featured and standard results and hide Latest writing when published content is empty.
- [ ] Remove obsolete sort, trending, and support-count UI without touching the support service.

### Task 3: Reusable article reader

**Files:** `src/components/blog/ArticleContent.jsx`, `src/components/blog/ArticleTOC.jsx`, `src/components/blog/ArticleShare.jsx`, `src/pages/BlogPost.jsx`, `src/pages/BlogPost.css`

- [ ] Render preview and archive records through one legacy-compatible reader.
- [ ] Derive stable heading IDs and show the TOC only with at least three H2/H3 headings.
- [ ] Add code-copy behavior and responsive styles for diagrams, code, tables, lists, quotes, and captions.
- [ ] Hide support, dates, read time, TOC, and related content when inappropriate.

### Task 4: Uber architecture asset

**File:** `public/images/blogs/uber-system-design.svg`

- [ ] Create and validate an accessible responsive 16:9 diagram showing Rider App, API Layer, Matching Service, Driver App, and Location Service.

### Task 5: Discovery, homepage, and SEO

**Files:** `src/pages/Home.jsx`, `src/data/commandRegistry.js`, `src/hooks/useSEO.jsx`, `scripts/generate-sitemap.js`

- [ ] Switch Home and Command Palette to public selectors and an intentional single-preview layout.
- [ ] Make article structured dates conditional and apply noindex only to previews.
- [ ] Generate blog sitemap entries from published records only.

### Task 6: Documentation and complete verification

**File:** `docs/blog-authoring.md`

- [ ] Document adding content, covers, HTML/code/diagrams, categories, states, dates, featuring, and series.
- [ ] Run selector tests, `npm run build`, and `git diff --check`.
- [ ] Run desktop, tablet, and mobile browser QA for active and archived routes and inspect the final diff.
