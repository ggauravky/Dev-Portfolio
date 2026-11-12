# Redesign v2 — Build plan

> Approved 2026-11-12 (Phase 2). Branch `redesign/v2`. One phase per session; track status in `docs/PROGRESS.md`, decisions in `docs/DECISIONS.md`.


## Context
Phase 0 (`docs/REPO_MAP.md`, `docs/AUDIT.md`) and Phase 1 (`docs/DESIGN.md`, direction **A — Monograph**) are done. This plan splits the build into one-session phases, each with files, acceptance criteria, risks and rollback. The goals are mobile Lighthouse Performance ≥ 90 (baseline 38) and removing the "AI-look" tells. Data, URLs, SEO and hosting stay as they are.

**User decisions (2026-11-12):**
- Sign-in leaves the main nav.
- Motion follows Monograph's quiet style: sliding-fill buttons, 0.98 press, underline draw, a 150 ms route crossfade, and a stagger on the hero's secondary lines only. The heading stays static, and there is no custom cursor or magnetic hover.

## On approval (this session, no commit)
1. Run `git switch -c redesign/v2` from `main`. The untracked `docs/*` files come along.
2. Write `docs/PLAN.md` (this plan), `docs/PROGRESS.md` (a checklist of phases A–G with sub-phases, plus "Current state" and "Next step"), and `docs/DECISIONS.md` (entries D-001 to D-009 below).
3. Add to `CLAUDE.md` a section of about 250 tokens, "Redesign v2 (in progress)", so the file stays under 2k tokens:
   - Read `docs/REPO_MAP.md`, `docs/DESIGN.md` and `docs/PROGRESS.md` first, and update PROGRESS at the end of every session.
   - Anti-slop rules from DESIGN.md:
     - Banned: gradients and gradient text, glass, glow and coloured shadows, emoji icons, card-in-card, 3-icon rows, bento, pills except a status dot, `//` labels, ALL-CAPS eyebrows, and ghost text.
     - The lime accent `#C2EE3A` has one job, "live/current", and appears on less than 5% of a screen.
     - Use hairlines, not shadows. Radius is 0/4/8, spacing is 8px-based, and fonts are Instrument Serif, Geist and Geist Mono.
     - No new facts or numbers. Respect reduced motion, and animate only transform and opacity.
   - Note that the current Tailwind tokens section is superseded by DESIGN.md.
4. Screenshots: run `.gitignore` → `docs/audit/**/*.png`, then convert the 52 `*-fold.png` first-viewport shots to WebP (q≈70, using the `sharp` already in devDeps, via a one-off script in the scratchpad) and commit those as the "before" set, about 1.6 MB. The full-page PNGs stay local only. **Recommendation:** compress the fold shots and ignore the rest, because 119 MB of PNGs would bloat clone size forever.

## Decisions log seed (`docs/DECISIONS.md`)
- D-001: Direction A — Monograph.
- D-002: Sign-in moves out of the nav. It stays in the footer, the signed-in avatar menu, and the existing inline triggers in BookNow, Support, ActivityTimeline and SupportButton.
- D-003: Quiet motion. No cursor effects, no magnetic buttons, no scroll reveals.
- D-004: No Lenis or GSAP. Native scroll and CSS cover the motion language.
- D-005: Fold-only WebP screenshots are committed; the PNGs are git-ignored.
- D-006: No ESLint or TypeScript added. The quality gate is described below.
- D-007: Mermaid `diagrams` (8 projects, currently unrendered) stay out of scope. Adding mermaid or a build-time renderer is a heavy dependency, so it is revisited after G.
- D-008: The obfuscator, copyright banner and `console.log` watermark are kept.
- D-009: Case-study pages use the existing `/projects/:slug` route, so there is no new route or rewrite.

## Quality gates (end of every phase)
1. `npm run build` passes, plus `npm run test:blog` and `git diff --check`.
   - **No linter or typecheck exists.** Phase A adds a dependency-free `scripts/check-design.mjs` (`npm run check:design`). It greps `src/` for banned patterns: `bg-gradient`, `bg-clip-text`, `rounded-full` outside an allow-list, `shadow-[`, `backdrop-blur`, `font-display` (Syne), `animate-` on non-transform properties, and `//` label strings. It reports counts per file and exits with code 1 when there are violations in files the phase has finished. It does not replace a linter; it guards against design regression. A real ESLint setup stays out of scope unless the user asks for it.
2. Responsive at 390, 768, 1024 and 1440: no horizontal scroll (checked programmatically) and touch targets ≥ 44 px.
3. WCAG AA contrast, a keyboard-only pass (tab order, visible focus, Esc closes overlays), semantic landmarks and headings, and a skip link (from A on).
4. Lighthouse via `npx lighthouse` (one-off, not installed) against `npm run preview`, 3 runs, median reported. A11y must stay ≥ 95, SEO 100 and Best Practices 100.
   - Performance must not regress after any phase, must reach **≥ 70 after C**, and must be **≥ 90 from D1 (Home) onward**. Lower targets earlier are realistic because the canvas, splash and eager framer are only gone after C and E.
