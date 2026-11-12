# Redesign v2 — Progress

Branch: `redesign/v2` (from `main`). Plan: `docs/PLAN.md`. Decisions: `docs/DECISIONS.md`.
Update this file at the end of every session.

## Current state (2026-11-12)
Phase **B — Core components** is done, **uncommitted** pending the user's approval (A is committed as `9b86d14`).
- UI kit in `src/components/ui/` (`Button` primary/secondary/ghost/link with sliding fill on fine pointers, 0.98 press, loading/disabled; `TextLink` underline draw; `Input`/`Textarea`; `Tag`; `Card` as a hairline row; `Rule`; `index.js`; styles in `ui.css`). Dev-only sheet at `/_kit` (`src/pages/_Kit.jsx`, `import.meta.env.DEV` only).
- Shared `src/hooks/useFocusTrap.js` (stacked traps, Esc, focus return) used by the drawer, ⌘K and the auth dialog.
- Nav (`Navbar.jsx`/`.css`): solid ink bar + hairline, serif wordmark, 6 links with `aria-current` + accent underline, Search (icon-only < 640 and 1024–1279), Resume ↗ text link, avatar menu when signed in, **no Sign in** (D-002). Drawer = serif "Contents" list of 8 pages, inert when closed, focus-trapped. framer-motion and the scroll listener are gone from the nav.
- Footer: colophon layout; "Sign in" lives under Account (My activity when signed in). Same links, copy and `/admin` link as before.
- ⌘K restyled on tokens (ink-raised, rule, sentence-case groups, underline filter tabs, accent bar on the selected item only); logic unchanged apart from the focus trap and scroll-lock restore.
- Auth dialog restyled; network errors ("Failed to fetch") show friendly copy (`auth/authErrors.js`); Google button `shape: rectangular`.
- `check:design`: 0 hits in 17 FINISHED files, 500 todo (was 553). Entry chunk 680 → 658 kB.
- Gates: build ✓, `test:blog` 14/14 ✓, `git diff --check` ✓, keyboard script 19/19 (tab order, focus ring, ⌘K open/trap/Esc/toggle, drawer trap + inert + 44px targets, footer Sign in → dialog trap + Esc + focus return), no horizontal scroll at 390–1440, header targets ≥ 44px at all widths. Contrast: paper/ink 16.2, muted/ink 6.7, muted/ink-raised 6.3, placeholder 4.6.
- Screenshots: `docs/audit/after/B/{before,after}/` (nav, footer, palette, drawer, auth at 4 widths + `kit-1440`). The "before" mobile auth dialog has no shot (its trigger was inside the closed drawer).
- Not done here: `BackToTop` (blue ring) and the cursor spotlight still show on every page — C/G.

## Next step
Phase **C — Motion system** (`src/lib/motion.js`, CSS route fade, remove splash/cursor/tilt/reveals; **confirm RadialMenu removal**). The `--ease-out`/`--dur-*` vars added to `src/index.css` in B are the seed for `motion.js`. When splash goes, drop Navbar's `navReady`/`logoRef` props.

## Checklist
- [x] Phase 0 — Recon & audit (`REPO_MAP.md`, `AUDIT.md`, screenshots)
- [x] Phase 1 — Design direction (`DESIGN.md`, A — Monograph)
- [x] Phase 2 — Plan (`PLAN.md`, `PROGRESS.md`, `DECISIONS.md`, CLAUDE.md section)
- [x] A — Foundations (tokens, self-hosted fonts, scales, focus/selection/scrollbar, skip link, `check:design`)
- [x] B — Core components (ui kit, nav without Sign-in, footer, Cmd+K, auth dialog)
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
| After B (local `vite preview`, median of 3²) | 64 | 100 | 96 | 100 | 4.9 s | 340 ms |

¹ Runs 1–2 were CPU-contended (TBT > 2 s, Perf 36) so 5 more were taken; runs: 36, 36, 54, 55, 55, 47, 53, 56. Render-blocking savings fell 751 → 300 ms and CLS 0.023 → 0.002. FCP is still ≈ 4.3 s, set by the JS-rendered splash/hero (fixed in C/D1/E, not fonts).
² Runs 62, 64, 65; FCP 4.2 s, CLS 0.004. Gain is mostly the nav dropping framer-motion `layoutId` and the scroll listener. Desktop after B: 97 (LCP 1.0 s).
Desktop (median of 3): before 93 (LCP 1.4 s), after 96 (LCP 1.0 s). BP 96 locally on both sides (not 100 as on live); not caused by A.
