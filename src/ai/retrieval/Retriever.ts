import { SearchResult, RetrievalOptions } from '../types';
import { KnowledgeIndexer } from '../knowledge/KnowledgeIndexer';
import { SearchRanker } from './SearchRanker';
import { RetrievalError } from '../errors';

export interface IRetriever {
  retrieve(query: string, options?: RetrievalOptions): Promise<SearchResult[]>;
}

/**
 * Knowledge Retriever retrieving top-k relevant knowledge search results.
 */
export class KnowledgeRetriever implements IRetriever {
  private indexer: KnowledgeIndexer;

  constructor(indexer: KnowledgeIndexer) {
    this.indexer = indexer;
  }

  /**
   * Perform candidate search, filtering, and relevance ranking.
   */
  public async retrieve(query: string, options: RetrievalOptions = {}): Promise<SearchResult[]> {
    if (!query || query.trim().length === 0) {
      throw new RetrievalError('Query string cannot be empty', query);
    }

    const limit = options.limit ?? 5;
    const minScore = options.minScore ?? 0.1;
    const sections = options.sections;

    const candidates = this.indexer.findCandidateChunks(query, sections);
    if (candidates.length === 0) {
      return [];
    }

    const results = SearchRanker.rankChunks(query, candidates, limit, minScore);

    // Apply metadata filters if provided
    if (options.metadataFilter) {
      return results.filter((res) => {
        if (!res.metadata) return false;
        return Object.entries(options.metadataFilter!).every(
          ([key, val]) => res.metadata![key] === val
        );
      });
    }

    return results;
  }
}
