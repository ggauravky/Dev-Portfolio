import { GoogleGenerativeAI } from '@google/generative-ai';
import { BaseAIProvider } from './AIProvider';
import { AssistantResponse } from '../types';
import { AIConfigOptions } from '../config/aiConfig';
import { AIProviderError } from '../errors';

/**
 * Concrete AI Provider for Google Gemini LLM models.
 * Encapsulates Gemini SDK calls, parameter formatting, error translation, and response normalization.
 */
export class GeminiProvider extends BaseAIProvider {
  public readonly name = 'gemini';

  /**
   * Check if Gemini API Key is available in configuration or environment.
   */
  public async isAvailable(): Promise<boolean> {
    const config = this.getMergedOptions();
    return Boolean(config.apiKey && config.apiKey.trim().length > 0);
  }

  /**
   * Generate completion response from Gemini API.
   */
  public async generateResponse(
    prompt: string,
    options?: Partial<AIConfigOptions>
  ): Promise<AssistantResponse> {
    const startTime = Date.now();
    const config = this.getMergedOptions(options);

    if (!prompt || prompt.trim().length === 0) {
      throw new AIProviderError('Prompt text cannot be empty', this.name);
    }

    if (!config.apiKey || config.apiKey.trim().length === 0) {
      // Degraded fallback when API key is unconfigured
      const latencyMs = Date.now() - startTime;
      return {
        success: true,
        reply: "I am Gaurav's portfolio AI assistant. Currently my Gemini API key is offline, but feel free to explore Gaurav's projects, skills, and journey!",
        sources: [],
        followUpSuggestions: [
          'What projects has Gaurav built?',
          'What technologies does Gaurav use?',
        ],
        provider: this.name,
        model: config.model,
        degraded: true,
        latencyMs,
      };
    }

    try {
      const genAI = new GoogleGenerativeAI(config.apiKey);
      const model = genAI.getGenerativeModel({
        model: config.model || 'gemini-2.0-flash-lite',
        generationConfig: {
          temperature: config.temperature,
          topP: config.topP,
          maxOutputTokens: config.maxTokens,
        },
      });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      const latencyMs = Date.now() - startTime;

      if (!text || text.trim().length === 0) {
        throw new AIProviderError('Received empty response text from Gemini API', this.name);
      }

      return {
        success: true,
        reply: text.trim(),
        sources: [],
        followUpSuggestions: this.generateFollowUpSuggestions(prompt),
        provider: this.name,
        model: config.model || 'gemini-2.0-flash-lite',
        degraded: false,
        latencyMs,
        usage: {
          promptTokens: Math.ceil(prompt.length / 4),
          completionTokens: Math.ceil(text.length / 4),
          totalTokens: Math.ceil((prompt.length + text.length) / 4),
        },
      };
    } catch (err: unknown) {
      const latencyMs = Date.now() - startTime;
      const errorMessage = err instanceof Error ? err.message : String(err);

      // Check for rate limits or quota exceeded errors
      if (errorMessage.includes('429') || errorMessage.toLowerCase().includes('quota')) {
        return {
          success: true,
          reply: 'I am receiving a high volume of requests right now and hit my rate limit. Please try again in a moment or reach out to Gaurav directly!',
          sources: [],
          followUpSuggestions: ['How can I contact Gaurav?'],
          provider: `${this.name}-rate-limited`,
          model: config.model,
          degraded: true,
          latencyMs,
        };
      }

      throw new AIProviderError(
        `Gemini API generation failed: ${errorMessage}`,
        this.name,
        { originalError: errorMessage, latencyMs }
      );
    }
  }

  /**
   * Placeholder for streaming response architecture (Phase 4 expansion).
   */
  public async *generateStream(
    prompt: string,
    options?: Partial<AIConfigOptions>
  ): AsyncGenerator<string, void, unknown> {
    const config = this.getMergedOptions(options);
    if (!config.apiKey) {
      yield "I am Gaurav's portfolio AI assistant (API key offline).";
      return;
    }

    const genAI = new GoogleGenerativeAI(config.apiKey);
    const model = genAI.getGenerativeModel({ model: config.model });
    const result = await model.generateContentStream(prompt);

    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      if (chunkText) {
        yield chunkText;
      }
    }
  }

  /**
   * Generate contextual follow-up question suggestions based on prompt text.
   */
  private generateFollowUpSuggestions(prompt: string): string[] {
    const lower = prompt.toLowerCase();

    if (lower.includes('project') || lower.includes('build') || lower.includes('work')) {
      return [
        'What is BuildMyTeam?',
        'Tell me about SmartMess',
        'What are Gaurav\'s top technical projects?',
      ];
    }

    if (lower.includes('skill') || lower.includes('tech') || lower.includes('stack')) {
      return [
        'What is Gaurav\'s education background?',
        'What backend technologies does Gaurav use?',
        'Tell me about Gaurav\'s AI/ML experience.',
      ];
    }

    return [
      'What projects has Gaurav built?',
      'What services does Gaurav offer?',
      'How can I contact Gaurav?',
    ];
  }
}
