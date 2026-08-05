import React from 'react';
import { ChatMessage as ChatMessageType } from '../../ai/types';
import { ChatMessage } from './ChatMessage';
import { ChatTyping } from './ChatTyping';
import { ChatEmptyState } from './ChatEmptyState';
import { ChatError } from './ChatError';
import { useAutoScroll } from '../../hooks/useAutoScroll';

interface ChatMessagesProps {
  messages: ChatMessageType[];
  isLoading: boolean;
  error?: string | null;
  onSelectSuggestion: (suggestion: string) => void;
  onRetry?: () => void;
}

/**
 * Scrollable chat message stream container.
 */
export const ChatMessages: React.FC<ChatMessagesProps> = ({
  messages,
  isLoading,
  error,
  onSelectSuggestion,
  onRetry,
}) => {
  const { containerRef, handleScroll } = useAutoScroll<HTMLDivElement>([
    messages,
    isLoading,
  ]);

  if (messages.length === 0 && !isLoading) {
    return <ChatEmptyState onSelectPrompt={onSelectSuggestion} />;
  }

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto px-4 py-4 space-y-3 custom-scrollbar"
    >
      {messages.map((message) => (
        <ChatMessage
          key={message.id}
          message={message}
          onSelectSuggestion={onSelectSuggestion}
          onRetry={onRetry}
        />
      ))}

      {isLoading && <ChatTyping />}

      {error && <ChatError error={error} onRetry={onRetry} />}
    </div>
  );
};
