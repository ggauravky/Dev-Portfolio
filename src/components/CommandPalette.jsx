// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Universal Command Center (Cmd+K) — Premium portfolio search experience
// Source: https://github.com/ggauravky/Dev-Portfolio

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import PropTypes from 'prop-types'
import { Command } from 'cmdk'
import {
    Search, X, Folder, Globe, Briefcase, Share2, Zap,
    CornerDownLeft, ExternalLink, Copy, Check, Clock,
    FileText, Code2, ChevronRight, ArrowUpRight, Compass,
    Terminal
} from 'lucide-react'
import { getAllCommands, CATEGORIES } from '../data/commandRegistry'
import { searchCommands } from '../utils/searchEngine'
import { useHeaderHeight } from '../hooks/useHeaderHeight'
import { useRecentSearches } from '../hooks/useRecentSearches'

// ---------------------------------------------------------------------------
// CONSTANTS
// ---------------------------------------------------------------------------

const FILTER_TABS = [
    { id: 'all', label: 'All' },
    { id: 'PAGES', label: 'Pages' },
    { id: 'PROJECTS', label: 'Projects' },
    { id: 'SKILLS', label: 'Skills' },
    { id: 'SERVICES', label: 'Services' },
    { id: 'BLOG', label: 'Blog' },
    { id: 'SOCIAL', label: 'Social' },
]

// Suggested explore items shown when input is empty and no recents
const EXPLORE_SUGGESTIONS = [
    { id: 'explore-projects', label: 'My projects', query: 'projects' },
    { id: 'explore-stack', label: 'My tech stack', query: 'react' },
    { id: 'explore-contact', label: 'Contact me', query: 'contact' },
    { id: 'explore-resume', label: 'Download resume', query: 'resume' },
    { id: 'explore-github', label: 'Open GitHub', query: 'github' },
]

// Empty-state suggestions by query topic
function getEmptyHint(q) {
    if (q.includes('git')) return ['GitHub', 'Projects', 'Source Code']
    if (q.includes('mail') || q.includes('contact')) return ['Contact', 'Send Email', 'Copy Email']
    if (q.includes('res') || q.includes('cv')) return ['Download Resume', 'Resume Review']
    if (q.includes('ai') || q.includes('ml')) return ['Python', 'AI Guidance', 'Skills']
    if (q.includes('link')) return ['LinkedIn', 'Social']
    if (q.includes('proj')) return ['Projects', 'SmartMess', 'AIReel Studio']
    return ['Projects', 'Skills', 'React', 'Contact', 'Resume']
}

// ---------------------------------------------------------------------------
// ICON MAP
// ---------------------------------------------------------------------------
function ItemIcon({ category, type }) {
    const base = 'w-3.5 h-3.5 shrink-0'
    if (type === 'action') return <Zap className={`${base} text-amber-400`} />
    switch (category) {
        case CATEGORIES.QUICK_ACTIONS: return <Zap className={`${base} text-amber-400`} />
        case CATEGORIES.PAGES:        return <Globe className={`${base} text-emerald-400`} />
        case CATEGORIES.PROJECTS:     return <Folder className={`${base} text-lime-400`} />
        case CATEGORIES.SKILLS:       return <Terminal className={`${base} text-violet-400`} />
        case CATEGORIES.SERVICES:     return <Briefcase className={`${base} text-cyan-400`} />
        case CATEGORIES.BLOG:         return <FileText className={`${base} text-orange-400`} />
        case CATEGORIES.SOCIAL:       return <Share2 className={`${base} text-sky-400`} />
        case CATEGORIES.ACTIONS:      return <Copy className={`${base} text-amber-400`} />
        default:                      return <Code2 className={`${base} text-zinc-400`} />
    }
}
ItemIcon.propTypes = { category: PropTypes.string, type: PropTypes.string }

// Category heading icon for group headers
function CategoryDot({ category }) {
    const colorMap = {
        [CATEGORIES.QUICK_ACTIONS]: 'bg-amber-400',
        [CATEGORIES.PAGES]:         'bg-emerald-400',
        [CATEGORIES.PROJECTS]:      'bg-lime-400',
        [CATEGORIES.SKILLS]:        'bg-violet-400',
        [CATEGORIES.SERVICES]:      'bg-cyan-400',
        [CATEGORIES.BLOG]:          'bg-orange-400',
        [CATEGORIES.SOCIAL]:        'bg-sky-400',
        [CATEGORIES.ACTIONS]:       'bg-amber-400',
    }
    return <span className={`inline-block w-1.5 h-1.5 rounded-full mr-2 ${colorMap[category] || 'bg-zinc-500'}`} />
}
CategoryDot.propTypes = { category: PropTypes.string }

