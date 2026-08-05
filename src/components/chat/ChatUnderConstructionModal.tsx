import React from 'react';
import { Wrench, ShieldAlert, Sparkles, ArrowRight, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ChatUnderConstructionModalProps {
  onClose?: () => void;
}

/**
 * Premium Apple × Linear × Vercel style Under Construction & System Maintenance Modal for Gaurav AI.
 * Completely disables chat interaction while providing live status telemetry and clear navigation options.
 */
export const ChatUnderConstructionModal: React.FC<ChatUnderConstructionModalProps> = ({ onClose }) => {
  return (
    <div className="absolute inset-0 z-40 flex flex-col items-center justify-center p-4 bg-[#070708]/95 backdrop-blur-2xl text-center select-none animate-in fade-in duration-300">
      {/* Background ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-md p-6 sm:p-7 rounded-2xl bg-[#0e0e11]/90 border border-amber-500/30 shadow-2xl flex flex-col items-center">
        {/* Animated Badge Icon */}
        <div className="relative mb-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.2)]">
            <Wrench className="w-6 h-6 animate-pulse" />
          </div>
          <div className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 ring-2 ring-[#070708]">
            <Sparkles className="h-2.5 w-2.5 text-[#070708] font-bold" />
          </div>
        </div>

        {/* Status Pill */}
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[11px] font-mono font-bold tracking-wider uppercase mb-3">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400" />
          </span>
          Under Construction
        </span>

        {/* Main Heading */}
        <h2 className="text-xl sm:text-2xl font-display font-bold text-slate-100 tracking-tight">
          Gaurav AI is Upgrading
        </h2>

        {/* Subtitle */}
        <p className="mt-2 text-xs sm:text-sm text-neutral-400 leading-relaxed font-sans max-w-xs sm:max-w-sm">
          We're currently upgrading Gaurav AI's RAG Living Knowledge Engine with expanded vector indices and neural models.
        </p>

        {/* Live Status Progress Checklist */}
        <div className="mt-5 w-full space-y-2 text-left bg-[#070708] border border-neutral-800 p-3.5 rounded-xl font-mono text-xs">
          <div className="flex items-center justify-between gap-2">
            <span className="text-neutral-300 flex items-center gap-1.5 text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              Neural RAG Model Upgrade
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold">
              In Progress
            </span>
          </div>

          <div className="flex items-center justify-between gap-2">
            <span className="text-neutral-300 flex items-center gap-1.5 text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              Vector Store Re-Indexing
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-bold">
              In Progress
            </span>
          </div>

          <div className="flex items-center justify-between gap-2">
            <span className="text-neutral-400 flex items-center gap-1.5 text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-neutral-600" />
              Quality & Telemetry Pass
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-neutral-800 text-neutral-500 font-bold">
              Queued
            </span>
          </div>
        </div>

        {/* Paused Notice */}
        <div className="mt-4 flex items-center gap-2 text-[11px] font-sans text-neutral-400 bg-amber-950/20 border border-amber-500/20 px-3 py-2 rounded-lg w-full text-left">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
          <span>Chat input is temporarily paused. Please check back shortly!</span>
        </div>

        {/* CTA Navigation Buttons */}
        <div className="mt-5 grid grid-cols-2 gap-2.5 w-full">
          <Link
            to="/projects"
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-emerald-400 text-obsidian font-sans font-semibold text-xs transition-all hover:bg-emerald-300 active:scale-95 shadow-md"
          >
            <span>Projects</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            to="/contact"
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-amber-500/30 text-neutral-200 font-sans font-medium text-xs transition-all hover:text-amber-400 active:scale-95"
          >
            <span>Contact</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="mt-4 text-xs font-mono text-neutral-500 hover:text-neutral-300 transition-colors"
          >
            Dismiss Widget
          </button>
        )}
      </div>
    </div>
  );
};
