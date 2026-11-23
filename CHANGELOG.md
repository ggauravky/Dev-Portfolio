# Changelog

All notable changes to the **Dev-Portfolio** project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [6.0.0] - 2026-11-23

### Monograph Redesign & Site Assistant

Everything since v5.1.0: the August simplification and the v2 redesign (#24–#34).

#### Added
- **Monograph redesign (#25):** a dark, editorial design with Fraunces for headings, Geist for text and one lime accent used only for "live / current". Every route is rebuilt on it, including legal, booking, support and account pages.
- **Bottom pill dock:** replaces the top navbar, with the page index, a scroll-progress ring and the availability dot.
- **Hero name:** reacts to the cursor through Fraunces' variable weight axis.
- **Home live panel (#26):** Lucknow local time (IST), latest GitHub activity and current availability.
- **Projects index:** ranked, with filters, sorting, search and a preview that follows the cursor. Clicking a project carries its title and image into the case study (View Transitions, with an instant fallback).
- **Journey timeline (#28):** a spine that fills as you scroll, a sticky year and photo previews.
- **Site assistant (#32, #33):** opened from the dock. It answers only from this site and the owner's knowledge base, with source links and streamed answers, and shows daily usage limits.
- **Per-route SEO (#27):** static HTML heads for every route (title, canonical, Open Graph, structured data), real 404s for unknown project, blog and service pages, and maintained `llms.txt`, `llms-full.txt` and `openapi.json`.
- Flagship Open Source documentation suite (`ARCHITECTURE.md`, `DEPLOYMENT.md`, `FAQ.md`, `ROADMAP.md`, `SUPPORT.md`).
- Custom geometric vector logos (`logo.svg`, `logo-monochrome.svg`, `favicon.svg`).
- GitHub community workflows, issue templates, PR template, dependabot configuration, and CI build pipeline.
- 402 responsive AVIF/WebP image variants generated across resolution breakpoints.

#### Changed
- **Colour, motion and mobile pass (#28):** motion respects `prefers-reduced-motion`.
- **Copy cleanup (#34):** across Home, Projects, case studies, Journey, Services, Blog and Contact. Blog diagrams and the cover were redrawn in the site's own fonts.
- **Theme:** the site is dark-only, and the theme toggle is removed.
- Streamlined architecture into a high-performance, focused software engineering portfolio.
- Upgraded Command Palette (`⌘K`) with instant fuzzy search across pages, projects, and services.

#### Removed
- **Top navbar:** replaced by the bottom dock.
- Deleted legacy experimental Lab module and AI assistant routes.
- Removed unused dependencies (`@google/generative-ai`, `@tensorflow/tfjs`, `compromise`, `mermaid`).

#### Security
- **Backend routes (#30):** hardened, with request IDs and Sentry data scrubbing.

---

## [5.0.0] - 2026-08-01

### Career Timeline & Interactive Journey Milestone

#### Added
- Interactive Career & Academic Journey timeline with filters (Year, Location, Mode, Tech, Organization).
- Activity Timeline tracking contribution activity and verified session logs.

---

## [4.0.0] - 2026-07-15

### Service Booking & Payment Integration

#### Added
- Cashfree payment gateway integration for 1-on-1 mentorship, code reviews, and freelance web application packages.
- Admin dashboard (`/admin`) for booking management, transaction verification, and activity tracking.
- Automated email receipts via Brevo transaction API.

---

## [3.0.0] - 2026-06-01

### Core UI/UX Overhaul & Obsidian Design Language

#### Added
- Modern dark obsidian aesthetic with `#c5f82a` toxic accent palette.
- Framer Motion page transitions and custom radial contextual navigation menu.
- Lazy-loaded project case studies and technical blog post reader.
