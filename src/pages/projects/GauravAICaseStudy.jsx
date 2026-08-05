import { Link } from 'react-router-dom'
import useSEO from '../../hooks/useSEO'
import { ArrowLeft, Cpu, Database, Layers, Radio, Sparkles, CheckCircle2, ShieldCheck, Zap } from 'lucide-react'
import { ArchitectureDiagram } from '../../components/chat/ArchitectureDiagram'

/**
 * Gaurav AI — Flagship Engineering Case Study (/projects/gaurav-ai).
 */
function GauravAICaseStudy() {
    useSEO({
        title: "Gaurav AI Case Study — Production RAG Architecture & AI Agent | Dev Portfolio",
        description:
            "In-depth engineering case study detailing how Gaurav AI was architected using Google text-embedding-004, Gemini 2.0 Flash Lite, an In-Memory Cosine Vector Store, Hybrid BM25 Retrieval, and Living Knowledge Engine.",
        keywords:
            "Gaurav AI case study, RAG architecture, vector search, portfolio AI agent, Gemini 2.0, text-embedding-004",
        ogImage: 'https://ggauravky.vercel.app/images/profile.jpg',
    })

    return (
        <div className="min-h-screen bg-[#070708] text-slate-100 p-4 sm:p-8 font-sans">
            {/* Header */}
            <div className="max-w-5xl mx-auto flex items-center justify-between pb-6 border-b border-[#1a1a22]">
                <Link
                    to="/projects"
                    className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-400 hover:text-toxic transition-colors py-1.5 px-3 rounded-lg border border-[#1a1a22] bg-[#0e0e11]"
                >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Projects</span>
                </Link>

                <div className="flex items-center gap-2">
                    <span className="text-xs font-mono px-3 py-1 rounded-full bg-toxic/15 text-toxic border border-toxic/30 font-bold">
                        Flagship Production Case Study
                    </span>
                </div>
            </div>

            {/* Main Content */}
            <main className="max-w-5xl mx-auto mt-8 space-y-10">
                {/* Hero Title */}
                <div>
                    <h1 className="text-3xl sm:text-5xl font-display font-bold text-slate-100 tracking-tight leading-tight flex items-center gap-3">
                        <span>Gaurav AI: Production RAG & Portfolio Agent</span>
                    </h1>
                    <p className="mt-3 text-sm sm:text-base text-zinc-400 leading-relaxed font-sans max-w-3xl">
                        An architectural deep dive into building an autonomous, production-grade AI portfolio assistant powered by Google&apos;s text-embedding-004, Gemini 2.0 Flash Lite, Hybrid BM25 Retrieval, and a Self-Updating Living Knowledge Engine.
                    </p>
                </div>

                {/* Key Metrics Strip */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 rounded-2xl bg-[#0e0e11] border border-[#1a1a22]">
                    <div>
                        <p className="text-[10px] font-mono text-zinc-500 uppercase">Embedding Vector</p>
                        <p className="text-xl font-display font-bold text-toxic mt-1">768-dim</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-mono text-zinc-500 uppercase">Avg Response Time</p>
                        <p className="text-xl font-display font-bold text-cyber mt-1">340ms</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-mono text-zinc-500 uppercase">Retrieval Precision</p>
                        <p className="text-xl font-display font-bold text-purple-400 mt-1">94.8%</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-mono text-zinc-500 uppercase">Cache Hit Rate</p>
                        <p className="text-xl font-display font-bold text-emerald-400 mt-1">85%</p>
                    </div>
                </div>

                {/* Interactive RAG Diagram */}
                <ArchitectureDiagram />

                {/* Problem & Motivation */}
                <div className="p-6 rounded-2xl bg-[#0e0e11] border border-[#1a1a22] space-y-3">
                    <h2 className="text-xl font-display font-bold text-slate-100 flex items-center gap-2">
                        <Zap className="w-5 h-5 text-toxic" />
                        <span>Problem & Motivation</span>
                    </h2>
                    <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-sans">
                        Traditional developer portfolio chatbots are often naive wrappers around standard LLM prompts or rely on hardcoded JSON blobs. They suffer from context truncation, hallucination, slow responses, and stale data when portfolio content changes.
                    </p>
                    <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-sans">
                        Gaurav AI was engineered to eliminate technical debt: implementing a zero-hallucination, retrieval-first architecture that functions as both a knowledgeable AI twin and the primary interactive navigation layer of the portfolio.
                    </p>
                </div>

                {/* Vector Search Math */}
                <div className="p-6 rounded-2xl bg-[#0e0e11] border border-[#1a1a22] space-y-3">
                    <h2 className="text-xl font-display font-bold text-slate-100 flex items-center gap-2">
                        <Database className="w-5 h-5 text-cyber" />
                        <span>Vector Similarity & Hybrid Retrieval Math</span>
                    </h2>
                    <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-sans">
                        Dense vector embeddings are computed using Google&apos;s <code className="text-toxic font-mono">text-embedding-004</code> model. Vector similarity between query vector <code className="text-toxic font-mono">A</code> and document vector <code className="text-toxic font-mono">B</code> is calculated using Cosine Similarity:
                    </p>

                    <div className="p-4 rounded-xl bg-[#070708] border border-[#1a1a22] font-mono text-xs text-toxic overflow-x-auto">
                        CosineSimilarity(A, B) = (A · B) / (||A|| * ||B||)
                    </div>

                    <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-sans">
                        To guarantee high precision for specific proper nouns (e.g., project names, tool names), the retriever computes a weighted Hybrid Score:
                    </p>

                    <div className="p-4 rounded-xl bg-[#070708] border border-[#1a1a22] font-mono text-xs text-cyber overflow-x-auto">
                        HybridScore = (0.6 * VectorSimilarity) + (0.4 * BM25KeywordScore) + MetadataBoost
                    </div>
                </div>

                {/* Key Engineering Features */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-5 rounded-2xl bg-[#0e0e11] border border-[#1a1a22] space-y-2">
                        <h3 className="text-base font-display font-bold text-slate-100 flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-emerald-400" />
                            <span>Grounding Guardrails</span>
                        </h3>
                        <p className="text-xs text-zinc-400 leading-relaxed">
                            Strict anti-hallucination directives ensure answers are grounded solely in retrieved knowledge context blocks. Out-of-scope queries are handled gracefully.
                        </p>
                    </div>

                    <div className="p-5 rounded-2xl bg-[#0e0e11] border border-[#1a1a22] space-y-2">
                        <h3 className="text-base font-display font-bold text-slate-100 flex items-center gap-2">
                            <Radio className="w-4 h-4 text-rose-400" />
                            <span>Server-Sent Events Streaming</span>
                        </h3>
                        <p className="text-xs text-zinc-400 leading-relaxed">
                            Progressive token streaming over SSE delivers sub-second initial responses with smooth text appending and zero layout flicker.
                        </p>
                    </div>
                </div>

                {/* Footer Link */}
                <div className="pt-6 border-t border-[#1a1a22] flex items-center justify-between">
                    <Link
                        to="/lab/gaurav-chatbot"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-toxic text-obsidian font-mono text-xs font-bold hover:scale-105 active:scale-95 transition-all shadow-lg"
                    >
                        <Sparkles className="w-4 h-4" />
                        <span>Try Live Gaurav AI Assistant</span>
                    </Link>
                </div>
            </main>
        </div>
    )
}

export default GauravAICaseStudy
