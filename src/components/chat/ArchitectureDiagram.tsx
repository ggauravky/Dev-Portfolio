import React, { useState } from 'react';
import { Database, FileCode, Layers, Cpu, Radio, Network, Bot, Sparkles, CheckCircle2 } from 'lucide-react';

interface DiagramNode {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  color: string;
  details: string;
}

const ARCHITECTURE_NODES: DiagramNode[] = [
  {
    id: 'sources',
    title: '1. Knowledge Sources',
    subtitle: 'Portfolio Datasets',
    icon: Database,
    color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
    details: 'Ingests normalized portfolio content: projectsData.js, portfolioData.json, blogsData.js, journeyData.js, servicesData.js, and metadata.',
  },
  {
    id: 'chunker',
    title: '2. Semantic Chunker',
    subtitle: 'Heading Boundaries',
    icon: FileCode,
    color: 'text-cyber border-cyber/30 bg-cyber/10',
    details: 'Splits raw markdown & JSON into semantic chunks by headings (#, ##), paragraphs, lists, and code blocks while maintaining metadata tags.',
  },
  {
    id: 'embeddings',
    title: '3. Dense Embeddings',
    subtitle: 'text-embedding-004',
    icon: Layers,
    color: 'text-purple-400 border-purple-500/30 bg-purple-500/10',
    details: 'Generates 768-dimensional L2 normalized dense vectors using Google\'s text-embedding-004 embedding model.',
  },
  {
    id: 'vectorstore',
    title: '4. Vector Store',
    subtitle: 'Cosine Similarity',
    icon: Database,
    color: 'text-toxic border-toxic/30 bg-toxic/10',
    details: 'In-Memory Cosine Similarity Vector Database calculating dot products across 768-dim embeddings in sub-10ms latency.',
  },
  {
    id: 'retrieval',
    title: '5. Hybrid Retrieval',
    subtitle: 'Vector + BM25 Search',
    icon: Network,
    color: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
    details: 'Evaluates HybridScore = (0.6 * VectorSim) + (0.4 * BM25Score) + MetadataBoost to retrieve top 5 candidate chunks.',
  },
  {
    id: 'llm',
    title: '6. Gemini 2.0 LLM',
    subtitle: 'Structured Generation',
    icon: Cpu,
    color: 'text-sky-400 border-sky-500/30 bg-sky-500/10',
    details: 'Prompt Builder injects retrieved context, session history, and strict grounding directives into Gemini 2.0 Flash Lite.',
  },
  {
    id: 'streaming',
    title: '7. Token Streaming',
    subtitle: 'Server-Sent Events',
    icon: Radio,
    color: 'text-rose-400 border-rose-500/30 bg-rose-500/10',
    details: 'Streams completion tokens progressively using Server-Sent Events (SSE) for sub-second first-token rendering.',
  },
  {
    id: 'agent',
    title: '8. Portfolio Agent',
    subtitle: 'Action Execution',
    icon: Bot,
    color: 'text-toxic border-toxic/30 bg-toxic/10',
    details: 'Executes portfolio actions: navigation, smooth element scrolling, DOM pulse highlighting, resume download, and email copying.',
  },
];

/**
 * Interactive System Architecture Diagram Component.
 */
export const ArchitectureDiagram: React.FC = () => {
  const [selectedNode, setSelectedNode] = useState<DiagramNode>(ARCHITECTURE_NODES[0]);

  return (
    <div className="p-4 sm:p-6 rounded-2xl bg-[#0e0e11] border border-[#1a1a22] shadow-2xl font-sans text-slate-100">
      <div className="flex items-center justify-between border-b border-[#1a1a22] pb-3 mb-5">
        <h3 className="text-base font-display font-bold flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-toxic" />
          <span>Gaurav AI — Production RAG Architecture</span>
        </h3>
        <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-toxic/15 text-toxic border border-toxic/30 font-bold">
          System Diagram
        </span>
      </div>

      {/* Interactive Grid Nodes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {ARCHITECTURE_NODES.map((node) => {
          const Icon = node.icon;
          const isSelected = selectedNode.id === node.id;

          return (
            <button
              key={node.id}
              type="button"
              onClick={() => setSelectedNode(node)}
              className={`p-3.5 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                isSelected
                  ? 'border-toxic bg-toxic/10 shadow-lg scale-[1.02]'
                  : 'border-[#1a1a22] bg-[#070708] hover:border-toxic/35'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-lg border ${node.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                {isSelected && <CheckCircle2 className="w-4 h-4 text-toxic shrink-0" />}
              </div>

              <h4 className="text-xs font-display font-bold text-slate-100 mt-2.5">
                {node.title}
              </h4>
              <p className="text-[11px] font-mono text-zinc-400 mt-0.5">
                {node.subtitle}
              </p>
            </button>
          );
        })}
      </div>

      {/* Active Node Detail Card */}
      <div className="mt-5 p-4 rounded-xl bg-[#070708] border border-[#1a1a22] animate-in fade-in duration-200">
        <div className="flex items-center gap-2 font-mono text-xs font-bold text-toxic border-b border-[#1a1a22] pb-2 mb-2">
          <span>SELECTED MODULE:</span>
          <span className="text-slate-100 font-sans font-bold">{selectedNode.title}</span>
        </div>
        <p className="text-xs text-zinc-300 leading-relaxed font-sans">
          {selectedNode.details}
        </p>
      </div>
    </div>
  );
};
