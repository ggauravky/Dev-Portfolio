# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Frontend (repo root, ESM):
- `npm run dev` — Vite dev server on :5173
- `npm run build` — generates image variants and `public/sitemap.xml`, then runs `vite build`. This is the only CI gate (`.github/workflows/ci.yml`, Node 20).
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
- Use Tailwind with the "Obsidian" design tokens: `#070708` background and `#c5f82a` accent.
