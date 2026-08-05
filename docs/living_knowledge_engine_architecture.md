# Gaurav AI — Living Knowledge Engine Architecture

This document describes the **Self-Updating Living Knowledge Engine** powering **Gaurav AI**.

---

## 1. Centralized Knowledge Source Registry

Every portfolio data source is registered in the Knowledge Registry ([KnowledgeRegistry.ts](file:///d:/VsCode/Dev-Portfolio/src/ai/knowledge/KnowledgeRegistry.ts)) with FNV-1a hash checksums for file modification tracking:

| Source ID | Type | Priority | Description |
| :--- | :--- | :--- | :--- |
| `doc_bio_gaurav` | `bio` | `1.0` | Gaurav's Profile, Bio, BBDU, and IIT Mandi credentials |
| `doc_skills_master` | `skills` | `0.95` | Technical skills matrix & framework breakdown |
| `doc_education_master` | `education` | `0.9` | Academic history & qualifications |
| `doc_project_*` | `projects` | `0.85 - 1.0` | Portfolio production projects & case studies |
| `doc_services_master` | `services` | `0.85` | Freelance & development service offerings |
| `doc_faq_*` | `faq` | `0.80` | Frequently asked questions & answers |

---

## 2. Knowledge Graph & Synonym Expansion

The Knowledge Graph ([KnowledgeGraph.ts](file:///d:/VsCode/Dev-Portfolio/src/ai/graph/KnowledgeGraph.ts)) maps relationships between entities:

- **Entity Types**: `Project`, `Skill`, `Technology`, `Institution`, `Blog`, `Service`.
- **Relationship Types**: `BUILT_WITH`, `USES`, `LEARNED_AT`, `EXPLAINS`, `RELATED_TO`.

### **Synonym & Acronym Expansion Dictionary**
- `JS` → `JavaScript`
- `TS` → `TypeScript`
- `MERN` → `MongoDB, Express, React, Node.js`
- `AI` / `ML` → `Artificial Intelligence, Machine Learning, LLM`
- `DL` → `Deep Learning`
- `RAG` → `Retrieval-Augmented Generation`

---

## 3. Incremental Ingestion & Quality Audit

The Incremental Ingestion Engine ([livingKnowledgeService.js](file:///d:/VsCode/Dev-Portfolio/backend/services/livingKnowledgeService.js)) re-chunks and re-embeds **only modified documents** by comparing FNV-1a checksums, keeping ingestion speed under **5 seconds**.
