import { Link } from 'react-router-dom'
import useSEO from '../../hooks/useSEO'
import { ChatWindow } from '../../components/chat/ChatWindow'
import { ArrowLeft, Cpu, Database, Sparkles } from 'lucide-react'

/**
 * GauravChatbot — Flagship AI Assistant page (/lab/gaurav-chatbot).
 * Apple × Notion × Linear minimalist layout with live RAG telemetry.
 */
function GauravChatbot() {
    useSEO({
        title: "Gaurav's AI Assistant - Lab | Portfolio Gemini Assistant",
        description:
            "Ask Gaurav Kumar Yadav's portfolio AI assistant about projects, technical skills, services, blogs, and career journey. Powered by RAG retrieval and Gemini 2.0 AI.",
        keywords:
            "Gaurav AI assistant, portfolio chatbot, Gaurav Kumar Yadav projects, Gemini chatbot, RAG AI assistant",
        ogImage: 'https://ggauravky.vercel.app/images/profile.jpg',
    })

    return (
        <div className="flex h-[100dvh] min-h-[100dvh] flex-col overflow-hidden bg-[#070708]">
            {/* Top Navigation Bar */}
            <header className="border-b border-[#1a1a22] bg-[#0e0e11]/85 backdrop-blur-xl px-4 py-2.5 flex items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-3">
                    <Link
                        to="/lab"
                        className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-400 hover:text-toxic transition-colors py-1.5 px-3 rounded-lg border border-[#1a1a22] bg-[#070708] hover:border-toxic/30"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Lab</span>
                    </Link>

                    <div className="h-4 w-px bg-[#1a1a22]" />

                    <div className="flex items-center gap-2">
                        <span className="text-xs font-display font-bold text-slate-100 hidden sm:inline">
                            Gaurav AI Assistant
                        </span>
                        <Sparkles className="w-3.5 h-3.5 text-toxic" />
                    </div>
                </div>

                {/* Status Telemetry Badges */}
                <div className="flex items-center gap-2 text-[10px] font-mono select-none">
                    <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#070708] border border-[#1a1a22] text-zinc-400">
                        <Cpu className="w-3 h-3 text-cyber" />
                        <span>Gemini 2.0 Flash</span>
                    </div>

                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-toxic/10 border border-toxic/25 text-toxic font-bold">
                        <Database className="w-3 h-3 text-toxic" />
                        <span>RAG Engine Active</span>
                    </div>
                </div>
            </header>

            {/* Main Full-Height Workspace */}
            <main className="flex-1 w-full max-w-5xl mx-auto overflow-hidden flex flex-col p-0 sm:p-4">
                <ChatWindow isFullScreen className="flex-1 rounded-none sm:rounded-2xl" />
            </main>
        </div>
    )
}

export default GauravChatbot
