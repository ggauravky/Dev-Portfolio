import React, { useState } from 'react';
import { Database, Search, X, Layers, Code } from 'lucide-react';

interface KnowledgeInspectorProps {
  isOpen: boolean;
  onClose: () => void;
}

const SAMPLE_CHUNKS = [
  {
    chunkId: 'chunk_bio_gaurav_0',
    documentId: 'doc_bio_gaurav',
    section: 'bio',
    title: 'Gaurav Kumar Yadav — Profile & Bio',
    similarity: 0.94,
    content: 'Gaurav Kumar Yadav is a BCA Student (2023–2026) at BBDU Lucknow and AI/ML Minor Scholar at IIT Mandi.',
  },
  {
    chunkId: 'chunk_project_tasknexus_0',
    documentId: 'doc_project_tasknexus',
    section: 'projects',
    title: 'Project: TaskNexus — Microservices Platform',
    similarity: 0.88,
    content: 'TaskNexus is a microservices task management system featuring AI automation, role workflows, and Docker deployment.',
  },
];

/**
 * Developer Knowledge Inspector Modal.
 */
export const KnowledgeInspector: React.FC<KnowledgeInspectorProps> = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const filtered = SAMPLE_CHUNKS.filter(
    (c) =>
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-[#0e0e11] border border-[#1a1a22] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#1a1a22] bg-[#070708]">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-toxic" />
            <h3 className="text-sm font-display font-bold text-slate-100">
              Developer Knowledge Inspector
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <div className="p-3 border-b border-[#1a1a22] bg-[#0e0e11] flex items-center gap-2">
          <Search className="w-4 h-4 text-zinc-400 ml-2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filter chunks by title or content..."
            className="w-full bg-transparent text-xs font-mono text-slate-100 outline-none placeholder:text-zinc-500"
          />
        </div>

        {/* Chunks List */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1">
          {filtered.map((chunk) => (
            <div
              key={chunk.chunkId}
              className="p-3.5 rounded-xl bg-[#070708] border border-[#1a1a22] font-mono text-xs"
            >
              <div className="flex items-center justify-between text-[10px] text-zinc-400 border-b border-[#1a1a22] pb-1.5 mb-2">
                <span className="text-toxic font-bold uppercase">{chunk.section}</span>
                <span>Score: {Math.round(chunk.similarity * 100)}%</span>
              </div>
              <h4 className="font-bold text-slate-200 text-xs mb-1 font-sans">{chunk.title}</h4>
              <p className="text-zinc-400 leading-relaxed text-[11px]">&quot;{chunk.content}&quot;</p>
              <div className="mt-2 flex items-center gap-2 text-[10px] text-zinc-500">
                <Layers className="w-3 h-3 text-cyber" />
                <span>Chunk ID: {chunk.chunkId}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
