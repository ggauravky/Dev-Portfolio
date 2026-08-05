import { ConfigurationError } from '../errors';

/**
 * AI System Configuration Options.
 * Centralized settings controlling model parameters, retrieval thresholds, caching, and memory.
 */
export interface AIConfigOptions {
  readonly apiKey: string;
  readonly temperature: number;
  readonly topP: number;
  readonly maxTokens: number;
  readonly provider: string;
  readonly model: string;
  readonly retrievalLimit: number;
  readonly similarityThreshold: number;
  readonly cacheTTL: number; // in milliseconds
  readonly debug: boolean;
  readonly streaming: boolean;
  readonly maxMemoryTurns: number;
  readonly maxContextTokens: number;
}

/**
 * Helper to safely extract environment variable across Node.js and Vite runtimes.
 */
const getEnvString = (key: string, fallback = ''): string => {
  if (typeof process !== 'undefined' && process?.env?.[key]) {
    return String(process.env[key]).trim();
  }
  try {
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta?.env?.[`VITE_${key}`]) {
      // @ts-ignore
      return String(import.meta.env[`VITE_${key}`]).trim();
    }
  } catch {
    // Skip if import.meta is unavailable
  }
  return fallback;
};

const getEnvNumber = (key: string, fallback: number): number => {
  const val = getEnvString(key);
  if (!val) return fallback;
  const parsed = Number(val);
  return Number.isFinite(parsed) ? parsed : fallback;
};

/**
 * Immutable Default AI Configuration Constants populated from Environment Variables.
 */
export const DEFAULT_AI_CONFIG: Readonly<AIConfigOptions> = Object.freeze({
  apiKey: getEnvString('GEMINI_API_KEY'),
  temperature: getEnvNumber('TEMPERATURE', 0.7),
  topP: getEnvNumber('TOP_P', 0.95),
  maxTokens: getEnvNumber('MAX_TOKENS', 1000),
  provider: getEnvString('AI_PROVIDER', 'gemini'),
  model: getEnvString('GEMINI_MODEL', 'gemini-2.0-flash-lite'),
  retrievalLimit: getEnvNumber('RETRIEVAL_LIMIT', 5),
  similarityThreshold: 0.3,
  cacheTTL: 3600000, // 1 hour
  debug: getEnvString('NODE_ENV') === 'development',
  streaming: false,
  maxMemoryTurns: 10,
  maxContextTokens: 4096,
});

/**
 * Configuration Manager handling global AI system configuration.
 * Encapsulates validation and thread-safe updates via immutability.
 */
export class AIConfigManager {
  private static instance: AIConfigManager;
  private currentConfig: AIConfigOptions;

  private constructor(initialConfig: Partial<AIConfigOptions> = {}) {
    this.currentConfig = this.validateAndMerge(initialConfig);
  }

  /**
   * Get singleton instance of Configuration Manager.
   */
  public static getInstance(initialConfig?: Partial<AIConfigOptions>): AIConfigManager {
    if (!AIConfigManager.instance) {
      AIConfigManager.instance = new AIConfigManager(initialConfig);
    }
    return AIConfigManager.instance;
  }

  /**
   * Get current active configuration object (frozen copy).
   */
  public getConfig(): Readonly<AIConfigOptions> {
    return Object.freeze({ ...this.currentConfig });
  }

  /**
   * Update configuration with partial overrides.
   */
  public updateConfig(overrides: Partial<AIConfigOptions>): Readonly<AIConfigOptions> {
    this.currentConfig = this.validateAndMerge(overrides, this.currentConfig);
    return this.getConfig();
  }

  /**
   * Reset configuration to default values.
   */
  public resetToDefaults(): Readonly<AIConfigOptions> {
    this.currentConfig = { ...DEFAULT_AI_CONFIG };
    return this.getConfig();
  }

  /**
   * Validate parameters and merge with defaults/base configuration.
   */
  private validateAndMerge(
    overrides: Partial<AIConfigOptions>,
    base: AIConfigOptions = DEFAULT_AI_CONFIG
  ): AIConfigOptions {
    const merged: AIConfigOptions = { ...base, ...overrides };

    if (merged.temperature < 0 || merged.temperature > 2.0) {
      throw new ConfigurationError('Temperature must be between 0.0 and 2.0', 'temperature', {
        value: merged.temperature,
      });
    }

    if (merged.topP < 0 || merged.topP > 1.0) {
      throw new ConfigurationError('topP must be between 0.0 and 1.0', 'topP', {
        value: merged.topP,
      });
    }

    if (merged.maxTokens <= 0) {
      throw new ConfigurationError('maxTokens must be greater than 0', 'maxTokens', {
        value: merged.maxTokens,
      });
    }

    if (merged.retrievalLimit <= 0) {
      throw new ConfigurationError('retrievalLimit must be greater than 0', 'retrievalLimit', {
        value: merged.retrievalLimit,
      });
    }

    if (merged.similarityThreshold < 0 || merged.similarityThreshold > 1.0) {
      throw new ConfigurationError('similarityThreshold must be between 0.0 and 1.0', 'similarityThreshold', {
        value: merged.similarityThreshold,
      });
    }

    if (merged.cacheTTL < 0) {
      throw new ConfigurationError('cacheTTL cannot be negative', 'cacheTTL', {
        value: merged.cacheTTL,
      });
    }

    return merged;
  }
}

/**
 * Export default configuration manager singleton instance getter shortcut.
 */
export const getAIConfig = (): Readonly<AIConfigOptions> => AIConfigManager.getInstance().getConfig();
