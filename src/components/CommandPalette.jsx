// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Universal Command Center (Cmd + K) — Raycast-grade search experience
// Source: https://github.com/ggauravky/Dev-Portfolio

import { useState, useEffect, useMemo, useCallback, useRef } from "react"
import { useNavigate } from "react-router-dom"
import PropTypes from "prop-types"
import { Command } from "cmdk"
import {
    Search, X, Folder, Terminal, Sparkles, Globe, Briefcase,
    Share2, Zap, CornerDownLeft, ExternalLink, Copy, Check
} from "lucide-react"
import { getAllCommands } from "../data/commandRegistry"
import { searchCommands } from "../utils/searchEngine"
import { useHeaderHeight } from "../hooks/useHeaderHeight"

// Highlighted title — bold-colors the matched portion in toxic color
function HighlightedTitle({ segments }) {
    if (!segments || segments.length === 0) return null
    return (
        <span>
            {segments.map((seg, i) =>
                seg.highlight ? (
                    <mark key={i} className="bg-transparent font-bold not-italic" style={{ color: "#c5f82a" }}>
                        {seg.text}
                    </mark>
                ) : (
                    <span key={i}>{seg.text}</span>
                )
            )}
        </span>
    )
}
HighlightedTitle.propTypes = {
    segments: PropTypes.arrayOf(PropTypes.shape({ text: PropTypes.string, highlight: PropTypes.bool }))
}

// Category icon mapping
function CategoryIcon({ category }) {
    switch (category) {
        case "PAGES": return <Globe className="w-4 h-4 text-emerald-400" />
        case "PROJECTS": return <Folder className="w-4 h-4 text-toxic" />
        case "LAB TOOLS": return <Terminal className="w-4 h-4 text-purple-400" />
        case "SERVICES": return <Briefcase className="w-4 h-4 text-cyan-400" />
        case "SOCIAL": return <Share2 className="w-4 h-4 text-sky-400" />
        case "ACTIONS": return <Zap className="w-4 h-4 text-amber-400" />
        default: return <Globe className="w-4 h-4 text-zinc-400" />
    }
}
CategoryIcon.propTypes = { category: PropTypes.string }

// Individual result item
function CommandItem({ cmd, onSelect, titleSegments }) {
    return (
        <Command.Item
            value={cmd.id}
            onSelect={() => onSelect(cmd)}
            className="aria-selected:bg-toxic/10 aria-selected:border-toxic/30 text-zinc-300 aria-selected:text-white transition-all duration-100 rounded-xl p-3 border border-transparent flex items-center justify-between cursor-pointer group my-0.5"
        >
            <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 rounded-lg shrink-0 bg-obsidian border border-obsidian-border group-aria-selected:border-toxic/40 text-zinc-400">
                    <CategoryIcon category={cmd.category} />
                </div>
                <div className="min-w-0">
                    <div className="flex items-center gap-2">
                        <h4 className="text-sm font-semibold truncate text-zinc-100">
                            {titleSegments ? <HighlightedTitle segments={titleSegments} /> : cmd.title}
                        </h4>
                        <span className="text-[10px] font-mono tracking-wider px-2 py-0.5 rounded bg-obsidian border border-obsidian-border text-zinc-400 shrink-0">
                            {cmd.badge}
                        </span>
                    </div>
                    <p className="text-xs text-zinc-400 truncate mt-0.5">{cmd.desc}</p>
                </div>
            </div>
            <div className="hidden group-aria-selected:flex items-center gap-1.5 text-toxic text-xs font-mono shrink-0 pl-2">
                {cmd.type === "external" ? (
                    <><span>Visit</span><ExternalLink className="w-3.5 h-3.5" /></>
                ) : cmd.type === "action" ? (
                    <><span>Run</span><Copy className="w-3.5 h-3.5" /></>
                ) : (
                    <><span>Open</span><CornerDownLeft className="w-3.5 h-3.5" /></>
                )}
            </div>
        </Command.Item>
    )
}
CommandItem.propTypes = {
    cmd: PropTypes.object.isRequired,
    onSelect: PropTypes.func.isRequired,
    titleSegments: PropTypes.array
}

