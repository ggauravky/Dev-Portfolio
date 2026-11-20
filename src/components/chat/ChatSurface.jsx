// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Source: https://github.com/ggauravky/Dev-Portfolio
//
// The chat state of the site (P-chat-2, D-104). Opening it wipes an ink-raised
// panel up from the dock (the route wipe in reverse, --dur-slow), the chrome
// and dock recede, and the page underneath becomes inert. The composer sits
// where the dock was. Lazy chunk: nothing here loads until the visitor shows
// intent. Motion moments: the wipe, rows entering, the streaming caret.

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import { useFocusTrap } from '../../hooks/useFocusTrap'
import { prefersReducedMotion } from '../../lib/motion'
import { STARTERS } from './starters'
import { streamChat } from './chatStream'
import { clearThread, getSessionId, interrupted, readThread, resetSession, writeThread } from './chatStore'
// cssCodeSplit is off (D-046), so a plain import would put this CSS in the one
// render-blocking stylesheet on every page. It ships with this lazy chunk instead.
import chatCss from './ChatSurface.css?inline'

if (typeof document !== 'undefined' && !document.getElementById('chat-surface-css')) {
    const style = document.createElement('style')
    style.id = 'chat-surface-css'
    style.textContent = chatCss
    document.head.appendChild(style)
}

const MAX_CHARS = 500
const COUNTER_FROM = 400
const HISTORY_TURNS = 2

const newId = () => Math.random().toString(36).slice(2, 10)

const timeFormat = (iso) => {
    try {
        return new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit' }).format(new Date(iso))
    } catch {
        return 'in a few minutes'
    }
}

const ERRORS = {
    TOO_LONG: `Keep questions under ${MAX_CHARS} characters.`,
    EMPTY_QUESTION: 'Type a question first.',
    NETWORK: "The assistant couldn't be reached. Check your connection and try again.",
    DEFAULT: 'Something went wrong on the assistant’s side. Please try again.',
}

/** Map a failed request to an ERRORS key: a known server code, a fetch failure, or the default. */
function errorCode(error) {
    if (error?.code && ERRORS[error.code]) return error.code
    if (error?.name === 'TypeError') return 'NETWORK'
    return 'DEFAULT'
}

// in → open and out → closed when the wipe ends (or its fail-safe timer fires).
const SETTLED = { in: 'open', out: 'closed' }

