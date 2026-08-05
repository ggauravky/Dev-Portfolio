import React from 'react';

/**
 * Animated three-dot "AI is thinking" loading indicator.
 */
export const ChatTyping: React.FC = () => {
  return (
    <div className="flex items-end gap-2.5 my-2">
      {/* Avatar G */}
      <div className="flex-shrink-0 w-8 h-8 rounded-md bg-toxic/15 border border-toxic/30 flex items-center justify-center text-toxic font-mono font-bold text-xs shadow-sm select-none">
        G
      </div>

      {/* Typing Bubble */}
      <div className="px-4 py-3 bg-[#0e0e11] border border-[#1a1a22] rounded-lg rounded-bl-sm shadow-sm">
        <div className="flex items-center gap-1.5">
          <span
            className="w-1.5 h-1.5 rounded-full bg-toxic"
            style={{ animation: 'typingBounce 1.2s ease-in-out infinite', animationDelay: '0ms' }}
          />
          <span
            className="w-1.5 h-1.5 rounded-full bg-toxic"
            style={{ animation: 'typingBounce 1.2s ease-in-out infinite', animationDelay: '180ms' }}
          />
          <span
            className="w-1.5 h-1.5 rounded-full bg-toxic"
            style={{ animation: 'typingBounce 1.2s ease-in-out infinite', animationDelay: '360ms' }}
          />
        </div>
      </div>

      <style>{`
        @keyframes typingBounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.35; }
          30% { transform: translateY(-5px); opacity: 1; }
        }
      `}</style>
    </div>
  );
};
