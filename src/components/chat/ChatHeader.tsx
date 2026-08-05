import React from 'react';
import { Sparkles, Shield, Terminal, X, Minus } from 'lucide-react';

interface ChatHeaderProps {
  onClose?: () => void;
  onMinimize?: () => void;
  onClear?: () => void;
  provider?: string;
  model?: string;
  mode?: 'recruiter' | 'engineering';
  onToggleMode?: () => void;
}

/**
 * Premium Chat Header component with single baseline alignment.
 */
export const ChatHeader: React.FC<ChatHeaderProps> = ({
  onClose,
  onMinimize,
  mode = 'recruiter',
  onToggleMode,
}) => {
  return (
    <div className="flex items-center justify-between px-4 py-3.5 border-b border-neutral-800/80 bg-[#0e0e11]/95 backdrop-blur-xl select-none shrink-0">
      <div className="flex items-center gap-3">
        <div className="relative flex items-center justify-center">
          <div className="w-8 h-8 rounded-lg bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-xs shadow-inner">
            G
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#070708]" />
        </div>

        <div className="flex flex-col justify-center">
          <h3 className="text-sm font-display font-semibold text-slate-100 flex items-center gap-1.5 leading-tight">
            <span>Gaurav AI</span>
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          </h3>
          <p className="text-[11px] font-sans text-neutral-400 flex items-center gap-1.5 leading-tight mt-0.5">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Ready to help</span>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {onToggleMode && (
          <button
            type="button"
            onClick={onToggleMode}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#070708] border border-neutral-800 hover:border-emerald-500/30 text-xs font-mono text-neutral-300 transition-colors"
          >
            {mode === 'recruiter' ? (
              <>
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Recruiter</span>
              </>
            ) : (
              <>
                <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden sm:inline">Engineering</span>
              </>
            )}
          </button>
        )}

        {onMinimize && (
          <button
            type="button"
            onClick={onMinimize}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800/80 transition-colors"
            aria-label="Minimize chat"
          >
            <Minus className="w-4 h-4" />
          </button>
        )}

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800/80 transition-colors"
            aria-label="Close chat"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
