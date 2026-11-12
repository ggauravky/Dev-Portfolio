# UI/UX Audit — Phase 0 baseline (2026-11-12)

Scope: live site https://ggauravky.vercel.app/ (Lighthouse) and local `npm run dev` without backend (screenshots).
Severity: **H** = hurts credibility/conversion, **M** = noticeable, **L** = polish.

## Screenshots (`docs/audit/`)
13 pages × 4 widths (1440 / 1024 / 768 / 390), each as full page `<page>-<w>.png` and first viewport `<page>-<w>-fold.png`.
Pages: `home, projects, project-detail (smartmess), about, skills, journey, services, service-detail (frontend-development), blog, blog-post (what-is-mcp), contact, updates, 404`.
Extras: `signin-1440.png`, `signin-390.png`, `cmdk-1440.png`, `nav-menu-390.png`.
Captured with Playwright Chromium, no backend → every page logs `ERR_CONNECTION_REFUSED` for API calls; sign-in modal shows "Failed to fetch". No horizontal overflow detected at any width. Folder is ~119 MB of PNGs — consider compressing or git-ignoring before committing.

## Lighthouse baseline — live home page
Lighthouse 12.8.2, headless Chromium, 2026-11-12 ~10:17 UTC, single run each (expect ±5 variance).

| | Perf | A11y | Best Pr. | SEO | FCP | LCP | TBT | CLS | SI | Weight |
|---|---|---|---|---|---|---|---|---|---|---|
| Mobile | **38** | 100 | 100 | 100 | 4.8 s | 7.1 s | 1,140 ms | 0.002 | 6.2 s | 685 KiB |
| Desktop | **82** | 100 | 100 | 100 | 1.3 s | 2.1 s | 90 ms | 0.021 | 2.0 s | 710 KiB |

Main mobile drags: render-blocking resources (~1.07 s, Google Fonts CSS), ~178 KiB unused JS, 4.3 s main-thread work / 2.2 s JS boot-up (obfuscated bundles + framer-motion + particle canvas + splash), LCP element painted at 7.1 s.

## "AI-look" audit (brief items, verified)
| Item | Verdict | Evidence |
|---|---|---|
| "WELCOME TO MY PORTFOLIO" pill | ✅ confirmed | `Home.jsx:127-133`; `home-1440-fold.png` |
| "AVAILABLE!" badge | ✅ confirmed (text "Available!", uppercased) | `Home.jsx:305-311` |
| Giant ghost text behind hero | ✅ confirmed — 16vw marquee, 3% opacity, "Developer · AI/ML · … Innovator" | `Home.jsx:97-106`; visible as "EL…" behind YADAV |
| Everything a rounded-full pill | ✅ confirmed — nav active state, CTAs, Resume/Sign-in, chips, tags; `rounded-full` on 182 lines/31 files. Mixed with square mono-chip filters on Projects/Journey → two competing shape languages | `projects-1440-fold.png`, `journey-1440-fold.png` |
| Lime→orange→purple/cyan gradients + glow | ✅ confirmed — gradient text on names/headings ("YADAV", "JOURNEY", "CONFIDENCE", "Let's Build"), avatar glow orb toxic→cyber→purple (`Home.jsx:279`), glowing CTA shadows; 81 gradient + 55 coloured-shadow lines | `contact-1440-fold.png` |
| Particle network background | ✅ confirmed — `NeuralNetworkCanvas`, Home hero | `home-1440-fold.png` |
| "// COMMENT" mono labels | ✅ confirmed — "// AI/ML & WEB DEVELOPER", "// SORT PROJECTS", "// SHOWING 26 PROJECTS", "// JUMP TO SERVICE", "// LET US DISCUSS…" etc.; ≥7 on Home alone | multiple |
| Generic copy | ✅ confirmed — "Innovator" (`Home.jsx:104`, `:364`), "Let's Build Something Great" (Home `:803-806` **and** Contact hero), "machine learning beginner projects" (`Home.jsx:377`, visible) | `contact-1440-fold.png` |
| Circular photo with neon ring | ✅ confirmed — border-toxic + ring + glow + 3D tilt + glint | `Home.jsx:257-302` |
| "Sign In" button | ✅ confirmed — desktop nav pill + "Sign In with Google" in mobile drawer; only needed for bookings/receipts | `Navbar.jsx:330`, `:437`; `nav-menu-390.png` |
| Equal-weight card grids, 3 of 26 projects | ✅ confirmed — Home shows 3 hard-coded (`Home.jsx:62-67`) of 26 (15 flagged featured), all same card size + a "View all" card. **Correction:** case-study depth *exists* in `ProjectDetail` (problem, solution, architecture, key decisions, lessons) but Home/Projects cards don't surface it, and later projects have partial data | `project-detail-1440.png` |

