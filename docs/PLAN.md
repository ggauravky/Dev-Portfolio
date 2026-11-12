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

> **A and B are done** (`9b86d14`, `7594b2c`). Their sections below are kept as the record.

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

### C–G superseded (2026-11-12, D-026)
After the owner's review of Phase B, the old C, D1–D9, E, F and G phases are replaced by **P2–P6** below. A and B are done. Read the Signature layer in `docs/DESIGN.md` first.

**Rules for every P-phase:**
- One session per phase. **Stop and wait for the owner's review** after each one, and never start the next phase without the owner's OK.
- **Conversion rule:** fully convert what the phase touches and delete the old styles and components. No half-migrated pages. Add each converted file to `FINISHED` in `scripts/check-design.mjs`.
- **Copy:** each page phase rewrites its own copy using existing facts only, and logs every change in `docs/COPY_REVIEW.md` (old → new → source fact, with a ⚠ confirm column for the owner).
- **Constraints:**
  - Never reformat `src/data/projectsData.js`; the sitemap script regex-parses `slug:`.
  - Every page keeps `useSEO` with the same titles and descriptions.
  - `vercel.json`, the sitemap, `llms.txt`/`llms-full.txt` and all URLs stay unchanged.
  - No heavy library without a stated reason.

### End-of-phase gate (mandatory; replaces "Quality gates" above where they differ)
1. Screenshots at **1440 and 390**, including hover and focus states, saved as WebP in `docs/audit/phase-N/`.
2. Run the `web-design-guidelines` audit, then the `feature-dev:code-reviewer` agent, and fix their findings. Then run `code-simplifier`.
3. `npm run build`, `npm run test:blog`, `npm run check:design` and `git diff --check`. There is still no linter or typecheck (D-006); say so, don't fake it.
4. Lighthouse mobile and desktop, median of 3 runs against `npm run preview`. Accessibility ≥ 95, SEO 100, no Performance regression. Mobile Performance ≥ 90 from P3 on.
5. **Self-critique:** list 5 reasons a stranger might think the result is templated or AI-made, and fix them. For each signature move used, say why it is specific to Gaurav and not copyable.
6. Update `docs/PROGRESS.md` and `docs/DECISIONS.md`, commit after the owner approves, then tell the owner to /clear.

### P2 — System
- **Type:** dev-only `/dev/type-specimen` → the owner picks with AskUserQuestion → self-host the picked fonts and drop the losers. Add the Devanagari face.
- **Tokens:** update to the new type, add the motion tokens, and the grain overlay (S8).
- **Motion:** `src/lib/motion.js` holds the durations, easing and springs. Add a global reduced-motion kill switch.
- **Navigation:** the S1 dock and top chrome. Delete B's top `Navbar` and drawer, and update `useHeaderHeight` and the `AppLayout` padding.
- **Cursor:** S5.
- **Components:** rebuild the button and input system in `src/components/ui/` to the DESIGN spec, and restyle ⌘K with real actions.
- **Data:** `src/data/siteStatus.js`, with placeholders the owner fills in.
- **Preloader and route transitions:** the preloader, plus a clip-path route wipe that replaces `PageTransition`.
- **Reveal-bug fix:** one IntersectionObserver reveal that follows the DESIGN reveal rules and replaces `ScrollReveal` for all 6 users.
- **Delete:** `ScrollProgress`, `CursorSpotlight`, `RadialMenu` (D-029), `use3DTilt`, `SplashScreen` and `BackToTop` (it moves into S4 in P3).
- **Accept:** the dock is fully keyboard and screen-reader operable; nothing is stuck invisible at any scroll depth; nothing moves under reduced motion; mobile Performance ≥ 64 (after B) with a target of ≥ 70.
- **Risks:** many pages lose the old nav at once, but they still render because the dock is global. Framer in the entry chunk is limited by lazy features.
- **Rollback:** revert the phase commit.

### P3 — Home, end to end
- **Sections:** hero (S2 name, S6), about, selected-work index (uses the `featured` flag, not hard-coded slugs), skills, notebook, journey teaser, contact, plus the S4 colophon footer (site-wide).
- **Portrait:** in the S3 arch mask.
- **Delete:** `NeuralNetworkCanvas`, every gradient and glow on Home, the pill, the badge, the marquee, the ring and the filler stats.
- **Owner fills in:** the `siteStatus` values.
- **Accept:** mobile Performance ≥ 90, TBT < 200 ms, no rAF loop at idle.

### P4 — Projects
- The S7 index, the case-study template, and the top 5–6 case studies (problem, role, stack, decisions, outcome, links), using facts from `projectsData.js` only.
- **The owner confirms the list:** proposed `smartmess`, `rag-ai-teaching-assistant`, `kanoon-mate`, `smart-lms`, `insightaudio` and `real-time-chat-app`.
- The other projects use the same template with partial data. Case studies stay on `/projects/:slug` (D-009).

### P5 — Remaining pages
- About, Skills, Journey (may split into P5a/b), Services and `ServiceDetail` (fix the clipped "Razorpay"), Blog and BlogPost (reading progress, TOC, code styling), Contact and 404.
- Sign-in stays as decided in D-002.

### P6 — Polish and QA
- Performance, a11y, SEO and the OG image (`public/og-image.jpg` is referenced but missing today; build it with the S2 name).
- The 390/768/1024/1440 sweep and cross-browser checks (Chromium, Firefox, WebKit).
- Scroll restoration, skeletons and empty states.
- Delete the legacy aliases and unused CSS.
- **Accept:** `check:design` reports zero violations repo-wide.

## Verification (summary)
Every phase passes the end-of-phase gate above, in order, then stops for the owner's review and commit approval.
