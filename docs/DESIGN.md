# Design direction — Phase 1 (2026-11-12)

> **Chosen direction: A — Monograph** (dark editorial, serif-led). Picked by the user on 2026-11-12. B and C are kept below for reference only.

> **Revised 2026-11-12 after the owner's review of Phase B (D-026).** The Monograph *palette, hairlines, radius `0/4/8`, 8px spacing, margin-rail grid, index-not-grid projects and dark-only* stay. Its **motion language ("quiet, one moment, no scroll reveals") and the fixed Instrument Serif + Geist pairing are superseded** by the Signature layer below. Where this section and anything later in the file disagree, this section wins.

## Signature layer (mandatory)
The goal is an ownable design language, not generic effects. Rules:
- Every effect must improve clarity or feel. There are **at most 3 "moments" per page**.
- Nothing may push mobile Lighthouse Performance below 90 or cost accessibility.
- **Conversion rule:** every phase fully converts what it touches and deletes the old styles. No half-migrated pages, and two design languages never coexist on one page.

**S1 Bottom pill dock** (replaces the top navbar)
- Fixed at bottom-centre, and always a pill.
- **Idle:** a compact pill showing the page index and name (e.g. "03 / Projects"), a small scroll-progress ring and the availability dot.
- **Hover, focus or tap:** it morphs (width/height spring, shared `layoutId` highlight) into the full menu: Home, About, Projects, Journey, Skills, Services, Blog, Contact, plus ⌘/Ctrl+K and Resume. Magnetic hover and a sliding active indicator.
- **Mobile:** thumb-reachable, `env(safe-area-inset-bottom)`, targets ≥ 44px.
- **Accessibility:** a `nav` landmark, `aria-current`, a focus trap while expanded (reuse `src/hooks/useFocusTrap.js`), and Esc closes it.
- **Top chrome:** only a tiny fixed wordmark and a Resume link, with `mix-blend-mode: difference`.
- **Reduced motion:** no spring; the state change is instant.

**S2 Name as type** — *revised in P2 (D-034): English only, no Devanagari anywhere.*
- The Latin name, set in Fraunces, is the recurring typographic element in the hero, preloader, route wipe, footer and OG image.

**S3 Lucknow arch** — the single recurring shape
- An Awadhi/Lucknow arch, built as one SVG `clipPath`. It is used for the portrait mask (replacing the circle and neon ring), image masks and section dividers.
- No other decorative shapes. The dock and buttons are pills: the only allowed pills besides the status dot.

**S4 Live colophon footer**
- Lucknow local time (IST, ticking per minute).
- "Currently building".
- Last GitHub activity or streak, reusing `fetchGitHubContributions` / `getGitHubFallbackData` from `src/utils/githubApi.js`. Fetched after idle, never blocking.
- Availability status.
- Copy-email-to-clipboard with a toast.
- A big wordmark.
- Back-to-top.

**S5 Cursor language**, fine pointers only
- A small dot that morphs into labelled chips (View / Open / Copy / Drag), with a magnetic pull on buttons.
- Hidden on touch and under reduced motion. The system cursor is kept for text inputs.

**S6 Typography in motion**
- The hero name responds to the cursor through a variable font axis (weight / optical size).
- Line-mask text reveals, not fades.
- A text-roll hover on links and buttons, and an animated underline draw.

**S7 Projects as an index**
- A ranked list with year, stack and type, sortable and filterable.
- A hover preview follows the cursor with spring easing.
- Row → case study uses a shared-element transition: the View Transitions API or Motion `layoutId`, with an instant fallback.

**S8 Atmosphere**
- No gradients, glow or particles.
- A static SVG grain overlay at ≤ 4% opacity, hairline borders, warm near-black, off-white, and one lime accent used sparingly.
- Anything in the background must be purposeful (e.g. a ticker of real commits); otherwise there is nothing.

**Single sources of truth:** new `src/data/siteStatus.js` holds availability, "currently building", the email and the resume URL. The dock, footer, ⌘K and contact all read from it. The owner supplies the availability and "currently building" values in P3; nothing is invented.

