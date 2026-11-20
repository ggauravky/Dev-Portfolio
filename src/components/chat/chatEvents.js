// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Source: https://github.com/ggauravky/Dev-Portfolio
//
// The tiny eager part of the chat (P-chat-2): an event to open it and the lazy
// chunk loader. Everything else lives in the ChatSurface chunk, fetched only on
// intent (hover, focus or touch on the trigger).

export const OPEN_CHAT_EVENT = 'open-chat'

/** Off with VITE_CHAT_ENABLED=false (a non-secret switch; the API has CHAT_ENABLED). */
export const CHAT_ENABLED = import.meta.env.VITE_CHAT_ENABLED !== 'false'

export const loadChatSurface = () => import('./ChatSurface')

let prefetched = false
export function prefetchChat() {
    if (prefetched || !CHAT_ENABLED) return
    prefetched = true
    loadChatSurface().catch(() => { prefetched = false })
}

export const openChat = (question) => window.dispatchEvent(new CustomEvent(OPEN_CHAT_EVENT, { detail: { question } }))
