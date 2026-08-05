# Gaurav AI — Production Deployment & Operations Playbook

This document defines the production deployment, environment configuration, disaster recovery, and operational procedures for **Gaurav AI v1.0 Release Candidate**.

---

## 1. Environment Variables Configuration

Set the following environment variables in your hosting environment (Vercel / Node server):

```env
# Google Gemini API Key
GEMINI_API_KEY="your-production-gemini-api-key"

# AI Core Provider & Model
AI_PROVIDER="gemini"
GEMINI_MODEL="gemini-2.0-flash-lite"

# Server Port
PORT=5000
NODE_ENV="production"
```

---

## 2. CI/CD & Deployment Pipeline

Every commit pushed to `main` triggers the automated GitHub Actions workflow ([production-ci.yml](file:///d:/VsCode/Dev-Portfolio/.github/workflows/production-ci.yml)):

1. Runs 4 automated test suites (`ragPipeline`, `telemetry`, `knowledgeEngine`, `e2ePipeline`).
2. Executes Vite production build (`npm run build`).
3. Deploys cleanly to production host.

---

## 3. Rate Limiting & Abuse Prevention

- **Sliding Window Limit**: Enforces 30 requests / minute per client IP.
- **Header Response**: Returns `429 Too Many Requests` with `Retry-After: 60` header when threshold is breached.
- **Sanitizer**: Strips HTML scripts and prompt injection keywords (`/ignore previous instructions/i`).

---

## 4. Disaster Recovery & Fallback Procedures

1. **Gemini SDK Unavailable**: System automatically degrades gracefully, serving cached grounded responses or informing the user of temporary model unavailability.
2. **Vector Index Invalidation**: Administrators can force a vector re-indexing by issuing a `POST /api/ai/admin/rebuild` request.
