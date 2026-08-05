import { AssistantResponse } from '../ai/types';

export interface ChatApiRequest {
  message: string;
  sessionId: string;
  history?: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

/**
 * Service client communicating with the backend POST /api/ai/chat endpoint.
 */
export class AIClient {
  private static getEndpointUrl(): string {
    const apiBase = (
      import.meta.env.VITE_CHATBOT_API_URL ||
      import.meta.env.VITE_API_URL ||
      ''
    ).replace(/\/$/, '');

    return apiBase ? `${apiBase}/api/ai/chat` : '/api/ai/chat';
  }

  /**
   * Send a user message to the backend AI chat endpoint.
   */
  public static async sendMessage(request: ChatApiRequest): Promise<AssistantResponse> {
    const endpoint = AIClient.getEndpointUrl();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-Id': request.sessionId,
        },
        body: JSON.stringify(request),
        signal: controller.signal,
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || data.success === false) {
        const errorMsg =
          data?.error?.message ||
          data?.reply ||
          `Server returned HTTP ${response.status}`;
        const errorCode = data?.error?.code || 'API_ERROR';
        
        const err = new Error(errorMsg);
        (err as unknown as Record<string, unknown>).code = errorCode;
        throw err;
      }

      return {
        success: true,
        reply: String(data.reply || '').trim(),
        sources: Array.isArray(data.sources) ? data.sources : [],
        followUpSuggestions: Array.isArray(data.followUpSuggestions) ? data.followUpSuggestions : [],
        provider: data.provider || 'gemini',
        model: data.model || 'gemini-2.0-flash-lite',
        degraded: Boolean(data.degraded),
        latencyMs: typeof data.latencyMs === 'number' ? data.latencyMs : null,
        usage: data.usage || undefined,
      };
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        throw new Error('The request timed out. Please check your connection and try again.');
      }
      throw err;
    } finally {
      clearTimeout(timeoutId);
    }
  }
}
