# Gaurav AI — Full Production System Architecture Documentation

This document serves as the master architectural specification for **Gaurav AI**, a production-grade AI portfolio assistant and Agentic Portfolio Operating System.

---

## 1. Executive Summary & Vision

Gaurav AI is engineered to bridge natural conversational interaction with direct portfolio exploration. Built with Google's `text-embedding-004` vector model, Gemini 2.0 Flash Lite LLM, an In-Memory Cosine Similarity Vector Database, Hybrid BM25 Keyword Search, and a Self-Updating Living Knowledge Engine, the assistant functions as both an authentic digital twin and the primary interactive navigation layer of the portfolio.

---

## 2. End-to-End System Architecture

```
[User Query / Action Prompt]
             │
             ▼
    [Intent Classification]
             │
 ┌───────────┴───────────┐
 │                       │
 ▼                       ▼
[Client Agent Action]   [RAG Retrieval Pipeline]
(Nav / Download / Copy)  │
                         ├──► [Text Ingestion & Chunker] (Heading Boundaries)
                         ├──► [Dense Embeddings] (text-embedding-004 768-dim)
                         ├──► [Cosine Vector Database] (Sub-10ms Cosine Search)
                         ├──► [BM25 Keyword Ranker] (Term Frequency Tables)
                         └──► [Knowledge Graph Resolver] (Entity Synonyms)
                                 │
                                 ▼
                     [Grounded Prompt Builder]
                     (System Persona + Context + Rules)
                                 │
                                 ▼
                     [Gemini 2.0 Flash Lite]
                                 │
                                 ▼
                     [Server-Sent Events Stream]
                     (Progressive Token Delivery)
                                 │
                                 ▼
                     [Client UI & Telemetry Drawer]
```

---

## 3. Core Architectural Modules

### **1. AI Core Architecture (`src/ai/`)**
- `config/aiConfig.ts`: Centralized runtime configuration.
- `types/index.ts`: Strict TypeScript data contracts.
- `providers/GeminiProvider.ts`: Implementation of `IAIProvider` interface using `@google/generative-ai`.
- `utils/SemanticChunker.ts`: Heading, paragraph, and code block boundary chunker.

### **2. Dense Vector Store & Embeddings (`src/ai/embeddings/`)**
- `GeminiEmbeddingProvider.ts`: Computes 768-dimensional L2-normalized dense vector embeddings.
- `VectorStore.ts`: In-memory Cosine similarity search engine:
  $$\text{CosineSimilarity}(\mathbf{A}, \mathbf{B}) = \frac{\mathbf{A} \cdot \mathbf{B}}{\|\mathbf{A}\| \|\mathbf{B}\|}$$

### **3. Hybrid Retrieval & Grounding (`src/ai/retrieval/` & `prompts/`)**
- `HybridRetriever.ts`: Evaluates:
  $$\text{HybridScore} = (0.6 \times \text{VectorSim}) + (0.4 \times \text{BM25Score}) + \text{MetadataBoost}$$
- `GroundingGuard.ts`: Enforces zero-hallucination rules.

### **4. Agentic Action System (`src/ai/agent/`)**
- `ActionRegistry.ts`: Modular action registry for page navigation, resume downloads, email copying, external links, and deep links.
- `ActionExecutor.ts`: Executes actions with React Router navigation, smooth scrolling, and glowing DOM pulse rings (`ring-4 ring-toxic`).

### **5. Telemetry & Cost Engine (`backend/telemetry/`)**
- `telemetryService.js`: Tracks response latency, tokens processed, cache hit rate, and USD cost estimates.

### **6. Living Knowledge Engine & Graph (`src/ai/graph/` & `src/ai/knowledge/`)**
- `KnowledgeRegistry.ts`: FNV-1a checksum hash change detector.
- `KnowledgeGraph.ts`: Entity relationships (`BUILT_WITH`, `USES`, `EXPLAINS`) & synonym expansion (`JS` → `JavaScript`, `MERN` → `MongoDB, Express, React, Node.js`).

---

## 4. API Endpoint Reference

- **`POST /api/ai/chat`**: Standard JSON completion endpoint.
- **`POST /api/ai/stream`**: Server-Sent Events (SSE) token streaming endpoint.
- **`POST /api/ai/feedback`**: Anonymous upvote/downvote response feedback endpoint.
- **`GET /api/ai/health`**: System telemetry, cache rates, and health snapshot.
- **`POST /api/ai/admin/rebuild`**: Force cache invalidation and vector re-indexing.

---

## 5. Automated Verification & Quality Assurance

- **RAG & Intent Test Suite**: `backend/tests/ragPipeline.test.js` (12/12 tests passed).
- **Telemetry & Cost Test Suite**: `backend/tests/telemetry.test.js` (4/4 tests passed).
- **Knowledge Engine Test Suite**: `backend/tests/knowledgeEngine.test.js` (2/2 tests passed).
- **Production Build**: `npm run build` (2363 modules compiled cleanly).