// Main component
export default function CommandPalette({ isOpen, onClose }) {
    const [search, setSearch] = useState("")
    const [toastMessage, setToastMessage] = useState("")
    const navigate = useNavigate()
    const headerHeight = useHeaderHeight()
    const listRef = useRef(null)

    const allCommands = useMemo(() => getAllCommands(), [])

    const categories = useMemo(() => {
        const catMap = { PAGES: [], PROJECTS: [], "LAB TOOLS": [], SERVICES: [], SOCIAL: [], ACTIONS: [] }
        allCommands.forEach((cmd) => { if (catMap[cmd.category]) catMap[cmd.category].push(cmd) })
        return catMap
    }, [allCommands])

    const searchResults = useMemo(() => {
        if (!search.trim()) return []
        return searchCommands(search, allCommands, 15)
    }, [search, allCommands])

    const isSearching = search.trim().length > 0

    // Auto-scroll selected item into view on every results update
    useEffect(() => {
        if (!isOpen) return
        const frame = requestAnimationFrame(() => {
            const listEl = listRef.current
            if (!listEl) return
            const selected = listEl.querySelector("[cmdk-item][aria-selected='true']")
            if (selected) selected.scrollIntoView({ block: "nearest", behavior: "smooth" })
        })
        return () => cancelAnimationFrame(frame)
    }, [search, searchResults, isOpen])

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            const isK = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k"
            if (isK) {
                e.preventDefault()
                if (isOpen) onClose()
                else window.dispatchEvent(new CustomEvent("open-command-palette"))
            } else if (e.key === "Escape" && isOpen) {
                e.preventDefault()
                onClose()
            }
        }
        window.addEventListener("keydown", handleKeyDown)
        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [isOpen, onClose])

    useEffect(() => {
        if (!isOpen) { setSearch(""); setToastMessage("") }
    }, [isOpen])

    const handleSelectCommand = useCallback((cmd) => {
        if (cmd.type === "internal") {
            onClose(); setSearch(""); navigate(cmd.url)
        } else if (cmd.type === "external") {
            onClose(); setSearch("")
            if (cmd.url.startsWith("mailto:") || cmd.url.startsWith("tel:")) {
                window.location.href = cmd.url
            } else {
                window.open(cmd.url, "_blank", "noopener,noreferrer")
            }
        } else if (cmd.type === "action") {
            if (cmd.actionId === "copy-email") {
                navigator.clipboard.writeText("kumar.gaurav.yadav2007@gmail.com")
                setToastMessage("Email copied!")
                setTimeout(() => onClose(), 900)
            } else if (cmd.actionId === "copy-url") {
                navigator.clipboard.writeText(window.location.href)
                setToastMessage("Link copied!")
                setTimeout(() => onClose(), 900)
            }
        }
    }, [navigate, onClose])

    if (!isOpen) return null

    const computedPaddingTop = headerHeight > 0 ? headerHeight + 14 : 24
    const computedMaxHeight = `calc(100vh - ${headerHeight > 0 ? headerHeight + 28 : 48}px)`

    const emptyHint = (() => {
        const q = search.toLowerCase()
        if (q.includes("git")) return '"GitHub" or "Projects"'
        if (q.includes("mail") || q.includes("contact")) return '"Contact" or "Send Email"'
        if (q.includes("res") || q.includes("cv")) return '"Download Resume"'
        if (q.includes("ai") || q.includes("ml")) return '"AI Lab" or "Skills"'
        if (q.includes("link")) return '"LinkedIn"'
        return '"Contact", "Resume", "GitHub", or "Projects"'
    })()

    const groupHeadingClass = "[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-widest [&_[cmdk-group-heading]]:text-zinc-500 [&_[cmdk-group-heading]]:font-semibold"

    return (
        <div
            className="fixed inset-0 z-50 flex items-start justify-center px-3 sm:px-4 bg-black/80 backdrop-blur-md"
            style={{ paddingTop: `${computedPaddingTop}px` }}
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-label="Universal Portfolio Command Center"
        >
            <div
                className="w-full max-w-2xl bg-[#0b0c10]/95 border border-[#1a1a2e] rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl flex flex-col animate-in fade-in zoom-in-95 duration-150"
                style={{ maxHeight: computedMaxHeight }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* shouldFilter={false} — we handle search ourselves; cmdk handles keyboard nav */}
                <Command
                    label="Universal Command Center"
                    shouldFilter={false}
                    className="w-full flex flex-col overflow-hidden h-full max-h-full"
                >
                    {/* Search Input */}
                    <div className="flex items-center px-4 py-3.5 border-b border-[#1a1a2e] gap-3 bg-[#0e0e14] relative shrink-0">
                        <Search className="w-5 h-5 text-toxic shrink-0" />
                        <Command.Input
                            value={search}
                            onValueChange={setSearch}
                            placeholder="Search commands, pages, projects, socials…"
                            className="w-full bg-transparent text-sm sm:text-base text-zinc-100 placeholder:text-zinc-500 outline-none border-none font-sans"
                            autoFocus
                        />
                        {toastMessage && (
                            <div className="absolute right-14 flex items-center gap-1.5 px-3 py-1 bg-toxic/20 border border-toxic/40 rounded-full text-toxic text-xs font-mono animate-in fade-in">
                                <Check className="w-3.5 h-3.5" />
                                <span>{toastMessage}</span>
                            </div>
                        )}
                        {search && !toastMessage && (
                            <button type="button" onClick={() => setSearch("")}
                                className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                                aria-label="Clear search">
                                <X className="w-4 h-4" />
                            </button>
                        )}
                        <button type="button" onClick={onClose}
                            className="px-2 py-1 text-[10px] sm:text-xs font-mono text-zinc-400 bg-obsidian border border-obsidian-border rounded hover:text-white shrink-0"
                            aria-label="Close">
                            ESC
                        </button>
                    </div>

                    {/* Results List */}
                    <Command.List
                        ref={listRef}
                        className="overflow-y-auto p-2 space-y-2 flex-1 min-h-0 scrollbar-thin scrollbar-thumb-zinc-800"
                        aria-label="Command results"
                    >
                        <Command.Empty className="py-12 text-center text-zinc-500 space-y-2">
                            <Sparkles className="w-8 h-8 mx-auto text-toxic/60 animate-pulse" />
                            <p className="text-sm font-medium text-zinc-300">No results for &quot;{search}&quot;</p>
                            <p className="text-xs text-zinc-500 font-mono">Try {emptyHint}</p>
                        </Command.Empty>

                        {/* Search mode: ranked flat list */}
                        {isSearching && searchResults.length > 0 && (
                            <Command.Group heading="Best Matches" className={groupHeadingClass}>
                                {searchResults.map((cmd) => (
                                    <CommandItem key={cmd.id} cmd={cmd} onSelect={handleSelectCommand} titleSegments={cmd._segments} />
                                ))}
                            </Command.Group>
                        )}

                        {/* Idle mode: category groups */}
                        {!isSearching && Object.entries(categories).map(([catName, items]) => {
                            if (!items || items.length === 0) return null
                            return (
                                <Command.Group key={catName} heading={catName} className={groupHeadingClass}>
                                    {items.map((cmd) => (
                                        <CommandItem key={cmd.id} cmd={cmd} onSelect={handleSelectCommand} titleSegments={null} />
                                    ))}
                                </Command.Group>
                            )
                        })}
                    </Command.List>

                    {/* Footer */}
                    <div className="px-4 py-2.5 bg-[#090a0e] border-t border-[#1a1a2e] flex items-center justify-between text-[11px] font-mono text-zinc-500">
                        <div className="flex items-center gap-3">
                            <span><kbd className="px-1.5 py-0.5 bg-obsidian rounded border border-obsidian-border text-zinc-300">↑↓</kbd> Navigate</span>
                            <span><kbd className="px-1.5 py-0.5 bg-obsidian rounded border border-obsidian-border text-zinc-300">↵</kbd> Select</span>
                            <span><kbd className="px-1.5 py-0.5 bg-obsidian rounded border border-obsidian-border text-zinc-300">Esc</kbd> Close</span>
                        </div>
                        <span className="hidden sm:inline text-zinc-600">
                            {isSearching
                                ? `${searchResults.length} result${searchResults.length !== 1 ? "s" : ""}`
                                : "Universal Command Center"}
                        </span>
                    </div>
                </Command>
            </div>
        </div>
    )
}

CommandPalette.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
}