// ---------------------------------------------------------------------------
// HIGHLIGHT TITLE
// ---------------------------------------------------------------------------
function HighlightedTitle({ segments }) {
    if (!segments || segments.length === 0) return null
    return (
        <span>
            {segments.map((seg, i) =>
                seg.highlight ? (
                    <mark key={i} className="bg-transparent font-bold not-italic text-toxic">
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

// ---------------------------------------------------------------------------
// ACTION INDICATOR (shown on selected item)
// ---------------------------------------------------------------------------
function ActionIndicator({ type }) {
    if (type === 'external') {
        return (
            <span className="hidden group-aria-selected:inline-flex items-center gap-1 text-toxic text-[10px] font-mono shrink-0 ml-2">
                Visit <ArrowUpRight className="w-3 h-3" />
            </span>
        )
    }
    if (type === 'action') {
        return (
            <span className="hidden group-aria-selected:inline-flex items-center gap-1 text-amber-400 text-[10px] font-mono shrink-0 ml-2">
                Run <Zap className="w-3 h-3" />
            </span>
        )
    }
    return (
        <span className="hidden group-aria-selected:inline-flex items-center gap-1 text-toxic text-[10px] font-mono shrink-0 ml-2">
            Open <CornerDownLeft className="w-3 h-3" />
        </span>
    )
}
ActionIndicator.propTypes = { type: PropTypes.string }

// ---------------------------------------------------------------------------
// RESULT ITEM
// ---------------------------------------------------------------------------
function CommandItem({ cmd, onSelect, titleSegments }) {
    const techStack = cmd._techStack && cmd._techStack.length > 0
        ? cmd._techStack.slice(0, 4).join(' · ')
        : null

    return (
        <Command.Item
            value={cmd.id}
            onSelect={() => onSelect(cmd)}
            className={[
                'group relative flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer',
                'border border-transparent',
                'text-zinc-300 hover:text-white',
                'hover:bg-white/[0.04] hover:border-white/[0.06]',
                'aria-selected:bg-toxic/[0.08] aria-selected:border-toxic/20 aria-selected:text-white',
                'transition-all duration-100 my-px',
                'focus:outline-none',
            ].join(' ')}
        >
            {/* Icon container */}
            <div className="flex items-center justify-center w-7 h-7 rounded-lg shrink-0 bg-obsidian border border-obsidian-border group-aria-selected:border-toxic/30 transition-colors duration-100">
                <ItemIcon category={cmd.category} type={cmd.type} />
            </div>

            {/* Text content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm font-semibold text-zinc-100 truncate leading-snug">
                        {titleSegments ? <HighlightedTitle segments={titleSegments} /> : cmd.title}
                    </span>
                    {cmd.badge && (
                        <span className="shrink-0 text-[9px] font-mono tracking-wider px-1.5 py-0.5 rounded bg-obsidian border border-obsidian-border text-zinc-500 leading-none">
                            {cmd.badge}
                        </span>
                    )}
                    <ActionIndicator type={cmd.type} />
                </div>
                {/* Subtitle: prefer techStack for projects, else desc */}
                {(techStack || cmd.desc) && (
                    <p className="text-[11px] text-zinc-500 truncate mt-0.5 leading-snug">
                        {techStack || cmd.desc}
                    </p>
                )}
            </div>
        </Command.Item>
    )
}
CommandItem.propTypes = {
    cmd: PropTypes.object.isRequired,
    onSelect: PropTypes.func.isRequired,
    titleSegments: PropTypes.array,
}

// ---------------------------------------------------------------------------
// GROUP HEADING
// ---------------------------------------------------------------------------
function GroupHeading({ category }) {
    return (
        <div className="flex items-center px-3 pt-4 pb-1.5 first:pt-2">
            <CategoryDot category={category} />
            <span className="text-[9px] font-mono font-semibold uppercase tracking-widest text-zinc-500">
                {category}
            </span>
        </div>
    )
}
GroupHeading.propTypes = { category: PropTypes.string }

// ---------------------------------------------------------------------------
// FILTER CHIPS
// ---------------------------------------------------------------------------
function FilterChips({ activeFilter, onFilterChange }) {
    return (
        <div className="flex items-center gap-1.5 px-3 py-2 border-b border-obsidian-border overflow-x-auto scrollbar-none shrink-0">
            {FILTER_TABS.map((tab) => (
                <button
                    key={tab.id}
                    type="button"
                    onClick={() => onFilterChange(tab.id)}
                    className={[
                        'shrink-0 px-2.5 py-1 rounded-full text-[11px] font-mono font-medium whitespace-nowrap',
                        'transition-all duration-150 leading-none',
                        activeFilter === tab.id
                            ? 'bg-toxic text-obsidian'
                            : 'bg-obsidian border border-obsidian-border text-zinc-400 hover:text-white hover:border-zinc-600',
                    ].join(' ')}
                    aria-pressed={activeFilter === tab.id}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    )
}
FilterChips.propTypes = {
    activeFilter: PropTypes.string.isRequired,
    onFilterChange: PropTypes.func.isRequired,
}

// ---------------------------------------------------------------------------
// IDLE STATE — RECENT + EXPLORE
// ---------------------------------------------------------------------------
function IdleState({ recents, onQuerySelect, onClearRecents, onRemoveRecent }) {
    const hasRecents = recents && recents.length > 0

    return (
        <div className="p-2">
            {/* Recent searches */}
            {hasRecents && (
                <div className="mb-1">
                    <div className="flex items-center justify-between px-3 pt-3 pb-1.5">
                        <div className="flex items-center gap-2">
                            <Clock className="w-3 h-3 text-zinc-500" />
                            <span className="text-[9px] font-mono font-semibold uppercase tracking-widest text-zinc-500">
                                Recent
                            </span>
                        </div>
                        <button
                            type="button"
                            onClick={onClearRecents}
                            className="text-[9px] font-mono text-zinc-600 hover:text-zinc-400 transition-colors"
                        >
                            Clear all
                        </button>
                    </div>
                    <div>
                        {recents.map((item) => (
                            <div
                                key={item.ts || item.query}
                                className="group flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/[0.04] cursor-pointer transition-colors duration-100"
                                onClick={() => onQuerySelect(item.query)}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => e.key === 'Enter' && onQuerySelect(item.query)}
                            >
                                <Clock className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
                                <span className="text-sm text-zinc-400 flex-1 group-hover:text-zinc-200 transition-colors">
                                    {item.query}
                                </span>
                                <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); onRemoveRecent(item.query) }}
                                    className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:text-zinc-200 text-zinc-600 transition-all"
                                    aria-label={`Remove ${item.query} from recent searches`}
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Explore / suggested */}
            <div>
                <div className="flex items-center gap-2 px-3 pt-3 pb-1.5">
                    <Compass className="w-3 h-3 text-zinc-500" />
                    <span className="text-[9px] font-mono font-semibold uppercase tracking-widest text-zinc-500">
                        Explore
                    </span>
                </div>
                <div>
                    {EXPLORE_SUGGESTIONS.map((sug) => (
                        <div
                            key={sug.id}
                            className="group flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-white/[0.04] cursor-pointer transition-colors duration-100"
                            onClick={() => onQuerySelect(sug.query)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => e.key === 'Enter' && onQuerySelect(sug.query)}
                        >
                            <span className="text-toxic text-xs leading-none shrink-0 select-none">✦</span>
                            <span className="text-sm text-zinc-400 flex-1 group-hover:text-zinc-200 transition-colors">
                                {sug.label}
                            </span>
                            <ChevronRight className="w-3.5 h-3.5 text-zinc-700 group-hover:text-zinc-500 transition-colors shrink-0" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
IdleState.propTypes = {
    recents: PropTypes.array.isRequired,
    onQuerySelect: PropTypes.func.isRequired,
    onClearRecents: PropTypes.func.isRequired,
    onRemoveRecent: PropTypes.func.isRequired,
}

// ---------------------------------------------------------------------------
// EMPTY STATE
// ---------------------------------------------------------------------------
function EmptyState({ query, onClear, onQuerySelect }) {
    const hints = getEmptyHint(query.toLowerCase())
    return (
        <div className="py-10 px-6 text-center flex flex-col items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-obsidian border border-obsidian-border flex items-center justify-center">
                <Search className="w-4 h-4 text-zinc-600" />
            </div>
            <div>
                <p className="text-sm font-semibold text-zinc-300 mb-1">
                    No results for &ldquo;{query}&rdquo;
                </p>
                <p className="text-xs text-zinc-600">Try a different search or explore below</p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-1.5">
                {hints.map((hint) => (
                    <button
                        key={hint}
                        type="button"
                        onClick={() => onQuerySelect(hint.toLowerCase())}
                        className="px-2.5 py-1 bg-obsidian border border-obsidian-border rounded-full text-xs text-zinc-400 hover:text-white hover:border-zinc-600 transition-all font-mono"
                    >
                        {hint}
                    </button>
                ))}
            </div>
            <button
                type="button"
                onClick={onClear}
                className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors font-mono underline underline-offset-2"
            >
                Clear search
            </button>
        </div>
    )
}
EmptyState.propTypes = {
    query: PropTypes.string.isRequired,
    onClear: PropTypes.func.isRequired,
    onQuerySelect: PropTypes.func.isRequired,
}

// ---------------------------------------------------------------------------
// TOAST NOTIFICATION
// ---------------------------------------------------------------------------
function ToastBadge({ message }) {
    if (!message) return null
    return (
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-toxic/20 border border-toxic/40 rounded-full text-toxic text-[10px] font-mono shrink-0 animate-in fade-in slide-in-from-right-2 duration-200">
            <Check className="w-3 h-3 shrink-0" />
            <span>{message}</span>
        </div>
    )
}
ToastBadge.propTypes = { message: PropTypes.string }

// ---------------------------------------------------------------------------
// MAIN COMPONENT
// ---------------------------------------------------------------------------
export default function CommandPalette({ isOpen, onClose }) {
    const [search, setSearch] = useState('')
    const [activeFilter, setActiveFilter] = useState('all')
    const [toastMessage, setToastMessage] = useState('')
    const navigate = useNavigate()
    const headerHeight = useHeaderHeight()
    const listRef = useRef(null)
    const inputRef = useRef(null)
    const triggerRef = useRef(null)
    const { recents, addRecent, removeRecent, clearRecents } = useRecentSearches()

    // Capture trigger for focus restoration
    useEffect(() => {
        if (isOpen) {
            // Find the search button to restore focus on close
            triggerRef.current = document.querySelector('[aria-label="Open Command Search"], [aria-label="Open Search Command Palette"]')
        }
    }, [isOpen])

    // All commands memoized (built once)
    const allCommands = useMemo(() => {
        try { return getAllCommands() } catch (_) { return [] }
    }, [])

    // Filter by active chip, then search
    const filteredCommands = useMemo(() => {
        if (activeFilter === 'all') return allCommands
        return allCommands.filter((cmd) => cmd.category === activeFilter)
    }, [allCommands, activeFilter])

    const isSearching = search.trim().length > 0

    // Search results (flat, scored list)
    const searchResults = useMemo(() => {
        if (!isSearching) return []
        return searchCommands(search, filteredCommands, 25)
    }, [search, filteredCommands, isSearching])

    // Group search results by category for display
    const groupedResults = useMemo(() => {
        if (!isSearching) return {}
        const groups = {}
        for (const cmd of searchResults) {
            if (!groups[cmd.category]) groups[cmd.category] = []
            groups[cmd.category].push(cmd)
        }
        return groups
    }, [searchResults, isSearching])

    // Ordered category display
    const categoryOrder = [
        CATEGORIES.QUICK_ACTIONS,
        CATEGORIES.PAGES,
        CATEGORIES.PROJECTS,
        CATEGORIES.SKILLS,
        CATEGORIES.SERVICES,
        CATEGORIES.BLOG,
        CATEGORIES.SOCIAL,
        CATEGORIES.ACTIONS,
    ]

    // Auto-scroll selected item into view
    useEffect(() => {
        if (!isOpen) return
        const frame = requestAnimationFrame(() => {
            const listEl = listRef.current
            if (!listEl) return
            const selected = listEl.querySelector('[cmdk-item][aria-selected="true"]')
            if (selected) selected.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
        })
        return () => cancelAnimationFrame(frame)
    }, [search, searchResults, isOpen])

    // Body scroll lock
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
        return () => { document.body.style.overflow = '' }
    }, [isOpen])

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            const isK = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k'
            if (isK) {
                e.preventDefault()
                if (isOpen) onClose()
                else window.dispatchEvent(new CustomEvent('open-command-palette'))
            } else if (e.key === 'Escape' && isOpen) {
                e.preventDefault()
                onClose()
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isOpen, onClose])

    // Reset state when closed; restore focus to trigger
    useEffect(() => {
        if (!isOpen) {
            setSearch('')
            setToastMessage('')
            setActiveFilter('all')
            // Restore focus to the trigger that opened the palette
            if (triggerRef.current) {
                setTimeout(() => {
                    try { triggerRef.current?.focus() } catch (_) { /* noop */ }
                }, 50)
            }
        }
    }, [isOpen])

    // Handle selection
    const handleSelectCommand = useCallback((cmd) => {
        try {
            if (cmd.type === 'internal') {
                addRecent(search.trim() || cmd.title)
                onClose()
                setSearch('')
                navigate(cmd.url)
            } else if (cmd.type === 'external') {
                addRecent(search.trim() || cmd.title)
                onClose()
                setSearch('')
                if (cmd.url.startsWith('mailto:') || cmd.url.startsWith('tel:')) {
                    window.location.href = cmd.url
                } else {
                    window.open(cmd.url, '_blank', 'noopener,noreferrer')
                }
            } else if (cmd.type === 'action') {
                if (cmd.actionId === 'copy-email') {
                    try {
                        navigator.clipboard.writeText('kumar.gaurav.yadav2007@gmail.com')
                        setToastMessage('Email copied!')
                        setTimeout(() => onClose(), 1000)
                    } catch (_) { onClose() }
                } else if (cmd.actionId === 'copy-url') {
                    try {
                        navigator.clipboard.writeText(window.location.href)
                        setToastMessage('Link copied!')
                        setTimeout(() => onClose(), 1000)
                    } catch (_) { onClose() }
                }
            }
        } catch (_) {
            // Any error during command execution — close gracefully
            onClose()
        }
    }, [navigate, onClose, search, addRecent])

    // Set search from explore/recent click
    const handleQuerySelect = useCallback((query) => {
        setSearch(query)
        setTimeout(() => inputRef.current?.focus(), 10)
    }, [])

    if (!isOpen) return null

    // Modal positioning
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 640
    const computedPaddingTop = !isMobile
        ? (headerHeight > 0 ? headerHeight + 12 : 24)
        : 0
    const computedMaxHeight = !isMobile
        ? `calc(100vh - ${headerHeight > 0 ? headerHeight + 24 : 48}px)`
        : '100dvh'

    return (
        <div
            className={[
                'fixed inset-0 z-[500] flex',
                isMobile ? 'items-end sm:items-start' : 'items-start',
                'justify-center',
                // On mobile: full-width bottom sheet; on desktop: centered modal with px
                'px-0 sm:px-4',
                'bg-black/75 backdrop-blur-sm',
            ].join(' ')}
            style={!isMobile ? { paddingTop: `${computedPaddingTop}px` } : undefined}
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-label="Universal Portfolio Command Center"
        >
            {/* Modal surface */}
            <div
                className={[
                    'w-full bg-[#0b0c10]/98 border border-[#1e1e28] flex flex-col',
                    'shadow-2xl shadow-black/60 backdrop-blur-xl',
                    // Mobile: bottom sheet style
                    'sm:rounded-2xl rounded-t-2xl',
                    // Animation
                    'animate-in fade-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200',
                ].join(' ')}
                style={{
                    maxWidth: isMobile ? '100%' : '680px',
                    maxHeight: computedMaxHeight,
                    // Mobile: safe area bottom padding
                    paddingBottom: isMobile ? 'env(safe-area-inset-bottom, 0px)' : undefined,
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <Command
                    label="Universal Portfolio Command Center"
                    shouldFilter={false}
                    className="w-full flex flex-col overflow-hidden h-full max-h-full"
                >
                    {/* ── Input Header ── */}
                    <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#1e1e28] shrink-0 bg-[#0e0e16]">
                        <Search className="w-4 h-4 text-toxic shrink-0" aria-hidden="true" />
                        <Command.Input
                            ref={inputRef}
                            value={search}
                            onValueChange={setSearch}
                            placeholder="Search portfolio…"
                            className="flex-1 bg-transparent text-sm text-zinc-100 placeholder:text-zinc-600 outline-none border-none font-sans caret-toxic min-w-0"
                            autoFocus
                            autoComplete="off"
                            spellCheck={false}
                            maxLength={120}
                            aria-label="Search portfolio"
                        />
                        <div className="flex items-center gap-2 shrink-0">
                            <ToastBadge message={toastMessage} />
                            {search && !toastMessage && (
                                <button
                                    type="button"
                                    onClick={() => setSearch('')}
                                    className="p-1 rounded-lg text-zinc-600 hover:text-zinc-300 hover:bg-white/[0.06] transition-all duration-150"
                                    aria-label="Clear search"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={onClose}
                                className="hidden sm:flex items-center justify-center px-2 py-1 text-[10px] font-mono text-zinc-600 bg-obsidian border border-obsidian-border rounded-md hover:text-zinc-300 hover:border-zinc-600 transition-all duration-150 leading-none"
                                aria-label="Close search"
                            >
                                ESC
                            </button>
                            {/* Mobile close button */}
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex sm:hidden items-center justify-center w-7 h-7 rounded-full bg-obsidian border border-obsidian-border text-zinc-500 hover:text-zinc-300 transition-all duration-150"
                                aria-label="Close search"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>

                    {/* ── Filter Chips ── */}
                    <FilterChips activeFilter={activeFilter} onFilterChange={setActiveFilter} />

                    {/* ── Results List ── */}
                    <Command.List
                        ref={listRef}
                        className="flex-1 min-h-0 overflow-y-auto overscroll-contain"
                        aria-label="Search results"
                        style={{ scrollbarWidth: 'thin', scrollbarColor: '#1a1a22 transparent' }}
                    >
                        {/* Idle state — no query */}
                        {!isSearching && (
                            <IdleState
                                recents={recents}
                                onQuerySelect={handleQuerySelect}
                                onClearRecents={clearRecents}
                                onRemoveRecent={removeRecent}
                            />
                        )}

                        {/* Search results — grouped by category */}
                        {isSearching && searchResults.length > 0 && (
                            <div className="p-2">
                                {categoryOrder.map((cat) => {
                                    const items = groupedResults[cat]
                                    if (!items || items.length === 0) return null
                                    return (
                                        <Command.Group key={cat}>
                                            <GroupHeading category={cat} />
                                            {items.map((cmd) => (
                                                <CommandItem
                                                    key={cmd.id}
                                                    cmd={cmd}
                                                    onSelect={handleSelectCommand}
                                                    titleSegments={cmd._segments}
                                                />
                                            ))}
                                        </Command.Group>
                                    )
                                })}
                            </div>
                        )}

                        {/* Empty state */}
                        {isSearching && searchResults.length === 0 && (
                            <Command.Empty>
                                <EmptyState
                                    query={search}
                                    onClear={() => setSearch('')}
                                    onQuerySelect={handleQuerySelect}
                                />
                            </Command.Empty>
                        )}
                    </Command.List>

                    {/* ── Footer ── */}
                    <div className="hidden sm:flex items-center justify-between px-4 py-2.5 border-t border-[#1e1e28] bg-[#090a0e] shrink-0">
                        <div className="flex items-center gap-3 text-[10px] font-mono text-zinc-600">
                            <span className="flex items-center gap-1">
                                <kbd className="inline-flex items-center justify-center w-5 h-5 bg-obsidian rounded border border-obsidian-border text-zinc-400 text-[9px]">↑</kbd>
                                <kbd className="inline-flex items-center justify-center w-5 h-5 bg-obsidian rounded border border-obsidian-border text-zinc-400 text-[9px]">↓</kbd>
                                Navigate
                            </span>
                            <span className="flex items-center gap-1">
                                <kbd className="inline-flex items-center justify-center h-5 px-1.5 bg-obsidian rounded border border-obsidian-border text-zinc-400 text-[9px]">↵</kbd>
                                Open
                            </span>
                            <span className="flex items-center gap-1">
                                <kbd className="inline-flex items-center justify-center h-5 px-1.5 bg-obsidian rounded border border-obsidian-border text-zinc-400 text-[9px]">Esc</kbd>
                                Close
                            </span>
                        </div>
                        <span className="text-[10px] font-mono text-zinc-700">
                            {isSearching
                                ? `${searchResults.length} result${searchResults.length !== 1 ? 's' : ''}`
                                : 'Universal Command Center'}
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