## Colour tokens (colour/motion/mobile phase, 2026-11-13)
Tokens live only in `src/index.css` as RGB channels (D-011); use `rgb(var(--token))`. No `--color-*` aliases were needed.

| Token | Value | Use |
|---|---|---|
| `--ink` | `#0E0D0B` | background (warm near-black, kept) |
| `--paper` | `#EDEAE3` | primary text — 16.17:1 on ink |
| `--muted` | `#9C978C` | secondary text — 6.68:1 on ink, 6.28:1 on ink-raised |
| `--accent` | **`#C6F432`** | "live / current" (was `#C2EE3A`, 14.42:1) |
| `--accent-contrast-text` | `#0E0D0B` | text on an accent fill |
| `--accent-muted` | `#4E5E19` (accent at 35% over ink) | tracks (Journey spine fill), the resting primary-CTA outline; never text |

**Measured contrast (WCAG 2.x relative luminance):**
- `#C6F432` on ink `#0E0D0B`: **15.16:1** — passes AA/AAA for text of any size and for UI (3:1).
- Ink text on a `#C6F432` fill: **15.16:1** — passes.
- `#C6F432` on ink-raised `#161512`: 14.25:1 — passes.
- `#C6F432` on paper: **1.07:1** — fails everything, so lime is never placed on a paper surface.
- `--accent-muted` on ink: 2.72:1 — below 3:1, so it is never the only thing that identifies a control: the primary CTA is identified by its label (16.17:1) and arrow, and the spine is decoration.

## Where lime is / isn't allowed (permanent)
Lime is currency: every use must mean "live", "current", or "this is interactive and you are on it".

**Allowed only on:**
1. Hover/focus of interactive text — the drawn underline (`.text-link`, `.btn--link`, row titles, blog links).
2. The live/available status dot — `.dock-status`, `.hero-live__dot`, `.pg-dot`, `.colophon__dot.is-live` (all `rgb(var(--accent))`).
3. Active/current indicators — the dock's current-page tick, the Journey "Now" node, the active filter segment, the active tab, the current TOC entry, the selected ⌘K item.
4. Primary CTAs — **an outline, never a fill**, the same everywhere (`.btn--primary`): a muted-accent hairline at rest, a full-accent outline plus a drawn label underline on hover/focus.
5. Focus rings (`:focus-visible`, 2px, offset 2) and active form fields (the focus line and the floated label).
6. The blog reading-progress bar.
7. One code-syntax token type in blog code blocks (reserved; there is no highlighter yet).

**Never on:** body text · large fills · decoration (e.g. a full-height track — the Journey spine uses `--accent-muted`) · resting, non-interactive icons · paper surfaces.

**Scarcity:** at the default scroll position of any page and viewport there is at most **one** accent moment in the page content, plus the dock's availability dot (persistent chrome). Measured: under 0.06% of the screen at 390px and 1440px on all eight main pages.

**Never the only signal:** every lime state also changes something else — position or scale (underline draw, floated label), a 2px ring, text-roll and arrow nudge, `aria-current`, or text ("Now").

**Small screens:** if an accent element gets lost at 360px, enlarge the element; never intensify or spread the colour.

## Type (decided by specimen in P2)
> **Decided 2026-11-12 (D-033):** Fraunces variable (opsz 9–144 + wght 100–900, SOFT/WONK at 0 — the sharp cut) for display and S6 · Geist (text) · Geist Mono (labels, code). Instrument Serif removed. No Devanagari face (D-034).

- Build a temporary, dev-only `/dev/type-specimen` route (no prod route or rewrite) rendering 3–4 stacks with real content: the hero name, an H2, body text, a mono label and the Devanagari name. Then the owner picks with AskUserQuestion.
- **Instrument Serif has no variable axes, so it cannot do S6.** It stays in only if it clearly wins and S6 uses another face.
- Candidates shown in the specimen: Fraunces sharp, Fraunces soft, Newsreader, Instrument Serif (control). Satoshi/General Sans were excluded: their ITF licence forbids redistributing font files, and this repo is public.
- **Banned:** Inter, Roboto, Arial, Space Grotesk, Poppins, Montserrat and Playfair.
- Self-hosted, subset, `font-display: swap`, metric-matched fallbacks.