## Findings by category

### Visual hierarchy
- **H** Hero competes with itself: 3-line Syne name, pill, mono subtitle, 3 icon chips, location line, availability box, 3 CTAs, scroll cue, glowing avatar, particle canvas and ghost marquee all in one viewport — no single focal point.
- **H** Every section uses the same recipe (pill label → huge uppercase Syne h2 → centered subtitle → equal grid), so the page reads as a repeated template; nothing is emphasised.
- **M** Nav is crowded at 1440: 8 links + Search + Resume + Sign In; active link is a filled lime pill that outshouts the logo.
- **M** Services hero stat card mixes four type treatments; "Razorpay" display text is clipped by its card at 1440 (`services-1440-fold.png`).
- **M** Project detail hero: blurred screenshot backdrop text ("Know What's Cooking…") collides with the "Back to projects" button and the project title (`project-detail-1440.png`).

### Typography
- **H** Syne 800 uppercase at extreme sizes on nearly every page heading (wide, shouty); body in Plus Jakarta; Space Mono for labels, buttons, filters, chips and inputs → three voices fighting, mono overused.
- **M** Blog/Blog-post use a different system (tight Plus Jakarta display, editorial layout) — the strongest page, but inconsistent with the rest.
- **M** Tiny mono labels (10–11 px, letter-spaced, low-contrast grey) for "CURRENTLY", stats labels, journey rail years.
- **L** Placeholder text in Space Mono on Projects search reads as code, not UI.

### Spacing & layout
- **M** Large dead bands between Home sections (~150–250 px) with uniform rhythm — no tension or variation.
- **M** At 768, hero stacks avatar first and pushes CTAs below the fold (`home-768-fold.png`); at 390 the avatar takes ~30% of the first screen.
- **L** About hero card leaves a large empty right column at 1440.

### Color
- **M** Lime `#c5f82a` used for active nav, primary CTAs, badges, labels, gradient text, borders and glows — accent has no scarcity, so it signals nothing.
- **M** Orange `#ff5d00` and legacy blue/purple tokens (`primary`, `secondary`) still in config/gradients → palette drift.
- **L** Low-contrast grey on near-black for secondary copy and mono labels (passes Lighthouse sampling on Home but marginal on inner pages).

### Buttons & forms
- **M** Three button shapes coexist: rounded-full pills (Home/nav), rounded-md mono buttons (About/Services), square tag chips; inconsistent casing (Title vs UPPERCASE mono).
- **M** Projects uses a native `<select>` for sort styled as a big mono field; filters as chunky mono buttons.
- **M** Sign-in modal with no backend shows bare "Failed to fetch" + "RETRY" — raw error copy (`signin-1440.png`).

### Motion
- **H** Splash screen + page transitions + particle canvas + marquee + cursor spotlight + 3D tilt + scroll reveals + ping/float animations — motion everywhere, little of it meaningful; costs main-thread time on mobile.
- **M** Home hero ignores `prefers-reduced-motion` (marquee, ping, float).
- **L** Cursor spotlight ring stays visible over modals and overlaps the mobile drawer close button (`signin-1440.png`, `nav-menu-390.png`).

### Responsiveness
- No horizontal overflow at 390/768/1024/1440 (checked programmatically).
- **M** 768: hero fold is avatar + name only; CTAs cut off.
- **M** Mobile drawer: Sign In with Google and View Resume are the two largest buttons, outweighing navigation.
- **L** Journey right-hand year rail is tiny and partly redundant at 1024.

### Accessibility
- Lighthouse a11y 100 on Home (automated only).
- **M** No skip link found in `src`.
- **M** Reduced motion handled patchily (see Motion).
- **M** Custom right-click `RadialMenu` overrides native context menu — surprising for keyboard/AT users.
- **L** Keyword-stuffed alt text ("…web developer portfolio India").
- **L** React unknown-prop warnings on Home and Blog post (console).

