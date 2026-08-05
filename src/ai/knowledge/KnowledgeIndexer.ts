import { KnowledgeDocument, KnowledgeChunk } from '../types';
import { TextChunker } from '../utils/TextChunker';

export interface IndexStats {
  documentCount: number;
  chunkCount: number;
  uniqueTermsCount: number;
}

/**
 * In-memory search index builder.
 * Chunks documents and creates term inverted index tables for candidate search.
 */
export class KnowledgeIndexer {
  private documents: Map<string, KnowledgeDocument> = new Map();
  private chunks: Map<string, KnowledgeChunk> = new Map();
  private termInvertedIndex: Map<string, Set<string>> = new Map();
  private sectionMap: Map<string, Set<string>> = new Map(); // section -> chunkIds

  /**
   * Tokenize text into lowercased clean words.
   */
  private static tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 2); // Ignore single/two letter noise words
  }

  /**
   * Index a single KnowledgeDocument by chunking and updating term tables.
   */
  public indexDocument(doc: KnowledgeDocument, chunkSize = 500, overlap = 50): KnowledgeChunk[] {
    this.documents.set(doc.id, doc);

    // Remove existing chunks for this doc if re-indexing
    this.removeDocumentFromIndex(doc.id);

    const chunkResults = TextChunker.chunkText(doc.content, { maxChunkSize: chunkSize, overlap });
    const createdChunks: KnowledgeChunk[] = [];

    for (const res of chunkResults) {
      const chunk: KnowledgeChunk = {
        chunkId: res.chunkId,
        documentId: doc.id,
        section: doc.section,
        title: doc.title,
        content: res.content,
        chunkIndex: res.chunkIndex,
        tokenEstimate: Math.ceil(res.characterCount / 4),
        metadata: doc.metadata,
      };

      this.chunks.set(chunk.chunkId, chunk);
      createdChunks.push(chunk);

      // Add to section mapping
      if (!this.sectionMap.has(doc.section)) {
        this.sectionMap.set(doc.section, new Set());
      }
      this.sectionMap.get(doc.section)!.add(chunk.chunkId);

      // Add to inverted term index (title + content)
      const terms = KnowledgeIndexer.tokenize(`${doc.title} ${chunk.content}`);
      for (const term of terms) {
        if (!this.termInvertedIndex.has(term)) {
          this.termInvertedIndex.set(term, new Set());
        }
        this.termInvertedIndex.get(term)!.add(chunk.chunkId);
      }
    }

    return createdChunks;
  }

  /**
   * Index a batch of KnowledgeDocuments.
   */
  public indexBatch(docs: KnowledgeDocument[], chunkSize = 500, overlap = 50): number {
    let totalChunks = 0;
    for (const doc of docs) {
      const chunks = this.indexDocument(doc, chunkSize, overlap);
      totalChunks += chunks.length;
    }
    return totalChunks;
  }

  /**
   * Remove a document and its associated chunks from index.
   */
  public removeDocumentFromIndex(documentId: string): void {
    if (!this.documents.has(documentId)) return;

    for (const [chunkId, chunk] of this.chunks.entries()) {
      if (chunk.documentId === documentId) {
        this.chunks.delete(chunkId);
        // Remove from section map
        this.sectionMap.get(chunk.section)?.delete(chunkId);

        // Remove from term index
        for (const set of this.termInvertedIndex.values()) {
          set.delete(chunkId);
        }
      }
    }
    this.documents.delete(documentId);
  }

  /**
   * Candidate search using inverted term index.
   */
  public findCandidateChunks(query: string, sections?: string[]): KnowledgeChunk[] {
    const terms = KnowledgeIndexer.tokenize(query);
    const candidateIds = new Set<string>();

    for (const term of terms) {
      const matches = this.termInvertedIndex.get(term);
      if (matches) {
        matches.forEach((id) => candidateIds.add(id));
      }
    }

    const candidateChunks: KnowledgeChunk[] = [];
    const sectionSet = sections && sections.length > 0 ? new Set(sections) : null;

    for (const chunkId of candidateIds) {
      const chunk = this.chunks.get(chunkId);
      if (chunk) {
        if (!sectionSet || sectionSet.has(chunk.section)) {
          candidateChunks.push(chunk);
        }
      }
    }

    // Fallback: If no term matches found, return all chunks in target sections (or top chunks)
    if (candidateChunks.length === 0) {
      for (const chunk of this.chunks.values()) {
        if (!sectionSet || sectionSet.has(chunk.section)) {
          candidateChunks.push(chunk);
        }
      }
    }

    return candidateChunks;
  }

  /**
   * Get all stored chunks.
   */
  public getAllChunks(): KnowledgeChunk[] {
    return Array.from(this.chunks.values());
  }

  /**
   * Get index statistics.
   */
  public getStats(): IndexStats {
    return {
      documentCount: this.documents.size,
      chunkCount: this.chunks.size,
      uniqueTermsCount: this.termInvertedIndex.size,
    };
  }

  /**
   * Clear all index data.
   */
  public clear(): void {
    this.documents.clear();
    this.chunks.clear();
    this.termInvertedIndex.clear();
    this.sectionMap.clear();
  }
}
