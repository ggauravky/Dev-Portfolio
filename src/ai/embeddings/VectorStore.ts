import { EmbeddingVector } from './EmbeddingTypes';
import { SearchResult } from '../types';

export interface VectorEntry {
  id: string;
  documentId: string;
  category: string;
  title: string;
  content: string;
  vector: EmbeddingVector;
  metadata?: Record<string, unknown>;
}

export interface VectorSearchResult {
  entry: VectorEntry;
  similarity: number;
}

/**
 * Fast In-Memory Cosine Similarity Vector Database Engine.
 * Supports top-k vector search, section filtering, thresholding, and vector indexing.
 */
export class VectorStore {
  private entries: Map<string, VectorEntry> = new Map();

  /**
   * Calculate Cosine Similarity between two L2 normalized vectors.
   */
  public static cosineSimilarity(vecA: EmbeddingVector, vecB: EmbeddingVector): number {
    if (vecA.length !== vecB.length || vecA.length === 0) return 0;

    let dot = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
      const a = vecA[i];
      const b = vecB[i];
      dot += a * b;
      normA += a * a;
      normB += b * b;
    }

    if (normA === 0 || normB === 0) return 0;
    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Upsert a vector entry into the store.
   */
  public upsert(entry: VectorEntry): void {
    this.entries.set(entry.id, entry);
  }

  /**
   * Upsert a batch of vector entries.
   */
  public upsertBatch(entries: VectorEntry[]): void {
    for (const entry of entries) {
      this.upsert(entry);
    }
  }

  /**
   * Search vector store by query vector using Cosine Similarity.
   */
  public search(
    queryVector: EmbeddingVector,
    limit = 5,
    minSimilarity = 0.25,
    categories?: string[]
  ): SearchResult[] {
    if (this.entries.size === 0 || queryVector.length === 0) {
      return [];
    }

    const categorySet = categories && categories.length > 0 ? new Set(categories) : null;
    const scored: VectorSearchResult[] = [];

    for (const entry of this.entries.values()) {
      if (categorySet && !categorySet.has(entry.category)) {
        continue;
      }

      const sim = VectorStore.cosineSimilarity(queryVector, entry.vector);

      if (sim >= minSimilarity) {
        scored.push({ entry, similarity: sim });
      }
    }

    scored.sort((a, b) => b.similarity - a.similarity);

    return scored.slice(0, limit).map((match) => ({
      chunkId: match.entry.id,
      documentId: match.entry.documentId,
      section: match.entry.category,
      title: match.entry.title,
      content: match.entry.content,
      score: Number(match.similarity.toFixed(4)),
      metadata: match.entry.metadata,
    }));
  }

  /**
   * Get store size.
   */
  public get size(): number {
    return this.entries.size;
  }

  /**
   * Clear all indexed vectors.
   */
  public clear(): void {
    this.entries.clear();
  }
}
