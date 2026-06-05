import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import useSEO from '../../hooks/useSEO'
import ChatMessage from '../../components/chat/ChatMessage'
import TypingIndicator from '../../components/chat/TypingIndicator'

const SESSION_STORAGE_KEY = 'gaurav-chatbot-session-id'
const FALLBACK_MESSAGE = "I'm having trouble right now, please try again."

const SUGGESTED_QUESTIONS = [
    'What projects have you built?',
    'What technologies do you use?',
    'Tell me about your experience',
    'What services do you offer?',
]

const MAINTENANCE_OPTIONS = [
    'Show me your top projects',
    'What services do you offer?',
    'Share your availability and work style',
    'How can I contact you?',
]

const buildId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`

const createMessage = (role, content, extra = {}) => ({
    id: extra.id || buildId(),
    role,
    content,
    timestamp: extra.timestamp || new Date(),
    sources: Array.isArray(extra.sources) ? extra.sources : [],
    intro: Boolean(extra.intro),
    followUpSuggestions: Array.isArray(extra.followUpSuggestions) ? extra.followUpSuggestions : [],
    userIntent: extra.userIntent || null,
})

const createIntroMessage = () =>
    createMessage(
        'ai',
        "I'm Gaurav's portfolio assistant. Ask me about projects, skills, services, blogs, journey, work style, or career direction. I only answer from portfolio data, so if something is not in the knowledge base, I'll say so.",
        {
            id: 'gaurav-chatbot-intro',
            intro: true,
        }
    )

const readInitialMessages = () => {
    return [createIntroMessage()]
}

const readSessionId = () => {
    if (globalThis.window === undefined) {
        return `gaurav-${Date.now()}`
    }

    const existing = sessionStorage.getItem(SESSION_STORAGE_KEY)
    if (existing) {
        return existing
    }

    const generated =
        globalThis.crypto?.randomUUID?.() ||
        `gaurav-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    sessionStorage.setItem(SESSION_STORAGE_KEY, generated)
    return generated
}

