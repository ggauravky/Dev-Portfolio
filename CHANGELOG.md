# Changelog — Gaurav AI

All notable changes to **Gaurav AI** will be documented in this file.

---

## [v1.0.0-rc1] — 2026-08-05 (Production Release Candidate)

### **Phase 1: Complete Chatbot Reset & Technical Debt Audit**
- Audited legacy codebase and safely removed 14 legacy files (~62 KB).
- Prepared modular architectural structure in `src/ai/`.

### **Phase 2: AI Core Architecture**
- Created 32 TypeScript modules across `config`, `types`, `providers`, `prompts`, `retrieval`, `knowledge`, `embeddings`, `memory`, and `utils`.

### **Phase 3: AI Backend Integration (Gemini)**
- Built `GeminiProvider.ts` integrating `@google/generative-ai`.
- Mounted synchronous `POST /api/ai/chat` endpoint.

### **Phase 4: Modern AI Chat Interface**
- Built modular chat components: `ChatWidget`, `ChatWindow`, `ChatHeader`, `ChatMessages`, `ChatMessage`, `ChatInput`, `ChatSources`, `ChatSuggestions`.

### **Phase 5: Intelligence Layer (RAG, Vector Store & SSE Streaming)**
- Integrated Google `text-embedding-004` (768-dim dense vector generation).
- Built In-Memory Cosine Similarity `VectorStore`.
- Implemented `HybridRetriever` (0.6 Vector + 0.4 BM25 + Metadata Boost).
- Added `GroundingGuard` anti-hallucination rules.
- Built Server-Sent Events progressive token streaming (`POST /api/ai/stream`).

### **Phase 6: Premium UI/UX & Motion Design**
- Built `designTokens.ts` with Apple/Linear cubic-bezier easing (`cubic-bezier(0.16, 1, 0.3, 1)`).
- Upgraded message bubbles with code copy headers and hover tooltip citations.

### **Phase 7: Portfolio AI Agent Operating System**
- Built `ActionRegistry.ts` (15+ portfolio actions).
- Built `ActionExecutor.ts` supporting client navigation, smooth scrolling, pulse ring DOM highlighting, resume downloading, and email copying.
- Integrated shortcuts into `Ctrl + K` Command Palette.

### **Phase 8: Enterprise Observability Platform**
- Implemented `telemetryService.js` and `AIAnalytics.ts` tracking latency, token usage, cost estimates, and weak retrievals.
- Built feedback API (`POST /api/ai/feedback`) and developer health dashboard (`src/pages/lab/AIHealthDashboard.jsx`).

### **Phase 9: Living Knowledge Engine & Semantic Graph**
- Built `KnowledgeRegistry.ts` with FNV-1a checksum hash file modification tracking.
- Built `KnowledgeGraph.ts` mapping entities and expanding acronyms (`JS` → `JavaScript`, `MERN` → `MongoDB, Express, React, Node.js`).
- Built `livingKnowledgeService.js` for incremental re-indexing.

### **Phase 10: AI Showcase & Engineering Transparency**
- Built collapsible "Why This Answer?" telemetry panel in assistant messages.
- Added Recruiter Mode vs. Engineering Mode toggle in `ChatHeader.tsx`.
- Built interactive `ArchitectureDiagram.tsx` and developer `KnowledgeInspector.tsx`.
- Created flagship production case study page (`/projects/gaurav-ai`).

### **Phase 11: Production Hardening & Security**
- Built input security `Sanitizer.ts` with prompt injection defense.
- Built sliding window `rateLimiter.js` enforcing 30 requests/min per IP.
- Created end-to-end test suite (`e2ePipeline.test.js`).
- Configured GitHub Actions CI/CD workflow (`production-ci.yml`).
- Published production deployment playbook (`docs/production_deployment_playbook.md`).