## Buttons and micro-interactions (real components)
- **Buttons:** primary, secondary, ghost and link.
  - Hover: a text-roll (a duplicate label slides up) plus a fill wipe from the edge the cursor entered.
  - A magnetic pull of 8–12px (spring), and press `scale(.97)`.
  - A focus-visible ring, loading and disabled states, and an arrow icon that nudges on hover.
- **Inputs:** floating labels, an animated focus line, inline validation and a success state.
- **Motion tokens in one file, `src/lib/motion.js`:** durations **160 / 280 / 520 ms**, easing **`cubic-bezier(.22,1,.36,1)`**, and spring presets. Animate transform and opacity only, and honour `prefers-reduced-motion` everywhere.
- **Preloader:** first visit only (`sessionStorage`), ≤ 1.4 s, the name and a counter, skippable, and disabled for reduced motion.
- **Route transitions:** a clip-path wipe carrying the wordmark.
- **⌘/Ctrl+K:** restyled, with real actions: jump to a page, copy email, open the resume, open GitHub and LinkedIn. There is no theme toggle (dark-only, D-028).

## Motion layer (colour/motion/mobile phase, 2026-11-13)
- **Reveals:** the primary mechanism is a CSS scroll-driven animation (`animation-timeline: view()`, range `entry 0%` → `entry 40vh`, opacity plus 24px of travel, or 16px below 768px) on each `[data-reveal]` section and each list row, so rows stagger by their own position. The IntersectionObserver reveal below is the fallback (`@supports not (animation-timeline: view())`). Both are gated on the JS-added `.reveal-armed` class and the fail-safe. Anything on screen when the page mounts is static (`data-reveal-static`), so nothing visible at rest is ever part-faded; rows finish once fully entered. Support: Chrome/Edge 115+, Safari 26+, Firefox 159+ (on by default since 2026-10-27); older Firefox gets the fallback.
- **Headings:** `LineMask` splits below-fold headings into rendered lines (never characters). Each line rises 80 ms after the one above, in 280 ms, for at most 520 ms in total. The hero name stays static.
- **Parallax (the only one):** the hero live panel moves at 0.6× the name's scroll speed over the first viewport. It uses a root scroll timeline (`translate`) and needs no JS. It runs only at ≥ 1200px, where the panel clears the hero actions (D-091), and is off under reduced motion.
- **Reduced motion:** one block in `src/index.css` switches off reveals, the heading stagger, the parallax and the pulses outright. Scroll-driven animations ignore the duration collapse, which is why they get their own rule there.
- **Preloader:** none (dropped by the owner in D-055).

## Reveal rules (fixes the stuck-at-opacity-0 bug)
- IntersectionObserver with a generous `rootMargin` (e.g. `0px 0px 20% 0px`), and durations ≤ 520 ms.
- Content is visible by default. It is hidden only under a class added by JS, and a timeout fail-safe reveals everything if the observer or animation fails.
- Nothing is hidden permanently, and there are no reveals under reduced motion.

## Known tensions and their resolutions
- **S6 animates `font-variation-settings`, which is not transform or opacity.** This is the one documented exception: hero name only, fine pointers only, rAF-throttled, started after LCP, and off for reduced motion.
- **The hero heading is the LCP element**, so it paints statically on the first frame and is never animated in. Line-mask reveals apply to below-fold headings only.
- **The preloader can cost LCP and Speed Index**, because Lighthouse is always a first visit. The page renders underneath, and the overlay animates only opacity and transform. If mobile Performance misses its target, shorten the preloader to ≤ 800 ms or drop it. There is no special-casing for Lighthouse.
- **The dock morph needs framer `layout`/`layoutId`.** The idle dock is plain CSS, and `LazyMotion` `domMax` features load asynchronously on first interaction so the entry chunk stays lean.
- **The route clip-path wipe** is a single overlay element and runs ≤ 520 ms. **View Transitions** are progressive enhancement only.