function GauravChatbot() {
    useSEO({
        title: "Gaurav's AI Chatbot - Lab | Portfolio RAG Assistant",
        description:
            'Ask Gaurav Kumar Yadav\'s portfolio chatbot about projects, skills, services, blogs, and journey. Powered by structured RAG and DeepSeek.',
        keywords:
            'Gaurav chatbot, portfolio AI assistant, Gaurav Kumar Yadav projects, DeepSeek chatbot, RAG portfolio assistant',
        ogImage: 'https://ggauravky.vercel.app/images/profile.jpg',
    })

    const [messages, setMessages] = useState(readInitialMessages)
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [showMaintenance, setShowMaintenance] = useState(true)
    const [sessionId] = useState(readSessionId)

    const textareaRef = useRef(null)
    const scrollAnchorRef = useRef(null)

    const apiBase = useMemo(
        () => (import.meta.env.VITE_CHATBOT_API_URL || import.meta.env.VITE_API_URL || '').replace(/\/$/, ''),
        []
    )
    const endpoint = apiBase ? `${apiBase}/api/chatbot` : '/api/chatbot'

    const userMessageCount = messages.filter((message) => message.role === 'user').length
    const showSuggestions = userMessageCount === 0

    useEffect(() => {
        scrollAnchorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }, [messages, isLoading])

    useEffect(() => {
        const textarea = textareaRef.current
        if (!textarea) {
            return
        }

        textarea.style.height = 'auto'
        textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`
    }, [input])

    const sendMessage = async (value = input) => {
        const trimmed = value.trim()
        if (!trimmed || isLoading) {
            return
        }

        const userMessage = createMessage('user', trimmed)
        const optimisticMessages = [...messages, userMessage]

        setMessages(optimisticMessages)
        setInput('')
        setIsLoading(true)

        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto'
        }

        try {
            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), 22000)
            const history = messages
                .filter((message) => !message.intro)
                .slice(-8)
                .map((message) => ({
                    role: message.role === 'ai' ? 'assistant' : 'user',
                    content: message.content,
                    sources: message.role === 'ai' ? message.sources : [],
                }))

            let response
            try {
                response = await fetch(endpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        message: trimmed,
                        history,
                        sessionId,
                    }),
                    signal: controller.signal,
                })
            } finally {
                clearTimeout(timeoutId)
            }

            const data = await response.json().catch(() => ({}))
            if (!response.ok || !data.success || !String(data.reply || '').trim()) {
                throw new Error(data.reply || FALLBACK_MESSAGE)
            }

            setMessages((previous) => {
                const replyText = String(data.reply).trim()
                const last = previous.at(-1)

                const hasIntro = previous.some((m) => m.intro === true || m.id === 'gaurav-chatbot-intro')
                const isIntroLike = replyText.toLowerCase().includes("portfolio assistant") || replyText.toLowerCase().includes("ask me about")
                if (hasIntro && isIntroLike) {
                    const updated = previous.map((m) => {
                        if (m.intro === true || m.id === 'gaurav-chatbot-intro') {
                            return createMessage('ai', m.content, {
                                id: m.id,
                                timestamp: new Date(),
                                sources: Array.isArray(data.sources) && data.sources.length ? data.sources : m.sources,
                                followUpSuggestions: data.followUpSuggestions || m.followUpSuggestions || [],
                                userIntent: data.userIntent || m.userIntent || null,
                            })
                        }
                        return m
                    })
                    return updated
                }

                if (last?.role === 'ai' && String(last.content).trim() === replyText) {
                    const updated = [...previous]
                    updated[updated.length - 1] = createMessage('ai', replyText, {
                        id: last.id,
                        timestamp: new Date(),
                        sources: data.sources,
                        followUpSuggestions: data.followUpSuggestions || [],
                        userIntent: data.userIntent || null,
                    })
                    return updated
                }

                return [
                    ...previous,
                    createMessage('ai', replyText, {
                        sources: data.sources,
                        followUpSuggestions: data.followUpSuggestions || [],
                        userIntent: data.userIntent || null,
                    }),
                ]
            })
        } catch (error) {
            const fallbackReply =
                error?.name === 'AbortError'
                    ? FALLBACK_MESSAGE
                    : String(error?.message || FALLBACK_MESSAGE)

            setMessages((previous) => [
                ...previous,
                createMessage('ai', fallbackReply),
            ])
        } finally {
            setIsLoading(false)
            textareaRef.current?.focus()
        }
    }

    const handleKeyDown = (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault()
            void sendMessage()
        }
    }

    const handleMaintenanceOption = (text) => {
        setInput(text)
        setShowMaintenance(false)
        textareaRef.current?.focus()
    }

    return (
        <>
            <style>{`
                :root { --safe-area-inset-bottom: env(safe-area-inset-bottom); }

                .chat-shell {
                    background: #070708;
                }

                .chat-scroll::-webkit-scrollbar {
                    width: 6px;
                }

                .chat-scroll::-webkit-scrollbar-thumb {
                    background: #1a1a22;
                    border-radius: 999px;
                }

                .maintenance-backdrop {
                    background: rgba(7, 7, 8, 0.85);
                }

                .maintenance-dialog {
                    position: relative;
                    overflow: hidden;
                }

                .maintenance-dialog::before {
                    content: '';
                    position: absolute;
                    inset: -40% 10% 30% -30%;
                    background: conic-gradient(from 120deg, rgba(197, 248, 42, 0.2), rgba(255, 93, 0, 0.15), rgba(197, 248, 42, 0.2));
                    opacity: 0.65;
                    filter: blur(40px);
                }

                .maintenance-dialog::after {
                    content: '';
                    position: absolute;
                    inset: 1px;
                    border-radius: 8px;
                    background: #0e0e11;
                }

                .maintenance-content {
                    position: relative;
                    z-index: 1;
                }

                .pb-safe-area { padding-bottom: env(safe-area-inset-bottom); }
                .input-safe { padding-bottom: calc(env(safe-area-inset-bottom) + 8px); }
            `}</style>

            {showMaintenance && (
                <div className="maintenance-backdrop fixed inset-0 z-30 flex items-center justify-center px-4 py-6 backdrop-blur-sm">
                    <dialog
                        open
                        className="maintenance-dialog w-full max-w-3xl rounded-lg border border-[#1a1a22] p-1 shadow-[0_30px_120px_rgba(7,7,8,0.85)]"
                        aria-label="Maintenance notice"
                    >
                        <div className="maintenance-content max-h-[calc(100dvh-3rem)] overflow-y-auto rounded-lg bg-[#0e0e11] p-5 sm:p-6">
                            <div className="flex flex-wrap items-start justify-between gap-4">
                                <div className="flex items-start gap-3">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-cyber/15 border border-cyber/30 text-xs font-bold text-cyber">
                                        UP
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-mono uppercase tracking-[0.22em] text-cyber">
                                            Maintenance Notice
                                        </p>
                                        <h2 className="mt-2 text-lg font-display font-bold text-slate-100 sm:text-xl">
                                            Upgrading the portfolio assistant
                                        </h2>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowMaintenance(false)}
                                    className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-[#1a1a22] bg-[#070708] text-zinc-400 transition hover:border-toxic hover:text-toxic"
                                    aria-label="Close maintenance notice"
                                >
                                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="mt-5 grid gap-5 sm:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
                                <div className="space-y-4">
                                    <p className="text-sm leading-relaxed text-[#a1a1aa] font-sans">
                                        We are improving response quality. For now, answers can be shorter or less detailed.
                                        You can still explore verified portfolio answers safely.
                                    </p>

                                    <div className="rounded-lg border border-[#1a1a22] bg-[#070708] p-4">
                                        <p className="text-[10px] font-mono uppercase tracking-widest text-[#52525b]">
                                            What you can do now
                                        </p>
                                        <div className="mt-3 space-y-2 text-sm text-[#a1a1aa]">
                                            <div className="flex items-start gap-2">
                                                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-toxic shrink-0" />
                                                <span>Browse top projects and impact highlights.</span>
                                            </div>
                                            <div className="flex items-start gap-2">
                                                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-cyber shrink-0" />
                                                <span>See services, timelines, and engagement fit.</span>
                                            </div>
                                            <div className="flex items-start gap-2">
                                                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-toxic shrink-0" />
                                                <span>Ask about availability or preferred work style.</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-2 text-[10px] text-[#52525b] font-mono">
                                        <span className="rounded-md border border-[#1a1a22] bg-[#070708] px-3 py-1.5">
                                            Safe responses only
                                        </span>
                                        <span className="rounded-md border border-[#1a1a22] bg-[#070708] px-3 py-1.5">
                                            No hallucinated info
                                        </span>
                                    </div>
                                </div>

                                <div className="rounded-lg border border-[#1a1a22] bg-[#0e0e11] p-4">
                                    <div className="flex items-center justify-between">
                                        <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-cyber">
                                            Quick options
                                        </p>
                                        <span className="text-[10px] font-mono text-[#52525b]">Tap to prefill</span>
                                    </div>
                                    <div className="mt-3 grid gap-2">
                                        {MAINTENANCE_OPTIONS.map((option) => (
                                            <button
                                                key={option}
                                                onClick={() => handleMaintenanceOption(option)}
                                                className="rounded-lg border border-[#1a1a22] bg-[#070708] px-4 py-3 text-left text-sm text-zinc-300 transition hover:-translate-y-0.5 hover:border-cyber/30 hover:text-cyber hover:bg-cyber/5"
                                            >
                                                {option}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                                <div className="text-xs text-[#52525b] font-mono">
                                    Thanks for your patience. Full-quality mode is returning soon.
                                </div>
                                <button
                                    onClick={() => setShowMaintenance(false)}
                                    className="rounded-md border border-zinc-700 px-5 py-2.5 text-xs font-mono uppercase font-bold text-slate-200 transition hover:border-toxic hover:text-toxic hover:bg-toxic/5"
                                >
                                    Continue anyway
                                </button>
                            </div>
                        </div>
                    </dialog>
                </div>
            )}

            <div className="chat-shell flex h-[100dvh] min-h-[100dvh] flex-col overflow-hidden">
                <header className="border-b border-[#1a1a22] bg-[#0e0e11]/85 backdrop-blur-xl">
                    <div className="mx-auto flex w-full max-w-4xl items-center gap-3 px-4 py-4 sm:px-6">
                        <Link
                            to="/lab"
                            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-[#1a1a22] bg-[#070708] text-zinc-400 transition-colors hover:border-toxic/30 hover:text-toxic"
                            aria-label="Back to Lab"
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                            </svg>
                        </Link>

                        <div className="flex h-11 w-11 items-center justify-center rounded-md bg-toxic/15 border border-toxic/30 text-sm font-bold text-toxic shadow-lg">
                            G
                        </div>

                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-display font-bold text-slate-100 sm:text-base">Gaurav Portfolio AI</p>
                            <div className="mt-1 flex flex-wrap items-center gap-2 text-[10px] font-mono text-[#52525b]">
                                <span className="rounded-md border border-toxic/25 bg-toxic/5 px-2 py-0.5 text-toxic">
                                    RAG + DeepSeek
                                </span>
                                <span className="rounded-md border border-[#1a1a22] bg-[#070708] px-2 py-0.5 text-zinc-400">
                                    Portfolio-only answers
                                </span>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="chat-scroll flex-1 overflow-y-auto">
                    <div className="mx-auto flex w-full max-w-4xl flex-col gap-4 px-4 py-6 pb-28 sm:px-6 sm:pb-6">
                        <div className="rounded-lg border border-[#1a1a22] bg-[#0e0e11] p-4 sm:p-5">
                            <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono uppercase tracking-[0.18em] text-[#52525b]">
                                <span className="text-toxic">Production Feature</span>
                                <span className="rounded-md border border-[#1a1a22] bg-[#070708] px-2.5 py-1 tracking-normal text-zinc-300">
                                    Fast retrieval
                                </span>
                                <span className="rounded-md border border-[#1a1a22] bg-[#070708] px-2.5 py-1 tracking-normal text-zinc-300">
                                    Mongo history logs
                                </span>
                            </div>
                            <p className="mt-3 text-sm leading-relaxed text-[#a1a1aa] font-sans">
                                This assistant only answers from Gaurav's structured portfolio knowledge base.
                                Unrelated questions are blocked, and missing details are not invented.
                            </p>
                        </div>

                        {messages.map((message) => (
                            <ChatMessage
                                key={message.id}
                                role={message.role}
                                content={message.content}
                                timestamp={message.timestamp}
                                sources={message.sources}
                                followUpSuggestions={message.followUpSuggestions}
                                onSuggestionClick={(suggestion) => void sendMessage(suggestion)}
                            />
                        ))}

                        {showSuggestions && !isLoading && (
                            <div className="rounded-lg border border-[#1a1a22] bg-[#0e0e11] p-4 sm:p-5">
                                <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-[#52525b]">
                                    Suggested Questions
                                </p>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {SUGGESTED_QUESTIONS.map((question) => (
                                        <button
                                            key={question}
                                            onClick={() => void sendMessage(question)}
                                            className="rounded-lg border border-[#1a1a22] bg-[#070708] px-3.5 py-2 text-xs font-mono text-[#a1a1aa] transition-all hover:-translate-y-0.5 hover:border-toxic/30 hover:text-toxic hover:bg-toxic/5"
                                        >
                                            {question}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {isLoading && <TypingIndicator />}

                        <div ref={scrollAnchorRef} />
                    </div>
                </div>

                <div className="sm:static fixed inset-x-0 bottom-0 z-20 border-t border-[#1a1a22] bg-[#0e0e11]/85 backdrop-blur-xl">
                    <div className="mx-auto w-full max-w-4xl px-4 py-4 sm:px-6 sm:py-4 pb-safe-area input-safe">
                        <div className="rounded-lg border border-[#1a1a22] bg-[#070708] p-3 shadow-2xl">
                            <div className="flex items-end gap-3">
                                <textarea
                                    ref={textareaRef}
                                    value={input}
                                    onChange={(event) => setInput(event.target.value.slice(0, 1000))}
                                    onKeyDown={handleKeyDown}
                                    rows={1}
                                    disabled={isLoading}
                                    placeholder="Ask me about projects, services, or my journey..."
                                    className="max-h-40 min-h-[52px] flex-1 resize-none bg-transparent px-3 py-3 text-sm leading-relaxed text-slate-100 outline-none placeholder:text-zinc-700 font-sans"
                                />

                                <button
                                    onClick={() => void sendMessage()}
                                    disabled={isLoading || !input.trim()}
                                    className={`inline-flex h-12 w-12 items-center justify-center rounded-md transition-all duration-200 ${
                                        isLoading || !input.trim()
                                            ? 'cursor-not-allowed bg-zinc-800 text-zinc-600'
                                            : 'bg-toxic text-obsidian shadow-lg hover:-translate-y-0.5 shadow-toxic/20'
                                    }`}
                                    aria-label="Send message"
                                >
                                    {isLoading ? (
                                        <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                        </svg>
                                    ) : (
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="mt-2 flex items-center justify-between gap-3 px-1 text-[10px] font-mono text-[#52525b]">
                            <span>Enter to send. Shift + Enter for a new line.</span>
                            <span>{input.length}/1000</span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default GauravChatbot
