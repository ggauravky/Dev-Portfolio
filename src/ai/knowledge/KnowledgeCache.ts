import { KnowledgeDocument } from '../types';

interface CacheEntry<T> {
  data: T;
  createdAt: number;
  expiresAt: number;
}

export interface CacheStats {
  hits: number;
  misses: number;
  size: number;
}

/**
 * High performance in-memory Knowledge Cache with TTL expiration support.
 */
export class KnowledgeCache {
  private cache: Map<string, CacheEntry<unknown>> = new Map();
  private defaultTTLMs: number;
  private hits = 0;
  private misses = 0;

  constructor(defaultTTLMs = 3600000) {
    this.defaultTTLMs = defaultTTLMs;
  }

  /**
   * Set a value in cache with optional item-specific TTL override.
   */
  public set<T>(key: string, data: T, ttlMs?: number): void {
    const ttl = ttlMs ?? this.defaultTTLMs;
    const now = Date.now();
    this.cache.set(key, {
      data,
      createdAt: now,
      expiresAt: now + ttl,
    });
  }

  /**
   * Retrieve a value from cache if it exists and has not expired.
   */
  public get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) {
      this.misses++;
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.misses++;
      return null;
    }

    this.hits++;
    return entry.data as T;
  }

  /**
   * Check if non-expired key exists in cache.
   */
  public has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Remove a single entry from cache.
   */
  public delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear all items from cache.
   */
  public clear(): void {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
  }

  /**
   * Invalidate cached documents associated with a specific section.
   */
  public invalidateSection(sectionName: string): number {
    let count = 0;
    for (const [key, entry] of this.cache.entries()) {
      if (key.includes(sectionName) || (entry.data as KnowledgeDocument)?.section === sectionName) {
        this.cache.delete(key);
        count++;
      }
    }
    return count;
  }

  /**
   * Get cache telemetry statistics.
   */
  public getStats(): CacheStats {
    return {
      hits: this.hits,
      misses: this.misses,
      size: this.cache.size,
    };
  }
}
