// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Unauthorized copying, modification, or distribution of this software,
// via any medium, is strictly prohibited without the express written
// consent of the author. See LICENSE for details.
// Source: https://github.com/ggauravky/Dev-Portfolio

/**
 * TypingIndicator — animated three-dot "AI is thinking" indicator.
 * Matches the GauravChatbot AI avatar style (gradient "G").
 */
function TypingIndicator() {
    return (
        <div className="msg-enter flex items-end gap-2 sm:gap-2.5">
            {/* G avatar — matches ChatMessage AI avatar */}
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-sm shadow-indigo-500/25 select-none">
                G
            </div>

            {/* Bubble */}
            <div className="px-4 py-3 bg-slate-800/90 border border-slate-700/40 rounded-2xl rounded-bl-sm shadow-sm shadow-slate-900/40">
                <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-500" style={{ animation: 'typingBounce 1.2s ease-in-out infinite', animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-500" style={{ animation: 'typingBounce 1.2s ease-in-out infinite', animationDelay: '180ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-500" style={{ animation: 'typingBounce 1.2s ease-in-out infinite', animationDelay: '360ms' }} />
                </div>
            </div>

            <style>{`
                @keyframes typingBounce {
                    0%, 60%, 100% { transform: translateY(0);   opacity: 0.35; }
                    30%           { transform: translateY(-5px); opacity: 1;    }
                }
            `}</style>
        </div>
    )
}

export default TypingIndicator
