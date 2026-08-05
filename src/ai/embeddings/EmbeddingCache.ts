import { EmbeddingResult, EmbeddingVector } from './EmbeddingTypes';
import { HashUtil } from '../utils/HashUtil';

/**
 * Cache store for computed text embeddings to eliminate redundant embedding calculations.
 */
export class EmbeddingCache {
  private cache: Map<string, EmbeddingResult> = new Map();
  private maxItems: number;

  constructor(maxItems = 10000) {
    this.maxItems = maxItems;
  }

  /**
   * Get cached embedding for text if available.
   */
  public get(text: string): EmbeddingResult | null {
    const hash = HashUtil.hashString(text);
    return this.cache.get(hash) || null;
  }

  /**
   * Store embedding result in cache.
   */
  public set(text: string, vector: EmbeddingVector, dimensions: number): EmbeddingResult {
    if (this.cache.size >= this.maxItems) {
      // LRU eviction heuristic: delete first item
      const firstKey = this.cache.keys().next().value;
      if (firstKey) this.cache.delete(firstKey);
    }

    const hash = HashUtil.hashString(text);
    const result: EmbeddingResult = {
      text,
      vector,
      dimensions,
      hash,
    };

    this.cache.set(hash, result);
    return result;
  }

  /**
   * Check if embedding exists for given text.
   */
  public has(text: string): boolean {
    const hash = HashUtil.hashString(text);
    return this.cache.has(hash);
  }

  /**
   * Clear all cached embeddings.
   */
  public clear(): void {
    this.cache.clear();
  }

  /**
   * Get total cached items count.
   */
  public get size(): number {
    return this.cache.size;
  }
}
