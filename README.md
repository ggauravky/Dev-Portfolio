# Gaurav AI — Enterprise RAG Architecture & Portfolio Operating System

[![Build Status](https://github.com/ggauravky/Dev-Portfolio/actions/workflows/production-ci.yml/badge.svg)](https://github.com/ggauravky/Dev-Portfolio/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Node Version](https://img.shields.io/badge/Node.js-v20-green.svg)](https://nodejs.org)
[![Vite Version](https://img.shields.io/badge/Vite-v5.4-purple.svg)](https://vitejs.dev)

> **Gaurav AI** is an enterprise-grade Retrieval-Augmented Generation (RAG) assistant and Agentic Portfolio Operating System powered by Google's `text-embedding-004` vector embeddings model, Gemini 2.0 Flash Lite, an In-Memory Cosine Similarity Vector Database, Hybrid BM25 Keyword Search, and a Self-Updating Living Knowledge Engine.

---

## 🌟 System Highlights

- **Retrieval-Augmented Generation (RAG)**: Zero-hallucination grounded responses using dense 768-dimensional vector embeddings and Hybrid BM25 keyword search.
- **Agentic Portfolio Operating System**: Executes client navigation, smooth element scrolling, pulse ring DOM highlighting, resume downloads, and email copying directly through conversational prompts.
- **Living Knowledge Engine**: Automatically detects document modifications via FNV-1a checksum hashes and re-indexes only modified content incrementally.
- **Recruiter & Engineering Modes**: Recruiter-friendly starter prompts alongside developer tools for inspecting RAG vector search scores and pipeline telemetry.
- **Server-Sent Events (SSE) Token Streaming**: Sub-second progressive token rendering with smooth text appending.
- **Enterprise Observability & Telemetry**: Tracks token usage, latency, cache hit rates, weak retrievals (<0.4 confidence), and USD cost estimates.

---

## 🏗️ Architecture Blueprint

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

## 📐 Vector Similarity & Hybrid Search Formula

Dense vector similarity between query vector $\mathbf{A}$ and document chunk vector $\mathbf{B}$ is computed using **Cosine Similarity**:

$$\text{CosineSimilarity}(\mathbf{A}, \mathbf{B}) = \frac{\mathbf{A} \cdot \mathbf{B}}{\|\mathbf{A}\| \|\mathbf{B}\|}$$

Candidate chunks are ranked using the weighted Hybrid Score:

$$\text{HybridScore} = (0.6 \times \text{VectorSim}) + (0.4 \times \text{BM25Score}) + \text{MetadataBoost}$$

---

## 💻 Tech Stack

- **Frontend**: React 18, Vite 5, Tailwind CSS, Framer Motion, Lucide Icons.
- **Backend API**: Node.js, Express.js.
- **AI / RAG**: Google `@google/generative-ai` (`text-embedding-004`, `gemini-2.0-flash-lite`), Custom In-Memory Vector Store, Hybrid BM25 Search.
- **Testing**: Node Test Runner (`node --test`), Custom E2E Suite.
- **CI/CD**: GitHub Actions (`production-ci.yml`).

---

## 🚀 Quickstart Guide

### 1. Prerequisites
- Node.js v20+
- npm v10+

### 2. Installation
```bash
git clone https://github.com/ggauravky/Dev-Portfolio.git
cd Dev-Portfolio
npm install
```

### 3. Environment Setup
Create a `.env` file in the root directory:
```env
GEMINI_API_KEY="your-gemini-api-key"
AI_PROVIDER="gemini"
GEMINI_MODEL="gemini-2.0-flash-lite"
PORT=5000
```

### 4. Run Development Server & Backend
```bash
npm run dev
```

### 5. Execute Test Suite
```bash
node --test backend/tests/ragPipeline.test.js backend/tests/telemetry.test.js backend/tests/knowledgeEngine.test.js backend/tests/e2ePipeline.test.js
```

### 6. Production Build Verification
```bash
npm run build
```

---

## 📄 Documentation

- [Master System Architecture Specification](file:///d:/VsCode/Dev-Portfolio/docs/gaurav_ai_system_architecture.md)
- [Living Knowledge Engine Architecture](file:///d:/VsCode/Dev-Portfolio/docs/living_knowledge_engine_architecture.md)
- [Production Observability Architecture](file:///d:/VsCode/Dev-Portfolio/docs/ai_observability_architecture.md)
- [Production Deployment Playbook](file:///d:/VsCode/Dev-Portfolio/docs/production_deployment_playbook.md)
- [Release Notes v1.0.0](file:///d:/VsCode/Dev-Portfolio/docs/release_notes_v1.0.0.md)

---

## 📜 License

Licensed under the MIT License. Copyright (c) 2026 Gaurav Kumar Yadav.
