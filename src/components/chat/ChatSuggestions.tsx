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
    <div className="mt-2.5 flex flex-wrap items-center gap-2 w-full">
      {suggestions.map((suggestion, idx) => (
        <button
          key={`${suggestion}_${idx}`}
          type="button"
          onClick={() => onSelectSuggestion(suggestion)}
          disabled={disabled}
          className="inline-flex items-center gap-1.5 text-xs font-sans rounded-lg border border-neutral-800 bg-[#070708] px-3 py-1.5 text-neutral-300 hover:border-emerald-500/40 hover:text-emerald-400 hover:bg-emerald-950/20 transition-all duration-200 active:scale-98 text-left disabled:opacity-50 disabled:cursor-not-allowed group focus:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500/50"
        >
          <Sparkles className="w-3 h-3 text-emerald-400/70 group-hover:text-emerald-400 shrink-0 transition-transform group-hover:scale-110" />
          <span>{suggestion}</span>
        </button>
      ))}
    </div>
  );
};