// Site paths in parentheses and full URLs become links; everything else is text.
const LINK_RE = /(\((\/[\w\-/#.]*)\))|(https?:\/\/[^\s)]+)/g

function Linked({ text, onNavigate }) {
    const parts = []
    let last = 0
    for (const match of text.matchAll(LINK_RE)) {
        if (match.index > last) parts.push(text.slice(last, match.index))
        if (match[2]) {
            parts.push('(')
            parts.push(<Link key={match.index} to={match[2]} replace className="chat-link" onClick={onNavigate}>{match[2]}</Link>)
            parts.push(')')
        } else {
            parts.push(<a key={match.index} href={match[3]} className="chat-link" target="_blank" rel="noopener noreferrer">{match[3]}</a>)
        }
        last = match.index + match[0].length
    }
    if (last < text.length) parts.push(text.slice(last))
    return parts
}

// Models sometimes add markdown despite the prompt; show it as plain text.
const plain = (text) => text
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/__(.+?)__/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/`([^`]+)`/g, '$1')

/** Plain-text answer → paragraphs and "- " lists. */
function AnswerText({ text, onNavigate }) {
    const blocks = plain(text).split(/\n{2,}/)
    return blocks.map((block, i) => {
        const lines = block.split('\n')
        const items = lines.filter((line) => /^\s*[-•]\s+/.test(line))
        if (items.length && items.length >= lines.length - 1) {
            const lead = lines.find((line) => !/^\s*[-•]\s+/.test(line))
            return (
                <div key={i}>
                    {lead ? <p><Linked text={lead} onNavigate={onNavigate} /></p> : null}
                    <ul>
                        {items.map((line, j) => <li key={j}><Linked text={line.replace(/^\s*[-•]\s+/, '')} onNavigate={onNavigate} /></li>)}
                    </ul>
                </div>
            )
        }
        return <p key={i}><Linked text={block} onNavigate={onNavigate} /></p>
    })
}

/** The answer itself, or the note that replaces it (rate limit, error). */
function TurnBody({ turn, isLast, onRetry, onNavigate }) {
    if (turn.status === 'limit') {
        return (
            <p className="chat-note">
                That’s a lot of questions in a short time. You can ask again at {timeFormat(turn.retryAt)}.
            </p>
        )
    }
    if (turn.status === 'error') {
        return (
            <p className="chat-note">
                {ERRORS[turn.error] || ERRORS.DEFAULT}{' '}
                {isLast ? <button type="button" className="chat-inline-btn" onClick={() => onRetry(turn)}>Try again</button> : null}
            </p>
        )
    }
    return (
        <>
            {turn.a ? <AnswerText text={turn.a} onNavigate={onNavigate} /> : null}
            {turn.status === 'streaming' ? <span className="chat-caret" aria-hidden="true" /> : null}
            {turn.status === 'stopped' ? <p className="chat-note">Stopped.</p> : null}
        </>
    )
}

TurnBody.propTypes = {
    turn: PropTypes.object.isRequired,
    isLast: PropTypes.bool,
    onRetry: PropTypes.func.isRequired,
    onNavigate: PropTypes.func.isRequired,
}

function Turn({ turn, onAsk, onRetry, onNavigate, isLast }) {
    const streaming = turn.status === 'streaming'
    return (
        <li className="chat-turn">
            <div className="chat-row chat-row--q">
                <span className="chat-row__label">You asked</span>
                <p className="chat-row__q">{turn.q}</p>
            </div>
            <div className="chat-row chat-row--a" aria-busy={streaming}>
                <span className="chat-row__label">Answer</span>
                <div className="chat-row__a">
                    <TurnBody turn={turn} isLast={isLast} onRetry={onRetry} onNavigate={onNavigate} />

                    {turn.status === 'done' && turn.sources?.length ? (
                        <p className="chat-sources">
                            <span className="chat-sources__label">From</span>
                            {turn.sources.map((source, i) => (
                                <span key={source.url}>
                                    {i ? <span className="chat-sources__sep" aria-hidden="true"> · </span> : null}
                                    <Link to={source.url} replace className="chat-link" onClick={onNavigate}>{source.title}</Link>
                                </span>
                            ))}
                        </p>
                    ) : null}

                    {isLast && turn.status === 'done' && turn.followUps?.length ? (
                        <div className="chat-follow" role="group" aria-label="Ask next">
                            {turn.followUps.map((question) => (
                                <button key={question} type="button" className="chat-chip" onClick={() => onAsk(question)}>
                                    {question}
                                </button>
                            ))}
                        </div>
                    ) : null}
                </div>
            </div>
        </li>
    )
}

Turn.propTypes = {
    turn: PropTypes.object.isRequired,
    onAsk: PropTypes.func.isRequired,
    onRetry: PropTypes.func.isRequired,
    onNavigate: PropTypes.func.isRequired,
    isLast: PropTypes.bool,
}

// Keeps the surface the height of the visible viewport, so the on-screen
// keyboard never covers the composer (iOS/Android).
function useVisualViewport(ref, active) {
    useEffect(() => {
        const vv = window.visualViewport
        if (!active || !vv || !ref.current) return undefined
        const node = ref.current
        const update = () => {
            node.style.setProperty('--chat-vh', `${vv.height}px`)
            node.style.setProperty('--chat-vtop', `${vv.offsetTop}px`)
        }
        update()
        vv.addEventListener('resize', update)
        vv.addEventListener('scroll', update)
        return () => {
            vv.removeEventListener('resize', update)
            vv.removeEventListener('scroll', update)
        }
    }, [ref, active])
}

function ChatSurface({ open, question, onClose, returnFocusTo }) {
    const [phase, setPhase] = useState(open ? 'in' : 'closed') // in | open | out | closed
    const [thread, setThread] = useState(readThread)
    const [draft, setDraft] = useState('')
    const [inputError, setInputError] = useState('')
    const [announce, setAnnounce] = useState('')

    const rootRef = useRef(null)
    const scrollRef = useRef(null)
    const inputRef = useRef(null)
    const abortRef = useRef(null)
    const stickRef = useRef(true)
    const historyPushed = useRef(false)

    const visible = phase !== 'closed'
    const streaming = thread.some((t) => t.status === 'streaming')

    // ── open / close lifecycle ─────────────────────────────────────────────
    useEffect(() => {
        if (open) setPhase((p) => (p === 'closed' || p === 'out' ? 'in' : p))
        else setPhase((p) => (p === 'closed' || prefersReducedMotion() ? 'closed' : 'out'))
    }, [open])

    // Reduced motion skips the wipe; a timer finishes it if animationend never fires.
    useEffect(() => {
        if (phase === 'in' && prefersReducedMotion()) setPhase('open')
        if (!SETTLED[phase]) return undefined
        const timer = window.setTimeout(() => setPhase((p) => SETTLED[p] || p), 700)
        return () => window.clearTimeout(timer)
    }, [phase])

    useLayoutEffect(() => {
        if (!visible) return undefined
        const html = document.documentElement
        const main = document.getElementById('main-content')
        const skip = document.querySelector('.skip-link')
        html.classList.add('chat-open')
        main?.setAttribute('inert', '')
        skip?.setAttribute('inert', '')
        return () => {
            html.classList.remove('chat-open')
            main?.removeAttribute('inert')
            skip?.removeAttribute('inert')
        }
    }, [visible])

    // Browser Back closes the chat: one history entry while it's open.
    useEffect(() => {
        if (!open) return undefined
        if (!historyPushed.current) {
            window.history.pushState({ ...(window.history.state || {}), gkyChat: true }, '')
            historyPushed.current = true
        }
        const onPop = () => {
            historyPushed.current = false
            onClose()
        }
        window.addEventListener('popstate', onPop)
        return () => window.removeEventListener('popstate', onPop)
    }, [open, onClose])

    const close = useCallback(() => {
        abortRef.current?.abort()
        if (historyPushed.current && window.history.state?.gkyChat) {
            historyPushed.current = false
            window.history.back() // popstate → onClose
        } else {
            onClose()
        }
    }, [onClose])

    const onAnimationEnd = (event) => {
        if (event.target === event.currentTarget && SETTLED[phase]) setPhase(SETTLED[phase])
    }

    // Active through the closing wipe: it restores focus only after the chrome
    // and dock are visible again (layout cleanups run before this one).
    // Touch screens start on the heading, so the keyboard doesn't cover the
    // starters the moment the chat opens; pointers start in the composer.
    const headingRef = useRef(null)
    const [touchFirst] = useState(() => typeof window !== 'undefined' && window.matchMedia?.('(pointer: coarse)').matches)
    useFocusTrap(rootRef, visible, {
        onEscape: () => (abortRef.current ? abortRef.current.abort() : close()),
        initialFocusRef: touchFirst ? headingRef : inputRef,
        returnFocusTo,
    })
    useVisualViewport(rootRef, visible)

    // ── thread persistence and scrolling ──────────────────────────────────
    useEffect(() => {
        if (!streaming) writeThread(thread)
    }, [thread, streaming])

    useEffect(() => {
        const node = scrollRef.current
        if (node && thread.length && stickRef.current) node.scrollTop = node.scrollHeight
    }, [thread])

    const onScroll = () => {
        const node = scrollRef.current
        if (node) stickRef.current = node.scrollHeight - node.scrollTop - node.clientHeight < 80
    }

    // ── asking ─────────────────────────────────────────────────────────────
    const update = (id, patch) => setThread((turns) => turns.map((t) => (t.id === id ? { ...t, ...(typeof patch === 'function' ? patch(t) : patch) } : t)))

    const ask = useCallback(async (raw, replaceId = null) => {
        const q = String(raw || '').trim()
        if (abortRef.current) return
        if (!q) {
            setInputError(ERRORS.EMPTY_QUESTION)
            return
        }
        if (q.length > MAX_CHARS) {
            setInputError(ERRORS.TOO_LONG)
            return
        }
        setInputError('')
        setDraft('')
        stickRef.current = true

        const id = newId()
        const history = thread.filter((t) => t.status === 'done' && t.id !== replaceId).slice(-HISTORY_TURNS).map((t) => t.q)
        const turn = { id, q, a: '', status: 'streaming', sources: [], followUps: [] }
        setThread((turns) => [...turns.filter((t) => t.id !== replaceId), turn])
        setAnnounce('')

        const controller = new AbortController()
        abortRef.current = controller
        let answer = ''
        try {
            await streamChat({
                sessionId: getSessionId(),
                question: q,
                history,
                signal: controller.signal,
                onDelta: (text) => {
                    answer += text
                    update(id, (t) => ({ a: t.a + text }))
                },
                onDone: ({ sources, followUps }) => {
                    update(id, { status: 'done', sources, followUps })
                    setAnnounce(answer)
                },
                onLimit: (retryAt) => {
                    update(id, { status: 'limit', retryAt })
                    setAnnounce(`Too many questions for now. You can ask again at ${timeFormat(retryAt)}.`)
                },
            })
        } catch (error) {
            if (controller.signal.aborted) {
                update(id, interrupted(answer))
            } else {
                const code = errorCode(error)
                update(id, { status: 'error', error: code })
                setAnnounce(ERRORS[code])
            }
        } finally {
            abortRef.current = null
            if (!touchFirst) requestAnimationFrame(() => inputRef.current?.focus({ preventScroll: true }))
        }
    }, [thread, touchFirst])

    // A question passed in (⌘K, a deep link) is asked once the surface is up.
    // The guard resets on close, so the same question can be passed in again,
    // and it is only set when a stream isn't already running (ask would skip it).
    const askedInitial = useRef(null)
    useEffect(() => {
        if (!open || !question) {
            askedInitial.current = null
            return
        }
        if (askedInitial.current !== question && !abortRef.current) {
            askedInitial.current = question
            ask(question)
        }
    }, [open, question, ask])

    useEffect(() => () => abortRef.current?.abort(), [])

    const stop = () => abortRef.current?.abort()
    const retry = (turn) => ask(turn.q, turn.id)
    const newChat = () => {
        stop()
        clearThread()
        resetSession()
        setThread([])
        setAnnounce('')
        inputRef.current?.focus()
    }
    // Following a link leaves the chat state for that page. Chat links navigate
    // with `replace`, so the destination takes the chat's own history entry
    // instead of stacking a duplicate of the page under it.
    const onNavigate = () => {
        abortRef.current?.abort()
        historyPushed.current = false
        onClose()
    }

    const submit = (event) => {
        event.preventDefault()
        if (streaming) stop()
        else ask(draft)
    }

    const onKeyDown = (event) => {
        if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
            event.preventDefault()
            if (!streaming) ask(draft)
        }
    }

    // Auto-grow the composer up to ~4 lines.
    useLayoutEffect(() => {
        const node = inputRef.current
        if (!node) return
        node.style.height = 'auto'
        node.style.height = `${Math.min(node.scrollHeight, 112)}px`
    }, [draft, visible])

    if (!visible) return null

    const empty = thread.length === 0
    const lastId = thread[thread.length - 1]?.id

    return (
        <div
            ref={rootRef}
            className={`chat chat--${phase}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="chat-title"
            onAnimationEnd={onAnimationEnd}
        >
            <div className="chat__bar">
                <span className="chat__mark">Ask<span className="chat__mark-name"> <span aria-hidden="true">·</span> <span translate="no">Gaurav Kumar Yadav</span></span></span>
                <div className="chat__bar-actions">
                    {!empty ? (
                        <button type="button" className="chat-text-btn" onClick={newChat}>New chat</button>
                    ) : null}
                    <button type="button" className="chat-text-btn" onClick={close}>
                        Close <kbd className="chat-kbd">Esc</kbd>
                    </button>
                </div>
            </div>

            <div ref={scrollRef} className="chat__scroll" onScroll={onScroll}>
                <div className="chat__col">
                    <header className="chat__head">
                        <h2 id="chat-title" ref={headingRef} tabIndex={-1} className="chat__greeting">Ask about Gaurav’s work.</h2>
                        <p className="chat__lede">
                            Answers come only from this site: his projects, journey, skills, services and blog.
                            Questions are stored for 180 days to improve the answers.
                        </p>
                    </header>

                    {empty ? (
                        <ol className="chat-starters" aria-label="Questions to start with">
                            {STARTERS.map((starter, i) => (
                                <li key={starter}>
                                    <button type="button" className="chat-starter" onClick={() => ask(starter)}>
                                        <span className="chat-starter__n" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                                        <span className="chat-starter__text">{starter}</span>
                                    </button>
                                </li>
                            ))}
                        </ol>
                    ) : (
                        <ol className="chat-thread" aria-label="Conversation">
                            {thread.map((turn) => (
                                <Turn
                                    key={turn.id}
                                    turn={turn}
                                    isLast={turn.id === lastId}
                                    onAsk={ask}
                                    onRetry={retry}
                                    onNavigate={onNavigate}
                                />
                            ))}
                        </ol>
                    )}
                </div>
            </div>

            <form className="chat__composer" onSubmit={submit}>
                <label htmlFor="chat-input" className="sr-only">Your question about Gaurav</label>
                <textarea
                    id="chat-input"
                    ref={inputRef}
                    className="chat__input"
                    rows={1}
                    value={draft}
                    name="question"
                    autoComplete="off"
                    placeholder="Ask about a project, the journey, skills or services…"
                    maxLength={MAX_CHARS + 50}
                    aria-describedby={inputError ? 'chat-input-error' : undefined}
                    aria-invalid={inputError ? true : undefined}
                    onChange={(event) => {
                        setDraft(event.target.value)
                        if (inputError && event.target.value.length <= MAX_CHARS) setInputError('')
                    }}
                    onKeyDown={onKeyDown}
                />
                {draft.length >= COUNTER_FROM ? (
                    <span className={`chat__count ${draft.length > MAX_CHARS ? 'is-over' : ''}`} aria-hidden="true">
                        {draft.length}/{MAX_CHARS}
                    </span>
                ) : null}
                <button type="submit" className="chat__send">
                    {streaming ? 'Stop' : 'Ask'}
                </button>
                {inputError ? <p id="chat-input-error" className="chat__error" role="alert">{inputError}</p> : null}
            </form>

            <div className="sr-only" aria-live="polite" aria-atomic="true">{announce}</div>
        </div>
    )
}

ChatSurface.propTypes = {
    open: PropTypes.bool.isRequired,
    question: PropTypes.string,
    onClose: PropTypes.func.isRequired,
    returnFocusTo: PropTypes.instanceOf(typeof HTMLElement === 'undefined' ? Object : HTMLElement),
}

export default ChatSurface
