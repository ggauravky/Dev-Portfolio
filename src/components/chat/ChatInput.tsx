import React, { useRef, useEffect, useState } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { CHAT_TOKENS } from './designTokens';

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
  cooldownSeconds?: number;
  placeholder?: string;
  maxChars?: number;
}

/**
 * Premium Notion/Linear-style ChatInput component with clean spacing and shortcut badges.
 */
export const ChatInput: React.FC<ChatInputProps> = ({
  onSend,
  isLoading,
  cooldownSeconds = 0,
  placeholder = 'Ask about projects, skills, experience...',
  maxChars = 1000,
}) => {
  const [input, setInput] = useState<string>('');
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Auto-resize height
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`;
  }, [input]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading || cooldownSeconds > 0) return;
    onSend(trimmed);
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isDisabled = isLoading || cooldownSeconds > 0 || !input.trim();
  const charRatio = input.length / maxChars;

  return (
    <div className="w-full">
      <div className="rounded-xl border border-neutral-800 bg-[#070708] p-2 shadow-inner transition-all duration-200 focus-within:border-emerald-500/40 focus-within:ring-1 focus-within:ring-emerald-500/20">
        <div className="flex items-end gap-2">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value.slice(0, maxChars))}
            onKeyDown={handleKeyDown}
            rows={1}
            disabled={isLoading || cooldownSeconds > 0}
            placeholder={
              cooldownSeconds > 0
                ? `Please wait ${cooldownSeconds}s...`
                : placeholder
            }
            className="max-h-36 min-h-[44px] flex-1 resize-none bg-transparent px-3 py-2.5 text-sm leading-relaxed text-slate-100 outline-none placeholder:text-neutral-500 font-sans"
            aria-label="Chat query input"
          />

          <button
            type="button"
            onClick={handleSend}
            disabled={isDisabled}
            className={`inline-flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-200 shrink-0 ${
              isDisabled
                ? 'cursor-not-allowed bg-neutral-800/80 text-neutral-600'
                : 'bg-emerald-400 text-obsidian shadow-md hover:scale-105 active:scale-95 font-bold hover:bg-emerald-300'
            }`}
            aria-label="Send message"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : cooldownSeconds > 0 ? (
              <span className="text-xs font-mono font-bold text-neutral-400">
                {cooldownSeconds}s
              </span>
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* Linear Style Footer Info & Shortcuts */}
      <div className="mt-2 flex items-center justify-between px-1 text-[10px] font-mono text-neutral-500 select-none">
        <div className="flex items-center gap-1.5">
          <span className={CHAT_TOKENS.kbd}>↵ Send</span>
          <span className={CHAT_TOKENS.kbd}>Shift + ↵ Newline</span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className={charRatio > 0.85 ? 'text-amber-400 font-bold' : ''}>
            {input.length}/{maxChars}
          </span>
        </div>
      </div>
    </div>
  );
};
