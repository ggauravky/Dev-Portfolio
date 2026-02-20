// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// GauravChatbot â€” full viewport AI chat, messages-only scrolls, responsive
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
import { useState, useRef, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import useSEO from '../../hooks/useSEO'
import ChatMessage from '../../components/chat/ChatMessage'
import TypingIndicator from '../../components/chat/TypingIndicator'

// â”€â”€â”€ Constants â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

// In production, force same-origin API so requests go to Vercel /api/chat.
// In development, allow explicit chat API override, then fallback to local backend.
const API_URL = (
    import.meta.env.PROD
        ? ''
        : import.meta.env.VITE_CHAT_API_URL || import.meta.env.VITE_API_URL || 'http://localhost:5000'
).replace(/\/$/, '')

const SUGGESTION_CHIPS = [
    'Tell me about yourself',
    'What projects have you built?',
    'What is TaskNexus?',
    'Are you open for internships?',
    'What AI skills do you have?',
]

const makeMsg = (role, content) => ({
    id: `${Date.now()}-${Math.random()}`,
    role,
    content,
    timestamp: new Date(),
})

const INITIAL_AI_MESSAGE = makeMsg(
    'ai',
    "Hey! 👋 I'm Gaurav — a BCA student from Lucknow building things in AI/ML and full-stack development.\n\nAsk me anything — what I've built, what I know, or whether I'm available. Happy to chat!"
)

// â”€â”€â”€ Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function GauravChatbot() {
    useSEO({
        title: "Gaurav's AI Chatbot - Lab | Portfolio Powered by Gemini",
        description:
            'Chat with an AI version of Gaurav Kumar Yadav. Ask about his skills, projects, education, and availability. Powered by Google Gemini.',
        keywords:
            'Gaurav AI Chatbot, Portfolio Chatbot, Gaurav Kumar Yadav AI, Gemini Chatbot, Developer Chatbot, AI Portfolio',
        ogImage: 'https://ggauravky.vercel.app/images/profile.jpg',
    })

    const [messages, setMessages] = useState([INITIAL_AI_MESSAGE])
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)
    const [chipsVisible, setChipsVisible] = useState(true)
    const [isFocused, setIsFocused] = useState(false)

    // Stable session ID for this page visit — groups all turns from one visitor together
    const sessionIdRef = useRef(`${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`)
    // Count of user messages sent in this session (for messageIndex analytics)
    const msgCountRef = useRef(0)

    const messagesEndRef = useRef(null)
    const textareaRef = useRef(null)

    // â”€â”€ Smooth scroll to latest message â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }, [])

    useEffect(() => {
        scrollToBottom()
    }, [messages, isLoading, scrollToBottom])

    // â”€â”€ Auto-resize textarea â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const resizeTextarea = useCallback(() => {
        const el = textareaRef.current
        if (!el) return
        el.style.height = 'auto'
        el.style.height = `${Math.min(el.scrollHeight, 140)}px`
    }, [])

    useEffect(() => {
        resizeTextarea()
    }, [input, resizeTextarea])

    // â"€â"€ Send message â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
    const sendMessage = useCallback(
        async (text) => {
            const trimmed = (text || input).trim()
            if (!trimmed || isLoading) return

            setChipsVisible(false)
            setError(null)
            setInput('')

            setMessages((prev) => [...prev, makeMsg('user', trimmed)])
            setIsLoading(true)

            if (textareaRef.current) textareaRef.current.style.height = 'auto'

            try {
                // Build conversation history for multi-turn context (skip the initial AI greeting)
                const historySnapshot = messages
                    .filter((m) => m.id !== INITIAL_AI_MESSAGE.id)
                    .slice(-12)
                    .map((m) => ({ role: m.role === 'ai' ? 'model' : 'user', text: m.content }))

                const currentIndex = msgCountRef.current;
                msgCountRef.current += 1;

                const response = await fetch(`${API_URL}/api/chat`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        message: trimmed,
                        history: historySnapshot,
                        sessionId: sessionIdRef.current,
                        messageIndex: currentIndex,
                    }),
                    signal: AbortSignal.timeout(25000),
                })

                const data = await response.json()
                if (!response.ok || !data.success) throw new Error(data.reply || 'Something went wrong.')
                setMessages((prev) => [...prev, makeMsg('ai', data.reply)])
            } catch (err) {
                setError(
                    err.name === 'TimeoutError'
                        ? 'Request timed out. Please try again.'
                        : err.message || 'Failed to reach the server.'
                )
            } finally {
                setIsLoading(false)
                textareaRef.current?.focus()
            }
        },
        [input, isLoading, messages]
    )

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            sendMessage()
        }
    }

    const canSend = input.trim().length > 0 && !isLoading

    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    return (
        <>
            <style>{`
                @keyframes msgSlideUp {
                    from { opacity: 0; transform: translateY(10px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to   { opacity: 1; }
                }
                .msg-enter  { animation: msgSlideUp 0.22s ease-out both; }
                .fade-in    { animation: fadeIn 0.2s ease-out both; }

                .messages-scroll::-webkit-scrollbar       { width: 4px; }
                .messages-scroll::-webkit-scrollbar-track { background: transparent; }
                .messages-scroll::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 4px; }
                .messages-scroll::-webkit-scrollbar-thumb:hover { background: #334155; }

                .input-wrap {
                    transition: border-color 0.25s ease, box-shadow 0.25s ease;
                }
                .input-wrap.focused {
                    border-color: rgba(99,102,241,0.55);
                    box-shadow: 0 0 0 3px rgba(99,102,241,0.14), 0 2px 16px rgba(99,102,241,0.10);
                }
                .send-btn {
                    transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
                }
                .send-btn:hover:not(:disabled) { transform: scale(1.07); }
                .send-btn:active:not(:disabled) { transform: scale(0.95); }

                .chip-btn {
                    transition: background 0.18s, border-color 0.18s, color 0.18s, transform 0.12s, box-shadow 0.18s;
                }
                .chip-btn:active:not(:disabled) { transform: scale(0.95); }
            `}</style>

            {/* â”€â”€ Full-viewport shell â€” ONLY messages area scrolls â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
            <div
                className="flex flex-col bg-slate-950 relative"
                style={{ height: '100dvh', minHeight: '-webkit-fill-available' }}
            >
                {/* Ambient glows */}
                <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
                    <div className="absolute -top-40 right-0 w-72 h-72 bg-indigo-700/5 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 -left-20 w-72 h-72 bg-cyan-700/5 rounded-full blur-3xl" />
                </div>

                {/* â”€â”€ Header â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
                <header className="flex-shrink-0 flex items-center gap-3 px-4 py-3 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-xl z-20">
                    {/* Back */}
                    <Link
                        to="/lab"
                        className="flex items-center gap-1.5 text-slate-500 hover:text-slate-200 text-sm transition-colors duration-200 group flex-shrink-0 mr-1"
                        aria-label="Back to Lab"
                    >
                        <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        <span className="hidden sm:inline text-xs">Lab</span>
                    </Link>

                    {/* Avatar */}
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-lg shadow-indigo-500/25 ring-2 ring-indigo-500/20">
                        G
                    </div>

                    {/* Name + status */}
                    <div className="flex-1 min-w-0">
                        <p className="text-white font-semibold text-sm leading-tight">Gaurav&apos;s AI</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="relative flex h-1.5 w-1.5 flex-shrink-0">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                            </span>
                            <span className="text-emerald-400 text-xs">Online · Powered by Gemini</span>
                        </div>
                    </div>

                    {/* Info badge â€” desktop */}
                    <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-slate-800/80 border border-slate-700/60 rounded-full text-slate-400 text-xs">
                        <svg className="w-3 h-3 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="10" strokeWidth="2" />
                            <path strokeLinecap="round" strokeWidth="2" d="M12 8v4m0 4h.01" />
                        </svg>
                        Ask anything about me
                    </div>
                </header>

                {/* â”€â”€ Scrollable messages area â€” ONLY this scrolls â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
                <div
                    className="flex-1 overflow-y-auto messages-scroll overscroll-contain"
                    style={{ minHeight: 0 }}
                >
                    <div className="max-w-2xl mx-auto w-full px-3 sm:px-5 pt-5 pb-3 flex flex-col gap-3">

                        {messages.map((msg) => (
                            <ChatMessage
                                key={msg.id}
                                role={msg.role}
                                content={msg.content}
                                timestamp={msg.timestamp}
                            />
                        ))}

                        {/* Typing indicator */}
                        {isLoading && <TypingIndicator />}

                        {/* Error banner */}
                        {error && (
                            <div className="fade-in flex items-start gap-3 px-4 py-3 bg-red-500/8 border border-red-500/20 rounded-2xl text-sm">
                                <span className="text-red-400 text-base flex-shrink-0 mt-0.5">âš ï¸</span>
                                <div className="flex-1 min-w-0">
                                    <p className="text-red-300 leading-snug">{error}</p>
                                    <a
                                        href="https://ggauravky.vercel.app/contact"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-red-400/60 hover:text-red-300 underline text-xs mt-1 inline-block transition-colors"
                                    >
                                        Contact Gaurav directly →
                                    </a>
                                </div>
                                <button
                                    onClick={() => setError(null)}
                                    className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full text-red-400 hover:text-red-200 hover:bg-red-500/15 transition-all"
                                    aria-label="Dismiss"
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        )}

                        {/* Scroll anchor */}
                        <div ref={messagesEndRef} className="h-1 w-full" />
                    </div>
                </div>

                {/* â”€â”€ Suggestion chips â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
                {chipsVisible && (
                    <div className="flex-shrink-0 border-t border-slate-800/50">
                        <div className="max-w-2xl mx-auto w-full px-3 sm:px-5 py-2.5">
                            <p className="text-slate-700 text-[10px] font-semibold uppercase tracking-widest mb-2">
                                Quick questions
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                                {SUGGESTION_CHIPS.map((chip) => (
                                    <button
                                        key={chip}
                                        onClick={() => sendMessage(chip)}
                                        disabled={isLoading}
                                        className="chip-btn px-3 py-1.5 bg-slate-800/70 hover:bg-slate-700/80 border border-slate-700/50 hover:border-indigo-500/40 text-slate-400 hover:text-slate-100 text-xs rounded-full disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-sm hover:shadow-indigo-500/10"
                                    >
                                        {chip}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* â”€â”€ Input area â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
                <div className="flex-shrink-0 border-t border-slate-800/80 bg-slate-950/90 backdrop-blur-xl z-20">
                    <div className="max-w-2xl mx-auto w-full px-3 sm:px-5 pt-3 pb-3 sm:pb-4">

                        {/* Glow container */}
                        <div className={`input-wrap flex items-end gap-2 rounded-2xl border bg-slate-900/70 px-3 py-2 ${isFocused ? 'focused' : 'border-slate-800'}`}>
                            <textarea
                                ref={textareaRef}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                onFocus={() => setIsFocused(true)}
                                onBlur={() => setIsFocused(false)}
                                placeholder="Ask me about my skills, projects, or availabilityâ€¦"
                                disabled={isLoading}
                                rows={1}
                                maxLength={1000}
                                aria-label="Chat input"
                                className="flex-1 bg-transparent text-slate-200 placeholder-slate-600 text-sm sm:text-[15px] resize-none outline-none leading-relaxed py-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{ minHeight: '28px', maxHeight: '140px', overflowY: 'auto' }}
                            />

                            {/* Send button */}
                            <button
                                onClick={() => sendMessage()}
                                disabled={!canSend}
                                aria-label="Send message"
                                className={`send-btn flex-shrink-0 mb-0.5 w-9 h-9 rounded-xl flex items-center justify-center ${
                                    canSend
                                        ? 'bg-gradient-to-br from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/35'
                                        : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                                }`}
                            >
                                {isLoading ? (
                                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                    </svg>
                                ) : (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M5 12h14M12 5l7 7-7 7" />
                                    </svg>
                                )}
                            </button>
                        </div>

                        {/* Below-input row */}
                        <div className="flex items-center justify-between mt-1.5 px-0.5">
                            <p className="text-slate-700 text-[11px] hidden sm:block">
                                <kbd className="px-1 py-0.5 bg-slate-800 border border-slate-700/80 rounded text-slate-600 font-mono text-[10px]">Enter</kbd>
                                {' '}send ·{' '}
                                <kbd className="px-1 py-0.5 bg-slate-800 border border-slate-700/80 rounded text-slate-600 font-mono text-[10px]">Shift+Enter</kbd>
                                {' '}new line
                            </p>
                            <p className="text-slate-700 text-[11px] sm:hidden">
                                Answers from real portfolio data
                            </p>
                            {input.length > 0 && (
                                <span className={`text-[11px] tabular-nums transition-colors duration-200 ${input.length > 900 ? 'text-amber-400' : 'text-slate-700'}`}>
                                    {input.length}/1000
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default GauravChatbot