### Performance
- **H** Mobile Perf 38 (LCP 7.1 s, TBT 1.1 s). Likely causes: render-blocking Google Fonts (3 families, many weights), obfuscated JS (larger, slower parse), framer-motion on first route, splash screen delaying LCP, canvas rAF loop, eager Home.
- **M** `cobe` dependency unused; `pino*` server libs in frontend deps.
- **L** Duplicate keyframes across CSS files.

### SEO
- Lighthouse SEO 100 on Home. `useSEO` injects meta client-side only, so non-JS crawlers/social scrapers see `index.html` defaults for every route (check per-route OG previews).
- **L** Visible copy written for keywords ("machine learning beginner projects", alt text) reads unnatural.

### Copy
- **H** Generic, self-labelling lines: "Welcome to my portfolio", "Innovator", "Let's Build Something Great" (used twice), "Build with confidence", "Like what you see?".
- **M** "Beginner projects" undersells; mixed positioning (student / intern / freelancer / service vendor with Razorpay checkout) in the same hero.
- **M** Stats as filler: "20+ projects", "< 24h", "4 Detailed", "Trusted by 500+ students".
- **L** Tone shifts between pages (Blog is calm and editorial; Services is salesy).

## What to keep
- Blog index/post layout — closest to the target editorial direction.
- Obsidian base `#070708` and a (much rarer) lime accent.
- Project case-study data model (`problem/solution/architecture/keyDecisions/lessonsLearned`) — the raw material for real case studies.
- Cmd+K palette, structured blog JSON, solid a11y/SEO/best-practice baseline.

## Final — Phase 0 baseline vs P6 (2026-11-13)

### Lighthouse
Baseline: live site, Lighthouse 12.8.2, single run. P6: local `vite preview`, Lighthouse 13.4.1, median of 3 (PROGRESS.md ¹⁰).

| Page | Mobile Perf | Desktop Perf | A11y | BP | SEO | Mobile LCP | Mobile TBT |
|---|---|---|---|---|---|---|---|
| Home, baseline | 38 | 82 | 100 | 100 | 100 | 7.1 s | 1,140 ms |
| Home, P6 | **98** | **100** | 100 | 100 | 100 | 2.0 s | 135 ms |
| Projects, P6 | 98 | 100 | 100 | 100 | 100 | 2.0 s | 68 ms |
| Case study (kanoon-mate), P6 | 99 | 100 | 100 | 100 | 100 | 2.0 s | 63 ms |
| Blog, P6 | 95 | 100 | 100 | 100 | 100 | 2.7 s | 39 ms |
| Article (what-is-mcp), P6 | 98 | 100 | 100 | 100 | 100 | 2.1 s | 100 ms |
| Contact, P6 | 99 | 100 | 100 | 100 | 100 | 2.0 s | 39 ms |

### "AI-look" tells
| Tell (Phase 0) | Now |
|---|---|
| "WELCOME TO MY PORTFOLIO" pill, "AVAILABLE!" badge | Gone. Availability is one accent dot + sentence in the colophon. |
| Giant ghost marquee text | Gone (banned; `check:design`). The name itself is the type (S2, S6). |
| Rounded-full pills everywhere (182 lines / 31 files) | Pills only on the dock, buttons and the status dot; 0 violations. |
| Lime→orange→purple gradients, gradient text, glow (81 + 55 lines) | 0. One shadow token, for dialogs; hairlines elsewhere. |
| Particle network background | Deleted; static grain (S8) at ≤ 4 % only. |
| "// COMMENT" mono labels | 0 (checked by `check:design`, incl. legal pages and changelog). |
| Generic copy ("Innovator", "Let's Build Something Great") | Rewritten from repo facts; every change logged in COPY_REVIEW.md. |
| Circular photo with neon ring | Portrait in the Lucknow arch (S3), also in the OG image and favicon. |
| "Sign In" in the nav | Out of the nav (D-002); only booking/support/activity open it. |
| Equal-weight card grids | Projects as an index (S7), case studies with rail facts. |
| Off-system surfaces (legal, checkout, activity, changelog, offline, OG/favicon) | All on v2 in P6. |
