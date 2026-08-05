import React from 'react';
import { Sparkles, Cpu, Shield, Terminal, X } from 'lucide-react';
import { CHAT_TOKENS } from './designTokens';

interface ChatHeaderProps {
  onClose?: () => void;
  onMinimize?: () => void;
  mode?: 'recruiter' | 'engineering';
  onToggleMode?: () => void;
}

/**
 * Premium Chat Header component with Recruiter vs Engineering Mode toggle.
 */
export const ChatHeader: React.FC<ChatHeaderProps> = ({
  onClose,
  mode = 'recruiter',
  onToggleMode,
}) => {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-[#1a1a22] bg-[#0e0e11]/90 backdrop-blur-xl select-none">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-8 h-8 rounded-lg bg-toxic/15 border border-toxic/30 flex items-center justify-center text-toxic font-bold text-sm">
            G
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-[#070708]" />
        </div>

        <div>
          <h3 className="text-sm font-display font-bold text-slate-100 flex items-center gap-1.5 leading-none">
            <span>Gaurav AI</span>
            <Sparkles className="w-3.5 h-3.5 text-toxic" />
          </h3>
          <p className="text-[10px] font-mono text-zinc-400 mt-1 flex items-center gap-1">
            <Cpu className="w-3 h-3 text-cyber" />
            <span>Gemini 2.0 RAG Pipeline</span>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {onToggleMode && (
          <button
            type="button"
            onClick={onToggleMode}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#070708] border border-[#1a1a22] hover:border-toxic/30 text-xs font-mono text-zinc-300 transition-colors"
          >
            {mode === 'recruiter' ? (
              <>
                <Shield className="w-3.5 h-3.5 text-toxic" />
                <span className="hidden sm:inline">Recruiter</span>
              </>
            ) : (
              <>
                <Terminal className="w-3.5 h-3.5 text-cyber" />
                <span className="hidden sm:inline">Engineering</span>
              </>
            )}
          </button>
        )}

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
