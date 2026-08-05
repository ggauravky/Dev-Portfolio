import { SemanticChunker, SemanticChunk } from '../utils/SemanticChunker';

export interface NormalizedDocument {
  id: string;
  title: string;
  category: 'projects' | 'skills' | 'experience' | 'education' | 'blogs' | 'services' | 'events' | 'bio' | 'faq';
  summary: string;
  content: string;
  tags: string[];
  keywords: string[];
  url?: string;
  lastUpdated: string;
  relationships?: string[];
  importance: number; // 0.1 to 1.0 score
  language: string;
  chunkCount?: number;
  chunks?: SemanticChunk[];
  metadata?: Record<string, unknown>;
}

/**
 * Ingestion Pipeline normalizing raw portfolio content into structured KnowledgeDocuments & SemanticChunks.
 */
export class IngestionPipeline {
  private normalizedDocs: Map<string, NormalizedDocument> = new Map();
  private allChunks: SemanticChunk[] = [];

  /**
   * Ingest raw JSON portfolio dataset.
   */
  public ingestPortfolioJson(rawJson: Record<string, unknown>): NormalizedDocument[] {
    const docs: NormalizedDocument[] = [];
    const timestamp = new Date().toISOString().split('T')[0];

    // 1. Personal Bio & Profile
    if (rawJson.personal && typeof rawJson.personal === 'object') {
      const p = rawJson.personal as Record<string, unknown>;
      const content = [
        `Gaurav Kumar Yadav is a BCA Student (2023–2026) at BBDU Lucknow and AI/ML Minor Scholar at IIT Mandi.`,
        `Title: ${p.title || 'AI/ML & Full-Stack Developer'}`,
        `Location: ${p.location || 'Lucknow, Uttar Pradesh, India'}`,
        `Email: ${p.email || 'gauravkumar752399@gmail.com'}`,
        `Bio: ${p.bio || ''}`,
        `Open to: ${Array.isArray(p.openTo) ? p.openTo.join(', ') : 'Internships, Software Roles, Freelance'}`,
      ].join('\n');

      docs.push({
        id: 'doc_bio_gaurav',
        title: 'Gaurav Kumar Yadav — Profile & Bio',
        category: 'bio',
        summary: 'Gaurav Kumar Yadav is a BCA student & AI/ML minor scholar building scalable web and machine learning systems.',
        content,
        tags: ['bio', 'profile', 'gaurav', 'contact', 'bbdu', 'iit mandi'],
        keywords: ['gaurav', 'who is gaurav', 'about gaurav', 'profile', 'contact', 'email'],
        url: '/about',
        lastUpdated: timestamp,
        importance: 1.0,
        language: 'en',
      });
    }

    // 2. Skills
    if (rawJson.skills && typeof rawJson.skills === 'object') {
      const s = rawJson.skills as Record<string, string[]>;
      const content = Object.entries(s)
        .map(([cat, list]) => `${cat.toUpperCase()}: ${Array.isArray(list) ? list.join(', ') : String(list)}`)
        .join('\n');

      docs.push({
        id: 'doc_skills_master',
        title: 'Technical Skills & Tech Stack',
        category: 'skills',
        summary: 'Programming languages, frontend frameworks, backend technologies, AI/ML tools, and cloud databases used by Gaurav.',
        content: `Gaurav's Core Technical Stack:\n${content}`,
        tags: ['skills', 'python', 'javascript', 'react', 'node', 'mongodb', 'tensorflow', 'tailwinds'],
        keywords: ['skills', 'tech stack', 'languages', 'frameworks', 'tools', 'backend', 'frontend', 'ai skills'],
        url: '/skills',
        lastUpdated: timestamp,
        importance: 0.9,
        language: 'en',
      });
    }

    // 3. Education
    if (Array.isArray(rawJson.education)) {
      const eduList = rawJson.education as Array<Record<string, unknown>>;
      const content = eduList
        .map((e) => `- Degree: ${e.degree} at ${e.institution} (${e.year || e.status}). Location: ${e.location}. Focus: ${e.focus}`)
        .join('\n');

      docs.push({
        id: 'doc_education_master',
        title: 'Education & Academic Qualifications',
        category: 'education',
        summary: 'BCA Degree at BBDU Lucknow and AI/ML Minor Program at IIT Mandi.',
        content: `Gaurav's Educational History:\n${content}`,
        tags: ['education', 'degree', 'bbdu', 'iit mandi', 'bca', 'academic'],
        keywords: ['education', 'college', 'degree', 'iit mandi', 'bbdu', 'bca', 'qualifications'],
        url: '/about',
        lastUpdated: timestamp,
        importance: 0.85,
        language: 'en',
      });
    }

    // Process and chunk each document
    for (const doc of docs) {
      const chunks = SemanticChunker.chunkDocument(
        doc.id,
        doc.title,
        doc.category,
        doc.content,
        { maxChunkTokens: 300 },
        { tags: doc.tags, keywords: doc.keywords, importance: doc.importance }
      );

      doc.chunkCount = chunks.length;
      doc.chunks = chunks;

      this.normalizedDocs.set(doc.id, doc);
      this.allChunks.push(...chunks);
    }

    return docs;
  }

