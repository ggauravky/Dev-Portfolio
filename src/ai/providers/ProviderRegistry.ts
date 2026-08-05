import { IAIProvider, MockAIProvider } from './AIProvider';
import { GeminiProvider } from './GeminiProvider';
import { AIProviderError } from '../errors';
import { getAIConfig } from '../config/aiConfig';

/**
 * Registry managing available AI providers via Dependency Injection.
 * Decouples model calls from specific LLM vendors.
 */
export class ProviderRegistry {
  private static instance: ProviderRegistry;
  private providers: Map<string, IAIProvider> = new Map();
  private defaultProviderName: string = 'gemini';

  private constructor() {
    // Register available providers
    this.registerProvider(new MockAIProvider());
    this.registerProvider(new GeminiProvider());

    const activeProvider = getAIConfig().provider || 'gemini';
    if (this.hasProvider(activeProvider)) {
      this.defaultProviderName = activeProvider.toLowerCase();
    }
  }

  /**
   * Get singleton instance of ProviderRegistry.
   */
  public static getInstance(): ProviderRegistry {
    if (!ProviderRegistry.instance) {
      ProviderRegistry.instance = new ProviderRegistry();
    }
    return ProviderRegistry.instance;
  }

  /**
   * Register a new AI Provider implementation.
   */
  public registerProvider(provider: IAIProvider): void {
    if (!provider || !provider.name) {
      throw new AIProviderError('Cannot register invalid provider without a name');
    }
    this.providers.set(provider.name.toLowerCase(), provider);
  }

  /**
   * Unregister an AI Provider by name.
   */
  public unregisterProvider(name: string): boolean {
    return this.providers.delete(name.toLowerCase());
  }

  /**
   * Get a registered provider by name.
   */
  public getProvider(name?: string): IAIProvider {
    const targetName = (name || this.defaultProviderName).toLowerCase();
    const provider = this.providers.get(targetName);

    if (!provider) {
      // Fallback to mock if requested provider is missing
      const fallback = this.providers.get('mock');
      if (fallback) return fallback;
      throw new AIProviderError(`AI Provider '${targetName}' is not registered in ProviderRegistry`, targetName);
    }

    return provider;
  }

  /**
   * Check if a provider is registered.
   */
  public hasProvider(name: string): boolean {
    return this.providers.has(name.toLowerCase());
  }

  /**
   * Set the default active provider name.
   */
  public setDefaultProvider(name: string): void {
    const targetName = name.toLowerCase();
    if (!this.hasProvider(targetName)) {
      throw new AIProviderError(`Cannot set default provider to unregistered '${targetName}'`, targetName);
    }
    this.defaultProviderName = targetName;
  }

  /**
   * Get default registered active provider.
   */
  public getDefaultProvider(): IAIProvider {
    return this.getProvider(this.defaultProviderName);
  }

  /**
   * List all registered provider names.
   */
  public listProviders(): string[] {
    return Array.from(this.providers.keys());
  }
}

export const getProviderRegistry = (): ProviderRegistry => ProviderRegistry.getInstance();
