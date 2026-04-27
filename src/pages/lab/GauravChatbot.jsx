import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import useSEO from '../../hooks/useSEO'
import ChatMessage from '../../components/chat/ChatMessage'
import TypingIndicator from '../../components/chat/TypingIndicator'

const SESSION_STORAGE_KEY = 'gaurav-chatbot-session-id'
const MESSAGES_STORAGE_KEY = 'gaurav-chatbot-messages'
const FALLBACK_MESSAGE = "I'm having trouble right now, please try again."

const SUGGESTED_QUESTIONS = [
    'What projects have you built?',
    'What technologies do you use?',
    'Tell me about your experience',
    'What services do you offer?',
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

const reviveMessages = (raw) => {
    try {
        const parsed = JSON.parse(raw)
        if (!Array.isArray(parsed) || parsed.length === 0) {
            return [createIntroMessage()]
        }

        return parsed.map((message) =>
            createMessage(message.role, message.content, {
                id: message.id,
                timestamp: message.timestamp ? new Date(message.timestamp) : new Date(),
                sources: message.sources,
                intro: message.intro,
            })
        )
    } catch {
        return [createIntroMessage()]
    }
}

const readInitialMessages = () => {
    // Always start fresh - no persistent chat history
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

    // Chat history persists only in current session; refreshing clears all messages
    // All messages are stored in database for analytics, but not displayed after page reload

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

                // If an intro already exists in the conversation, avoid re-adding intro-like replies
                const hasIntro = previous.some((m) => m.intro === true || m.id === 'gaurav-chatbot-intro')
                const isIntroLike = replyText.toLowerCase().includes("portfolio assistant") || replyText.toLowerCase().includes("ask me about")
                if (hasIntro && isIntroLike) {
                    // update existing intro message's timestamp and merge sources/followups instead of adding a new intro
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

                // Avoid adding duplicate consecutive assistant replies (helps when backend repeats the same text)
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

    return (
        <>
            <style>{`
                :root { --safe-area-inset-bottom: env(safe-area-inset-bottom); }

                .chat-shell {
                    background:
                        radial-gradient(circle at top right, rgba(34, 211, 238, 0.12), transparent 24%),
                        radial-gradient(circle at bottom left, rgba(59, 130, 246, 0.14), transparent 28%),
                        linear-gradient(180deg, #020617 0%, #020817 48%, #020617 100%);
                }

                .chat-scroll::-webkit-scrollbar {
                    width: 6px;
                }

                .chat-scroll::-webkit-scrollbar-thumb {
                    background: rgba(71, 85, 105, 0.9);
                    border-radius: 999px;
                }

                /* ensure bottom input area respects device safe area (notch) */
                .pb-safe-area { padding-bottom: env(safe-area-inset-bottom); }
                .input-safe { padding-bottom: calc(env(safe-area-inset-bottom) + 8px); }
            `}</style>

            <div className="chat-shell flex h-[100dvh] min-h-[100dvh] flex-col overflow-hidden">
                <header className="border-b border-slate-800/80 bg-slate-950/75 backdrop-blur-xl">
                    <div className="mx-auto flex w-full max-w-4xl items-center gap-3 px-4 py-4 sm:px-6">
                        <Link
                            to="/lab"
                            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/80 text-slate-300 transition-colors hover:border-cyan-500/40 hover:text-cyan-200"
                            aria-label="Back to Lab"
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                            </svg>
                        </Link>

                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 text-sm font-bold text-white shadow-lg shadow-cyan-900/30">
                            G
                        </div>

                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-slate-100 sm:text-base">Gaurav Portfolio AI</p>
                            <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                                <span className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2 py-0.5 text-emerald-300">
                                    RAG + DeepSeek
                                </span>
                                <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2 py-0.5 text-cyan-200">
                                    Portfolio-only answers
                                </span>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="chat-scroll flex-1 overflow-y-auto">
                    <div className="mx-auto flex w-full max-w-4xl flex-col gap-4 px-4 py-6 pb-28 sm:px-6 sm:pb-6">
                        <div className="rounded-3xl border border-slate-800/80 bg-slate-900/55 p-4 sm:p-5">
                            <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                                <span>Production Feature</span>
                                <span className="rounded-full border border-slate-700 px-2 py-0.5 tracking-normal text-slate-300">
                                    Fast retrieval
                                </span>
                                <span className="rounded-full border border-slate-700 px-2 py-0.5 tracking-normal text-slate-300">
                                    Mongo conversation history
                                </span>
                            </div>
                            <p className="mt-3 text-sm leading-7 text-slate-300 sm:text-[15px]">
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
                            <div className="rounded-3xl border border-slate-800/80 bg-slate-900/55 p-4 sm:p-5">
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                                    Suggested Questions
                                </p>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {SUGGESTED_QUESTIONS.map((question) => (
                                        <button
                                            key={question}
                                            onClick={() => void sendMessage(question)}
                                            className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-2 text-sm text-cyan-100 transition-all hover:-translate-y-0.5 hover:border-cyan-400/50 hover:bg-cyan-500/15"
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

                <div className="sm:static fixed inset-x-0 bottom-0 z-20 border-t border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
                    <div className="mx-auto w-full max-w-4xl px-4 py-4 sm:px-6 sm:py-4 pb-safe-area input-safe">
                        <div className="rounded-[28px] border border-slate-800 bg-slate-900/75 p-3 shadow-2xl shadow-black/25">
                            <div className="flex items-end gap-3">
                                <textarea
                                    ref={textareaRef}
                                    value={input}
                                    onChange={(event) => setInput(event.target.value.slice(0, 1000))}
                                    onKeyDown={handleKeyDown}
                                    rows={1}
                                    disabled={isLoading}
                                    placeholder="Ask me about my projects, skills, or journey..."
                                    className="max-h-40 min-h-[52px] flex-1 resize-none bg-transparent px-3 py-3 text-sm leading-6 text-slate-100 outline-none placeholder:text-slate-500 sm:text-[15px]"
                                />

                                <button
                                    onClick={() => void sendMessage()}
                                    disabled={isLoading || !input.trim()}
                                    className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl transition-all ${
                                        isLoading || !input.trim()
                                            ? 'cursor-not-allowed bg-slate-800 text-slate-600'
                                            : 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-900/30 hover:-translate-y-0.5'
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

                        <div className="mt-2 flex items-center justify-between gap-3 px-1 text-[11px] text-slate-500">
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
