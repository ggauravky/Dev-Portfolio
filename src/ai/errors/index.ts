/**
 * Base error class for all AI module errors.
 * Provides structured error details, timestamps, and error codes.
 */
export class BaseAIError extends Error {
  public readonly code: string;
  public readonly details?: Record<string, unknown>;
  public readonly timestamp: number;

  constructor(message: string, code = 'AI_ERROR', details?: Record<string, unknown>) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.details = details;
    this.timestamp = Date.now();

    // Restores proper prototype chain in ES5/ES6 transpilation
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Error thrown when AI Provider operations fail.
 */
export class AIProviderError extends BaseAIError {
  public readonly providerName?: string;

  constructor(message: string, providerName?: string, details?: Record<string, unknown>) {
    super(message, 'AI_PROVIDER_ERROR', { ...details, providerName });
    this.providerName = providerName;
  }
}

/**
 * Error thrown when retrieval pipeline or search operations fail.
 */
export class RetrievalError extends BaseAIError {
  public readonly query?: string;

  constructor(message: string, query?: string, details?: Record<string, unknown>) {
    super(message, 'RETRIEVAL_ERROR', { ...details, query });
    this.query = query;
  }
}

/**
 * Error thrown during knowledge loading, validation, indexing, or caching.
 */
export class KnowledgeError extends BaseAIError {
  public readonly documentId?: string;

  constructor(message: string, documentId?: string, details?: Record<string, unknown>) {
    super(message, 'KNOWLEDGE_ERROR', { ...details, documentId });
    this.documentId = documentId;
  }
}

/**
 * Error thrown during embedding generation or embedding cache access.
 */
export class EmbeddingError extends BaseAIError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'EMBEDDING_ERROR', details);
  }
}

/**
 * Error thrown when configuration parameters are invalid or missing.
 */
export class ConfigurationError extends BaseAIError {
  public readonly configKey?: string;

  constructor(message: string, configKey?: string, details?: Record<string, unknown>) {
    super(message, 'CONFIGURATION_ERROR', { ...details, configKey });
    this.configKey = configKey;
  }
}
