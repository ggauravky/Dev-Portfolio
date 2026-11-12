# Redesign v2 — Progress

Branch: `redesign/v2` (from `main`). Plan: `docs/PLAN.md`. Decisions: `docs/DECISIONS.md`.
Update this file at the end of every session.

## Current state (2026-11-12)
**P4 — Projects is built, uncommitted, awaiting the owner's review.** P3 is committed (`45150a9`).
- `/projects` is an S7 ranked index: the 6 owner-confirmed case studies, then 20 compact rows. Filter (category, search) and order (rank, title, stack size) live in the URL. A spring hover preview appears on fine pointers. The empty state has a Clear filters button. No year column: the data has none (D-050).
- `/projects/:slug` is one chapter template for all 26 projects: an arch frontispiece, a facts rail, and Problem, Team, What it does, Architecture, Key decisions, What I learned, Screens and Next. Missing data hides its chapter (D-051).
- `/projects` and every case study paint a static header shell from `index.html` before any JS (D-057); the preloader is gone (D-055), and the boot path is ~260 KB gzip (D-056).
- Row → case study and case study → next morph the title (and the preview into the arch) with View Transitions. There's an instant fallback (D-052).
- Shared grid, arch and line-mask moved to `src/styles/page.css` (D-054). Home "Selected work" uses the same ranking (D-049).
- Copy log: `docs/COPY_REVIEW.md` § P4 (⚠ rows, including 3 data claims to verify). Screenshots: `docs/audit/phase-4/`.

## Next step
1. Owner reviews P4, confirms the ⚠ copy rows, and approves the commit.
2. **P5 — Remaining pages.**

## Checklist
- [x] Phase 0 — Recon & audit (`REPO_MAP.md`, `AUDIT.md`, screenshots)
- [x] Phase 1 — Design direction (`DESIGN.md`, A — Monograph)
- [x] Phase 2 — Plan (`PLAN.md`, `PROGRESS.md`, `DECISIONS.md`, CLAUDE.md section)
- [x] A — Foundations (tokens, self-hosted fonts, scales, focus/selection/scrollbar, skip link, `check:design`)
- [x] B — Core components (ui kit, nav without Sign-in, footer, Cmd+K, auth dialog). Partly superseded by P2.
- [x] Signature-layer revision of DESIGN/PLAN (owner review, D-026)
- [x] P2 — System: type specimen, motion, dock, cursor, buttons/inputs, preloader, route wipe, reveal fix (`529650f`)
- [x] P3 — Home end to end + colophon footer (`45150a9`)
- [x] P4 — Projects index + case studies (uncommitted, awaiting review)
- [ ] P5 — About, Skills, Journey, Services, Blog, Contact, 404
- [ ] P6 — Polish & QA (OG image, sweep, cross-browser, legacy cleanup)

## Lighthouse log (mobile, median of 3)
| Phase | Perf | A11y | BP | SEO | LCP | TBT |
|---|---|---|---|---|---|---|
| Baseline (live, single run) | 38 | 100 | 100 | 100 | 7.1 s | 1,140 ms |
| Before A (local `vite preview`, median of 3) | 48 | 100 | 96 | 100 | 5.6 s | 820 ms |
| After A (local `vite preview`, median of 8¹) | 54 | 100 | 96 | 100 | 5.1 s | 640 ms |
| After B (local `vite preview`, median of 3²) | 64 | 100 | 96 | 100 | 4.9 s | 340 ms |
| After P2 (local `vite preview`, median of 5³) | 64 | 100 | 96 | 100 | 5.4 s | 310 ms |
| After P3 (local `vite preview`, median of 3⁴) | 97 | 100 | 96 | 100 | 2.1 s | 110 ms |
| After P4 `/projects` (local `vite preview`, median of 3⁵) | 68 | 100 | 96 | 100 | 5.2 s | 250 ms |
| After P4 `/projects/kanoon-mate` (median of 3) | 97 | 100 | 96 | 100 | 2.1 s | 120 ms |
| P4 without preloader `/projects` (median of 3⁶) | 57 | 100 | 96 | 100 | 5.5 s | 690 ms |
| P4 without preloader `/projects/kanoon-mate` (median of 3⁶) | 61 | 100 | 96 | 100 | 5.2 s | 620 ms |
| P4 + boot-path cut (D-056) `/projects` (median of 5⁷) | 70 | 100 | 96 | 100 | 4.2 s | 540 ms |
| P4 + boot-path cut (D-056) `/projects/kanoon-mate` (median of 5⁷) | 70 | 100 | 96 | 100 | 4.3 s | 530 ms |
| P4 + boot-path cut (D-056) Home (median of 5⁷) | 91 | 100 | 96 | 100 | 2.2 s | 280 ms |
| **P4 + route shells (D-057) `/projects`** (median of 3⁸) | **96** | 100 | 96 | 100 | 2.0 s | 160 ms |
| **P4 + route shells `/projects/kanoon-mate`** (median of 5⁸) | **98** | 100 | 96 | 100 | 2.0 s | 0 ms |
| **P4 + route shells `/projects/notes-app`** (median of 3⁸) | **94** | 100 | 96 | 100 | 2.1 s | 240 ms |
| P4 + route shells Home (median of 3⁸) | 97 | 100 | 96 | 100 | 2.1 s | 130 ms |

