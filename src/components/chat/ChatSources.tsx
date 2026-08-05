import React, { useState } from 'react';
import { ChatSource } from '../../ai/types';
import { BookOpen, FolderGit2, Zap, FileText, User, ExternalLink } from 'lucide-react';

interface ChatSourcesProps {
  sources?: ChatSource[];
}

/**
 * Helper returning category icon for source section.
 */
function getCategoryIcon(section?: string) {
  const sec = String(section || '').toLowerCase();
  if (sec.includes('project')) return FolderGit2;
  if (sec.includes('skill')) return Zap;
  if (sec.includes('blog')) return FileText;
  if (sec.includes('bio') || sec.includes('personal')) return User;
  return BookOpen;
}

/**
 * Clickable citation chips displaying retrieved RAG knowledge sources with hover metadata preview.
 */
export const ChatSources: React.FC<ChatSourcesProps> = ({ sources }) => {
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  if (!sources || sources.length === 0) return null;

  return (
    <div className="mt-2.5 pt-2 border-t border-[#1a1a22]/60 flex flex-wrap items-center gap-1.5 text-xs font-mono select-none">
      <div className="flex items-center gap-1 text-slate-400 font-semibold">
        <BookOpen className="w-3 h-3 text-toxic" />
        <span className="text-[10px] uppercase tracking-wider text-slate-500">Sources:</span>
      </div>

      {sources.slice(0, 4).map((src, idx) => {
        const Icon = getCategoryIcon(src.section);
        const scorePct = src.score ? Math.round(src.score * 100) : null;
        const chipId = `${src.chunkId || src.title}_${idx}`;
        const isHovered = activeTooltip === chipId;

        return (
          <div
            key={chipId}
            className="relative"
            onMouseEnter={() => setActiveTooltip(chipId)}
            onMouseLeave={() => setActiveTooltip(null)}
          >
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#070708] border border-[#1a1a22] hover:border-toxic/40 text-zinc-300 transition-all duration-200 cursor-pointer group shadow-sm">
              <Icon className="w-3 h-3 text-zinc-400 group-hover:text-toxic transition-colors" />
              <span className="font-medium text-[11px] truncate max-w-[130px] sm:max-w-[170px] group-hover:text-slate-100">
                {src.title}
              </span>

              {scorePct !== null && (
                <span className="text-[9px] px-1 py-0.2 bg-toxic/15 text-toxic rounded font-bold">
                  {scorePct}%
                </span>
              )}
            </div>

            {/* Hover Tooltip Metadata Preview */}
            {isHovered && src.snippet && (
              <div className="absolute bottom-full left-0 mb-2 w-64 p-3 rounded-lg bg-[#0e0e11] border border-[#262630] shadow-2xl text-[11px] font-sans text-slate-200 z-50 animate-in fade-in duration-150 pointer-events-none">
                <div className="flex items-center justify-between font-mono text-[10px] text-zinc-400 border-b border-[#1a1a22] pb-1 mb-1.5">
                  <span className="uppercase font-bold text-toxic">{src.section || 'Knowledge'}</span>
                  {scorePct && <span>Relevance: {scorePct}%</span>}
                </div>
                <p className="line-clamp-3 leading-relaxed text-zinc-300 font-mono text-[10px]">
                  &quot;{src.snippet}&quot;
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
