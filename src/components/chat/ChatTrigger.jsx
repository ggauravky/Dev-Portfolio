// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Source: https://github.com/ggauravky/Dev-Portfolio
//
// The chat trigger, a second pill beside the dock (D-104). Since D-114 it reads
// like a search box, "Ask about my work" with a search mark ("Ask" on narrow
// screens). Same height, hairline and radius as the dock. Hover, focus or touch fetches
// the chat chunk; a click opens it. On a first visit it gives one quiet pulse
// (paper hairline, not lime), never under reduced motion.

import { useEffect, useRef, useState } from 'react'
import { useMagnetic } from '../../hooks/useMagnetic'
import { prefersReducedMotion } from '../../lib/motion'
import { CHAT_ENABLED, openChat, prefetchChat } from './chatEvents'

const HINT_KEY = 'gky_chat_hint'

function ChatTrigger() {
    const ref = useRef(null)
    const [hint, setHint] = useState(false)
    useMagnetic(ref, { max: 4, strength: 0.2 })

    useEffect(() => {
        if (!CHAT_ENABLED || prefersReducedMotion()) return undefined
        let seen = true
        try { seen = window.localStorage.getItem(HINT_KEY) === '1' } catch { /* storage blocked: no hint */ }
        if (seen) return undefined
        const timer = window.setTimeout(() => {
            setHint(true)
            try { window.localStorage.setItem(HINT_KEY, '1') } catch { /* ignore */ }
        }, 2500)
        return () => window.clearTimeout(timer)
    }, [])

    if (!CHAT_ENABLED) return null

    return (
        <button
            ref={ref}
            type="button"
            className={`chat-trigger ${hint ? 'is-hinting' : ''}`}
            aria-label="Ask the site assistant about Gaurav"
            aria-haspopup="dialog"
            onPointerEnter={prefetchChat}
            onFocus={prefetchChat}
            onTouchStart={prefetchChat}
            onAnimationEnd={() => setHint(false)}
            onClick={() => openChat()}
        >
            <svg className="chat-trigger__icon" viewBox="0 0 16 16" width="15" height="15" aria-hidden="true">
                <circle cx="7" cy="7" r="4.75" fill="none" stroke="currentColor" strokeWidth="1.5" />
                <path d="M10.6 10.6 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span className="chat-trigger__long">Ask about my work</span>
            <span className="chat-trigger__short" aria-hidden="true">Ask</span>
        </button>
    )
}

export default ChatTrigger
