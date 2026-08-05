# Gaurav AI — Enterprise Telemetry & Observability Architecture

This document details the telemetry, metrics tracking, cost optimization, quality evaluation, and admin operations for **Gaurav AI**.

---

## 1. Cost Optimization & Pricing Model

Token costs are estimated using official Google Cloud AI pricing:

- **Embeddings Model**: `text-embedding-004` — **$0.00002 / 1,000 tokens**
- **LLM Input Model**: `gemini-2.0-flash-lite` — **$0.000075 / 1,000 input tokens**
- **LLM Output Model**: `gemini-2.0-flash-lite` — **$0.0003 / 1,000 output tokens**

$$\text{Total Cost} = \left(\frac{\text{EmbedTokens}}{1000} \times 0.00002\right) + \left(\frac{\text{InputTokens}}{1000} \times 0.000075\right) + \left(\frac{\text{OutputTokens}}{1000} \times 0.0003\right)$$

---

## 2. API Endpoints

### **GET `/api/ai/health`**
Returns internal developer telemetry snapshot, knowledge chunk counts, average latency, and weak retrievals snapshot.

### **POST `/api/ai/feedback`**
Submits anonymous user feedback:
```json
{
  "rating": "helpful",
  "issueType": "general",
  "message": "Great answer on TaskNexus architecture",
  "query": "Tell me about TaskNexus"
}
```

### **POST `/api/ai/admin/rebuild`**
Invalidates in-memory vector store cache and re-indexes all normalized portfolio knowledge documents.

---

## 3. Knowledge Manifest & Versioning

- **Knowledge Version**: `2.0.0`
- **Embedding Model**: `text-embedding-004-v1`
- **Schema Version**: `v1`
- **Prompt Version**: `v2.0`

Document modifications are tracked via FNV-1a checksum hashes ([KnowledgeVersion.ts](file:///d:/VsCode/Dev-Portfolio/src/ai/knowledge/KnowledgeVersion.ts)) to trigger targeted incremental re-indexing.
