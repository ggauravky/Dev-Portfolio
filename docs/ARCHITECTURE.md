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

---

## 7. Site Assistant (chat)

The assistant answers questions about Gaurav using only this site's data. It is a Vercel function, not part of the Render backend: Render's free instance sleeps after 15 idle minutes and takes about a minute to wake. Decisions D-097–D-105.

**Request path** (`POST /api/chat` → `api/chat.js` → `lib/chat/handler.js`)
1. **Validation** (not a public API, D-108):
   - exact `Origin` allow-list (`CHAT_ALLOWED_ORIGINS`, default the production origin)
   - JSON only, body ≤ 4 KB
   - UUID `sessionId`, question ≤ 500 characters
   - at most 2 earlier questions as history; earlier answers are never sent back
2. **Conversation layer** (`intents.js`, D-107): small talk, unsafe input, gibberish and other scripts get fixed replies with no model call; replies change when repeated. The server reads the session's recent turns, so follow-ups ("tell me more", "what stack did it use?", "the hackathon before that") are resolved against the previous answer, and dates are compared in code.
3. **Cleaning:** control characters and chat-template tokens are stripped; emails and phone numbers become `[email]`/`[phone]` (`redact.js`).
4. **Rate limits** (`store.js`, MongoDB `portfolio_chat.chat_rate`): fixed 10-minute windows, 18 messages per session and 60 per salted IP hash, plus 80 per session per day and site-wide per-minute provider caps. Over the limit the stream carries one `limit` event with a retry time.
5. **Retrieval** (`retrieve.js`):
   - Hybrid: `0.7·cosine + 0.3·BM25` over `lib/chat/corpus-index.json`, 84 chunks: projects, journey, skills, services, blog sections, about text, and four overviews for list questions, embedded with `gemini-embedding-001` at 768 dims by `npm run chat:index`.
   - Brute force in memory; there is no vector database.
   - If the query can't be embedded, BM25 runs alone behind a rarity-weighted coverage gate.
6. **Generation** (`providers.js`, `prompt.js`):
   - Groq `openai/gpt-oss-20b`, then Gemini `gemini-3.5-flash-lite`, then a templated answer built from the matched chunks. Each provider is skipped on no key, a spent daily budget, a non-2xx, no first token within 8 s, or an empty stream; it never switches after the first token.
   - The system prompt fences context and question as data and has fixed decline phrases. A decline drops sources and follow-ups.
7. **Response:** NDJSON, `delta` events then one `done` with at most 3 sources and 3 follow-ups. Follow-ups are the chunks most similar to the answer's main chunk; no extra model call.
8. **Storage:**
   - `chat_turns`: redacted question, answer, chunk ids, provider, latency, salted IP hash; TTL 180 days.
   - `chat_cache`: repeated first questions, 24 h, keyed by `CACHE_SCHEMA` and the corpus version.
   - Nothing stored is returned to the client. If MongoDB is unreachable, limits fall back to per-instance memory and turns are not logged.

**Client** (`src/components/chat/`)
- "Ask" (`ChatTrigger`) sits beside the dock. `ChatSurface` is a lazy chunk fetched on hover, focus or touch, and it injects its own CSS so the global stylesheet doesn't grow.
- Opening it wipes the site into the chat state: the chrome and dock recede, `#main-content` becomes `inert`, and a focus trap applies. Esc stops a stream, then closes; the browser Back closes it.
- The thread is kept in `sessionStorage`.

**Configuration:** every limit and model name is in `lib/chat/config.js`. Environment variables are listed in `docs/DEPLOYMENT.md` ("Site assistant"). Kill switches: `CHAT_ENABLED=0` (API) and `VITE_CHAT_ENABLED=false` (hides the trigger).

**Tests:** `npm run test:chat` (providers, the embedder and MongoDB are mocked). `npm run chat:dev` runs the real handler locally on `:8787`; Vite proxies `/api/chat` to it in dev and preview.
