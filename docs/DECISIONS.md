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
