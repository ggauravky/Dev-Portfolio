import { useState, useCallback } from 'react';
import { ChatMessage } from '../ai/types';

const SESSION_KEY_PREFIX = 'gaurav_ai_session_id';
const MESSAGES_KEY_PREFIX = 'gaurav_ai_chat_messages_';

/**
 * Hook for managing session persistence using sessionStorage.
 * sessionStorage maintains chat context across page refreshes,
 * but clears automatically when the browser tab is closed.
 */
export function useChatSession() {
  const [sessionId, setSessionId] = useState<string>(() => {
    if (typeof window === 'undefined') return `gaurav-session-${Date.now()}`;
    try {
      const existing = sessionStorage.getItem(SESSION_KEY_PREFIX);
      if (existing) return existing;
      const generated = `gaurav-session-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      sessionStorage.setItem(SESSION_KEY_PREFIX, generated);
      return generated;
    } catch {
      return `gaurav-session-${Date.now()}`;
    }
  });

  /**
   * Load stored messages for active session from sessionStorage.
   */
  const loadStoredMessages = useCallback((): ChatMessage[] => {
    if (typeof window === 'undefined' || !sessionId) return [];
    try {
      const raw = sessionStorage.getItem(`${MESSAGES_KEY_PREFIX}${sessionId}`);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.map((m) => ({
          ...m,
          timestamp: m.timestamp ? new Date(m.timestamp) : new Date(),
        }));
      }
      return [];
    } catch {
      return [];
    }
  }, [sessionId]);

  /**
   * Save messages array to sessionStorage.
   */
  const saveMessages = useCallback(
    (messages: ChatMessage[]) => {
      if (typeof window === 'undefined' || !sessionId) return;
      try {
        sessionStorage.setItem(
          `${MESSAGES_KEY_PREFIX}${sessionId}`,
          JSON.stringify(messages)
        );
      } catch {
        // Handle storage quota exceeded gracefully
      }
    },
    [sessionId]
  );

  /**
   * Reset active session and clear sessionStorage.
   */
  const clearSession = useCallback(() => {
    if (typeof window === 'undefined') return;
    try {
      sessionStorage.removeItem(`${MESSAGES_KEY_PREFIX}${sessionId}`);
      const newSessionId = `gaurav-session-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      sessionStorage.setItem(SESSION_KEY_PREFIX, newSessionId);
      setSessionId(newSessionId);
    } catch {
      // Ignore storage errors
    }
  }, [sessionId]);

  return {
    sessionId,
    loadStoredMessages,
    saveMessages,
    clearSession,
  };
}
