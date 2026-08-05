import { KnowledgeDocument } from '../types';
import { KnowledgeValidator } from './KnowledgeValidator';
import { KnowledgeCache } from './KnowledgeCache';
import { KnowledgeIndexer } from './KnowledgeIndexer';
import { parsePortfolioData } from './portfolioKnowledge';
import { KnowledgeError } from '../errors';

export type KnowledgeSourceProvider = () => Promise<unknown[]> | unknown[];

/**
 * Reusable, modular Knowledge Manager coordinating loading, validation, caching, and indexing.
 */
export class KnowledgeLoader {
  private cache: KnowledgeCache;
  private indexer: KnowledgeIndexer;
  private sourceProviders: Map<string, KnowledgeSourceProvider> = new Map();
  private loadedSources: Set<string> = new Set();

  constructor(cache?: KnowledgeCache, indexer?: KnowledgeIndexer) {
    this.cache = cache || new KnowledgeCache();
    this.indexer = indexer || new KnowledgeIndexer();

    // Automatically register default portfolio knowledge source
    this.registerSource('portfolio', () => parsePortfolioData());
  }

  /**
   * Register a dynamic knowledge source for lazy loading.
   */
  public registerSource(sourceName: string, provider: KnowledgeSourceProvider): void {
    if (!sourceName || typeof provider !== 'function') {
      throw new KnowledgeError('Invalid source registration parameters');
    }
    this.sourceProviders.set(sourceName, provider);
  }

  /**
   * Load and index documents from raw array or source provider.
   */
  public async loadDocuments(sourceName: string, rawData?: unknown[]): Promise<KnowledgeDocument[]> {
    try {
      const cacheKey = `source_${sourceName}`;
      const cached = this.cache.get<KnowledgeDocument[]>(cacheKey);
      if (cached) {
        return cached;
      }

      let dataToProcess = rawData;

      if (!dataToProcess && this.sourceProviders.has(sourceName)) {
        const provider = this.sourceProviders.get(sourceName)!;
        dataToProcess = await provider();
      }

      if (!dataToProcess || !Array.isArray(dataToProcess)) {
        throw new KnowledgeError(`No data available for knowledge source '${sourceName}'`, sourceName);
      }

      const { validDocs, invalidCount, errors } = KnowledgeValidator.validateBatch(dataToProcess);

      if (validDocs.length === 0 && invalidCount > 0) {
        throw new KnowledgeError(`Failed to load valid documents from '${sourceName}': ${errors.join('; ')}`, sourceName);
      }

      // Index valid documents
      this.indexer.indexBatch(validDocs);

      // Cache validated documents
      this.cache.set(cacheKey, validDocs);
      this.loadedSources.add(sourceName);

      return validDocs;
    } catch (err) {
      if (err instanceof KnowledgeError) throw err;
      throw new KnowledgeError(`Unexpected error loading knowledge source '${sourceName}'`, sourceName, {
        originalError: String(err),
      });
    }
  }

  /**
   * Lazy load all registered sources if not yet loaded.
   */
  public async loadAllRegisteredSources(): Promise<number> {
    let totalLoaded = 0;
    for (const sourceName of this.sourceProviders.keys()) {
      if (!this.loadedSources.has(sourceName)) {
        const docs = await this.loadDocuments(sourceName);
        totalLoaded += docs.length;
      }
    }
    return totalLoaded;
  }

  /**
   * Get the underlying KnowledgeIndexer instance.
   */
  public getIndexer(): KnowledgeIndexer {
    return this.indexer;
  }

  /**
   * Get underlying KnowledgeCache instance.
   */
  public getCache(): KnowledgeCache {
    return this.cache;
  }

  /**
   * Clear cache and search index.
   */
  public clearAll(): void {
    this.cache.clear();
    this.indexer.clear();
    this.loadedSources.clear();
  }
}
