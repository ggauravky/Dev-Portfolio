import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ChatErrorProps {
  error: string;
  onRetry?: () => void;
}

/**
 * User-friendly error notification banner with retry functionality.
 */
export const ChatError: React.FC<ChatErrorProps> = ({ error, onRetry }) => {
  if (!error) return null;

  return (
    <div className="mx-auto w-full max-w-2xl my-3 p-3.5 rounded-lg bg-amber-950/40 border border-amber-500/30 text-amber-200 text-xs font-mono flex items-center justify-between gap-3 shadow-md">
      <div className="flex items-center gap-2.5 min-w-0">
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
        <span className="truncate">{error}</span>
      </div>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition-colors shrink-0 font-bold uppercase tracking-wider text-[10px]"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Retry</span>
        </button>
      )}
    </div>
  );
};
