// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Source: https://github.com/ggauravky/Dev-Portfolio
//
// The chat trigger: a segment inside the idle dock pill, after a hairline
// (unslop audit X-3, D-115; it was a second pill beside the dock, D-104/D-114).
// A search mark and "Ask". Hover, focus or touch fetches the chat chunk; a
// click opens it. It never opens the dock menu (Dock.jsx opens on the page
// trigger only), and while the menu is open the same action is a menu item.
// No pulse and no magnetic pull: it is quiet chrome, not a live element.

import { CHAT_ENABLED, openChat, prefetchChat } from './chatEvents'

function ChatTrigger() {
    if (!CHAT_ENABLED) return null

    return (
        <button
            type="button"
            className="dock-ask"
            aria-label="Ask the site assistant about Gaurav"
            aria-haspopup="dialog"
            onPointerEnter={prefetchChat}
            onFocus={prefetchChat}
            onTouchStart={prefetchChat}
            onClick={() => openChat()}
        >
            <svg className="dock-ask__icon" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
                <circle cx="7" cy="7" r="4.75" fill="none" stroke="currentColor" strokeWidth="1.5" />
                <path d="M10.6 10.6 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span aria-hidden="true">Ask</span>
        </button>
    )
}

export default ChatTrigger