Three directions, not three colorways: each differs in base (dark / dark / light), type voice (serif / grotesk / soft serif), grid logic, how projects are shown, and what the one accent is *for*.

## Rules for every direction
- **Color:** warm near-black, off-white, one accent. Lime `#c5f82a` (or a refinement) is the accent unless noted; it gets one job per direction and appears on < 5% of any screen.
- **Structure:** 1px hairlines over shadows (one shadow token, dialogs only). One radius scale per direction. Spacing on 8px: `8 16 24 32 48 64 96 128` (4 allowed only inside controls).
- **Banned:** purple/blue gradients, gradient text, glassmorphism, neon glow, coloured shadows, emoji icons, floating glass cards, card-in-card, 3-icon feature rows, generic bento, pills except a status dot, `// comment` labels, ALL-CAPS eyebrows above every heading, ghost marquee text.
- **Type:** no Inter/Roboto/Arial/system as the main face. Fonts self-hosted as latin-subset `woff2`, `font-display: swap`, fallback metrics (`size-adjust`) to keep CLS ≈ 0, max two files preloaded. Replaces the render-blocking Google Fonts CSS (~1.07 s on mobile).
- **Facts:** only facts already in the repo data (projects, journey, blog, services). No new numbers or claims; filler stats ("500+ students", "< 24h") are removed, not reworded.
- **Motion:** respects `prefers-reduced-motion` everywhere. The LCP element (hero heading) is painted static on first frame — never starts at opacity 0. No splash, particle canvas, cursor spotlight or 3D tilt in any direction. framer-motion only via `LazyMotion` + `domAnimation`, and only on routes that need user-triggered motion.
- **Shared fixes for AI tells:** remove welcome pill, "Available!" badge, ghost marquee, neon-ring photo, gradient headings, generic copy ("Innovator", "Let's Build Something Great"); Sign in leaves the main nav (kept where bookings/receipts need it — no route changes). Each direction below adds its own answer to the equal-weight project grid and the "same recipe every section" problem.
- **Self-check:** near-black + one acid accent and hairline grids are themselves common generated looks. They are kept because they are the user's identity and the brief; what makes each direction specific is the accent's scarcity and job, the type voice, and the project structure.

---

## A. Monograph — dark editorial, serif-led
**Mood:** a well-set technical book. Calm, confident, reading-first. Extends what already works on the Blog pages to the whole site.
**References:** rauno.me · paco.me · press.stripe.com · rsms.me

**Palette**
| Token | Hex | Use |
|---|---|---|
| ink | `#0E0D0B` | background |
| ink-raised | `#161512` | dialogs, code blocks |
| rule | `#2A2824` | hairlines |
| paper | `#EDEAE3` | primary text |
| muted | `#9C978C` | secondary text (≈ 7:1 on ink) |
| accent | `#C6F432` (was `#C2EE3A`; see "Colour tokens") | **job: "live / current"** — current role, current page in nav, link hover underline, focus ring |

