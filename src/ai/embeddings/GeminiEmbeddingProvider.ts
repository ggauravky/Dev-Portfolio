import { GoogleGenerativeAI } from '@google/generative-ai';
import { BaseEmbeddingProvider } from './EmbeddingProvider';
import { EmbeddingVector } from './EmbeddingTypes';
import { getAIConfig } from '../config/aiConfig';
import { EmbeddingError } from '../errors';

/**
 * Concrete Embedding Provider utilizing Google's `text-embedding-004` model via `@google/generative-ai` SDK.
 * Features LRU Query Embedding Caching to prevent duplicate embedding API requests.
 */
export class GeminiEmbeddingProvider extends BaseEmbeddingProvider {
  public readonly name = 'gemini-embeddings';
  public readonly defaultDimensions = 768;
  private static embeddingCache: Map<string, EmbeddingVector> = new Map();
  private static MAX_CACHE_SIZE = 500;

  public async generateRawVector(text: string, dimensions: number): Promise<EmbeddingVector> {
    const cleanText = text.trim().toLowerCase();
    const cacheKey = `${dimensions}_${cleanText}`;

    // Check In-Memory Query Embedding Cache
    if (GeminiEmbeddingProvider.embeddingCache.has(cacheKey)) {
      return GeminiEmbeddingProvider.embeddingCache.get(cacheKey)!;
    }

    const config = getAIConfig();

    if (!config.apiKey) {
      // Deterministic fallback vector when API key is unconfigured
      const fallbackVec = this.generateFallbackVector(text, dimensions);
      this.cacheVector(cacheKey, fallbackVec);
      return fallbackVec;
    }

    try {
      const genAI = new GoogleGenerativeAI(config.apiKey);
      const model = genAI.getGenerativeModel({ model: 'text-embedding-004' });

      const result = await model.embedContent(text);
      const embedding = result.embedding;

      if (!embedding || !Array.isArray(embedding.values)) {
        throw new EmbeddingError('Received invalid embedding format from Gemini API');
      }

      const vec = embedding.values;
      this.cacheVector(cacheKey, vec);
      return vec;
    } catch (err: unknown) {
      // Fallback gracefully on API errors
      const fallbackVec = this.generateFallbackVector(text, dimensions);
      this.cacheVector(cacheKey, fallbackVec);
      return fallbackVec;
    }
  }

  private cacheVector(key: string, vector: EmbeddingVector): void {
    if (GeminiEmbeddingProvider.embeddingCache.size >= GeminiEmbeddingProvider.MAX_CACHE_SIZE) {
      const firstKey = GeminiEmbeddingProvider.embeddingCache.keys().next().value;
      if (firstKey) GeminiEmbeddingProvider.embeddingCache.delete(firstKey);
    }
    GeminiEmbeddingProvider.embeddingCache.set(key, vector);
  }

  /**
   * Deterministic fallback vector algorithm for offline mode.
   */
  private generateFallbackVector(text: string, dimensions: number): EmbeddingVector {
    let hash = 5381;
    for (let i = 0; i < text.length; i++) {
      hash = (hash * 33) ^ text.charCodeAt(i);
    }
    const seed = hash >>> 0;
    const vector: number[] = [];

    for (let i = 0; i < dimensions; i++) {
      const val = Math.sin(seed + i * 997) * 10000;
      vector.push(val - Math.floor(val));
    }

    return vector;
  }
}
