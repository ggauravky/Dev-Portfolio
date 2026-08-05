import { KnowledgeChunk, SearchResult } from '../types';

export interface RankerWeights {
  termFrequencyWeight: number;
  titleBonus: number;
  exactPhraseBonus: number;
  sectionBonus: number;
}

/**
 * Reusable relevance scoring and ranking engine for candidate knowledge chunks.
 */
export class SearchRanker {
  private static readonly DEFAULT_WEIGHTS: RankerWeights = {
    termFrequencyWeight: 1.0,
    titleBonus: 0.35,
    exactPhraseBonus: 0.5,
    sectionBonus: 0.2,
  };

  /**
   * Rank a list of candidate KnowledgeChunks against query text.
   */
  public static rankChunks(
    query: string,
    chunks: KnowledgeChunk[],
    limit = 5,
    minScore = 0.1,
    weights: Partial<RankerWeights> = {}
  ): SearchResult[] {
    if (!query || query.trim().length === 0 || chunks.length === 0) {
      return [];
    }

    const w = { ...SearchRanker.DEFAULT_WEIGHTS, ...weights };
    const normalizedQuery = query.toLowerCase().trim();
    const queryTerms = normalizedQuery
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter((t) => t.length > 2);

    const scoredResults: SearchResult[] = [];

    for (const chunk of chunks) {
      const score = SearchRanker.calculateChunkScore(normalizedQuery, queryTerms, chunk, w);

      if (score >= minScore) {
        scoredResults.push({
          chunkId: chunk.chunkId,
          documentId: chunk.documentId,
          section: chunk.section,
          title: chunk.title,
          content: chunk.content,
          score: Math.min(1.0, Number(score.toFixed(4))),
          metadata: chunk.metadata,
        });
      }
    }

    // Sort descending by relevance score
    scoredResults.sort((a, b) => b.score - a.score);

    return scoredResults.slice(0, limit);
  }

  /**
   * Compute relevance score for a single candidate chunk.
   */
  private static calculateChunkScore(
    normalizedQuery: string,
    queryTerms: string[],
    chunk: KnowledgeChunk,
    w: RankerWeights
  ): number {
    const titleLower = chunk.title.toLowerCase();
    const contentLower = chunk.content.toLowerCase();

    let score = 0;

    // Exact query phrase match bonus
    if (contentLower.includes(normalizedQuery)) {
      score += w.exactPhraseBonus;
    }
    if (titleLower.includes(normalizedQuery)) {
      score += w.titleBonus;
    }

    // Individual term frequency matching
    if (queryTerms.length > 0) {
      let matchedTerms = 0;
      for (const term of queryTerms) {
        if (contentLower.includes(term)) {
          matchedTerms++;
        }
        if (titleLower.includes(term)) {
          score += w.titleBonus / queryTerms.length;
        }
      }
      score += (matchedTerms / queryTerms.length) * w.termFrequencyWeight;
    }

    return Math.min(1.0, score);
  }
}
