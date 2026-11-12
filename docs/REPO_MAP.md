# Repo Map — Dev-Portfolio (Phase 0 recon, 2026-11-12)

Snapshot of the frontend as it stands before the v2 redesign. Backend/payment/auth internals: see `docs/ARCHITECTURE.md`.

## Stack (confirmed from `package.json`)
- **Vite 5 + React 18 SPA**, React Router, Tailwind 3 (+ PostCSS/autoprefixer). Plain JSX, no TypeScript in `src/`.
- Runtime deps: `framer-motion`, `cmdk` (Cmd/Ctrl+K palette), `lucide-react`, `react-github-calendar`, `react-hot-toast`, `@vercel/analytics`, `@vercel/speed-insights`, `prop-types`, `cobe` (**unused** — no import in `src/`), `pino*` (server logging libs listed in frontend deps).
- Dev: `sharp` (image variants), `rollup-plugin-visualizer`, `vite-plugin-obfuscator`.
- Fonts (Google Fonts, `index.html`): **Syne** 700/800 (display), **Plus Jakarta Sans** 300–800 (body), **Space Mono** 400/700 (mono labels).

## Entrypoints
| File | Role |
|---|---|
| `index.html` | Shell, font links, static meta |
| `src/main.jsx` | React root |
| `src/App.jsx` | Router, global overlays, layout, routes |

`App.jsx` globals: `ScrollProgress`, `CursorSpotlight` (after splash), `ScrollToTop`, `AnalyticsRouteTracker`, `CommandPalette` (opened via window event `open-command-palette`), `RadialMenu` (custom right-click menu), `NetworkStatusBanner`, `Toaster`, `SplashScreen` (once per session, `sessionStorage gky-splash-shown`; content is `inert` while it shows).
Tree: `ErrorBoundary → OpeningContext → AppLayout (fixed #site-header Navbar, Footer, BackToTop) → AnimatedRoutes (AnimatePresence, per-route PageTransition + Suspense)`.
`Home` is eager; everything else `lazy()`; Blog and Projects chunks prefetched at module load.

## Routes (`src/App.jsx:171-197`)
| Path | Page | Notes |
|---|---|---|
| `/` | `Home` | 8 sections, see below |
| `/about` | `About` | |
| `/journey` | `Journey` | timeline/grid, filters, side navigator |
| `/skills` | `Skills` | |
| `/projects`, `/projects/:slug` | `Projects`, `ProjectDetail` | 26 projects, case-study template |
| `/blog`, `/blog/:slug` | `Blog`, `BlogPost` | structured JSON articles |
| `/updates` | `Updates` | |
| `/services`, `/services/:slug` + 4 aliases | `Services`, `ServiceDetail` | priced via backend |
| `/booknow`, `/support`, `/payment-success[/:id]` | booking + Razorpay | backend required |
| `/my-activity`, `/my-supports` | `ActivityTimeline` | auth required |
| `/contact` | `Contact` | |
| `/privacy`, `/terms`, `/refund` | legal | |
| `/admin` | `AdminRedirect` | |
| `*` | `NotFound` | |

**Sign-in is not a route**: `GoogleAuthDialog` (`src/components/auth/`) is mounted by `src/context/AuthContext.jsx:254`, opened from `Navbar.jsx:330-336` (desktop pill) and `:437-443` (mobile drawer). Every new route also needs a rewrite in `vercel.json`.

## Home (`src/pages/Home.jsx`, 838 lines)
Hero (L88: `NeuralNetworkCanvas`, ghost marquee L97-106, welcome pill L127, h1 L136, CTAs L208-250, avatar + "Available!" L257-311) → About + GitHub/LeetCode stats (L329/L388) → Skills (L452, hard-coded L69-73) → Featured Projects (L547, 3 hard-coded slugs L62-67) → Blog teaser (L654, `getFeaturedBlogs`) → Journey teaser (L729, latest 3) → Contact CTA (L795).

