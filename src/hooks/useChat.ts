import { useState, useEffect, useCallback } from 'react';
import { ChatMessage } from '../ai/types';
import { useChatSession } from './useChatSession';
import { AIClient } from '../services/aiClient';
import { ActionRegistry, ActionExecutor } from '../ai/agent';

export interface UseChatReturn {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  sessionId: string;
  cooldownSeconds: number;
  activeProvider: string;
  activeModel: string;
  sendMessage: (content: string) => Promise<void>;
  regenerateLastMessage: () => Promise<void>;
  retryFailedMessage: () => Promise<void>;
  clearConversation: () => void;
  selectSuggestion: (suggestion: string) => Promise<void>;
}

const buildMessageId = () => `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

/**
 * Master hook for AI Chat state management, API synchronization, agent action execution, and session persistence.
 */
export function useChat(): UseChatReturn {
  const { sessionId, loadStoredMessages, saveMessages, clearSession } = useChatSession();

  const [messages, setMessages] = useState<ChatMessage[]>(() => loadStoredMessages());
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldownSeconds, setCooldownSeconds] = useState<number>(0);
  const [activeProvider, setActiveProvider] = useState<string>('gemini');
  const [activeModel, setActiveModel] = useState<string>('gemini-2.0-flash-lite');

  // Sync to local storage on message change
  useEffect(() => {
    saveMessages(messages);
  }, [messages, saveMessages]);

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldownSeconds <= 0) return;
    const timer = setTimeout(() => {
      setCooldownSeconds((prev) => prev - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [cooldownSeconds]);

  /**
   * Dispatch query message to backend API and evaluate agent actions.
   */
  const sendMessage = useCallback(
    async (content: string) => {
      const trimmed = content.trim();
      if (!trimmed || isLoading || cooldownSeconds > 0) return;

      setError(null);

      const userMessage: ChatMessage = {
        id: buildMessageId(),
        role: 'user',
        content: trimmed,
        timestamp: new Date(),
      };

      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);
      setIsLoading(true);

      // Check for direct client agent action trigger (e.g. "download resume", "copy email")
      const resolvedAction = ActionRegistry.resolveActionFromQuery(trimmed);
      if (resolvedAction) {
        try {
          await ActionExecutor.execute(resolvedAction.actionId, resolvedAction.params || {});
        } catch {
          // Ignore action execution errors gracefully
        }
      }

      // Prepare API history payload (last 10 turns)
      const history = updatedMessages
        .slice(-10)
        .map((m) => ({ role: m.role, content: m.content }));

      try {
        const response = await AIClient.sendMessage({
          message: trimmed,
          sessionId,
          history,
        });

        if (response.provider) setActiveProvider(response.provider);
        if (response.model) setActiveModel(response.model);

        const aiMessage: ChatMessage = {
          id: buildMessageId(),
          role: 'assistant',
          content: response.reply,
          timestamp: new Date(),
          sources: response.sources,
          followUpSuggestions: response.followUpSuggestions,
          latencyMs: response.latencyMs,
          model: response.model,
          provider: response.provider,
          degraded: response.degraded,
          tokens: response.usage?.totalTokens,
        };

        setMessages((prev) => [...prev, aiMessage]);
        setCooldownSeconds(1);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to generate response.';
        setError(errorMessage);

        const errorMsgObject: ChatMessage = {
          id: buildMessageId(),
          role: 'assistant',
          content: `⚠️ Error: ${errorMessage}`,
          timestamp: new Date(),
          degraded: true,
        };

        setMessages((prev) => [...prev, errorMsgObject]);
      } finally {
        setIsLoading(false);
      }
    },
    [messages, isLoading, cooldownSeconds, sessionId]
  );

  /**
   * Regenerate the response for the last user prompt.
   */
  const regenerateLastMessage = useCallback(async () => {
    if (isLoading || messages.length === 0) return;

    const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user');
    if (!lastUserMsg) return;

    const trimmedHistory = messages.filter(
      (m, idx) => idx <= messages.lastIndexOf(lastUserMsg)
    );

    setMessages(trimmedHistory);
    await sendMessage(lastUserMsg.content);
  }, [messages, isLoading, sendMessage]);

  /**
   * Retry failed query.
   */
  const retryFailedMessage = useCallback(async () => {
    setError(null);
    await regenerateLastMessage();
  }, [regenerateLastMessage]);

  /**
   * Clear full conversation state and session storage.
   */
  const clearConversation = useCallback(() => {
    setMessages([]);
    setError(null);
    clearSession();
  }, [clearSession]);

  /**
   * Select a suggested follow-up prompt.
   */
  const selectSuggestion = useCallback(
    async (suggestion: string) => {
      await sendMessage(suggestion);
    },
    [sendMessage]
  );

  return {
    messages,
    isLoading,
    error,
    sessionId,
    cooldownSeconds,
    activeProvider,
    activeModel,
    sendMessage,
    regenerateLastMessage,
    retryFailedMessage,
    clearConversation,
    selectSuggestion,
  };
}
