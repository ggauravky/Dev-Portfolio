const path = require("node:path");
const fs = require("node:fs");

/**
 * Fast FNV-1a hash algorithm for unique chunk IDs.
 */
function fnv1a(str) {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return (hash >>> 0).toString(16);
}

/**
 * Tokenize string into lowercased terms.
 */
function tokenize(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2);
}

/**
 * Split long text content by paragraph breaks or sections into semantic chunks.
 */
function chunkText(documentId, title, category, content, metadata = {}) {
  if (!content || !content.trim()) return [];

  const cleanText = content.trim();
  const rawSections = cleanText.split(/(?=\n#{1,3}\s+)/g);
  const chunks = [];
  let chunkIdx = 0;

  for (const rawSec of rawSections) {
    const secText = rawSec.trim();
    if (!secText) continue;

    // Split paragraphs if section is too long (> 1200 chars)
    if (secText.length > 1200) {
      const paragraphs = secText.split(/\n\n+/g);
      let buf = "";

      for (const p of paragraphs) {
        const pText = p.trim();
        if (!pText) continue;
        if ((buf + "\n\n" + pText).length <= 1200) {
          buf = buf ? buf + "\n\n" + pText : pText;
        } else {
          if (buf) {
            chunks.push({
              chunkId: `chunk_${fnv1a(buf)}_${chunkIdx++}`,
              documentId,
              title,
              category,
              content: buf,
              metadata,
            });
          }
          buf = pText;
        }
      }
      if (buf) {
        chunks.push({
          chunkId: `chunk_${fnv1a(buf)}_${chunkIdx++}`,
          documentId,
          title,
          category,
          content: buf,
          metadata,
        });
      }
    } else {
      chunks.push({
        chunkId: `chunk_${fnv1a(secText)}_${chunkIdx++}`,
        documentId,
        title,
        category,
        content: secText,
        metadata,
      });
    }
  }

  return chunks;
}

/**
 * Multi-Source Knowledge Ingestion Manager for Backend RAG Pipeline.
 */
class KnowledgeIngestionService {
  constructor() {
    this.documents = [];
    this.chunks = [];
    this.isInitialized = false;
  }

  /**
   * Load and normalize all available portfolio knowledge sources.
   */
  initialize() {
    if (this.isInitialized) return;

    const docs = [];

    // 1. Ingest portfolioData.json
    const jsonPath = path.join(__dirname, "..", "data", "portfolioData.json");
    if (fs.existsSync(jsonPath)) {
      try {
        const raw = fs.readFileSync(jsonPath, "utf8");
        const data = JSON.parse(raw);

        // Profile & Bio
        if (data.personal) {
          docs.push({
            id: "doc_bio_gaurav",
            title: "Gaurav Kumar Yadav — Profile & Bio",
            category: "bio",
            content: `Name: ${data.personal.name || "Gaurav Kumar Yadav"}\nTitle: ${data.personal.title || "AI/ML & Full-Stack Developer"}\nLocation: ${data.personal.location || "Lucknow, UP, India"}\nEmail: ${data.personal.email || "gauravkumar752399@gmail.com"}\nBio: ${data.personal.bio || ""}\nOpen To: ${Array.isArray(data.personal.openTo) ? data.personal.openTo.join(", ") : "Software Engineering Roles, Internships, Freelance"}`,
            importance: 1.0,
          });
        }

        // Skills
        if (data.skills) {
          const skillsText = Object.entries(data.skills)
            .map(([cat, list]) => `${cat.toUpperCase()}: ${Array.isArray(list) ? list.join(", ") : String(list)}`)
            .join("\n");
          docs.push({
            id: "doc_skills_master",
            title: "Technical Skills & Tech Stack",
            category: "skills",
            content: `Gaurav's Core Technical Skills & Tech Stack:\n${skillsText}`,
            importance: 0.95,
          });
        }

        // Education
        if (Array.isArray(data.education)) {
          const eduText = data.education
            .map((e) => `- ${e.degree} at ${e.institution} (${e.year || e.status}). Location: ${e.location}. Focus: ${e.focus}`)
            .join("\n");
          docs.push({
            id: "doc_education_master",
            title: "Education & Qualifications",
            category: "education",
            content: `Gaurav's Educational History:\n${eduText}`,
            importance: 0.9,
          });
        }

        // Projects from JSON
        if (Array.isArray(data.projects)) {
          for (const p of data.projects) {
            const title = String(p.title);
            docs.push({
              id: `doc_project_${title.toLowerCase().replace(/[^\w]/g, "_")}`,
              title: `Project: ${title}`,
              category: "projects",
              content: `Project Title: ${title}\nStatus: ${p.status || "Completed"}\nTech Stack: ${Array.isArray(p.techStack) ? p.techStack.join(", ") : p.tech || ""}\nDescription: ${p.description || ""}\nSolution & Features: ${p.solution || p.impact || ""}`,
              importance: p.featured ? 1.0 : 0.85,
            });
          }
        }

        // Services from JSON
        if (Array.isArray(data.services)) {
          const srvText = data.services
            .map((s) => `- ${s.title}: ${s.description}. Deliverables: ${Array.isArray(s.deliverables) ? s.deliverables.join(", ") : ""}`)
            .join("\n");
          docs.push({
            id: "doc_services_master",
            title: "Services & Freelance Offerings",
            category: "services",
            content: `Services Offered by Gaurav:\n${srvText}`,
            importance: 0.85,
          });
        }

        // FAQ
        if (Array.isArray(data.faq)) {
          data.faq.forEach((f, i) => {
            docs.push({
              id: `doc_faq_${i + 1}`,
              title: `FAQ: ${f.question}`,
              category: "faq",
              content: `Q: ${f.question}\nA: ${f.answer}`,
              importance: 0.8,
            });
          });
        }

        // Voice & Work Style
        if (data.voice) {
          const voiceText = Object.entries(data.voice)
            .map(([k, v]) => `${k}: ${typeof v === "object" ? JSON.stringify(v) : String(v)}`)
            .join("\n");
          docs.push({
            id: "doc_voice_workstyle",
            title: "Work Style, Mindset & Goals",
            category: "bio",
            content: `Gaurav's Engineering Philosophy & Work Style:\n${voiceText}`,
            importance: 0.9,
          });
        }
      } catch (err) {
        console.error("Failed to parse portfolioData.json:", err.message);
      }
    }

    // Process chunking for all loaded documents
    const allChunks = [];
    for (const doc of docs) {
      const chunks = chunkText(doc.id, doc.title, doc.category, doc.content, {
        importance: doc.importance || 0.8,
      });
      doc.chunkCount = chunks.length;
      allChunks.push(...chunks);
    }

    this.documents = docs;
    this.chunks = allChunks;
    this.isInitialized = true;
    console.log(`[RAG Ingestion] Processed ${docs.length} documents into ${allChunks.length} chunks.`);
  }

  getChunks() {
    if (!this.isInitialized) this.initialize();
    return this.chunks;
  }

  getDocuments() {
    if (!this.isInitialized) this.initialize();
    return this.documents;
  }
}

const ingestionService = new KnowledgeIngestionService();

module.exports = {
  ingestionService,
  tokenize,
};
