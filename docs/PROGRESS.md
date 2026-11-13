# Redesign v2 — Progress

Branch: `redesign/v2` (from `main`). Plan: `docs/PLAN.md`. Decisions: `docs/DECISIONS.md`.
Update this file at the end of every session.

## Current state (2026-11-13)
**P6 — Polish & QA is built, uncommitted, awaiting the owner's review. With it the redesign is complete** (P5 `b1c745b` is committed).
- Every route is on v2: Privacy/Terms/Refund share `LegalPage` (D-066); Updates, BookNow, Support, PaymentSuccess and My activity (+ both account dialogs) are rebuilt on the page primitives, logic untouched (D-070); offline page, error boundary and network banner too (D-073).
- New: v2 favicon set and `og-image.jpg` (D-067), scroll restoration (D-068), route skeleton and empty states (D-069), focus parity for hover-only effects.
- Cleanup: legacy Tailwind aliases, font aliases, ~400 lines of unused CSS, 5 legacy components and 7 unused deps deleted (D-071, D-072). `check:design --all`: **0** repo-wide.
- code-simplifier ran on the P5 diff: Contact/Blog/BlogPost/validate.js (shared `validateRequired`, module-level `API_URL`, one needless `useCallback`).
- Lighthouse (mobile and desktop, 6 pages, median of 3): Perf 95–100, A11y 100, BP 100, SEO 100. Contact mobile 89 → 99.
- QA sweep (20 routes × 390/768/1024/1440, reduced motion) in **Chromium, Firefox and WebKit**: no horizontal scroll, no console/page errors, one h1 per page. Touch targets ≥ 44 px after P6 fixes (footer, Services links, mobile article TOC, 404 list); left by design: the 32 px desktop article TOC (fine pointers; WCAG 2.5.8 needs 24) and inline in-sentence links (2.5.8 exception). Keyboard pass: skip link first, radio groups on arrows, dialogs trap focus and close on Escape. Scroll restoration checked (push → 0, back → saved 1500). SEO: `useSEO` on every page (only `AdminRedirect` and the dev `_Kit` skip it), every route has a `vercel.json` rewrite, `sitemap.xml` unchanged after build, `llms*.txt` unchanged (no public text they quote changed). Results: `docs/audit/phase-6/sweep-chromium.json`.
- Copy log: `docs/COPY_REVIEW.md` § P6. Screenshots: `docs/audit/phase-6/`.

