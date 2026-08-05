import React, { useState, useEffect } from 'react';
import { Bot, X, Sparkles } from 'lucide-react';
import { ChatWindow } from './ChatWindow';

/**
 * Global floating AI Assistant widget with Apple/Linear microinteractions and backdrop overlay.
 */
export const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  // Close popup window on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end pointer-events-none">
      {/* Expanded Chat Popup Window */}
      {isOpen && (
        <div className="pointer-events-auto mb-3 animate-in fade-in slide-in-from-bottom-4 duration-300 w-[calc(100vw-2.5rem)] sm:w-[420px] shadow-2xl">
          <ChatWindow
            onClose={() => setIsOpen(false)}
            onMinimize={() => setIsOpen(false)}
          />
        </div>
      )}

      {/* Floating Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="pointer-events-auto group relative flex h-14 w-14 items-center justify-center rounded-full bg-toxic text-obsidian shadow-[0_0_30px_rgba(197,248,42,0.35)] transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-toxic focus-visible:ring-offset-2 focus-visible:ring-offset-[#070708]"
        aria-label={isOpen ? 'Close AI Assistant' : 'Open AI Assistant'}
        aria-expanded={isOpen}
        title="Chat with Gaurav's AI Assistant"
      >
        <div className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-cyber text-[9px] font-bold text-obsidian animate-pulse">
          <Sparkles className="h-2.5 w-2.5" />
        </div>

        {isOpen ? (
          <X className="h-6 w-6 font-bold" />
        ) : (
          <Bot className="h-6 w-6 font-bold transition-transform group-hover:rotate-12" />
        )}
      </button>
    </div>
  );
};
