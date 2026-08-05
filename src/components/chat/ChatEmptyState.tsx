import React from 'react';
import { Sparkles, Code2, Briefcase, Cpu, FolderGit2 } from 'lucide-react';

interface ChatEmptyStateProps {
  onSelectPrompt: (prompt: string) => void;
}

const STARTER_CARDS = [
  {
    icon: FolderGit2,
    title: 'Top Projects',
    subtitle: 'TaskNexus, SmartMess, BuildMyTeam',
    prompt: 'What are Gaurav\'s top technical projects and builds?',
  },
  {
    icon: Code2,
    title: 'Tech Stack & Skills',
    subtitle: 'Python, React, Node, MongoDB, AI/ML',
    prompt: 'What technologies, frameworks, and programming languages does Gaurav use?',
  },
  {
    icon: Briefcase,
    title: 'Services & Offerings',
    subtitle: 'Full-Stack, AI Integration, Mentorship',
    prompt: 'What services does Gaurav offer and what is his availability?',
  },
  {
    icon: Cpu,
    title: 'AI & Academic Minor',
    subtitle: 'BCA @ BBDU & AI/ML Minor @ IIT Mandi',
    prompt: 'Tell me about Gaurav\'s AI/ML experience and academic background.',
  },
];

/**
 * Apple × Notion × Linear minimalist empty state screen.
 */
export const ChatEmptyState: React.FC<ChatEmptyStateProps> = ({ onSelectPrompt }) => {
  return (
    <div className="flex flex-col items-center justify-center py-10 px-4 text-center my-auto">
      {/* Avatar Badge */}
      <div className="relative group mb-5">
        <div className="absolute -inset-1 rounded-2xl bg-toxic/20 blur-md group-hover:bg-toxic/30 transition-all" />
        <div className="relative w-16 h-16 rounded-2xl bg-[#0e0e11] border border-toxic/40 flex items-center justify-center text-toxic text-2xl font-display font-bold shadow-2xl">
          G
        </div>
      </div>

      <h2 className="text-xl sm:text-2xl font-display font-bold text-slate-100 tracking-tight flex items-center gap-2">
        <span>Gaurav AI</span>
        <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-toxic/15 text-toxic border border-toxic/30 font-semibold">
          v2.0 RAG
        </span>
      </h2>

      <p className="mt-2 text-xs sm:text-sm text-zinc-400 max-w-md leading-relaxed font-sans">
        Digital twin answering questions about projects, technical skills, services, and career journey with grounded knowledge retrieval.
      </p>

      {/* Starter Cards Grid */}
      <div className="mt-7 grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl text-left">
        {STARTER_CARDS.map((card, idx) => {
          const Icon = card.icon;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectPrompt(card.prompt)}
              className="p-4 rounded-xl bg-[#0e0e11] border border-[#1a1a22] hover:border-toxic/35 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 group text-left flex items-start gap-3.5 shadow-sm"
            >
              <div className="p-2.5 rounded-lg bg-[#070708] border border-[#1a1a22] text-zinc-400 group-hover:text-toxic group-hover:border-toxic/30 transition-colors shrink-0">
                <Icon className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-display font-bold text-slate-200 group-hover:text-toxic transition-colors flex items-center justify-between">
                  <span>{card.title}</span>
                  <Sparkles className="w-3.5 h-3.5 text-toxic opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                </p>
                <p className="text-[11px] text-zinc-500 truncate mt-0.5 font-mono">
                  {card.subtitle}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
