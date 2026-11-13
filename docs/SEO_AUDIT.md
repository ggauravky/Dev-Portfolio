# SEO + AI-visibility audit

Branch `feat/seo-ai-visibility`. Production: https://ggauravky.vercel.app. Audited 2026-11-13. Nothing is committed or deployed.

## Part 0 — production audit (before changes)

| Resource | Reachable | Content-Type | Content accurate | Action taken |
|---|---|---|---|---|
| `/robots.txt` | 200 | text/plain | Yes. All 7 AI crawlers allowed, sitemap listed. `Disallow: /api/` also blocks `/api/content` | None. Markdown alternates point at `/llms-full.txt` instead |
| `/sitemap.xml` | 200 | application/xml | Mostly. 46 URLs, all 26 projects, 2 published posts, 4 service pages, no admin/API/preview routes. Home `<loc>` had no trailing slash (canonical has one). Only `/blog` and posts carry `<lastmod>` | Home `<loc>` → `/`. Other `<lastmod>` left out: no reliable per-page date |
| `/llms.txt`, `/.well-known/llms.txt` | 200 | text/plain | **No.** Non-existent `supportpilot-ai` project, 4 disabled services linked (404) with a wrong price, archived posts listed instead of published ones, Featured list ≠ `featured: true`, dead AI-chat API | Rewritten from `projectsData`/`blogsData`/`servicesData`; the two files are identical again |
| `/llms-full.txt` | 200 | text/plain | **No.** Same issues; catalog had 23 entries (4 real projects missing); wrong Kanoon-Mate repo | Catalog regenerated from `projectsData.js` (26), sections fixed |
| `/openapi.json` | 200 | application/json | **No.** Documented `POST /api/ai/chat`; omitted `/api/content`; license URL 404 | Chat removed, `/api/content` documented as built, license → GitHub `LICENSE` |
| `/.well-known/mcp.json` | 200 | application/json | **No.** Described only the dead chat endpoint | Rewritten as an index of the real read-only resources |
| `/api/ai/chat` (GET) | **500** | text/plain | `FUNCTION_INVOCATION_FAILED`: `aiController` required `services/aiService`, deleted in `0d4b615` | `api/ai/chat.js` and `backend/controllers/aiController.js` deleted (path now hits the JSON 404 catch-all) |
| `/api/content` | 200 | application/json; `text/markdown` with `Accept: text/markdown` | Yes | Documented in OpenAPI |
| Per-route HTML | 200 | text/html | **No.** Every route shipped Home's title, description, OG and `canonical=/` | Per-route prerendered heads (Part 2) |
| Unknown `/projects/x`, `/blog/x`, `/services/x` | **200** | text/html | Soft 404 | Real 404 after deploy (Part 5) |
| Unknown top-level path | 404 | text/html | Yes | — |
| `http://` | 308 → https | — | HSTS preload on | — |

## Part 1 — JSON-LD
One `@graph` per page from `src/lib/seo.js`, shared by the client (`useSEO`) and the build. Stable ids: `/#person`, `/#website`, `<url>#webpage`, `<url>#breadcrumb`, `<url>#work|#article|#service`.
- **Person:** `alternateName` Gaurav BBDU, ggauravky; `image` `/images/profile.jpg` (200); `jobTitle` "AI/ML Developer & Web Developer" (existing wording); `alumniOf`/`affiliation` EducationalOrganization BBD University (BBDU, Babu Banarasi Das University), no URL; `sameAs` = the 7 Contact-page profiles; `knowsLanguage` English only. The old static block in `index.html` (different sameAs, `bbdniit.ac.in`) and the stray Organization node are gone.
- **WebSite** once, with a SearchAction to `/projects?q=` (Projects reads `?q=` on load, so it is URL-addressable).
- **ProfilePage** on Home and About only (it was on every page). Other pages: WebPage / CollectionPage / ContactPage.
- **BreadcrumbList** on every non-home page, named from the data (project/post/service titles).
- **Projects:** SoftwareSourceCode with `codeRepository` when the repo is public (18), CreativeWork otherwise (8, see owner actions). Fields from `projectsData.js` only.
- **Posts:** BlogPosting (author/publisher → Person, dates, image). **Services:** Service + Offer (price from `servicesData`, which matches `servicePricing.json`).
- **Validation** (script over the built HTML: JSON parses, one Person/WebSite, no duplicate or dangling `@id`, ProfilePage → Person, ListItem position/name/item, page url = canonical, headline ≤ 110, project/post required fields): 15 templates checked — `/`, `/about`, `/projects`, 2 projects, `/skills`, `/journey`, `/services`, a service page, `/blog`, a published and an archived post, `/contact`, `/updates`, `/privacy` — **0 issues**. Lighthouse does not validate JSON-LD; see the Rich Results Test owner action.