## Key components (`src/components/`)
- Shell: `Navbar.jsx`, `Footer.jsx` (+ `Footer.css`), `BackToTop`, `ScrollProgress`, `StickyMobileCTA`, `TrustStrip`.
- Effects: `NeuralNetworkCanvas.jsx` (particle network, Home hero only), `CursorSpotlight.jsx`, `ScrollReveal.jsx`, `SplashScreen`, `PageTransition`, `RadialMenu/`, `hooks/use3DTilt.js`.
- Search: `CommandPalette.jsx` (cmdk; Ctrl/Cmd+K at L479) fed by `src/data/commandRegistry.js`.
- Auth: `auth/GoogleAuthDialog.jsx`, `GoogleSignInButton.jsx`, `services/googleIdentity.js`.
- Media: `LazyImage` (+ generated responsive variants).
- SEO: `src/hooks/useSEO.jsx` (custom; mutates `<head>` client-side, JSON-LD support).

## Data sources
| Data | File | Shape |
|---|---|---|
| Projects | `src/data/projectsData.js` | 26 entries (15 `featured`). Fields: slug, title, description, techStack, categories, github, demo, image, screenshots, team, **case-study fields** `problem, solution, architecture, diagrams{system,flow,database} (mermaid), keyDecisions[], lessonsLearned` — full on early entries, partial later |
| Journey | `src/data/journeyData.js` | 25 entries + 18 categories (date, org, category, mode, status, skills) |
| Services | `src/data/servicesData.js` | 4 services; prices from `backend/data/servicePricing.json` |
| Blog | `src/data/blogs/*.json` (2: `uber-system-design`, `what-is-mcp`) → `blogsData.js` selectors; old posts `archivedBlogsData.js` |
| Events | `src/data/eventsData.js` | |
| Palette commands | `src/data/commandRegistry.js` | |
| Portfolio JSON | `data/`, `public/data/`, `api/data/` (identical), `backend/data/` (diverged) | used by AI chat / llms files |

## Styling
- Tailwind (`tailwind.config.js`, 28 lines): colors `toxic #c5f82a`, `cyber #ff5d00`, `obsidian #070708` (+ card `#0e0e11`, light `#16161a`, border `#1a1a22`), legacy `primary #3b82f6`, `secondary #8b5cf6`; fonts sans/display/mono. No custom shadows or keyframes in config.
- `src/index.css`: CSS vars (gradients, `--glow-color`), utilities `.glass-effect`, `.neon-glow`, `.pulse-glow`, `.gradient-border`, `.shimmer`, `.animate-*` (~14 keyframes), hover-lift/scale, scroll-reveal. Some keyframes duplicated in per-component CSS (`Skills.css`, `SkeletonLoader.css`, `LazyImage.css`).
- Per-page CSS files: `Home.css`, `Blog.css`, `BlogPost.css`, `Skills.css`, `JourneyNavigator.css`, `StatsCards.css`, etc.
- Footprint (line counts): `rounded-full` 182 lines / 31 files; gradient utilities 81 / 21; coloured/arbitrary shadows 55 / 17.

## Animation
- `framer-motion` in 13 files (App, Home, Journey, Projects, Skills, Navbar, JourneyNavigator, PageTransition, RadialMenu×2, SplashScreen, SupportButton, use3DTilt).
- CSS keyframes in `index.css` + 5 component CSS files + inline in `NotFound`, `Services`, `NetworkStatusBanner`.
- Canvas: `NeuralNetworkCanvas` (rAF loop).
- Reduced motion: handled in several CSS files and some JS (`RadialMenu`, `SplashScreen`, `Journey`, `use3DTilt`); **not** in the Home hero (marquee, ping, float).

## Build & deploy
- `npm run build` = `scripts/generate-image-variants.js` → `scripts/generate-sitemap.js` → `vite build`. Only CI gate (`.github/workflows/ci.yml`, Node 20).
- `vite.config.js`: obfuscator (hex ids, string array) on own chunks, `copyrightBannerPlugin` (post), `manualChunks` vendor/framer/analytics, es2020, visualizer → `dist/stats.html`.
- **Vercel** (SPA + `api/`): `vercel.json` ~37 explicit rewrites to `index.html`, ~17 header blocks (cache, CORS for AI-discovery files, security incl. COOP/COEP/HSTS). Functions: `api/content.js`, `api/ai/chat.js`, `api/[...path].js`.
- **Render**: Express API in `backend/` (contact, newsletter, auth, blog, activity, payment).
- Hand-maintained discovery files: `public/llms.txt`, `llms-full.txt`, `openapi.json`, `.well-known/`.
