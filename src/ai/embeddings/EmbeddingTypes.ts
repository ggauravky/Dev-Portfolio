/**
 * Floating point array representing dense vector embedding.
 */
export type EmbeddingVector = number[];

export interface EmbeddingOptions {
  dimensions?: number;
  normalize?: boolean;
  model?: string;
}

export interface EmbeddingResult {
  text: string;
  vector: EmbeddingVector;
  dimensions: number;
  hash: string;
  metadata?: Record<string, unknown>;
}

export interface BatchEmbeddingResult {
  embeddings: EmbeddingResult[];
  totalCount: number;
  dimensions: number;
  latencyMs: number;
}