## Part 2 — per-page meta
- `scripts/route-heads.js` (Vite plugin) writes `dist/<route>/index.html` for 60 routes (+ Home): unique `<title>` "[purpose] — Gaurav Kumar Yadav", a description of 150–160 characters (static pages hand-written; project/post/service pages built from whole sentences of the data, emoji stripped, never cut mid-sentence — 8 run 118–144 where the source has no better split), self-referencing production canonical, OG + Twitter tags (`@xgauravky`), robots, JSON-LD, and a route-specific `<noscript>` fallback. Checked on all 61 files: one of each tag, unique titles, one `h1`; on 3 sample routes the head React applies after load is byte-identical to the prerendered one.
- `/services/<slug>` canonicalises to the short service URL (`/frontend-development` …).
- `rel="alternate" type="text/markdown"` → `/llms-full.txt` on Home, About, Projects, Skills, Journey, Services, Contact.
- Private/transactional routes (`/my-activity`, `/my-supports`, `/payment-success`, `/admin`) and the 404 are now `noindex` (they were indexable).
- `vite preview` serves the same per-route files (preview middleware), so local checks match Vercel.

## Part 3 — search intent
- Home: title, `h1` and the first paragraph carry the full name.
- About: the lede now opens with who and where ("Gaurav Kumar Yadav, a BCA student at BBD University, Lucknow."), then the work; BBD University details follow in "Now".
- Alt text: every meaningful image has descriptive alt (blog figures from JSON, project screens, journey photos, cover fallbacks). Empty alt only on decorative duplicates (case frontispiece inside `aria-hidden`, avatar beside the name, hover preview).
- Headings (rendered DOM, `vite preview`, 22 routes incl. a published and an archived post, a service alias and the 404): exactly one visible `h1` and no skipped levels on every route. The prerendered HTML also has one `h1` per file (the Home hero shell is stripped from other routes and the `<noscript>` heading is route-specific). No fixes were needed in page markup.

**Copy changes (owner-approved, logged in `COPY_REVIEW.md`):** Home lede and About lede as above. Checked at 1440 px and 375 px: no overflow; prerendered shells carry the same text.

## Part 4 — Core Web Vitals
Lighthouse 13.4.1, `vite preview`, median of 3, `main` and this branch alternated on the same host. Perf / LCP / TBT / CLS (A11y 100, SEO 100 and Best Practices 96 on every run, both builds).

