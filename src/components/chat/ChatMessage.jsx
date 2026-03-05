// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Unauthorized copying, modification, or distribution of this software,
// via any medium, is strictly prohibited without the express written
// consent of the author. See LICENSE for details.
// Source: https://github.com/ggauravky/Dev-Portfolio

import PropTypes from 'prop-types'

// Format timestamp: "2:34 PM"
const formatTime = (date) => {
    if (!date) return ''
    try {
        return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } catch {
        return ''
    }
}

/**
 * ChatMessage — single chat bubble with avatar and timestamp.
 * role: 'user' → right-aligned blue/indigo bubble
 * role: 'ai'   → left-aligned dark bubble with G avatar
 */
function ChatMessage({ role, content, timestamp }) {
    const isUser = role === 'user'
    const time = formatTime(timestamp)

    return (
        <div className={`msg-enter flex items-end gap-2 sm:gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>

            {/* Avatar */}
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold select-none shadow-sm ${
                isUser
                    ? 'bg-slate-700 text-slate-300 order-last'
                    : 'bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 text-white shadow-indigo-500/25'
            }`}>
                {isUser ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                ) : 'G'}
            </div>

            {/* Bubble + timestamp */}
            <div className={`flex flex-col gap-1 max-w-[78%] sm:max-w-[72%] ${isUser ? 'items-end' : 'items-start'}`}>
                <div className={`px-4 py-2.5 rounded-2xl text-sm sm:text-[15px] leading-relaxed whitespace-pre-wrap break-words ${
                    isUser
                        ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-br-sm shadow-md shadow-indigo-500/20'
                        : 'bg-slate-800/90 border border-slate-700/40 text-slate-200 rounded-bl-sm shadow-sm shadow-slate-900/40'
                }`}>
                    {content}
                </div>

                {/* Timestamp */}
                {time && (
                    <span className="text-[10px] text-slate-700 px-1 select-none">
                        {time}
                    </span>
                )}
            </div>
        </div>
    )
}

ChatMessage.propTypes = {
    role: PropTypes.oneOf(['user', 'ai']).isRequired,
    content: PropTypes.string.isRequired,
    timestamp: PropTypes.instanceOf(Date),
}

ChatMessage.defaultProps = {
    timestamp: null,
}

export default ChatMessage
