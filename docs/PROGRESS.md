# Redesign v2 — Progress

Branch: `redesign/v2` (from `main`). Plan: `docs/PLAN.md`. Decisions: `docs/DECISIONS.md`.
Update this file at the end of every session.

## Current state (2026-11-12)
Phase 2 (Plan) is done: the plan, progress and decisions docs and the CLAUDE.md redesign section are written, and the fold screenshots are converted to WebP. **Nothing is committed yet**, pending the user's approval. No source code has changed.

## Next step
Phase **A — Foundations** (tokens, self-hosted fonts, type scale, global focus/selection/scrollbar, skip link, `scripts/check-design.mjs`). Start by capturing a Lighthouse baseline from `npm run preview`.

## Checklist
- [x] Phase 0 — Recon & audit (`REPO_MAP.md`, `AUDIT.md`, screenshots)
- [x] Phase 1 — Design direction (`DESIGN.md`, A — Monograph)
- [x] Phase 2 — Plan (`PLAN.md`, `PROGRESS.md`, `DECISIONS.md`, CLAUDE.md section)
- [ ] A — Foundations
- [ ] B — Core components (ui kit, nav without Sign-in, footer, Cmd+K, auth dialog)
- [ ] C — Motion system (motion.js, CSS route fade, remove splash/cursor/tilt/reveals; **confirm RadialMenu removal**)
- [ ] D1 — Home (+ E: remove particle canvas) — Perf ≥ 90 from here
- [ ] D2 — Projects index
- [ ] D3 — Case studies (**confirm top-6 list**)
- [ ] D4 — About
- [ ] D5 — Skills
- [ ] D6 — Journey (may split a/b)
- [ ] D7 — Services + ServiceDetail
- [ ] D8 — Blog + BlogPost
- [ ] D9 — Contact + sign-in surfaces
- [ ] F — Copy pass (`COPY_REVIEW.md`, user sign-off)
- [ ] G — Polish (404, skeletons, empty states, favicon, OG image, scroll restoration, states audit, drop legacy aliases)

## Lighthouse log (mobile, median of 3)
| Phase | Perf | A11y | BP | SEO | LCP | TBT |
|---|---|---|---|---|---|---|
| Baseline (live, single run) | 38 | 100 | 100 | 100 | 7.1 s | 1,140 ms |
