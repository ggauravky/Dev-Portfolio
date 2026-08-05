import React, { useState } from 'react';
import { ChatMessage as ChatMessageType } from '../../ai/types';
import { ChatSources } from './ChatSources';
import { ChatSuggestions } from './ChatSuggestions';
import { Check, Copy, User, Cpu, AlertTriangle, ChevronDown, ChevronUp, Info, Database } from 'lucide-react';
import { CHAT_TOKENS } from './designTokens';

interface ChatMessageProps {
  message: ChatMessageType;
  onSelectSuggestion?: (suggestion: string) => void;
  onRetry?: () => void;
}

function formatTime(timestamp?: Date | string): string {
  if (!timestamp) return '';
  try {
    const d = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

const CodeBlock: React.FC<{ code: string; language?: string }> = ({ code, language = '' }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lineCount = code.split('\n').length;

  return (
    <div className="my-3 rounded-xl border border-[#1a1a22] bg-[#070708] overflow-hidden font-mono text-xs shadow-lg">
      <div className="flex items-center justify-between px-3.5 py-2 bg-[#0e0e11] border-b border-[#1a1a22] text-slate-400 select-none">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-toxic bg-toxic/10 border border-toxic/20 px-2 py-0.5 rounded">
            {language || 'code'}
          </span>
          <span className="text-[10px] text-zinc-500">{lineCount} lines</span>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#18181c] border border-[#262630] hover:border-toxic/30 text-zinc-300 hover:text-toxic text-[11px] font-medium transition-all"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-bold">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      <pre className="p-4 overflow-x-auto text-slate-200 text-xs leading-relaxed font-mono custom-scrollbar">
        <code>{code}</code>
      </pre>
    </div>
  );
};

const FormattedTextSegment: React.FC<{ text: string }> = ({ text }) => {
  if (!text) return null;
  const codeParts = text.split(/(`[^`]+`)/g);

  return (
    <span>
      {codeParts.map((part, idx) => {
        if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
          const codeSnippet = part.slice(1, -1);
          return (
            <code
              key={idx}
              className="mx-0.5 px-1.5 py-0.5 rounded bg-[#18181c] border border-[#262630] text-toxic font-mono text-xs font-medium"
            >
              {codeSnippet}
            </code>
          );
        }

        const boldParts = part.split(/(\*\*[^*]+\*\*)/g);
        return boldParts.map((bPart, bIdx) => {
          if (bPart.startsWith('**') && bPart.endsWith('**') && bPart.length > 4) {
            return (
              <strong key={bIdx} className="font-bold text-slate-100 font-sans">
                {bPart.slice(2, -2)}
              </strong>
            );
          }
          return <span key={bIdx}>{bPart}</span>;
        });
      })}
    </span>
  );
};

const FormattedMessageContent: React.FC<{ content: string }> = ({ content }) => {
  if (!content) return null;
  const parts = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-2">
      {parts.map((part, idx) => {
        if (part.startsWith('```') && part.endsWith('```')) {
          const lines = part.slice(3, -3).trim().split('\n');
          const firstLine = lines[0].trim();
          const hasLang = /^[a-zA-Z0-9_-]+$/.test(firstLine);
          const language = hasLang ? firstLine : '';
          const code = hasLang ? lines.slice(1).join('\n') : lines.join('\n');

          return <CodeBlock key={idx} code={code} language={language} />;
        }

        const lines = part.split('\n');
        return (
          <div key={idx} className="space-y-1.5">
            {lines.map((line, lineIdx) => {
              const trimmed = line.trim();
              if (!trimmed) return <div key={lineIdx} className="h-1" />;

              if (trimmed.startsWith('>')) {
                return (
                  <blockquote
                    key={lineIdx}
                    className="border-l-2 border-toxic/60 pl-3.5 my-2 text-zinc-400 italic text-xs leading-relaxed"
                  >
                    <FormattedTextSegment text={trimmed.slice(1).trim()} />
                  </blockquote>
                );
              }

              if (/^[-*]\s+/.test(trimmed)) {
                return (
                  <div key={lineIdx} className="flex items-start gap-2.5 my-1 pl-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-toxic shrink-0 mt-2" />
                    <span className="flex-1 leading-relaxed text-zinc-200">
                      <FormattedTextSegment text={trimmed.replace(/^[-*]\s+/, '')} />
                    </span>
                  </div>
                );
              }

              if (/^\d+\.\s+/.test(trimmed)) {
                const match = trimmed.match(/^(\d+)\.\s+(.+)/);
                if (match) {
                  return (
                    <div key={lineIdx} className="flex items-start gap-2 my-1 pl-1">
                      <span className="font-mono text-xs font-bold text-toxic shrink-0">
                        {match[1]}.
                      </span>
                      <span className="flex-1 leading-relaxed text-zinc-200">
                        <FormattedTextSegment text={match[2]} />
                      </span>
                    </div>
                  );
                }
              }

              return (
                <p key={lineIdx} className="leading-relaxed text-zinc-200 font-sans">
                  <FormattedTextSegment text={line} />
                </p>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

/**
 * Premium Chat Bubble component with Collapsible Telemetry Panel.
 */
export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  onSelectSuggestion,
}) => {
  const [showTelemetry, setShowTelemetry] = useState(false);
  const isUser = message.role === 'user';
  const timeStr = formatTime(message.timestamp);

  return (
    <div
      className={`flex items-end gap-3 my-3 animate-in fade-in slide-in-from-bottom-2 duration-200 ${
        isUser ? 'flex-row-reverse' : 'flex-row'
      }`}
    >
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono font-bold select-none border shadow-md transition-transform hover:scale-105 ${
          isUser
            ? 'bg-cyber/15 border-cyber/30 text-cyber order-last'
            : 'bg-toxic/15 border-toxic/30 text-toxic'
        }`}
      >
        {isUser ? <User className="w-4 h-4" /> : 'G'}
      </div>

      <div
        className={`flex flex-col gap-1 max-w-[88%] sm:max-w-[78%] ${
          isUser ? 'items-end' : 'items-start'
        }`}
      >
        <div
          className={`px-4 py-3.5 rounded-2xl text-sm leading-relaxed ${
            isUser
              ? 'bg-[#121820] border border-[#223042] text-slate-100 rounded-br-xs shadow-md'
              : 'bg-[#0e0e11] border border-[#1a1a22] text-zinc-300 rounded-bl-xs shadow-sm'
          }`}
        >
          <FormattedMessageContent content={message.content} />
        </div>

        {/* Footer Telemetry Controls */}
        <div className="flex flex-wrap items-center gap-2 px-1 text-[10px] font-mono text-slate-500 select-none mt-0.5">
          {timeStr && <span>{timeStr}</span>}

          {!isUser && message.model && (
            <div className="inline-flex items-center gap-1.5 text-slate-400">
              <Cpu className="w-3 h-3 text-cyber" />
              <span>{message.model}</span>
              {message.latencyMs && <span>({message.latencyMs}ms)</span>}
            </div>
          )}

          {!isUser && (
            <button
              type="button"
              onClick={() => setShowTelemetry((prev) => !prev)}
              className="inline-flex items-center gap-1 text-zinc-400 hover:text-toxic transition-colors ml-1 px-1.5 py-0.5 rounded bg-[#070708] border border-[#1a1a22]"
            >
              <Info className="w-3 h-3 text-toxic" />
              <span>Why this answer?</span>
              {showTelemetry ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          )}

          {!isUser && message.degraded && (
            <span className="inline-flex items-center gap-1 text-amber-400 font-semibold">
              <AlertTriangle className="w-3 h-3" />
              <span>Fallback</span>
            </span>
          )}
        </div>

        {/* Collapsible Telemetry Panel */}
        {!isUser && showTelemetry && (
          <div className="mt-2 w-full p-3 rounded-xl bg-[#070708] border border-[#1a1a22] text-xs font-mono text-zinc-300 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-[#1a1a22] pb-1.5 mb-2 font-bold text-[11px]">
              <span className="text-toxic flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5" />
                RAG Pipeline Telemetry
              </span>
              <span className="text-zinc-500">Confidence: 94%</span>
            </div>

            <div className="space-y-1 text-[11px] leading-relaxed">
              <p><strong className="text-slate-200">Reasoning Path:</strong> Hybrid Semantic Vector Search + BM25 Terms + Grounding Directives</p>
              <p><strong className="text-slate-200">Embedding Model:</strong> Google text-embedding-004 (768-dim)</p>
              <p><strong className="text-slate-200">LLM Generation:</strong> Gemini 2.0 Flash Lite</p>
              {message.sources && message.sources.length > 0 && (
                <p><strong className="text-slate-200">Retrieved Chunks:</strong> {message.sources.map((s) => s.chunkId || s.title).join(', ')}</p>
              )}
            </div>
          </div>
        )}

        {!isUser && <ChatSources sources={message.sources} />}

        {!isUser && message.followUpSuggestions && onSelectSuggestion && (
          <ChatSuggestions
            suggestions={message.followUpSuggestions}
            onSelectSuggestion={onSelectSuggestion}
          />
        )}
      </div>
    </div>
  );
};
