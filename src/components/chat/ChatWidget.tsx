import React, { useState, useEffect } from 'react';
import { Bot, X, Wrench } from 'lucide-react';
import { ChatWindow } from './ChatWindow';

/**
 * Global floating AI Assistant widget positioned bottom-left with Apple/Linear microinteractions.
 * Displays Under Construction modal overlay when opened.
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
    <div className="fixed bottom-4 left-4 sm:bottom-5 sm:left-5 md:bottom-6 md:left-6 z-50 flex flex-col items-start pointer-events-none">
      {/* Expanded Chat Popup Window */}
      {isOpen && (
        <div className="pointer-events-auto mb-3 animate-in fade-in slide-in-from-bottom-4 duration-200 w-[calc(100vw-2rem)] sm:w-[420px] shadow-2xl">
          <ChatWindow
            isUnderConstruction
            onClose={() => setIsOpen(false)}
            onMinimize={() => setIsOpen(false)}
          />
        </div>
      )}

      {/* Floating Trigger Button (Bottom-Left) */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="pointer-events-auto group relative flex h-13 w-13 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-obsidian-card/90 border border-amber-500/40 backdrop-blur-md text-amber-400 shadow-xl transition-all duration-200 hover:scale-[1.03] hover:border-amber-400 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#070708]"
        aria-label={isOpen ? 'Close Gaurav AI' : 'Gaurav AI — Under Construction'}
        aria-expanded={isOpen}
        title="Gaurav AI — Under Construction"
      >
        <div className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-amber-400 ring-2 ring-obsidian">
          <Wrench className="h-2 w-2 text-obsidian font-bold" />
        </div>

        {isOpen ? (
          <X className="h-5 w-5 sm:h-6 sm:w-6 text-neutral-200" />
        ) : (
          <Bot className="h-5 w-5 sm:h-6 sm:w-6 text-amber-400 transition-transform group-hover:rotate-6" />
        )}
      </button>
    </div>
  );
};
