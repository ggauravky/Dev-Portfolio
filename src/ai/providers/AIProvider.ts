import { AssistantResponse } from '../types';
import { AIConfigOptions, getAIConfig } from '../config/aiConfig';
import { AIProviderError } from '../errors';

/**
 * Interface contract that all AI model providers (Gemini, OpenAI, Claude, Mock) must implement.
 */
export interface IAIProvider {
  /**
   * Provider identifier name (e.g., 'gemini', 'groq', 'mock').
   */
  readonly name: string;

  /**
   * Check if provider API / key is configured and available.
   */
  isAvailable(): Promise<boolean>;

  /**
   * Generate an assistant response for the given prompt string.
   */
  generateResponse(prompt: string, options?: Partial<AIConfigOptions>): Promise<AssistantResponse>;
}

/**
 * Base Abstract AI Provider class handling common validation and config defaults.
 */
export abstract class BaseAIProvider implements IAIProvider {
  public abstract readonly name: string;

  public abstract isAvailable(): Promise<boolean>;

  public abstract generateResponse(
    prompt: string,
    options?: Partial<AIConfigOptions>
  ): Promise<AssistantResponse>;

  protected getMergedOptions(overrideOptions?: Partial<AIConfigOptions>): AIConfigOptions {
    const baseConfig = getAIConfig();
    return { ...baseConfig, ...overrideOptions };
  }
}

/**
 * Placeholder AI Provider implementation for Phase 2 architecture testing.
 * Returns structured responses without calling external LLM APIs or SDKs.
 */
export class MockAIProvider extends BaseAIProvider {
  public readonly name = 'mock';

  public async isAvailable(): Promise<boolean> {
    return true;
  }

  public async generateResponse(
    prompt: string,
    options?: Partial<AIConfigOptions>
  ): Promise<AssistantResponse> {
    const startTime = Date.now();
    const config = this.getMergedOptions(options);

    if (!prompt || prompt.trim().length === 0) {
      throw new AIProviderError('Prompt cannot be empty', this.name);
    }

    const latencyMs = Date.now() - startTime;

    return {
      success: true,
      reply: `[Mock AI Provider Response] Processed query successfully (Config model: ${config.model})`,
      sources: [],
      followUpSuggestions: [
        'What technologies do you work with?',
        'Tell me about your portfolio projects.',
      ],
      provider: this.name,
      model: config.model,
      degraded: false,
      latencyMs,
      usage: {
        promptTokens: Math.ceil(prompt.length / 4),
        completionTokens: 25,
        totalTokens: Math.ceil(prompt.length / 4) + 25,
      },
    };
  }
}
