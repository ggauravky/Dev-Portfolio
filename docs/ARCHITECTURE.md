# System Architecture & Technical Specification

This document provides a comprehensive technical overview of the **Dev-Portfolio** software architecture, component tree, data flow, state management, and build optimization pipeline.

---

## 1. High-Level Architecture Overview

```
                      ┌────────────────────────────────────────┐
                      │              USER BROWSER              │
                      │  (Vite + React 18 SPA / Tailwind CSS) │
                      └───────────────────┬────────────────────┘
                                          │
                                HTTP / HTTPS (REST API)
                                          │
                      ┌───────────────────▼────────────────────┐
                      │           NODE.JS BACKEND              │
                      │   (Express, Helmet, Cors, Pino Logs)   │
                      └─────────┬───────────────────┬──────────┘
                                │                   │
                      ┌─────────▼────────┐  ┌───────▼────────┐
                      │    MONGODB       │  │ CASHFREE API   │
                      │   (Atlas DB)     │  │ (Payment Flow) │
                      └──────────────────┘  └────────────────┘
```

---

## 2. Frontend Architecture Stack

- **Core Library**: React 18 (Concurrent rendering, `useMemo`, `useCallback`, lazy route splitting).
- **Build System**: Vite 5.4 with Rollup code-splitting, manual vendor chunking, and obfuscation.
- **Styling Engine**: Tailwind CSS 3.4 with custom Obsidian design system tokens (`#070708` background, `#c5f82a` toxic accent).
- **Animation Framework**: Framer Motion 12 (`AnimatePresence`, layout animations, spring physics).
- **Command Center**: `cmdk` library powering the `⌘K` Universal Command Center.

---

## 3. Directory Structure

```
src/
├── components/          # Reusable UI components (Navbar, Footer, CommandPalette, LazyImage, TechIcon)
├── context/             # React Context Providers (OpeningContext for splash sequence)
├── data/                # Authoritative Data Stores (projectsData, blogsData, journeyData, servicesData)
├── hooks/               # Custom React Hooks (useAuth, useSEO, use3DTilt, useHeaderHeight)
├── pages/               # Route Page Components (Home, About, Journey, Skills, Projects, Services, Blog)
└── utils/               # Helper utilities (searchEngine, backendPing, analytics)
```

---

## 4. Performance & Image Optimization

- **Multi-Format Image Pipeline**: Responsive AVIF, WebP, and PNG variants generated automatically during build (`scripts/generate-image-variants.js`).
- **Lazy Loading**: Route-based code splitting via `React.lazy()` and `<Suspense>` loaders prevents large bundle payloads.
- **SEO & Metadata**: Dynamic Open Graph, Twitter Cards, and canonical URL management via custom `useSEO()` hook.
