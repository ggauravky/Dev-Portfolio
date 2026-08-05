import React from 'react';
import { useChat } from '../../hooks/useChat';
import { ChatHeader } from './ChatHeader';
import { ChatMessages } from './ChatMessages';
import { ChatInput } from './ChatInput';

interface ChatWindowProps {
  onClose?: () => void;
  onMinimize?: () => void;
  className?: string;
  isFullScreen?: boolean;
}

/**
 * Full Chat Window container managing state, messaging, and responsive layout.
 */
export const ChatWindow: React.FC<ChatWindowProps> = ({
  onClose,
  onMinimize,
  className = '',
  isFullScreen = false,
}) => {
  const {
    messages,
    isLoading,
    error,
    cooldownSeconds,
    activeProvider,
    activeModel,
    sendMessage,
    clearConversation,
    selectSuggestion,
    retryFailedMessage,
  } = useChat();

  return (
    <div
      className={`flex flex-col bg-[#070708]/95 text-slate-100 overflow-hidden border border-neutral-800/80 shadow-2xl backdrop-blur-xl ${
        isFullScreen
          ? 'h-[100dvh] w-full rounded-none'
          : 'h-[85vh] sm:h-[580px] max-h-[calc(100vh-100px)] w-full rounded-t-2xl sm:rounded-2xl'
      } ${className}`}
    >
      {/* Header */}
      <ChatHeader
        provider={activeProvider}
        model={activeModel}
        onClear={messages.length > 0 ? clearConversation : undefined}
        onClose={onClose}
        onMinimize={onMinimize}
      />

      {/* Messages Stream */}
      <ChatMessages
        messages={messages}
        isLoading={isLoading}
        error={error}
        onSelectSuggestion={selectSuggestion}
        onRetry={retryFailedMessage}
      />

      {/* Footer Input Area */}
      <div className="p-3 border-t border-neutral-800/80 bg-[#0e0e11]/95 backdrop-blur-xl shrink-0">
        <ChatInput
          onSend={sendMessage}
          isLoading={isLoading}
          cooldownSeconds={cooldownSeconds}
        />
      </div>
    </div>
  );
};
