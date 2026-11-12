# Redesign v2 — Progress

Branch: `redesign/v2` (from `main`). Plan: `docs/PLAN.md`. Decisions: `docs/DECISIONS.md`.
Update this file at the end of every session.

## Current state (2026-11-12)
**P3 — Home end to end is built, uncommitted, awaiting the owner's review.** P2 is committed (`529650f`).
- Home is rebuilt as Monograph "pages": title page with the S6 name and the S3 arch portrait, then About, Selected work (`featured` flag), Skills, Notebook, Journey and Contact.
- The S4 live colophon footer is site-wide.
- `NeuralNetworkCanvas`, `OpeningContext`, every Home gradient/glow, the pill, the badge, the marquee, the ring and the stat cards are gone.
- Perf work (D-044–D-046):
  - a static hero shell in `index.html`, with the app booting after the hero paints;
  - small icon PNGs instead of the 406 KB favicon;
  - one CSS file, which also fixes lazy-route CSS never loading.
- `siteStatus`: availability is filled by the owner; "currently building" is still `null` (skipped).
- Copy log: `docs/COPY_REVIEW.md` (⚠ items to confirm). Screenshots: `docs/audit/phase-3/`.

## Next step
1. Owner reviews P3, confirms the ⚠ copy rows, and approves the commit.
2. **P4 — Projects** (confirm the top-6 list; S7 index; case studies).

## Checklist
- [x] Phase 0 — Recon & audit (`REPO_MAP.md`, `AUDIT.md`, screenshots)
- [x] Phase 1 — Design direction (`DESIGN.md`, A — Monograph)
- [x] Phase 2 — Plan (`PLAN.md`, `PROGRESS.md`, `DECISIONS.md`, CLAUDE.md section)
- [x] A — Foundations (tokens, self-hosted fonts, scales, focus/selection/scrollbar, skip link, `check:design`)
- [x] B — Core components (ui kit, nav without Sign-in, footer, Cmd+K, auth dialog). Partly superseded by P2.
- [x] Signature-layer revision of DESIGN/PLAN (owner review, D-026)
- [x] P2 — System: type specimen, motion, dock, cursor, buttons/inputs, preloader, route wipe, reveal fix (`529650f`)
- [x] P3 — Home end to end + colophon footer (uncommitted, awaiting review)
- [ ] P4 — Projects index + case studies (**confirm the top-6 list**)
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

¹ Runs 1–2 were CPU-contended (TBT > 2 s, Perf 36) so 5 more were taken; runs: 36, 36, 54, 55, 55, 47, 53, 56. Render-blocking savings fell 751 → 300 ms and CLS 0.023 → 0.002. FCP is still ≈ 4.3 s, set by the JS-rendered splash/hero (fixed in C/D1/E, not fonts).
² Runs 62, 64, 65; FCP 4.2 s, CLS 0.004. Gain is mostly the nav dropping framer-motion `layoutId` and the scroll listener. Desktop after B: 97 (LCP 1.0 s).
Desktop (median of 3): before 93 (LCP 1.4 s), after 96 (LCP 1.0 s). BP 96 locally on both sides (not 100 as on live); not caused by A.
³ Runs 62, 63, 65, 64, 64 (an earlier CPU-contended set of 3 gave 34/61/49 and was discarded). FCP 3.8 s, CLS 0. Target ≥ 70 missed: LCP is the old Home hero (P3). Without the preloader: 62, 61, 63 — it costs nothing (D-039). Desktop (median of 3): 94 (runs 94, 71 contended, 96; LCP 1.2 s).
⁴ Runs 98, 97, 97 (TBT 80/110/130 ms); FCP 1.7 s, CLS 0, 0 rAF calls at idle. Desktop: 100 ×3 (LCP 0.5 s). Path there: 46 → 66 (portrait eager, one word per line, so the font swap has no CLS) → 74 (static hero shell + boot after paint) → 87 (boot waits for the hero's fonts and image) → 92–97 (icons no longer fetch the 406 KB `favicon.svg` before LCP; TBT still 180–330 ms) → 97–98 (first render in `startTransition`, so React time-slices it; TBT ≤ 130 ms). BP 96 is the same local-only gap as before.

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
