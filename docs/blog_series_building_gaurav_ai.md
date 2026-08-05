# Building Gaurav AI — Engineering Blog Series

A 4-part deep dive into building an enterprise-grade RAG assistant and Agentic Portfolio Operating System.

---

## Part 1: Building Gaurav AI — From Naive Prompt to Enterprise RAG

Most portfolio chatbots are simple wrappers around standard LLM prompts. They suffer from hallucination, context truncation, slow response times, and stale data when portfolio content changes.

Gaurav AI was architected from the ground up to solve these fundamental flaws:
1. **Retrieval-First Philosophy**: Every answer must be grounded in retrieved knowledge.
2. **Zero Technical Debt**: Built across 11 modular engineering phases.
3. **Dual Role**: Functions as both an authentic digital twin and the primary interactive navigation layer of the portfolio.

---

## Part 2: Math Behind In-Memory Cosine Vector Search & Hybrid BM25 Ranking

Generating dense 768-dimensional embeddings using Google's `text-embedding-004` allows semantic similarity retrieval. Cosine similarity between query vector $\mathbf{A}$ and chunk vector $\mathbf{B}$ is computed as:

$$\text{CosineSimilarity}(\mathbf{A}, \mathbf{B}) = \frac{\mathbf{A} \cdot \mathbf{B}}{\|\mathbf{A}\| \|\mathbf{B}\|}$$

To guarantee high precision for proper nouns, candidate chunks are ranked using the weighted Hybrid Score:

$$\text{HybridScore} = (0.6 \times \text{VectorSim}) + (0.4 \times \text{BM25Score}) + \text{MetadataBoost}$$

---

## Part 3: Designing a Self-Updating Living Knowledge Engine

Whenever portfolio documents change, re-indexing every document is slow and expensive.
The Living Knowledge Engine computes FNV-1a checksum hashes for every source. During re-ingestion, the system compares current hashes against previous hashes and re-chunks/re-embeds **only modified files**, completing incremental ingestion in under 5 seconds.

---

## Part 4: Portfolio AI Agent Architecture — Turning Conversation into UI Navigation

Gaurav AI transforms conversation into actions. When a user asks *"Show me your MERN projects"*, the Agent system parses intent and executes client actions:
- Navigating to `/projects` via React Router.
- Smoothly scrolling to project sections.
- Highlighting target elements with glowing toxic pulse rings (`ring-4 ring-toxic`).
- Triggering direct resume downloads or copying email addresses.
