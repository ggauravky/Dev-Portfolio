# Design direction — Phase 1 (2026-11-12)

> **Chosen direction: A — Monograph** (dark editorial, serif-led). Picked by the user on 2026-11-12. B and C are kept below for reference only.

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
| accent | `#C2EE3A` (refined lime) | **job: "live / current"** — current role, current page in nav, link hover underline, focus ring |

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
