# Redesign v2 — Decisions

Append new entries; don't rewrite old ones (supersede them with a new entry instead).

| ID | Date | Decision | Why |
|---|---|---|---|
| D-001 | 2026-11-12 | Direction **A — Monograph** (dark editorial, serif-led). | User choice in Phase 1; lowest font and motion cost. See `DESIGN.md`. |
| D-002 | 2026-11-12 | Sign-in leaves the main nav and the mobile drawer. It stays in the footer, the signed-in avatar menu, and the existing inline triggers (BookNow, Support, ActivityTimeline, SupportButton). No route changes. | User choice. It is only needed for bookings and receipts. |
| D-003 | 2026-11-12 | Quiet motion: sliding-fill buttons, a 0.98 press, underline draw, a 150 ms route crossfade, and a CSS stagger on the hero's secondary lines only. The heading stays static. No custom cursor, magnetic hover or scroll reveals. | User choice; DESIGN.md wins over the brief. It protects LCP. |
| D-004 | 2026-11-12 | No Lenis or GSAP. framer-motion only through `LazyMotion` + `domAnimation` where needed. | CSS covers the motion language, and there is no new dependency weight. |
| D-005 | 2026-11-12 | `docs/audit/**/*.png` is git-ignored. Only the first-viewport shots are committed, as WebP. | 119 MB of PNGs would permanently bloat the repo. |
| D-006 | 2026-11-12 | No ESLint or TypeScript is added. The gates are build, `test:blog`, `git diff --check` and a dependency-free `scripts/check-design.mjs` (Phase A). | No new dependencies without need; it guards against design regressions. |
| D-007 | 2026-11-12 | Mermaid `diagrams` (8 projects, currently not rendered) are out of scope. | Rendering them needs a heavy dependency or a build-time renderer. Revisit after G. |
| D-008 | 2026-11-12 | The obfuscator, copyright banner and `console.log` watermark are kept. | Project requirement (CLAUDE.md). |
| D-009 | 2026-11-12 | Case studies use the existing `/projects/:slug` route. | No new routes or `vercel.json` rewrites, and URLs stay unchanged. |
| D-010 | 2026-11-12 | Fonts come from Fontsource 5.3.0 (latin subset woff2, copied once into `public/fonts/`), not an npm dependency. | No new runtime or dev dependency; files are static and OFL. |
| D-011 | 2026-11-12 | Colour tokens are RGB channels (`--ink: 14 13 11`), used as `rgb(var(--ink))` in CSS. | Keeps Tailwind opacity modifiers (`bg-ink/80`) working. |
| D-012 | 2026-11-12 | Legacy names are aliased, not removed: Tailwind `toxic`/`obsidian`/`font-display`, and `@font-face` names Plus Jakarta Sans/Syne/Space Mono pointing at Geist files. `font-display` maps to Geist, not the serif. Deleted in G. | Unrestyled pages keep rendering with no Google Fonts request; a 400-only serif under `font-bold` headings would be synthesized bold. |
| D-013 | 2026-11-12 | Only Geist is preloaded in A. Instrument Serif's preload is added when a page first uses it above the fold (D1). Geist Mono is never preloaded. | Preloading an unused font wastes bandwidth and triggers a Lighthouse warning. |
| D-014 | 2026-11-12 | Fallback metrics (`size-adjust`, `ascent/descent-override`) were measured in Chromium against Arial / Times New Roman / Courier New. | Real numbers for CLS ≈ 0 instead of guessed ones. |
| D-015 | 2026-11-12 | Spacing uses Tailwind's existing 2/4/6/8/12/16/24/32 steps (= 8–128px) plus `--space-1…8` vars; the default scale is not overridden. Radius likewise adds `rounded-control`/`rounded-dialog`. Body text size is unchanged until pages are restyled. | Overriding the defaults would restyle every page in A. |
| D-016 | 2026-11-12 | `::selection` is paper on ink, not lime. | The accent's only job is "live / current". |
| D-017 | 2026-11-12 | `check:design` fails only on files listed in its `FINISHED` array; `--all` makes everything strict (from G). Exceptions use a `design-allow` comment on the line. | 553 legacy hits exist today; the gate must pass while guarding finished work. |
| D-018 | 2026-11-12 | Desktop nav has 6 links: About, Projects, Journey, Services, Blog, Contact. Home is the wordmark; Skills and Updates are reachable from the drawer (Skills), footer and ⌘K. The drawer lists all 8 main pages. | PLAN § B "up to 6 links"; no URL changes. |
| D-019 | 2026-11-12 | The nav is a solid ink bar with one hairline, not a floating pill. No blur, shadow or scroll-state styling, so the scroll listener and framer-motion left the nav. | Banned glass/shadow; less JS on every page. |
| D-020 | 2026-11-12 | One `useFocusTrap` hook (with a trap stack) serves the drawer, ⌘K and the auth dialog. | Consistent Tab/Esc/focus-return; ⌘K over the open drawer runs one trap. |
| D-021 | 2026-11-12 | Button sliding fill runs only on `(hover: hover) and (pointer: fine)`; keyboard focus shows the fill too. Text colour changes are instant (no colour transitions). | D-003 (no magnetic hover); motion is transform/opacity only. |
| D-022 | 2026-11-12 | Auth dialog: removed the caps eyebrow and the 3-box benefits row (card-in-card); title is "Sign in"; reason copy unchanged. Raw network errors become "Sign-in couldn't reach the server…". Google button shape is `rectangular`. | Anti-slop rules; PLAN § B friendly error copy. |
| D-023 | 2026-11-12 | The kit sheet `/_kit` is mounted only under `import.meta.env.DEV`; no rewrite, no prod chunk. | PLAN § B; keeps prod routes and `vercel.json` unchanged. |
| D-024 | 2026-11-12 | ⌘K input shows focus by turning the search row's bottom rule accent instead of an outline inside the dialog. | Focus stays visible without a ring clashing with the dialog frame. |
| D-025 | 2026-11-12 | `src/components/Navbar.css` (an unused light-theme stylesheet) was replaced by the v2 nav styles and is now imported. | It was dead code. |
