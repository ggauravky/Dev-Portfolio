import React from 'react';
import { Sparkles } from 'lucide-react';

interface ChatSuggestionsProps {
  suggestions?: string[];
  onSelectSuggestion: (suggestion: string) => void;
  disabled?: boolean;
}

/**
 * Interactive follow-up question suggestion pills with Apple/Linear hover transitions.
 */
export const ChatSuggestions: React.FC<ChatSuggestionsProps> = ({
  suggestions,
  onSelectSuggestion,
  disabled = false,
}) => {
  if (!suggestions || suggestions.length === 0) return null;

  return (
    <div className="mt-3 flex flex-wrap items-center gap-1.5 w-full">
      {suggestions.map((suggestion, idx) => (
        <button
          key={`${suggestion}_${idx}`}
          type="button"
          onClick={() => onSelectSuggestion(suggestion)}
          disabled={disabled}
          className="inline-flex items-center gap-1.5 text-xs font-mono rounded-lg border border-[#1a1a22] bg-[#070708] px-3 py-1.5 text-zinc-300 hover:border-toxic/40 hover:text-toxic hover:bg-toxic/5 transition-all duration-200 active:scale-98 text-left disabled:opacity-50 disabled:cursor-not-allowed group focus:outline-none focus-visible:ring-2 focus-visible:ring-toxic/50"
        >
          <Sparkles className="w-3 h-3 text-toxic/70 group-hover:text-toxic shrink-0 transition-transform group-hover:scale-110" />
          <span>{suggestion}</span>
        </button>
      ))}
    </div>
  );
};
