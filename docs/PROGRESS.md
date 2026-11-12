# Redesign v2 — Progress

Branch: `redesign/v2` (from `main`). Plan: `docs/PLAN.md`. Decisions: `docs/DECISIONS.md`.
Update this file at the end of every session.

## Current state (2026-11-12)
Phase **A — Foundations** is done, **uncommitted** pending the user's approval (Phases 0–2 are committed as `bb19729`).
- v2 tokens are RGB-channel CSS variables in `src/index.css` (`--ink`, `--ink-raised`, `--rule`, `--paper`, `--muted`, `--accent`, type/space/radius/shadow vars) and mapped in `tailwind.config.js` (`bg-ink`, `text-paper`, `font-serif`, `text-display|h2|h3|body|small`, `rounded-control|dialog`, `shadow-dialog`).
- Fonts are self-hosted in `public/fonts/` (latin woff2, OFL texts alongside) with metric-matched fallbacks in `src/styles/fonts.css`. Only Geist is preloaded. Google Fonts is gone from `index.html` and `public/404.html`.
- **Legacy aliases** (delete in G): Tailwind `toxic`, `obsidian.*`, `font-display` → v2 tokens/Geist; `@font-face` names `Plus Jakarta Sans`/`Syne` → Geist, `Space Mono` → Geist Mono. So every page now renders in Geist without being restyled.
- Global `:focus-visible` (accent 2px, offset 2), paper `::selection`, rule scrollbar; noise overlay removed; skip link → `#main-content` in `AppLayout`; Toaster on tokens; SW cache `v5`.
- `npm run check:design` (`scripts/check-design.mjs`): 553 legacy hits reported as todo; it fails only on files in its `FINISHED` list (Phase A: `src/styles/fonts.css`). Each phase adds its restyled files there.
- Screenshots: `docs/audit/after/A/{before,after}/` (8 pages × 4 widths, WebP). No horizontal scroll at any width. Contrast: muted/ink 6.7:1, paper/ink 16.2:1.

## Next step
Phase **B — Core components** (ui kit, nav without Sign-in, footer, ⌘K, auth dialog). Add each finished file to `FINISHED` in `scripts/check-design.mjs`. When a page first uses `font-serif` at display size (D1), add the Instrument Serif preload to `index.html` (2nd and last preload).

## Checklist
- [x] Phase 0 — Recon & audit (`REPO_MAP.md`, `AUDIT.md`, screenshots)
- [x] Phase 1 — Design direction (`DESIGN.md`, A — Monograph)
- [x] Phase 2 — Plan (`PLAN.md`, `PROGRESS.md`, `DECISIONS.md`, CLAUDE.md section)
- [x] A — Foundations (tokens, self-hosted fonts, scales, focus/selection/scrollbar, skip link, `check:design`)
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
| Before A (local `vite preview`, median of 3) | 48 | 100 | 96 | 100 | 5.6 s | 820 ms |
| After A (local `vite preview`, median of 8¹) | 54 | 100 | 96 | 100 | 5.1 s | 640 ms |

¹ Runs 1–2 were CPU-contended (TBT > 2 s, Perf 36) so 5 more were taken; runs: 36, 36, 54, 55, 55, 47, 53, 56. Render-blocking savings fell 751 → 300 ms and CLS 0.023 → 0.002. FCP is still ≈ 4.3 s, set by the JS-rendered splash/hero (fixed in C/D1/E, not fonts).
Desktop (median of 3): before 93 (LCP 1.4 s), after 96 (LCP 1.0 s). BP 96 locally on both sides (not 100 as on live); not caused by A.
