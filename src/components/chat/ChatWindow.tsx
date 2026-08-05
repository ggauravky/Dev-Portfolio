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
      className={`flex flex-col bg-[#070708] text-slate-100 overflow-hidden border border-[#1a1a22] shadow-2xl ${
        isFullScreen
          ? 'h-[100dvh] w-full rounded-none'
          : 'h-[600px] max-h-[85vh] w-full max-w-lg rounded-xl'
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
      <div className="p-3 border-t border-[#1a1a22] bg-[#0e0e11]/90 backdrop-blur-xl shrink-0">
        <ChatInput
          onSend={sendMessage}
          isLoading={isLoading}
          cooldownSeconds={cooldownSeconds}
        />
      </div>
    </div>
  );
};
