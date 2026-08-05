import { EmbeddingOptions, EmbeddingResult, BatchEmbeddingResult, EmbeddingVector } from './EmbeddingTypes';
import { EmbeddingCache } from './EmbeddingCache';
import { HashUtil } from '../utils/HashUtil';
import { EmbeddingError } from '../errors';

/**
 * Interface contract for vector embedding providers.
 */
export interface IEmbeddingProvider {
  readonly name: string;
  readonly defaultDimensions: number;

  /**
   * Generate vector embedding for a single string.
   */
  embedQuery(text: string, options?: EmbeddingOptions): Promise<EmbeddingResult>;

  /**
   * Generate vector embeddings for a batch of text strings.
   */
  embedBatch(texts: string[], options?: EmbeddingOptions): Promise<BatchEmbeddingResult>;
}

/**
 * Abstract Base Embedding Provider handling caching and batch splitting.
 */
export abstract class BaseEmbeddingProvider implements IEmbeddingProvider {
  public abstract readonly name: string;
  public abstract readonly defaultDimensions: number;
  protected cache: EmbeddingCache;

  constructor(cache?: EmbeddingCache) {
    this.cache = cache || new EmbeddingCache();
  }

  public abstract generateRawVector(text: string, dimensions: number): Promise<EmbeddingVector>;

  public async embedQuery(text: string, options?: EmbeddingOptions): Promise<EmbeddingResult> {
    if (!text || text.trim().length === 0) {
      throw new EmbeddingError('Cannot generate embedding for empty string');
    }

    const dimensions = options?.dimensions || this.defaultDimensions;
    const cached = this.cache.get(text);

    if (cached && cached.dimensions === dimensions) {
      return cached;
    }

    const rawVector = await this.generateRawVector(text, dimensions);
    const vector = options?.normalize !== false ? this.normalizeVector(rawVector) : rawVector;

    return this.cache.set(text, vector, dimensions);
  }

  public async embedBatch(texts: string[], options?: EmbeddingOptions): Promise<BatchEmbeddingResult> {
    const startTime = Date.now();
    const dimensions = options?.dimensions || this.defaultDimensions;
    const results: EmbeddingResult[] = [];

    for (const text of texts) {
      const res = await this.embedQuery(text, options);
      results.push(res);
    }

    return {
      embeddings: results,
      totalCount: results.length,
      dimensions,
      latencyMs: Date.now() - startTime,
    };
  }

  /**
   * Normalizes vector to unit length (L2 norm).
   */
  protected normalizeVector(vector: EmbeddingVector): EmbeddingVector {
    const norm = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    if (norm === 0) return vector;
    return vector.map((val) => val / norm);
  }
}

/**
 * Mock Embedding Provider for Phase 2 architecture testing.
 * Generates deterministic pseudo-random normalized vectors based on FNV-1a hash without API calls.
 */
export class MockEmbeddingProvider extends BaseEmbeddingProvider {
  public readonly name = 'mock-embeddings';
  public readonly defaultDimensions = 128;

  public async generateRawVector(text: string, dimensions: number): Promise<EmbeddingVector> {
    const hash = HashUtil.fnv1a(text);
    const seed = parseInt(hash, 16);
    const vector: number[] = [];

    for (let i = 0; i < dimensions; i++) {
      // Deterministic pseudo-random value between -1.0 and 1.0 based on seed + index
      const val = Math.sin(seed + i * 997) * 10000;
      vector.push(val - Math.floor(val));
    }

    return vector;
  }
}