| Route | Mobile `main` | Mobile branch | Desktop `main` | Desktop branch |
|---|---|---|---|---|
| `/` | 97 / 1.97 s / 169 ms / 0 | 95 / 1.99 s / 236 ms / 0 | 100 / 0.47 s / 0.003 | 100 / 0.46 s / 0.003 |
| `/about` | 96 / 1.98 s / 177 ms / 0 | 98 / 1.98 s / 110 ms / 0 | 100 / 0.47 s / 0 | 100 / 0.47 s / 0 |
| `/projects` | 98 / 1.98 s / 116 ms / 0 | 98 / 1.98 s / 74 ms / 0 | 100 / 0.47 s / 0 | 100 / 0.47 s / 0 |
| `/projects/smartmess` | 95 / **2.68 s** / 109 ms / 0 | 94 / **2.72 s** / 159 ms / 0 | 100 / 0.66 s / 0 | 100 / 0.62 s / 0 |
| `/blog/what-is-mcp` | 94 / 2.12 s / 236 ms / 0 | 94 / 2.13 s / 224 ms / 0 | 100 / 0.50 s / 0 | 100 / 0.50 s / 0 |
| `/contact` | 98 / 1.98 s / 63 ms / 0 | 98 / 1.98 s / 95 ms / 0 | 100 / 0.48 s / 0 | 100 / 0.46 s / 0 |

- No regression: differences are TBT noise in both directions; LCP and CLS unchanged. P6 recorded Perf 95–100 on this route set.
- Over target: `/projects/smartmess` mobile LCP ≈ 2.7 s on both builds (pre-existing; the case-study image is the LCP element). Not changed here (layout/design scope).
- Best Practices 96 on both builds (pre-existing, not SEO-related).
- Fonts: `font-display: swap` on all four faces; `geist-var.woff2` preload intact. Images: `LazyImage` serves AVIF/WebP `<source>`s, lazy below the fold, eager+high priority for covers; journey thumbs have width/height. Project screenshots and blog figures have no width/height attributes (CSS `width:100%; height:auto`); measured CLS is 0, so left as is.

## Part 5 — crawlability
- No important page is `noindex` or blocked; only `/admin` and `/api/` are disallowed in robots.txt. `noindex` now on account, payment and 404 pages.
- Internal links: 57 unique internal paths (sitemap, llms files, OpenAPI, manifest, every `to=`/`href=` and data `path` in `src`) checked against the built routes: none broken. (`/_kit` is dev-only by design; `/api/content` is the function.)
- 404: unknown top-level paths already return a real 404 in production. Unknown `/projects/x`, `/blog/x`, `/services/x` returned 200 (soft 404). `vercel.json` now rewrites `/projects/:slug` → `/projects/:slug/index.html` (same for blog and services, and every static route to its own file); a slug without a built file falls through to `404.html` with status 404. Route URLs are unchanged. Confirm on the Vercel preview (owner action 1): `vite preview` cannot reproduce Vercel's rewrite fallthrough.
- HTTPS: `http://` → 308 to https, HSTS with `preload`. No www host (Vercel subdomain). Canonicals are absolute https; `/services/<slug>` canonicalises to the short URL.

## Manual actions for the owner
1. Approve and push; then on the **Vercel preview** check: `/about` and `/projects/smartmess` HTML has their own `<title>`/canonical; `/projects/nope`, `/blog/nope`, `/services/nope` return **404**; archived posts (e.g. `/blog/learning-to-code-beyond-syntax`) still 200.
2. Google Search Console and Bing Webmaster Tools: resubmit `https://ggauravky.vercel.app/sitemap.xml`; request indexing for `/`, `/about`, `/projects`.
3. Rich Results Test (https://search.google.com/test/rich-results) on `/`, `/about`, `/projects/smartmess`, `/blog/what-is-mcp` after deploy.
4. Fix or remove these `github` links in `projectsData.js` (404 today; then drop them from `UNAVAILABLE_REPOS` in `src/lib/seo.js`): PDF to Audio Book, TaskMaster Pro (Todo List - Advanced), Glass Morphism Calculator, Custom Captcha Generator, ShopEase (ecommerce-website-master), Flappy Bird, DishDash (food-delivery), Python Grocery Store. Dead demo: `gauravky.pythonanywhere.com/static/index.html` (404).
5. Re-run Lighthouse on the live site after deploy.
6. Decide whether archived posts should stay indexable (they are, but are not in the sitemap).
