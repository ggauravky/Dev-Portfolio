# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Frontend (repo root, ESM):
- `npm run dev` — Vite dev server on :5173
- `npm run build` — generates image variants and `public/sitemap.xml`, then runs `vite build`. This is the only CI gate (`.github/workflows/ci.yml`, Node 22).
- `npm run test:blog` — `node --test scripts/blog-data.test.mjs`

Backend (`cd backend`, CommonJS, separate `package.json`/`node_modules`):
- `npm run dev` (nodemon) / `npm start` — Express on :5000
- `npm test` — runs `node --test` over `backend/tests/`. One file: `node --test tests/payment.test.js`. One test: `node --test --test-name-pattern="<name>" tests/payment.test.js`
- `npm run preflight` — environment/config sanity check
- `test:email`, `test:razorpay`, `test:email:templates`, and `email:reconcile` hit real external services (Brevo, Razorpay, MongoDB). Don't run them unless asked.

There is no linter or formatter configured.

## Architecture

There are three deployables:
1. **React SPA** (`src/`) on Vercel. It talks to the backend through `import.meta.env.VITE_API_URL` (the origin only, with no `/api` suffix).
2. **Express API** (`backend/server.js`) on Render. It connects to MongoDB, Razorpay, Brevo SMTP (NodeMailer), Cloudinary avatars and Google Identity.
3. **Vercel serverless functions** (`api/`): `content.js` serves `public/llms-full.txt`, `ai/chat.js` reuses `backend/controllers/aiController.js` through `createRequire`, and `[...path].js` is the JSON 404 catch-all.

`server.js` mounts only the contact, newsletter, auth, blog, activity and payment routers. `adminRoutes.js` and `feedbackRoutes.js` exist but aren't mounted, and AI chat is served only by the Vercel function.

**Adding a client route:** register it in `src/App.jsx` and also add an explicit rewrite to `index.html` in `vercel.json`. Every SPA path is listed individually there, so a route without a rewrite returns a 404 in production.

The full payment and auth design is in `docs/ARCHITECTURE.md`. These invariants matter when editing:
- **Payments:** the price always comes from `backend/data/servicePricing.json`, and amounts sent by the browser are ignored. The checkout callback is not proof of payment. `/api/payment/verify` and the Razorpay webhook (raw-body signature check, idempotent on `x-razorpay-event-id`) both go through the single finalizer in `services/payment/paymentFinalizationService.js`. A failed email must never change the paid state.
- **Auth:** the Google ID token is verified server-side and users are matched on Google `sub` (`User.googleId`). The session is a backend-issued JWT in the HttpOnly cookie `portfolio_session`, so frontend JS never sees it. State-changing auth routes require an exact trusted `Origin` (`config/trustedOrigins.js`, `AUTH_ALLOWED_ORIGINS`), and wildcard origins are rejected on purpose. The frontend fetches the Google client ID from `GET /api/auth/config`, so there is no `VITE_GOOGLE_CLIENT_ID`.
- Secrets never go in `VITE_*` variables. Env vars are documented in `docs/DEPLOYMENT.md` and `backend/.env.example`.

## Content and data

- **Blog:** current articles are structured JSON in `src/data/blogs/*.json` (with `sections[].blocks`). Each one is imported into `src/data/blogsData.js` and run through `normalizeStructuredArticle`, which computes `readTime` and `date`. Old posts live in `archivedBlogsData.js`; don't move them back to make old URLs work, because `getBlogBySlug` already resolves them. `status` controls exposure: `preview` is visible but `noindex` and left out of the sitemap, and `published` is indexable. Discovery surfaces (blog index, Home teaser, command palette, related articles, sitemap) must use the selector functions exported from `blogsData.js`, not the raw arrays. See `docs/blog-authoring.md`; its HTML-`content` description predates the structured JSON format. Before publishing, run `npm run test:blog`, `npm run build` and `git diff --check`.
- **Portfolio JSON copies:** `data/`, `public/data/` and `api/data/` hold identical copies of `portfolioData.json`, while `backend/data/portfolioData.json` has diverged. If you edit one, check whether the others need the same change.
- **AI-discovery files:** `public/llms.txt`, `llms-full.txt`, `openapi.json` and `.well-known/` are hand-maintained. Update them when public pages or APIs change.
- **Build output:** production builds obfuscate our JS chunks and stamp a copyright banner (`vite.config.js`). Keep the `console.log` watermark in `App.jsx`, which is why console output isn't stripped.

## Conventions

- Conventional Commits (`feat(ui): …`, `fix(navbar): …`). Branches are `feat/…` or `fix/…`.
- Use Tailwind with the "Obsidian" design tokens: `#070708` background and `#c5f82a` accent. (Being replaced by the v2 tokens in `docs/DESIGN.md`; once Phase A lands, those win.)

## Redesign v2 (in progress, branch `redesign/v2`)

Before any redesign work, read `docs/REPO_MAP.md`, `docs/DESIGN.md` (direction A — Monograph) and `docs/PROGRESS.md`; the plan is `docs/PLAN.md`. Do one phase per session, run its quality gates, then update `docs/PROGRESS.md` and `docs/DECISIONS.md`.

Anti-slop rules:
- Banned: gradients and gradient text, glassmorphism, glow and coloured shadows, emoji icons, card-in-card, 3-icon feature rows, generic bento, pills (except the dock, buttons and a status dot), `// comment` labels, ALL-CAPS eyebrows, and ghost or marquee text.
- The lime accent `#C2EE3A` has one job, "live / current" (the current page in the dock, the availability dot, the current role, link hover, focus ring), and covers less than 5% of a screen.
- Use 1px hairlines, not shadows; there is one shadow token, for dialogs. Radius is `0/4/8`, and spacing is on 8px (`8 16 24 32 48 64 96 128`).
- Fonts are chosen in P2 from a type specimen (D-032; see DESIGN.md "Type"), self-hosted as woff2. Never use Inter, Roboto, Arial, Space Grotesk, Poppins, Montserrat or Playfair.
- Use only facts already in the repo data. Don't invent numbers or claims, and remove filler stats.
- The **Signature layer** (S1–S8 in DESIGN.md) is mandatory. At most 3 motion "moments" per page. Every phase fully converts what it touches and deletes the old styles; never leave a page half-migrated.
- Motion tokens live only in `src/lib/motion.js` (160/280/520 ms, `cubic-bezier(.22,1,.36,1)`). Respect `prefers-reduced-motion`, and animate transform/opacity only. The one exception is the S6 hero-name font axis (D-031). The hero heading paints statically and is never animated in.
- Reveals: content is visible by default, hidden only under a JS-added class, with a timeout fail-safe; never hide content permanently.
- Don't reformat `src/data/projectsData.js`, because `scripts/generate-sitemap.js` regex-parses `slug:`.
