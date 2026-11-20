// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Source: https://github.com/ggauravky/Dev-Portfolio
//
// The chat state of the site (P-chat-2, D-104). Opening it wipes an ink-raised
// panel up from the dock (the route wipe in reverse, --dur-slow), the chrome
// and dock recede, and the page underneath becomes inert. The composer sits
// where the dock was. Lazy chunk: nothing here loads until the visitor shows
// intent. Motion moments: the wipe, rows entering, the streaming caret.

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import { useFocusTrap } from '../../hooks/useFocusTrap'
import { prefersReducedMotion } from '../../lib/motion'
import { STARTERS } from './starters'
import { streamChat } from './chatStream'
import { clearThread, getSessionId, interrupted, readQuota, readThread, resetSession, writeQuota, writeThread } from './chatStore'
import { answerPlainText, parseAnswer, safeHref } from './answerFormat'
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

function Inline({ parts, onNavigate }) {
    return parts.map((part, i) => {
        if (part.t === 'strong') return <strong key={i} className="chat-strong">{part.v}</strong>
        if (part.t === 'link') {
            return part.internal
                ? <Link key={i} to={part.href} replace className="chat-link" onClick={onNavigate}>{part.v}</Link>
                : part.plain
                    ? <a key={i} href={part.href} className="chat-link">{part.v}</a>
                    : <a key={i} href={part.href} className="chat-link" target="_blank" rel="noopener noreferrer">{part.v}</a>
        }
        return part.v
    })
}

/** Paragraphs, lists, bold names and safe links (answerFormat.js); no innerHTML. */
function AnswerText({ text, onNavigate }) {
    const blocks = useMemo(() => parseAnswer(text), [text])
    return blocks.map((block, i) => {
        if (block.type === 'p') return <p key={i}><Inline parts={block.inline} onNavigate={onNavigate} /></p>
        const List = block.type === 'ol' ? 'ol' : 'ul'
        return (
            <List key={i}>
                {block.items.map((item, j) => <li key={j}><Inline parts={item} onNavigate={onNavigate} /></li>)}
            </List>
        )
    })
}

/**
 * Text arrives in bursts (a model's tokens, or a whole FAQ answer at once).
 * Reveal it at an even pace instead: each frame shows a share of what is left,
 * so it catches up within about a third of a second and never lags far behind.
 * Turns restored from storage, and reduced motion, show everything at once.
 */
function useSmoothText(text, live) {
    const [shown, setShown] = useState(live ? 0 : text.length)
    const shownRef = useRef(shown)
    useEffect(() => {
        if (prefersReducedMotion() || shownRef.current >= text.length) {
            shownRef.current = text.length
            setShown(text.length)
            return undefined
        }
        let frame = 0
        const step = () => {
            const left = text.length - shownRef.current
            if (left <= 0) return
            shownRef.current += Math.max(2, Math.ceil(left / 18))
            setShown(Math.min(shownRef.current, text.length))
            frame = requestAnimationFrame(step)
        }
        frame = requestAnimationFrame(step)
        return () => cancelAnimationFrame(frame)
    }, [text])
    if (shown >= text.length) return { visible: text, done: true }
    // Cut on a word boundary so half-words don't flicker.
    const cut = text.slice(0, shown)
    return { visible: cut.replace(/\S*$/, '') || cut, done: false }
}

const LIMIT_NOTES = {
    window: 'That’s the limit for a short burst of questions.',
    day: 'That’s today’s limit of questions for this chat.',
}

