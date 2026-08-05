import React from 'react';
import { Sparkles, Code2, FolderGit2, Briefcase } from 'lucide-react';

interface ChatEmptyStateProps {
  onSelectPrompt: (prompt: string) => void;
}

const STARTER_CARDS = [
  {
    icon: FolderGit2,
    title: 'Projects',
    prompt: 'What projects has Gaurav built?',
  },
  {
    icon: Code2,
    title: 'Skills & Tech Stack',
    prompt: 'What technologies does Gaurav use?',
  },
  {
    icon: Briefcase,
    title: 'Experience & Education',
    prompt: 'Tell me about Gaurav\'s experience and education.',
  },
];

/**
 * Clean, minimalist Apple × Notion empty state screen.
 */
export const ChatEmptyState: React.FC<ChatEmptyStateProps> = ({ onSelectPrompt }) => {
  return (
    <div className="flex flex-col items-center justify-center py-8 px-4 text-center my-auto">
      {/* Avatar Badge */}
      <div className="relative group mb-4">
        <div className="w-14 h-14 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-2xl font-display font-bold shadow-lg">
          G
        </div>
      </div>

      <h2 className="text-xl font-display font-semibold text-slate-100 tracking-tight">
        Hello 👋 I'm Gaurav AI.
      </h2>

      <p className="mt-2 text-xs text-neutral-400 max-w-sm leading-relaxed font-sans">
        I can help you explore Gaurav's <strong className="text-neutral-200">projects</strong>, <strong className="text-neutral-200">skills</strong>, <strong className="text-neutral-200">experience</strong>, <strong className="text-neutral-200">journey</strong>, <strong className="text-neutral-200">AI work</strong>, and <strong className="text-neutral-200">resume</strong>.
      </p>

      {/* 3 Prompts Grid */}
      <div className="mt-6 flex flex-col gap-2.5 w-full max-w-md">
        {STARTER_CARDS.map((card, idx) => {
          const Icon = card.icon;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectPrompt(card.prompt)}
              className="px-3.5 py-2.5 rounded-xl bg-neutral-900/80 border border-neutral-800 hover:border-emerald-500/30 transition-all duration-200 group text-left flex items-center justify-between shadow-sm"
            >
              <div className="flex items-center gap-3 min-w-0">
                <Icon className="w-4 h-4 text-neutral-400 group-hover:text-emerald-400 transition-colors shrink-0" />
                <span className="text-xs font-sans font-medium text-neutral-200 group-hover:text-emerald-400 transition-colors truncate">
                  {card.prompt}
                </span>
              </div>
              <Sparkles className="w-3.5 h-3.5 text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2" />
            </button>
          );
        })}
      </div>
    </div>
  );
};