5. SEO is preserved: every page still calls `useSEO`. `vercel.json` rewrites, `sitemap.xml` (diff before and after build), `llms.txt`/`llms-full.txt`, `openapi.json` and `.well-known/` are unchanged unless a page's public text changes.
6. Before and after screenshots of the pages touched, at all 4 widths, saved as WebP in `docs/audit/after/<phase>/`. Use the Phase-0 Playwright script, which stays outside the repo and uses the global Playwright CLI.
7. Run the `feature-dev:code-reviewer` agent on the diff, fix its findings, then run `code-simplifier`. Finish by updating PROGRESS and DECISIONS and stopping for commit approval.

## Phases

### A. Foundations
- **Files:** `tailwind.config.js`, `src/index.css`, `index.html` (drop Google Fonts lines 136–138 and add 2 preloads), new `src/styles/fonts.css`, new `public/fonts/*.woff2`, `public/404.html` and `offline.html` (font links), `public/sw.js` (cache version bump), `src/App.jsx` (skip link, Toaster colours at 254–293), new `scripts/check-design.mjs`, and `package.json` (add `check:design`).
- **Work:**
  - Tokens as CSS variables (`--ink`, `--ink-raised`, `--rule`, `--paper`, `--muted`, `--accent`) mapped into the Tailwind theme.
  - Type scale with display `clamp(56px, 9vw, 128px)`, h2 48, h3 28, body 17/1.6 and small 14. Spacing on an 8px base, radius 0/4/8, and one shadow token for dialogs.
  - Fonts: Instrument Serif 400 and italic, Geist variable and Geist Mono, as a latin subset, `font-display: swap`, with `size-adjust` fallback faces.
  - Global `:focus-visible` ring (accent, 2px, offset 2), `::selection` and the scrollbar.
  - Remove the `body::after` noise overlay.
  - Legacy tokens (`toxic`, `cyber`, `primary`, `secondary`, `font-display`=Syne) are kept as **aliases** until their last user is restyled, then deleted in G, so unfinished pages don't break.
- **Accept:** fonts are self-hosted and there is no request to fonts.googleapis; CLS < 0.05; render-blocking CSS < 300 ms; old pages still render (aliased).
- **Risks:**
  - A visible swap on the 128 px serif. Mitigate with tuned `size-adjust` and `ascent-override`.
  - The service worker serving stale fonts. Mitigate with the cache bump.
  - Font licences: all are OFL, and the licence text is committed.
- **Rollback:** revert the phase commit. The aliases make A independent of later phases.

### B. Core components
- **Files:** new `src/components/ui/` containing `Button.jsx` (primary, secondary, ghost, link; loading and disabled; sliding fill, `active:scale-[.98]`, focus ring), `TextLink.jsx` (underline draw), `Input.jsx`/`Textarea.jsx`, `Tag.jsx` (square, radius 4), `Card.jsx`/`Rule.jsx` (hairline row, not a box) and `index.js`. Also `Navbar.jsx`/`Navbar.css`, `Footer.jsx`/`Footer.css`, `CommandPalette.jsx`, `auth/GoogleAuthDialog.jsx`, and a dev-only `src/pages/_Kit.jsx` mounted only in `import.meta.env.DEV` (no route in prod and no rewrite).
- **Work:**
  - Nav: up to 6 links, with the accent marking the current page only. Search (⌘K) stays and Resume becomes a text link.
  - **Sign-in is removed** from the desktop nav and the drawer. A signed-in user still sees an avatar menu, and the footer gets a "Sign in" link.
  - Restyle the palette: ink-raised, rule borders, Geist, and accent only on the active item. The auth dialog gets friendly error copy instead of "Failed to fetch".
- **Accept:**
  - All 4 button variants pass keyboard, focus, disabled and loading checks.
  - Nav and drawer targets are ≥ 44 px.
  - Cmd+K works and is fully keyboard-operable.
  - Booking, support and activity flows can still open sign-in.
- **Risks:**
  - `useHeaderHeight` and the `AppLayout` padding depend on the nav height.
  - The drawer focus trap.
- **Rollback:** revert. The pages keep their inline styles until D.

### C. Motion system
- **Files:** new `src/lib/motion.js` (easing `cubic-bezier(.2,.7,.2,1)`, durations 150/240/400, stagger 60 ms, and `prefersReducedMotion`), `src/App.jsx`, `PageTransition.jsx`, `src/index.css` (a global reduced-motion kill-switch), and the files that delete or unmount `SplashScreen`, `CursorSpotlight`, `ScrollProgress`, `ScrollReveal` (6 users), `use3DTilt` and `RadialMenu`.
- **Work:**
  - Replace `AnimatePresence` in App with a 150 ms CSS opacity crossfade keyed on location, which takes framer-motion out of the entry chunk.
  - Where framer remains (Journey, Projects filtering), wrap it in `LazyMotion` + `domAnimation` with `m.` components.
  - Hero secondary-line stagger in CSS only.
  - Remove `cobe` and the `pino*` packages from the frontend dependencies.