/** The answer itself, or the note that replaces it (rate limit, error). */
function TurnBody({ turn, isLast, onRetry, onNavigate, reveal }) {
    if (turn.status === 'limit') {
        return (
            <p className="chat-note">
                {LIMIT_NOTES[turn.scope] || LIMIT_NOTES.window} You can ask again at {timeFormat(turn.retryAt)}.
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
    const waiting = turn.status === 'streaming' && !turn.a
    return (
        <>
            {waiting ? <p className="chat-note chat-searching">Looking through Gaurav’s site</p> : null}
            {reveal.visible ? <AnswerText text={reveal.visible} onNavigate={onNavigate} /> : null}
            {turn.status === 'streaming' || !reveal.done ? <span className="chat-caret" aria-hidden="true" /> : null}
            {turn.status === 'stopped' ? <p className="chat-note">Stopped.</p> : null}
        </>
    )
}

TurnBody.propTypes = {
    turn: PropTypes.object.isRequired,
    isLast: PropTypes.bool,
    onRetry: PropTypes.func.isRequired,
    onNavigate: PropTypes.func.isRequired,
    reveal: PropTypes.shape({ visible: PropTypes.string, done: PropTypes.bool }).isRequired,
}

function CopyButton({ text }) {
    const [copied, setCopied] = useState(false)
    useEffect(() => {
        if (!copied) return undefined
        const timer = setTimeout(() => setCopied(false), 1600)
        return () => clearTimeout(timer)
    }, [copied])
    const copy = async () => {
        try {
            await navigator.clipboard.writeText(answerPlainText(text))
            setCopied(true)
        } catch { /* clipboard blocked: nothing to do */ }
    }
    return (
        <button type="button" className="chat-text-btn chat-copy" onClick={copy}>
            <span aria-live="polite">{copied ? 'Copied' : 'Copy'}</span>
        </button>
    )
}

CopyButton.propTypes = { text: PropTypes.string.isRequired }

function SourceLink({ source, onNavigate }) {
    const link = safeHref(source.url)
    if (!link) return <span>{source.title}</span>
    return link.internal
        ? <Link to={link.href} replace className="chat-link" onClick={onNavigate}>{source.title}</Link>
        : (
            <a href={link.href} className="chat-link" target="_blank" rel="noopener noreferrer">
                {source.title}<span className="sr-only"> (opens in a new tab)</span>
            </a>
        )
}

SourceLink.propTypes = { source: PropTypes.object.isRequired, onNavigate: PropTypes.func.isRequired }

function Turn({ turn, onAsk, onRetry, onNavigate, isLast, locked }) {
    const streaming = turn.status === 'streaming'
    const reveal = useSmoothText(turn.a || '', streaming)
    // Sources and follow-ups appear once the answer has finished showing.
    const settled = turn.status === 'done' && reveal.done
    return (
        <li className="chat-turn">
            <div className="chat-row chat-row--q">
                <span className="chat-row__label">You asked</span>
                <p className="chat-row__q">{turn.q}</p>
            </div>
            <div className="chat-row chat-row--a" aria-busy={streaming || !reveal.done}>
                <span className="chat-row__label">Answer</span>
                <div className="chat-row__a">
                    <TurnBody turn={turn} isLast={isLast} onRetry={onRetry} onNavigate={onNavigate} reveal={reveal} />

                    {settled && turn.a ? (
                        <div className="chat-meta">
                            {turn.sources?.length ? (
                                <p className="chat-sources">
                                    <span className="chat-sources__label">From</span>
                                    {turn.sources.map((source, i) => (
                                        <span key={source.url}>
                                            {i ? <span className="chat-sources__sep" aria-hidden="true"> · </span> : null}
                                            <SourceLink source={source} onNavigate={onNavigate} />
                                        </span>
                                    ))}
                                </p>
                            ) : <span />}
                            <CopyButton text={turn.a} />
                        </div>
                    ) : null}

                    {isLast && settled && turn.followUps?.length ? (
                        <div className="chat-follow" role="group" aria-label="Ask next">
                            {turn.followUps.map((question) => (
                                <button key={question} type="button" className="chat-chip" disabled={locked} onClick={() => onAsk(question)}>
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
    locked: PropTypes.bool,
}

const pad = (n) => String(n).padStart(2, '0')
const countdown = (ms) => {
    const total = Math.max(0, Math.ceil(ms / 1000))
    const h = Math.floor(total / 3600)
    const m = Math.floor((total % 3600) / 60)
    return h ? `${h}:${pad(m)}:${pad(total % 60)}` : `${m}:${pad(total % 60)}`
}

/** Shown at the end of the thread while the composer is locked by a limit. */
function LimitNotice({ until, now, scope, onNavigate }) {
    const at = timeFormat(new Date(until).toISOString())
    return (
        <section className="chat-lock" aria-labelledby="chat-lock-title">
            <h3 id="chat-lock-title" className="chat-lock__title" tabIndex={-1}>
                {scope === 'day' ? 'That’s all for today' : 'Time for a short pause'}
            </h3>
            <p className="chat-lock__text">
                {scope === 'day'
                    ? 'This chat has reached today’s question limit.'
                    : 'You’ve asked a lot of questions in a few minutes.'}
                {' '}You can ask again at {at}.
            </p>
            <p className="chat-lock__time" aria-hidden="true">
                <span className="chat-lock__count">{countdown(until - now)}</span>
                <span className="chat-lock__unit">until you can ask again</span>
            </p>
            <p className="chat-lock__more">
                Meanwhile, everything is on the site:{' '}
                <Link to="/projects" replace className="chat-link" onClick={onNavigate}>Projects</Link>
                <span aria-hidden="true"> · </span>
                <Link to="/journey" replace className="chat-link" onClick={onNavigate}>Journey</Link>
                <span aria-hidden="true"> · </span>
                <Link to="/contact" replace className="chat-link" onClick={onNavigate}>Contact Gaurav</Link>
            </p>
        </section>
    )
}

LimitNotice.propTypes = {
    until: PropTypes.number.isRequired,
    now: PropTypes.number.isRequired,
    scope: PropTypes.string,
    onNavigate: PropTypes.func.isRequired,
}

const QUOTA_FROM = 5 // the meter shows once this many questions or fewer are left

/** "3 questions left" with a hairline meter, once few are left. */
function QuotaLine({ quota, locked }) {
    if (locked || typeof quota.left !== 'number' || quota.left > QUOTA_FROM || !quota.limit) return null
    // The window reset while the chat stayed open: the count is old news.
    if (quota.resetAt && Date.parse(quota.resetAt) <= Date.now()) return null
    const share = Math.max(0, Math.min(1, quota.left / quota.limit))
    const when = quota.resetAt ? timeFormat(quota.resetAt) : ''
    return (
        <p className="chat__quota">
            <span className="chat__quota-meter" aria-hidden="true">
                <span style={{ transform: `scaleX(${share})` }} />
            </span>
            <span>
                {quota.left === 1 ? '1 question left' : `${quota.left} questions left`}
                {when ? `${quota.scope === 'day' ? ' today' : ''}, more at ${when}` : ''}
            </span>
        </p>
    )
}

QuotaLine.propTypes = { quota: PropTypes.object.isRequired, locked: PropTypes.bool }

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
    // { left, limit, scope, resetAt } from the last answer; `until` once a limit is hit.
    const [quota, setQuota] = useState(readQuota)
    const [now, setNow] = useState(() => Date.now())
    const [atBottom, setAtBottom] = useState(true)

    const rootRef = useRef(null)
    const scrollRef = useRef(null)
    const colRef = useRef(null)
    const inputRef = useRef(null)
    const abortRef = useRef(null)
    const stickRef = useRef(true)
    const historyPushed = useRef(false)

    const visible = phase !== 'closed'
    const streaming = thread.some((t) => t.status === 'streaming')
    const lockedUntil = quota.until ? Date.parse(quota.until) || 0 : 0
    const locked = lockedUntil > now

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
        // A locked composer can't take focus: start on the heading instead.
        initialFocusRef: touchFirst || locked ? headingRef : inputRef,
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

    // The answer grows inside its row while it is revealed, without a thread
    // change: keep the view pinned to the bottom as the column grows.
    // With no conversation yet, the chat opens at the top (heading, intro and
    // starters), never scrolled to the bottom while fonts and starters lay out.
    const threadLength = useRef(thread.length)
    threadLength.current = thread.length
    useEffect(() => {
        const col = colRef.current
        const node = scrollRef.current
        if (!visible || !col || !node) return undefined
        if (!threadLength.current) node.scrollTop = 0
        if (typeof ResizeObserver === 'undefined') return undefined
        const observer = new ResizeObserver(() => {
            if (stickRef.current && threadLength.current) node.scrollTop = node.scrollHeight
        })
        observer.observe(col)
        return () => observer.disconnect()
    }, [visible])

    const onScroll = () => {
        const node = scrollRef.current
        if (!node) return
        stickRef.current = node.scrollHeight - node.scrollTop - node.clientHeight < 80
        if (stickRef.current !== atBottom) setAtBottom(stickRef.current)
    }

    const toLatest = () => {
        const node = scrollRef.current
        if (!node) return
        stickRef.current = true
        setAtBottom(true)
        node.scrollTo({ top: node.scrollHeight, behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
    }

    // When a lock starts, the composer is disabled under the caret: move focus
    // to the notice so keyboard and screen-reader users land on the reason.
    const wasLocked = useRef(locked)
    useEffect(() => {
        if (locked && !wasLocked.current) {
            requestAnimationFrame(() => document.getElementById('chat-lock-title')?.focus({ preventScroll: false }))
        }
        wasLocked.current = locked
    }, [locked])

    // ── limits: remember what is left; while locked, count down each second ──
    useEffect(() => { writeQuota(quota) }, [quota])
    useEffect(() => {
        if (!lockedUntil || lockedUntil <= Date.now()) return undefined
        const timer = window.setInterval(() => {
            const t = Date.now()
            setNow(t)
            if (t >= lockedUntil) {
                window.clearInterval(timer)
                setQuota((q) => ({ ...q, until: null, left: undefined }))
                setAnnounce('You can ask questions again.')
            }
        }, 1000)
        return () => window.clearInterval(timer)
    }, [lockedUntil])

    // ── asking ─────────────────────────────────────────────────────────────
    const update = (id, patch) => setThread((turns) => turns.map((t) => (t.id === id ? { ...t, ...(typeof patch === 'function' ? patch(t) : patch) } : t)))

    const ask = useCallback(async (raw, replaceId = null) => {
        const q = String(raw || '').trim()
        if (abortRef.current) return
        if (quota.until && Date.parse(quota.until) > Date.now()) return
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
                onDone: ({ sources, followUps, quota: left }) => {
                    update(id, { status: 'done', sources, followUps })
                    setAnnounce(answer)
                    if (left && typeof left.left === 'number') {
                        // The last question of the window: lock now, not after a refused one.
                        setQuota(left.left > 0 ? left : { ...left, until: left.resetAt })
                        setNow(Date.now())
                    }
                },
                onLimit: (retryAt, scope) => {
                    update(id, { status: 'limit', retryAt, scope })
                    setQuota((q) => ({ ...q, left: 0, scope, until: retryAt }))
                    setNow(Date.now())
                    setAnnounce(`You have reached the question limit. You can ask again at ${timeFormat(retryAt)}.`)
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
    }, [thread, touchFirst, quota.until])

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
        else if (!locked) ask(draft)
    }

    const onKeyDown = (event) => {
        if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
            event.preventDefault()
            if (!streaming && !locked) ask(draft)
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
                <div ref={colRef} className="chat__col">
                    <header className="chat__head">
                        <h2 id="chat-title" ref={headingRef} tabIndex={-1} className="chat__greeting">Ask about Gaurav’s work.</h2>
                        <p className="chat__lede">
                            Answers come only from Gaurav’s own material: this site and his public projects.
                            Questions are stored for 180 days to improve the answers.
                        </p>
                    </header>

                    {empty ? (
                        <ol className="chat-starters" aria-label="Questions to start with">
                            {STARTERS.map((starter, i) => (
                                <li key={starter}>
                                    <button type="button" className="chat-starter" disabled={locked} onClick={() => ask(starter)}>
                                        <span className="chat-starter__n" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                                        <span className="chat-starter__text">{starter}</span>
                                        <span className="chat-starter__go" aria-hidden="true">→</span>
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
                                    locked={locked}
                                />
                            ))}
                        </ol>
                    )}

                    {locked ? <LimitNotice until={lockedUntil} now={now} scope={quota.scope} onNavigate={onNavigate} /> : null}
                </div>
            </div>

            {!atBottom && thread.length ? (
                <button type="button" className="chat__latest" onClick={toLatest}>
                    Latest <span aria-hidden="true">↓</span>
                </button>
            ) : null}

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
                    placeholder={locked ? `You can ask again at ${timeFormat(new Date(lockedUntil).toISOString())}` : 'Ask about a project, the journey, skills or services…'}
                    disabled={locked}
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
                <button type="submit" className="chat__send" disabled={locked && !streaming}>
                    {streaming ? 'Stop' : 'Ask'}
                </button>
                {inputError
                    ? <p id="chat-input-error" className="chat__error" role="alert">{inputError}</p>
                    : <QuotaLine quota={quota} locked={locked} />}
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