¹ Runs 1–2 were CPU-contended (TBT > 2 s, Perf 36) so 5 more were taken; runs: 36, 36, 54, 55, 55, 47, 53, 56. Render-blocking savings fell 751 → 300 ms and CLS 0.023 → 0.002. FCP is still ≈ 4.3 s, set by the JS-rendered splash/hero (fixed in C/D1/E, not fonts).
² Runs 62, 64, 65; FCP 4.2 s, CLS 0.004. Gain is mostly the nav dropping framer-motion `layoutId` and the scroll listener. Desktop after B: 97 (LCP 1.0 s).
Desktop (median of 3): before 93 (LCP 1.4 s), after 96 (LCP 1.0 s). BP 96 locally on both sides (not 100 as on live); not caused by A.
³ Runs 62, 63, 65, 64, 64 (an earlier CPU-contended set of 3 gave 34/61/49 and was discarded). FCP 3.8 s, CLS 0. Target ≥ 70 missed: LCP is the old Home hero (P3). Without the preloader: 62, 61, 63 — it costs nothing (D-039). Desktop (median of 3): 94 (runs 94, 71 contended, 96; LCP 1.2 s).
⁴ Runs 98, 97, 97 (TBT 80/110/130 ms); FCP 1.7 s, CLS 0, 0 rAF calls at idle. Desktop: 100 ×3 (LCP 0.5 s). Path there: 46 → 66 (portrait eager, one word per line, so the font swap has no CLS) → 74 (static hero shell + boot after paint) → 87 (boot waits for the hero's fonts and image) → 92–97 (icons no longer fetch the 406 KB `favicon.svg` before LCP; TBT still 180–330 ms) → 97–98 (first render in `startTransition`, so React time-slices it; TBT ≤ 130 ms). BP 96 is the same local-only gap as before.

⁵ Runs 68, 68, 69; CLS 0. **Target ≥ 90 missed because of the P2 preloader, not P4:** the mobile LCP element is `.preloader__name` (Lighthouse is always a first visit, and the preloader is skipped only on "/"). `/about` (untouched in P4) scores 55 for the same reason. The case study passes because its lede is larger than the preloader text. Desktop: `/projects` 99 (runs 94, 99, 99), case study 95 (94, 99, 95). A11y 100, SEO 100 everywhere; BP 96 is the known local-only gap. Owner chose to drop it (D-055, ⁶).

⁶ D-055. The LCP element is now page content (`.pj-lede`, `.case-lede`). Runs: `/projects` 55, 65, 57; case study 72, 61, 61. CPU was partly contended (bootup 1.0–1.2 s vs 0.5 s uncontended); the cleanest run was 72, LCP 5.0 s. **Mobile ≥ 90 is still missed on JS-rendered pages:** nothing paints before the boot, vendor (~640 KB) and framer (~360 KB) chunks load. Home reaches 97 only through its static shell (D-044). Fix candidates: static shells per route, or framer/vendor out of the boot path.

⁷ The host was heavily contended for the whole set (22–59% background load from other apps; bootup 0.8–1.6 s vs 0.4–0.5 s quiet). Unchanged Home code ranged 80–98 in the same set. Quiet runs during this pass: `/projects` 97 and 88 (LCP 2.0 s, 3.4 s), case study 89 and 89 (LCP 3.2–3.3 s). Critical-path JS is ~260 KB gzip, down from ~501 KB. **Mobile ≥ 90 is not yet proven** on JS-rendered pages. The structural fix left is a pre-JS shell for `/projects` and `/projects/:slug` (title + lede painted from index.html, like D-044). Re-measure on a quiet machine first.

⁸ D-057. Runs: `/projects` 96, 84, 99; case study 87, 80, 98, 99, 99; notes-app 89, 94, 99; Home 97, 97, 98. CLS 0 everywhere. The lower runs are TBT from host CPU contention (bootup 0.9–1.3 s); LCP was 2.0–2.1 s in every run. Desktop (before the boot deferral, median of 3): `/projects` 99, case study 98, notes-app 97, Home 100. Shell paint measured at 48–168 ms (unthrottled). **Mobile ≥ 90 met on `/projects` and the case studies.**

## P4 self-critique ("looks templated" check)
1. **A hover image that follows the cursor over a list is a common awards-site index.** It is used only where it adds information (touch gets none). It springs on the shared `SPRING.soft`, and when you click it becomes the case study's arch, so the effect feeds the navigation instead of just decorating it.
2. **Filter chips over a list are the standard portfolio filter.** These are native radio groups set as plain text with counts and the accent underline ("current"). They are not pills, and the state is in the URL.
3. **"01 Problem / 02 Solution" case studies read like a template.** The chapters are only the ones the data supports, so pages differ in length (Notes App has 5, Kanoon-Mate 7). The architecture is shown as the project's own pipeline steps, and the page ends on "Next", like a book, not a CTA box.
4. **An arch-masked hero image is a 2024 trend.** It is the one Lucknow shape (S3) shared with the Home portrait, never used for decoration elsewhere, and the full screenshots stay uncropped.
5. **A big serif project title morphing between pages is a View Transitions demo cliché.** It costs nothing when unsupported, runs ≤ 520 ms, and is one of only three moments per page; the route wipe steps aside rather than stacking two effects.
Still templated: the descriptions in the data are marketing-toned ("production-ready", "high-performance"); they are facts the owner wrote, so they're flagged rather than rewritten.

## P3 self-critique ("looks templated" check)
1. **Numbered sections in a margin rail ("01 About") are a common editorial template.** Made specific: the numbers continue the dock's "01 / Home" contents-page index, they are mono and muted, and the rail also carries real meta (city, degree).
2. **A big serif name plus a portrait on the right is the default portfolio hero.** The name's slot-locked weight axis (letters thin near the cursor without reflow) and the Awadhi cusped arch from Lucknow are specific to Gaurav and his city; neither ships in a kit.
3. **"Selected work" as a hairline index is the Rauno/Paco pattern.** Kept on purpose (Monograph, "index not grid"). It is driven by the data's `featured` flag and shows team/solo from the data; S7 (sort, filter, preview) lands in P4.
4. **The giant footer wordmark is a 2024 awards trope.** It is the S2 "name as type" that recurs in the preloader and route wipe, and it sits under live facts (IST clock, GitHub activity, availability) rather than as decoration.
5. **Near-black + one lime dot.** Lime appears only on availability, the "Now" roles, link underlines and focus: under 1% of any Home screen.

## P2 self-critique ("looks templated" check)
1. **Bottom pill dock is a known pattern.** Made specific: a contents-page index ("03 / Projects", mono) that matches the Monograph book metaphor, a scroll ring instead of a progress bar, and the accent only on the current page.
2. **Cursor dot with "View" chips is an awards-site cliché.** Limited to four functional labels, shown only where the action is real; hidden on touch and under reduced motion; text fields keep the I-beam.
3. **000→100 preloader counter is a trope.** It's tied to the name in Fraunces, ≤ 1.4 s, once per session, skippable, and costs no Performance (D-039). It's the first thing to drop if the owner dislikes it.
4. **Near-black + grain + lime is a common generated look.** Grain is 3.5 % and static; lime appears only for current page, focus and (once filled) availability.
5. **Magnetic buttons and text-roll everywhere read as a kit.** Magnet only on boxed buttons (10 px max), dock items 4 px; links keep a plain underline draw.
Still templated today: every page body is the old styling (gradients, caps, pills). That's P3–P5 by design; the shell and pages currently mix two languages until then.