  /**
   * Ingest arrays of structured project, blog, or experience items.
   */
  public ingestCustomItems(
    category: NormalizedDocument['category'],
    items: Array<Record<string, unknown>>
  ): NormalizedDocument[] {
    const docs: NormalizedDocument[] = [];
    const timestamp = new Date().toISOString().split('T')[0];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const title = String(item.title || item.name || `${category}_item_${i + 1}`);
      const id = `doc_${category}_${title.toLowerCase().replace(/[^\w]/g, '_')}`;

      let content = '';
      if (category === 'projects') {
        content = [
          `Project Title: ${title}`,
          `Subtitle / Domain: ${item.subtitle || item.category || ''}`,
          `Status: ${item.status || 'Completed'}`,
          `Tech Stack: ${Array.isArray(item.techStack) ? item.techStack.join(', ') : item.tech || ''}`,
          `Description: ${item.description || ''}`,
          `Problem & Solution: ${item.solution || item.summary || ''}`,
          `Impact & Metrics: ${item.impact || ''}`,
          `GitHub / Demo Link: ${item.github || item.demo || ''}`,
        ].join('\n');
      } else if (category === 'blogs') {
        content = [
          `Blog Post Title: ${title}`,
          `Category: ${item.category || 'Engineering'}`,
          `Read Time: ${item.readTime || '5 min read'}`,
          `Excerpt: ${item.excerpt || item.summary || ''}`,
          `Full Content / Summary: ${item.content || item.description || ''}`,
        ].join('\n');
      } else {
        content = JSON.stringify(item, null, 2);
      }

      const doc: NormalizedDocument = {
        id,
        title: `${category.slice(0, -1).toUpperCase()}: ${title}`,
        category,
        summary: String(item.summary || item.description || item.excerpt || title).substring(0, 160),
        content,
        tags: [category, title.toLowerCase(), ...((item.techStack as string[]) || [])],
        keywords: [title.toLowerCase(), category, ...((item.techStack as string[]) || [])],
        url: item.url ? String(item.url) : `/${category}`,
        lastUpdated: timestamp,
        importance: item.featured ? 1.0 : 0.8,
        language: 'en',
      };

      const chunks = SemanticChunker.chunkDocument(
        doc.id,
        doc.title,
        doc.category,
        doc.content,
        { maxChunkTokens: 300 },
        { tags: doc.tags, importance: doc.importance }
      );

      doc.chunkCount = chunks.length;
      doc.chunks = chunks;

      this.normalizedDocs.set(doc.id, doc);
      this.allChunks.push(...chunks);
      docs.push(doc);
    }

    return docs;
  }

  /**
   * Get all ingested chunks across all documents.
   */
  public getAllChunks(): SemanticChunk[] {
    return [...this.allChunks];
  }

  /**
   * Get all normalized documents.
   */
  public getAllDocuments(): NormalizedDocument[] {
    return Array.from(this.normalizedDocs.values());
  }

  /**
   * Clear all stored documents and chunks.
   */
  public clear(): void {
    this.normalizedDocs.clear();
    this.allChunks = [];
  }
}