- **Accept:**
  - No framer code in the Home or initial chunk (checked in `dist/stats.html`).
  - With reduced motion on, nothing moves.
  - Only transform and opacity are animated (DevTools paint flashing).
  - Performance ≥ 70 on mobile.
- **Risks:** removing `RadialMenu` removes a feature. It is an a11y negative, but **the user must confirm before it is removed.** The `inert` splash gate (`App.jsx:296`) has to be removed cleanly.
- **Rollback:** revert. Each removal is its own commit.

### E. Particle canvas (done inside D1)
Delete `NeuralNetworkCanvas.jsx` (an rAF loop with O(n²) work, used only at `Home.jsx:95`), with **no replacement**. In Monograph the hero is the typography plus a contents list. Accept: no rAF loop on Home and TBT < 200 ms. Rollback: revert the file.

### D. Pages (one session each, in this order; F's copy rules apply in each)
- **D1 Home** (+E): `Home.jsx`, `Home.css`.
  - The hero is a static serif name, one plain sentence from the About copy, and a contents list of the top projects, with a portrait in the margin rail.
  - Remove the pill, the badge, the marquee, the ring and glow, the 3 hard-coded slugs (use the `featured` flag), and the filler stats.
  - The sections become contents, essay, list and colophon.
  - **Performance ≥ 90 starts here.**
- **D2 Projects index:** `Projects.jsx` and its CSS become a ranked index. Featured entries get a large row with an image, the rest are single lines, and the sort control is replaced with accessible buttons.
- **D3 Case studies:** `ProjectDetail.jsx` is laid out as chapters (problem, solution, architecture, key decisions, lessons), with the meta in the margin rail. This also fixes the hero collision.
  - Proposed top 6 (all have the full fields): `smartmess`, `rag-ai-teaching-assistant`, `kanoon-mate`, `smart-lms`, `insightaudio`, `real-time-chat-app`. **The user confirms this list.**
  - The remaining 20 projects use the same template with partial data.
- **D4 About**, **D5 Skills**, **D6 Journey** (`Journey.jsx` 1470 lines and `JourneyNavigator.css` 642, the biggest page; this may split into D6a/b).
- **D7 Services** and `ServiceDetail` (fix the clipped "Razorpay" text). Price display still comes from the backend.
- **D8 Blog** and `BlogPost`: move the existing `--article-*` variables onto the tokens. Light-touch work, since this is the closest to the target.
- **D9 Contact** and the **sign-in surfaces** (auth dialog, inline triggers).
- **Each sub-phase:**
  - Files: that page, its CSS, and the components it uses.
  - Accept: the gates above, `check:design` clean for those files, and identical `useSEO` titles and descriptions.
  - Risks: the sitemap script regex-parses `slug:` in `projectsData.js`, so **never reformat data files**.
  - Rollback: one commit per page.

### F. Copy pass (one session after D9)
Sweep every page for clichés ("Innovator", "Let's Build Something Great", "Welcome", "beginner projects", keyword-stuffed alt text, filler stats). Rewrite using existing facts only. Write `docs/COPY_REVIEW.md` as a table of old line → new line → source fact, with a ⚠ **confirm** column for anything the user must check. No change is merged until the user signs off. If visible text changes, update `llms.txt`/`llms-full.txt` and the portfolio JSON copies.

### G. Polish
- **Files:** `NotFound.jsx` (390 lines, to be cut to a simple editorial 404), `public/404.html`, `SkeletonLoader.jsx` (currently unused; either wire it in as the route fallback in place of the lime spinner, or delete it), empty states (Projects filter, Blog, Activity), `public/favicon.svg` plus new PNG/ICO/apple-touch icons, a **new `public/og-image.jpg`** (it is referenced in `index.html:93,117` but missing today, a real bug), `ScrollToTop` (restore the position on back/forward and go to the top on push), and a full hover/focus/active audit.
- Also delete the legacy token aliases and unused CSS utilities and keyframes.
- **Accept:** `check:design` reports zero violations repo-wide; the OG image resolves with a 200; back-button scroll is restored; Lighthouse ≥ 90/95/100/100 on Home, Projects, a case study and Blog.

## Verification (summary)
Each phase must pass, in order:
1. `npm run build`, `npm run test:blog`, `npm run check:design` (from A on) and `git diff --check`.
2. `npm run preview` with Lighthouse ×3.
3. Screenshots at 4 widths.
4. A keyboard pass and a reduced-motion pass.
5. The code-reviewer and then code-simplifier agents.
6. A PROGRESS update, then stop for commit approval.