## Post-merge: hero live panel (2026-11-13, branch `feat/hero-live-panel`, uncommitted)
The redesign is merged to `main` (#25). This change touches only the Home hero (D-074).
- **Portrait removed.** The hero is type only: the name keeps `--text-display` (DESIGN.md defines no larger step). On ≥ 1024px the hero pieces sit on the page grid directly (`display: contents`): name/lede/actions in columns 3–7, the panel in 8–12 with its last line on the baseline of "Yadav" (`align-self: last baseline`). Meta rail and lede keep their places relative to the name.
- **Live panel** (`components/home/HeroLive.jsx`): Lucknow time (IST, ticks on the minute), the last GitHub contribution date, and availability from `siteStatus.js`. Hairline, no fill, Geist Mono, a `<dl>` in a `role="group"` with one static label and `aria-live="off"`. It replaces the hero's separate availability line, so the status isn't shown twice.
- **Shared logic:** the footer's clock, formatters and GitHub derivation moved to `src/lib/liveStatus.js`; the footer and the panel both import it (the footer looks the same).
- **Removed:** the shell portrait, its preload script, the boot's wait on the hero image (`main.jsx`), `.home-hero__portrait/__img`, `.home-status`, and the hero-only `profile-480/768/1122` variants with their build step. Kept: `profile.jpg` (SEO/structured data) and the arch (`Arch.jsx`, used by case studies).
- **QA** (prod build, `vite preview`, Chrome): 1440/1024/768/390, no horizontal scroll and no overlap. A New York visitor sees the same IST time as real IST. A fake clock ticks 11:59 → 12:00 → 12:01. With the browser offline the clock shows, the GitHub line is hidden, there are no requests and no console errors. A real offline reload gets the service worker's `offline.html` (D-073), as before. With GitHub down the line hides; the existing helper still logs its own `console.error`. Reduced motion: no animations in the hero, and no S6 axis. S6 still works on hover at the new width. The arch still clips the case-study frontispiece.
- **Lighthouse (mobile), same host, alternating runs:** `main` 88/90/89 against this branch 89/88/91, so the median is 89 for both. A11y 100 and CLS 0 on all of them. Both are below the P6 98 because this host is slower today (TBT 190–410 ms), not because of this change.
- Gates: `npm run build` ✓, `test:blog` 14/14 ✓, `check:design --all` 0 ✓, `git diff --check` ✓.

## Post-merge: Journey redesign (2026-11-13, branch `feat/journey-redesign`, uncommitted)
Only `/journey`, plus the preview extracted from Projects (D-075–D-077).
- **Shared preview:** `components/ui/HoverPreview` replaces `components/projects/ProjectPreview` (checked on Projects: 12/12 rows preview, still off under reduced motion and on touch). Journey adds a crossfade between rows, a category tile for the one entry with no photo, and a snap under reduced motion. It warms the first 4 preview images after idle.
- **Both pages:** a keyboard preview on `:focus-visible`, and rows that dim to 0.45 while another row is hovered or focused (fine pointer only). Checked: hover, leave and Tab set the right opacities on both pages; nothing dims at 390.
- **Spine:** a hairline in the list column with a node per entry and live dots on the 3 "In Progress" entries. An accent fill tracks the scroll (scaleY, no per-frame layout reads). It's kept on mobile.
- **Sticky year:** IntersectionObserver on the year headings, no scroll math.
- **Rows:** a real `button[aria-expanded]`, the panel `hidden="until-found"`, and photos as a strip of 480px webp variants.
- **QA** (headless Chromium, dev + `vite preview`):
  - 1440 and 1024: consecutive-row crossfade, and the spine fill tracks scroll (0 → 0.2 → 0.52 → 0.84 → 1).
  - Sticky year: 2026 → 2025 → 2024 → hidden on a jump back to the top.
  - All 11 filter chips: node x equals spine x, and the spine ends on the first and last node (the two "misaligned" readings were rows still mid-reveal).
  - Keyboard: 25/25 rows reached, preview on each, and Enter/Space toggle.
  - Reduced motion: no running animations, the preview jumps, and the fill is set directly.
  - 390: no follower mounted, tap expands, thumbnails load the 480 variant, and no horizontal overflow.
  - No console or page errors.
- **Lighthouse (mobile, `vite preview`, Lighthouse 13.4.1):** 99/99/99, A11y 100, LCP 2.0 s, TBT 50–60 ms, CLS 0 (P5 recorded 98/100).
- Screenshots: `docs/audit/journey/` (`journey-before-*` / `journey-after-*`, 1440 and 390; webp copies are tracked, PNGs are gitignored).
- Gates: `npm run build` ✓, `test:blog` 14/14 ✓, `check:design --all` 0 ✓, `git diff --check` ✓.

## Post-merge: Contact redesign (2026-11-13, branch `feat/contact-redesign`, uncommitted)
Only `/contact`, plus two opt-in kit props (D-078–D-082).
- **Form (D-078):** the existing v2 fields, with labels lifting on `--dur-fast` and the existing left-to-right focus line. Validation runs on blur only; typing only clears an error once the value is valid. Errors get a < 400 ms transform shake (new opt-in `shake` prop on `Input`/`Textarea`, off under reduced motion). The counter turns paper at 1800/2000 and red at 2000. Submit: arrow → spinner → drawn check and "Sent" for 2 s, all in one 16 px slot with both labels stacked in one grid cell (new `icon` prop on `Button`), so the button doesn't move (checked: same box in all states). A failure goes back to idle with an inline error, and the input is kept. ⌘/Ctrl+Enter submits; the hint shows only with a fine pointer. One polite live region announces field errors, "Sending…", success and failure (`errorRole={null}` drops the per-field `role="alert"`).
- **Intent chips (D-079):** the Journey/Projects native radio filter (`.pj-seg`) with `role="radiogroup"`, optional, and prefilling an editable Subject (never over custom text). **Not sent as metadata:** `/api/contact` accepts extra fields but its controller only reads name/email/subject/message, so the field would be dropped. The backend is unchanged.
- **Elsewhere (D-080):** 9 rows, same links. Each has a 16 px muted icon (`aria-hidden`) that takes the platform's colour on link hover or focus. Colour changes instantly, with no transition. WhatsApp is first, with its label and note in paper. Resume opens `/resume.pdf` (200, `application/pdf`) in a new tab; there was no download micro-interaction to reuse.
- **LiveStatus (D-081):** no new component. The page's time/status/GitHub/email block *is* the footer colophon, which already shares `lib/liveStatus.js` with the hero (D-074). Fix: the footer's GitHub line can no longer print "NaN".
- **Signature touch (D-082):** owner chose an English line: "Thanks, {first name}, it's in my inbox. I'll reply to {email}." No Devanagari (D-034).
- **QA** (Vite dev, Playwright headless, `/api/contact` stubbed, no real emails):
  - Submit runs sending → sent → idle with no box change.
  - The 500 and network-error paths both keep the input.
  - Empty name and bad email: each shows its message and shakes on blur, then clears on correction. An empty submit shakes 4 fields, focuses Name and announces "4 fields need attention".
  - Keyboard order: email, copy, name, email, intent group (arrows), subject, message, submit, 9 rows, then the footer's copy.
  - Reduced motion: no shake (`animation: none`), and transitions use the global 0.01 ms.
  - 390 (touch): the chips wrap to 2 lines, no horizontal scroll, and no ⌘⏎ hint.
  - No console or page errors.
- **Lighthouse (mobile, `vite preview`, 13.4.1, alternating with `main` on the same host):** `main` 89/87/89/87/86/88 against the branch 88/92/91/93/82/92, so the medians are 87.5 and 91.5. A11y 100 (one 4.23:1 legend contrast miss was fixed), CLS 0. Both are below P6's 99 because the host is slower today.
- Screenshots: `docs/audit/contact/` (`contact-before-*` / `contact-after-*`, 1440 and 390, plus 1440 idle/sending/sent/error close-ups).
- Gates: `npm run build` ✓, `test:blog` 14/14 ✓, `check:design --all` 0 ✓, `git diff --check` ✓.

## Post-merge: SEO + AI visibility (2026-11-13, branch `feat/seo-ai-visibility`, uncommitted)
Meta, data and structure only; no visual or layout change. Report: `docs/SEO_AUDIT.md`.
- `src/lib/seo.js` is the one source for every route's title, description, canonical, OG/Twitter and JSON-LD `@graph`; `useSEO` reads it on the client and `scripts/route-heads.js` prerenders it into `dist/<route>/index.html` (60 routes + Home). `vercel.json` rewrites each route to its own file, so unknown slugs return a real 404.
- Removed the dead `/api/ai/chat` function (500 since `0d4b615`); `openapi.json`, `mcp.json`, `llms.txt`, `llms-full.txt` corrected from the repo data.
- **Freshness:** SEO/structured-data files (llms.txt, llms-full.txt, sitemap.xml, JSON-LD project data) must be reviewed whenever a project, journey entry, or blog post is added/changed — they are hand-written summaries, not auto-generated, so they drift out of sync silently.
- **Lighthouse (13.4.1, `vite preview`, median of 3, alternating with `main`):** mobile Perf 94–98 (main 94–98), desktop 100 on all 6 routes; A11y 100, SEO 100, CLS 0 on both. `/projects/smartmess` mobile LCP 2.7 s on both builds (pre-existing).
- Gates: `npm run build` ✓, `test:blog` 14/14 ✓, `check:design --all` 0 ✓, `git diff --check` ✓.

## Colour + motion + mobile pass (2026-11-13, branch `feat/color-motion-mobile`, uncommitted)
- **Colour:** `--accent` is `#C6F432` (15.16:1 on ink, and 15.16:1 for ink text on a lime fill), with new `--accent-contrast-text` and `--accent-muted`. Literal `#fff`/`#000` are replaced with tokens. The primary CTA is an accent outline, never a fill (D-088), and the Journey spine fill is muted. The permanent lime rules are in DESIGN.md. Measured: at most one in-content accent moment plus the dock dot at default scroll on all 8 pages, under 0.06% of the screen.
- **Motion:** scroll-driven `view()` reveals, with the IntersectionObserver as fallback. On-screen-at-load content is static. Below-fold headings are split by line (`LineMask`). There is one parallax: the hero live panel at 0.60× from 1200px up (D-091). A single reduced-motion rule set covers all of it. The preloader is still dropped (D-055).
- **Mobile:** body leading is 1.7 below 768px. Reveal travel is 16px below 768px. At 360 and 390 there are 0 tap targets under 44×44 and no horizontal overflow. The dock uses `env(safe-area-inset-bottom)`. The cursor, magnetic pull and row previews are fine-pointer only.
- **QA:**
  - Reveals: nothing is left hidden after reading or after a jump to the bottom in Chromium 156 and WebKit 26.6 (scroll-driven) and Firefox 156 (fallback).
  - Reduced motion: no animation and nothing hidden.
  - Keyboard: every focus ring is the 2px accent.
  - Screenshots: `docs/audit/phase-color-motion/` (committed: `compare-<width>.webp`, before/after first viewport for all 8 pages; the full-page before/after JPGs are kept local, per D-005).
- **Lighthouse (mobile, 13.4.1, `vite preview`, median of 3):** `/` 97, `/about` 97, `/projects` 98, `/projects/smartmess` 95, `/blog/what-is-mcp` 98, `/contact` 99, `/journey` 96. A11y 100, SEO 100, CLS 0 on all of them. BP 96 is the known local `/health` gap. That compares with the SEO-pass branch at 95/98/98/94/94/98. A first pass showed A11y 96/97 from part-faded on-screen text at load; that is fixed (D-089).
- **Gates:** `npm run build`, `npm run test:blog` (14/14), `npm run check:design --all` (0 hits) and `git diff --check` all pass.

## Next step
0. Owner reviews `feat/seo-ai-visibility` (`docs/SEO_AUDIT.md`), approves the commit, then checks the Vercel preview (per-route heads, slug 404s).
1. Owner reviews the Contact redesign and approves the commit.
2. Owner reviews the Journey redesign and approves the commit.
3. Earlier: owner answers the ⚠ copy rows (P3–P6); re-run Lighthouse on the live site after deploy.

## Checklist
- [x] Phase 0 — Recon & audit (`REPO_MAP.md`, `AUDIT.md`, screenshots)
- [x] Phase 1 — Design direction (`DESIGN.md`, A — Monograph)
- [x] Phase 2 — Plan (`PLAN.md`, `PROGRESS.md`, `DECISIONS.md`, CLAUDE.md section)
- [x] A — Foundations (tokens, self-hosted fonts, scales, focus/selection/scrollbar, skip link, `check:design`)
- [x] B — Core components (ui kit, nav without Sign-in, footer, Cmd+K, auth dialog). Partly superseded by P2.
- [x] Signature-layer revision of DESIGN/PLAN (owner review, D-026)
- [x] P2 — System: type specimen, motion, dock, cursor, buttons/inputs, preloader, route wipe, reveal fix (`529650f`)
- [x] P3 — Home end to end + colophon footer (`45150a9`)
- [x] P4 — Projects index + case studies (`dec113f`)
- [x] P5 — About, Skills, Journey, Services, Blog, Contact, 404 (`b1c745b`)
- [x] P6 — Polish & QA (OG image, icons, remaining pages, cleanup, sweep, cross-browser) (uncommitted, awaiting review)

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
| **P5 `/about`** (median of 3⁹) | **96** | 100 | 96 | 100 | 2.0 s | 180 ms |
| **P5 `/journey`** (median of 3⁹) | **98** | 100 | 96 | 100 | 2.0 s | 110 ms |
| **P5 `/blog`** (median of 3⁹) | **97** | 100 | 96 | 100 | 2.0 s | 160 ms |
| **P5 `/blog/what-is-mcp`** (median of 3⁹) | **97** | 100 | 96 | 100 | 2.1 s | 90 ms |
| **P5 `/services`** (median of 3⁹) | **98** | 100 | 96 | 100 | 2.0 s | 90 ms |
| P5 `/contact` (median of 3⁹) | 89 | 100 | 96 | 100 | 2.0 s | 380 ms |
| **P6 Home** (median of 3¹⁰) | **98** | 100 | **100** | 100 | 2.0 s | 135 ms |
| **P6 `/projects`** | **98** | 100 | 100 | 100 | 2.0 s | 68 ms |
| **P6 `/projects/kanoon-mate`** | **99** | 100 | 100 | 100 | 2.0 s | 63 ms |
| **P6 `/blog`** | **95** | 100 | 100 | 100 | 2.7 s | 39 ms |
| **P6 `/blog/what-is-mcp`** | **98** | 100 | 100 | 100 | 2.1 s | 100 ms |
| **P6 `/contact`** | **99** | 100 | 100 | 100 | 2.0 s | 39 ms |
| **Journey redesign `/journey`** (median of 3) | **99** | 100 | — | — | 2.0 s | 60 ms |

¹ Runs 1–2 were CPU-contended (TBT > 2 s, Perf 36) so 5 more were taken; runs: 36, 36, 54, 55, 55, 47, 53, 56. Render-blocking savings fell 751 → 300 ms and CLS 0.023 → 0.002. FCP is still ≈ 4.3 s, set by the JS-rendered splash/hero (fixed in C/D1/E, not fonts).
² Runs 62, 64, 65; FCP 4.2 s, CLS 0.004. Gain is mostly the nav dropping framer-motion `layoutId` and the scroll listener. Desktop after B: 97 (LCP 1.0 s).
Desktop (median of 3): before 93 (LCP 1.4 s), after 96 (LCP 1.0 s). BP 96 locally on both sides (not 100 as on live); not caused by A.
³ Runs 62, 63, 65, 64, 64 (an earlier CPU-contended set of 3 gave 34/61/49 and was discarded). FCP 3.8 s, CLS 0. Target ≥ 70 missed: LCP is the old Home hero (P3). Without the preloader: 62, 61, 63 — it costs nothing (D-039). Desktop (median of 3): 94 (runs 94, 71 contended, 96; LCP 1.2 s).
⁴ Runs 98, 97, 97 (TBT 80/110/130 ms); FCP 1.7 s, CLS 0, 0 rAF calls at idle. Desktop: 100 ×3 (LCP 0.5 s). Path there: 46 → 66 (portrait eager, one word per line, so the font swap has no CLS) → 74 (static hero shell + boot after paint) → 87 (boot waits for the hero's fonts and image) → 92–97 (icons no longer fetch the 406 KB `favicon.svg` before LCP; TBT still 180–330 ms) → 97–98 (first render in `startTransition`, so React time-slices it; TBT ≤ 130 ms). BP 96 is the same local-only gap as before.

⁵ Runs 68, 68, 69; CLS 0. **Target ≥ 90 missed because of the P2 preloader, not P4:** the mobile LCP element is `.preloader__name` (Lighthouse is always a first visit, and the preloader is skipped only on "/"). `/about` (untouched in P4) scores 55 for the same reason. The case study passes because its lede is larger than the preloader text. Desktop: `/projects` 99 (runs 94, 99, 99), case study 95 (94, 99, 95). A11y 100, SEO 100 everywhere; BP 96 is the known local-only gap. Owner chose to drop it (D-055, ⁶).

⁶ D-055. The LCP element is now page content (`.pj-lede`, `.case-lede`). Runs: `/projects` 55, 65, 57; case study 72, 61, 61. CPU was partly contended (bootup 1.0–1.2 s vs 0.5 s uncontended); the cleanest run was 72, LCP 5.0 s. **Mobile ≥ 90 is still missed on JS-rendered pages:** nothing paints before the boot, vendor (~640 KB) and framer (~360 KB) chunks load. Home reaches 97 only through its static shell (D-044). Fix candidates: static shells per route, or framer/vendor out of the boot path.

⁷ The host was heavily contended for the whole set (22–59% background load from other apps; bootup 0.8–1.6 s vs 0.4–0.5 s quiet). Unchanged Home code ranged 80–98 in the same set. Quiet runs during this pass: `/projects` 97 and 88 (LCP 2.0 s, 3.4 s), case study 89 and 89 (LCP 3.2–3.3 s). Critical-path JS is ~260 KB gzip, down from ~501 KB. **Mobile ≥ 90 is not yet proven** on JS-rendered pages. The structural fix left is a pre-JS shell for `/projects` and `/projects/:slug` (title + lede painted from index.html, like D-044). Re-measure on a quiet machine first.

⁸ D-057. Runs: `/projects` 96, 84, 99; case study 87, 80, 98, 99, 99; notes-app 89, 94, 99; Home 97, 97, 98. CLS 0 everywhere. The lower runs are TBT from host CPU contention (bootup 0.9–1.3 s); LCP was 2.0–2.1 s in every run. Desktop (before the boot deferral, median of 3): `/projects` 99, case study 98, notes-app 97, Home 100. Shell paint measured at 48–168 ms (unthrottled). **Mobile ≥ 90 met on `/projects` and the case studies.**

⁹ P5, local `vite preview`, mobile. Quiet host (benchmark index ≈ 1710): About 95/96/96, Journey 99/98/96, Blog 96/97/97, article 97/81/98, Services 99/98/75, Contact 87/89/98. CLS 0 and A11y 100 / SEO 100 on every run; the low outliers are TBT/LCP spikes. Two later sets ran on a contended host (benchmark ≈ 750–860, half speed): unchanged About scored 73–95 and Contact 79–92, so they're not used. **Contact (median 89) is not yet proven ≥ 90**: its own work is two ~70 ms document tasks; the rest is the shared boot (vendor + `index` chunk, ~380 ms at 4× throttle). Re-measure on a quiet machine before P6 work on the boot path. Desktop (median of 3): About 100, Journey 100, Blog 100, article 98, Services 99, Contact 100.
¹⁰ P6, Lighthouse 13.4.1, Chrome stable headless, local `vite preview`. Runs: Home 96/98/98, Projects 98/99/98, case study 98/99/99, Blog 95/95/99, article 98/98/98, Contact 99/99/99. **Desktop: 100 ×3 on all six.** CLS ≤ 0.003. BP is 100 now because a stub on :5000 answered `/health` and `/api/auth/me` with the backend's real signed-out responses (200, `user: null`); the old "BP 96 local-only gap" was just those two refused requests. Contact's gain is the P6 cleanup (≈400 lines less global CSS, 7 deps gone) and the shared validators.

## P5 self-critique ("looks templated" check)
1. **Seven pages on one header + numbered-section recipe could read as a template.** Each page uses the recipe for a different "page of the book": About is an essay with facts, Skills an index, Journey an archive by year, Services a price list, Contact a form plus a directory, the article a chapter with its contents in the margin. The header is shared because it is the one thing that paints before JS.
2. **Hairline lists everywhere is the minimal-portfolio default.** The label column always carries a real fact (date, price, category, platform), never an icon or a number for decoration, and lists replace what used to be cards-in-cards, so the structure is the content.
3. **A reading-progress bar is a blog cliché.** It's 1px, under the chrome, scroll-linked (no animation), and the accent's job there is "current position", the same job it has in the dock and the TOC tick.
4. **Accordion journeys look like every résumé site.** Native `<details>` keeps all 25 entries visible as titles, works without JS and with find-in-page; the only accent is "Now", driven by the data's `status`.
5. **"Contact" pages with a form and social list are generic.** The validation mirrors this site's own backend rules, errors come back onto the fields, and the success state names what happens next; no "Let's build something great".
Still templated: the service descriptions in `servicesData.js` are marketing-toned ("production-ready", "performance-focused"); they're the owner's data, so they're shown as written and flagged rather than rewritten.

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