**Type:** Instrument Serif (display, 400 + italic) · Geist (text, variable) · Geist Mono (code and dates only, not preloaded). All **SIL OFL 1.1**, self-hostable (Fontsource or the `geist` npm package). Scale ≈ 1.333: display `clamp(56px, 9vw, 128px)`, h2 48, h3 28, body 17/1.6, small 14.
**Grid:** 12 columns, max 1200. Content in cols 3–10; cols 1–2 are a **margin rail** for dates, stack and meta (desktop). Mobile: single column, meta inline above titles. Left-aligned throughout; no centered section intros.
**Radius / border:** scale `0 / 4 / 8` — structure and images 0, controls 4, dialogs 8. Sections separated by space, not boxes; lists by 1px `rule` lines.
**Motion language:** quiet, one moment. On first load the hero's secondary lines settle in (opacity + 8px, 3 staggers, ≤ 600 ms, CSS only); heading is static. Route change: 150 ms crossfade. Links: underline draws on hover. No scroll reveals.
**Buttons:** primary = `paper` fill, `ink` text, radius 4, height 44, Geist 500 15px, sentence case, hover → pure white, no lift. Secondary = text link, 1px underline offset 4px, lime on hover. Icons only for real meaning (↗ external).
**Hero:** name in Instrument Serif at display size, one plain sentence of what Gaurav builds (from existing About copy), then a **contents list** of selected work — title, one-line problem, year, stack — linking straight to the case studies. Small rectangular portrait in the margin rail, no ring or glow.
**Projects:** an index (table of contents), not a card grid. Featured entries get a larger row with image; the rest are single lines. Case studies read like chapters.
**Kills the tells:** pills → text links and square controls; gradients → serif contrast does the emphasis; equal grids → ranked index; repeated section recipe → each section is a different "page" of the book (contents, essay, list, colophon-style footer).
**Performance:** lowest risk. First-paint fonts ≈ 55 KB (Instrument Serif 400 + Geist var); Geist Mono deferred. Motion is CSS; framer-motion can leave the Home chunk entirely. Main risk: serif display at 128px needs a tuned fallback to avoid a visible swap.

---

## B. Spec Sheet — dark, engineered, data-first
**Mood:** an instrument panel / product datasheet. Precise, technical, shows how things are built. Leans on the case-study fields (`problem`, `architecture`, `keyDecisions`) as the main content.
**References:** oxide.computer · teenage.engineering · vercel.com/geist

**Palette**
| Token | Hex | Use |
|---|---|---|
| ink | `#100F0D` | background |
| panel | `#171613` | table header, dialog |
| guide | `#1D1C19` | visible column guides (desktop) |
| rule | `#2B2925` | hairlines |
| paper | `#F2F0EA` | text |
| muted | `#A19C91` | secondary text |
| accent | `#C5F82A` (current lime) | **job: "the one action"** — the single primary button per view, plus focus ring. Never text colour, never decoration |

**Type:** Satoshi (one family: display 700 tight tracking −0.03em, text 400/500) · JetBrains Mono (spec values: dates, stack, versions). JetBrains Mono is **OFL**. Satoshi is **ITF Free Font License** (Fontshare): free for commercial and web use, self-hosting woff2 is allowed, but redistributing the font files themselves is not — check the licence before committing them to a public repo (fallback: General Sans has the same licence; Geist (OFL) is the safe swap). Scale ≈ 1.25: display `clamp(44px, 6vw, 88px)`, h2 40, body 16/1.55, mono 13.
**Grid:** 4 / 8 / 12 columns, max 1280, 1px column guides visible on desktop as the page's texture. Content snaps hard to columns; dense, left-aligned, tabular. Sections divided by full-bleed hairlines.
**Radius / border:** scale `0 / 2` — everything square, controls 2. Every container is a hairline box or a table row; nothing floats.
**Motion language:** mechanical and short: 120–200 ms, ease-out, no springs, no bounce. Hero diagram strokes draw once (CSS `stroke-dashoffset`, ~1.2 s). User-triggered only after that: sort/filter on Projects reorders rows (framer `layout`, lazy-loaded on that route only).
**Buttons:** primary = lime fill, ink text, radius 2, height 44, Satoshi 600, pressed = 1px down. Secondary = transparent, 1px `rule` border, hover border → `paper`. One primary per view.
**Hero:** left: name, one-line role, two actions. Right: a **static system diagram of a real project**, drawn from that project's existing `diagrams.system` (pre-rendered to SVG at build time — never ship mermaid to Home), captioned with the project name and a link to its case study. Replaces the particle canvas with something that is true.
**Projects:** a sortable spec table (name, problem, stack, year, links); detail pages as datasheets with labelled fields. Featured items are pinned rows, not bigger cards.
**Kills the tells:** pills → square controls; glow → hairlines; particle network → a real architecture diagram; `// labels` → real table headers; equal grids → table with real columns.
**Performance:** medium. Fonts ≈ 40–65 KB (Satoshi var subset; JetBrains Mono 1 weight, not preloaded). Inline SVG diagram 10–20 KB. Risks: the draw-in must not hold LCP (heading is LCP, diagram is decoration); column guides must be one CSS background, not DOM elements; framer `layout` stays off Home.

