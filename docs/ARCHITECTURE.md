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
                      └──────┬──────────┬──────────┬─────────┘
                             │          │          │
                    ┌────────▼───┐ ┌────▼─────┐ ┌──▼──────────┐
                    │  MONGODB   │ │ RAZORPAY │ │BREVO EMAIL  │
                    │Transactions│ │ Checkout │ │SMTP + PDF   │
                    └────────────┘ └──────────┘ └─────────────┘
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

---

## 5. Payment Architecture

Paid service pricing is resolved from `backend/data/servicePricing.json`; browser-supplied amounts are ignored. The authenticated API creates a local `PaymentTransaction` before requesting a Razorpay order and returns only safe checkout fields, including the public key ID.

The checkout callback is not treated as proof of payment. `/api/payment/verify` uses the order ID stored in MongoDB for HMAC-SHA256 verification, fetches the payment from Razorpay, and confirms order, paise amount, INR currency, and captured status. `/api/payment/webhook/razorpay` verifies the signature against the exact raw body and records `x-razorpay-event-id` for persistent idempotency.

Both verification paths call one finalizer. It marks the payment paid, upserts one `Booking`, records one activity event, creates a stable receipt identity, and claims email delivery atomically. NodeMailer sends the in-memory PDF through Brevo SMTP; SMTP failure never changes the paid state. Receipt PDFs are generated from trusted MongoDB data and the download endpoint requires authenticated ownership.

---

## 6. Authentication Architecture

The React application exposes one global Google authentication dialog through `AuthContext`. A single loader fetches `https://accounts.google.com/gsi/client`, initializes Google Identity Services once for the backend-provided client ID, and renders Google's official responsive button with FedCM button support. One Tap and automatic account selection are disabled.

`POST /api/auth/google` sends the short-lived Google ID-token credential directly to the backend. The backend verifies signature, issuer, expiration, and the configured audience using `google-auth-library`, then identifies accounts only by the verified Google `sub` stored in the existing `User.googleId` field. The credential is discarded and is never stored or returned.

After reconciliation, the backend issues its own short-lived JWT in the `portfolio_session` HttpOnly cookie. The JWT has a fixed algorithm, issuer, audience, expiration, and unique `jti`; browser JavaScript never receives it. State-changing auth routes require an exact trusted `Origin`, protected application routes resolve `req.authUser` only from the cookie, and payment/activity records retain their existing MongoDB `userId` relationships.
