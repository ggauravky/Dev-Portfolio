import { SearchResult, RetrievalOptions } from '../types';
import { IRetriever } from './Retriever';
import { VectorStore } from '../embeddings/VectorStore';
import { GeminiEmbeddingProvider } from '../embeddings/GeminiEmbeddingProvider';
import { SearchRanker } from './SearchRanker';
import { KnowledgeIndexer } from '../knowledge/KnowledgeIndexer';

export interface HybridScoreWeights {
  vectorWeight: number; // default: 0.6
  bm25Weight: number; // default: 0.4
}

/**
 * Hybrid Retriever combining Dense Vector Semantic Search + BM25 Keyword Matching + Reranking.
 */
export class HybridRetriever implements IRetriever {
  private vectorStore: VectorStore;
  private embeddingProvider: GeminiEmbeddingProvider;
  private indexer: KnowledgeIndexer;
  private weights: HybridScoreWeights;

  constructor(
    indexer: KnowledgeIndexer,
    vectorStore?: VectorStore,
    embeddingProvider?: GeminiEmbeddingProvider,
    weights: Partial<HybridScoreWeights> = {}
  ) {
    this.indexer = indexer;
    this.vectorStore = vectorStore || new VectorStore();
    this.embeddingProvider = embeddingProvider || new GeminiEmbeddingProvider();
    this.weights = {
      vectorWeight: weights.vectorWeight ?? 0.6,
      bm25Weight: weights.bm25Weight ?? 0.4,
    };
  }

  /**
   * Execute hybrid retrieval combining vector similarity and BM25 term matching.
   */
  public async retrieve(query: string, options: RetrievalOptions = {}): Promise<SearchResult[]> {
    if (!query || query.trim().length === 0) return [];

    const limit = options.limit ?? 5;
    const minScore = options.minScore ?? 0.15;
    const sections = options.sections;

    // 1. Keyword Candidate Search & BM25 Scoring
    const candidateChunks = this.indexer.findCandidateChunks(query, sections);
    const bm25Results = SearchRanker.rankChunks(query, candidateChunks, limit * 2, 0.05);

    // Map BM25 scores by chunkId
    const bm25Map = new Map<string, number>();
    for (const r of bm25Results) {
      bm25Map.set(r.chunkId, r.score);
    }

    // 2. Dense Vector Semantic Search
    let vectorResults: SearchResult[] = [];
    try {
      const { vector } = await this.embeddingProvider.embedQuery(query);
      vectorResults = this.vectorStore.search(vector, limit * 2, 0.1, sections);
    } catch {
      vectorResults = [];
    }

    // Map Vector scores by chunkId
    const vectorMap = new Map<string, number>();
    for (const r of vectorResults) {
      vectorMap.set(r.chunkId, r.score);
    }

    // 3. Union & Hybrid Scoring
    const allChunkIds = new Set<string>([
      ...Array.from(bm25Map.keys()),
      ...Array.from(vectorMap.keys()),
    ]);

    const hybridResults: SearchResult[] = [];

    for (const chunkId of allChunkIds) {
      // Find chunk source
      const bm25Match = bm25Results.find((r) => r.chunkId === chunkId);
      const vectorMatch = vectorResults.find((r) => r.chunkId === chunkId);

      const baseMatch = bm25Match || vectorMatch;
      if (!baseMatch) continue;

      const vScore = vectorMap.get(chunkId) || 0;
      const bScore = bm25Map.get(chunkId) || 0;

      const hybridScore = Number(
        (vScore * this.weights.vectorWeight + bScore * this.weights.bm25Weight).toFixed(4)
      );

      if (hybridScore >= minScore) {
        hybridResults.push({
          ...baseMatch,
          score: hybridScore,
        });
      }
    }

    // Sort descending by hybrid score
    hybridResults.sort((a, b) => b.score - a.score);

    return hybridResults.slice(0, limit);
  }
}