---

## C. Notebook — light-first, essay and margin notes
**Mood:** a researcher's working notebook. Warm, human, thoughtful; projects told as short essays with sidenotes. A clear break from the current dark site — dark is kept for the footer/contact band and as a dark-mode option.
**References:** maggieappleton.com · gwern.net · craigmod.com

**Palette**
| Token | Hex | Use |
|---|---|---|
| paper | `#EFEDE8` | background (cooler than the stock cream) |
| ink | `#151412` | text, dark bands, dark-mode base |
| muted | `#5F5A52` | secondary text (≈ 6.5:1 on paper) |
| rule | `#D9D5CC` | hairlines |
| ink-paper | `#ECE9E2` | text on dark bands |
| accent | `#D4F55A` (lime as highlighter) | **job: "this matters"** — a marker fill behind ink text: the key decision in each case study, link hover, `::selection`. Never on headlines, never as text colour |

**Type:** Fraunces (display; variable with `opsz` and `SOFT` — used soft and low-contrast) · General Sans (text) · JetBrains Mono (code only). Fraunces and JetBrains Mono are **OFL**; General Sans is **ITF FFL** (same caveat as Satoshi — Geist is the OFL fallback). Scale ≈ 1.333 with larger body for reading: display `clamp(48px, 7vw, 104px)`, h2 44, body 18/1.65, sidenote 14.
**Grid:** asymmetric two-column page: text column ~64ch, wide right **margin for sidenotes** (dates, stack, small figures). Max 1120. Mobile: sidenotes become tap-to-expand inline notes. Left-aligned.
**Radius / border:** scale `0 / 6 / 12` — rules and text 0, images and controls 6, dialogs 12. Hairline rules between entries; no boxes around text.
**Motion language:** soft and rare. Highlighter swipes in (scaleX from left, 400 ms) the first time a key-decision mark enters view — case-study pages only. Sidenotes expand with a 200 ms height-free reveal (opacity + translate). Nothing on Home except font load.
**Buttons:** primary = ink fill, paper text, radius 6, height 44, General Sans 500. Secondary = underlined link; hover slides the lime marker under the text.
**Hero:** a page opening rather than a banner: name in Fraunces, a short first-person paragraph (from existing About copy), and margin notes with real current facts — current role/study and latest journey entry from `journeyData`, latest article from `blogsData` selectors. Portrait as a plain rectangular photo with a caption.
**Projects:** grouped by year as a notebook index; each case study is an essay (problem → approach → decisions → lessons) with sidenotes for stack and links.
**Kills the tells:** dark+neon look → light paper; gradients → one highlighter with a reading job; pills → links and 6px controls; equal grids → year-grouped index; repeated section recipe → prose with margins.
**Performance:** highest font cost, lowest motion cost. Full Fraunces variable is 100 KB+; must ship 1–2 static instances (fixed `opsz`/`SOFT`, latin subset, ≈ 30 KB each). With General Sans var ≈ 70–100 KB at first paint. Light/dark theming adds a small token layer and must avoid a flash of wrong theme (inline theme script in `index.html`).

---

## Comparison
| | A Monograph | B Spec Sheet | C Notebook |
|---|---|---|---|
| Base | dark | dark | light (dark bands) |
| Voice | serif, literary | grotesk, technical | soft serif, personal |
| Accent job | live / current | the one action | highlight what matters |
| Projects | ranked contents | sortable spec table | essays by year |
| Font cost | low | medium | highest |
| Motion cost | lowest | medium | low |
| Change from today | medium | medium | largest |

_Font sizes above are estimates; measure in the tokens/fonts phase._
