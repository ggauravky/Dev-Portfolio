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
 * role: 'user' → right-aligned cyber/orange bubble
 * role: 'ai'   → left-aligned dark card bubble with G avatar
 */
function ChatMessage({ role, content, timestamp = null, sources = [], followUpSuggestions = [], onSuggestionClick = null }) {
    const isUser = role === 'user'
    const time = formatTime(timestamp)

    return (
        <div className={`msg-enter flex items-end gap-2 sm:gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>

            {/* Avatar */}
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono font-bold select-none border shadow-sm ${
                isUser
                    ? 'bg-cyber/10 border-cyber/30 text-cyber order-last'
                    : 'bg-toxic/15 border-toxic/30 text-toxic'
            }`}>
                {isUser ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                ) : 'G'}
            </div>

            {/* Bubble + timestamp */}
            <div className={`flex flex-col gap-1.5 max-w-[86%] sm:max-w-[72%] ${isUser ? 'items-end' : 'items-start'}`}>
                <div className={`px-4 py-2.5 rounded-lg text-sm sm:text-[15px] leading-relaxed whitespace-pre-wrap break-words ${
                    isUser
                        ? 'bg-cyber/10 border border-cyber/30 text-slate-100 rounded-br-sm shadow-md'
                        : 'bg-[#0e0e11] border border-[#1a1a22] text-[#a1a1aa] rounded-bl-sm shadow-sm'
                }`}>
                    {content}
                </div>

                {/* Timestamp */}
                {time && (
                    <span className="text-[9px] font-mono text-[#52525b] px-1 select-none">
                        {time}
                    </span>
                )}

                {!isUser && Array.isArray(sources) && sources.length > 0 && (
                    <div className="flex flex-wrap gap-1 px-1">
                        {sources.slice(0, 3).map((source) => (
                            <span
                                key={`${source.section}-${source.title}`}
                                className="rounded border border-toxic/20 bg-toxic/5 px-2.5 py-1 text-[9px] font-mono text-toxic"
                            >
                                {source.title}
                            </span>
                        ))}
                    </div>
                )}
                
                {!isUser && Array.isArray(followUpSuggestions) && followUpSuggestions.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2 pt-2 border-t border-[#1a1a22]/30 w-full">
                        {followUpSuggestions.map((suggestion) => (
                            <button
                                key={suggestion}
                                onClick={() => onSuggestionClick?.(suggestion)}
                                className="w-full sm:w-auto text-xs font-mono rounded border border-[#1a1a22] bg-[#070708] px-3.5 py-2 text-[#a1a1aa] hover:border-toxic/30 hover:text-toxic transition-all text-center"
                            >
                                {suggestion}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

ChatMessage.propTypes = {
    role: PropTypes.oneOf(['user', 'ai']).isRequired,
    content: PropTypes.string.isRequired,
    followUpSuggestions: PropTypes.arrayOf(PropTypes.string),
    onSuggestionClick: PropTypes.func,
    timestamp: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.string]),
    sources: PropTypes.arrayOf(PropTypes.shape({
        section: PropTypes.string,
        title: PropTypes.string,
    })),
}

export default ChatMessage
