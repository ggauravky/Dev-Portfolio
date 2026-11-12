// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Site search (Cmd/Ctrl+K) — v2 Monograph styling
// Source: https://github.com/ggauravky/Dev-Portfolio

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import PropTypes from 'prop-types'
import { Command } from 'cmdk'
import './CommandPalette.css'
import {
    Search, X, Folder, Globe, Briefcase, Share2, Zap,
    Copy, Check, Clock, FileText, Code2, Terminal
} from 'lucide-react'
import { getAllCommands, CATEGORIES } from '../data/commandRegistry'
import { searchCommands } from '../utils/searchEngine'
import { useHeaderHeight } from '../hooks/useHeaderHeight'
import { useRecentSearches } from '../hooks/useRecentSearches'
import { useFocusTrap } from '../hooks/useFocusTrap'

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

// Display order for grouped search results
const CATEGORY_ORDER = [
    CATEGORIES.QUICK_ACTIONS,
    CATEGORIES.PAGES,
    CATEGORIES.PROJECTS,
    CATEGORIES.SKILLS,
    CATEGORIES.SERVICES,
    CATEGORIES.BLOG,
    CATEGORIES.SOCIAL,
    CATEGORIES.ACTIONS,
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
    if (q.includes('res') || q.includes('cv')) return ['Download Resume', 'Services']
    if (q.includes('ai') || q.includes('ml')) return ['Python', 'AI Guidance', 'Skills']
    if (q.includes('link')) return ['LinkedIn', 'Social']
    if (q.includes('proj')) return ['Projects', 'SmartMess', 'AIReel Studio']
    return ['Projects', 'Skills', 'React', 'Contact', 'Resume']
}

// ---------------------------------------------------------------------------
// ICONS + LABELS — one muted icon per category; colour is not used for meaning
// ---------------------------------------------------------------------------
const CATEGORY_ICON = {
    [CATEGORIES.QUICK_ACTIONS]: Zap,
    [CATEGORIES.PAGES]: Globe,
    [CATEGORIES.PROJECTS]: Folder,
    [CATEGORIES.SKILLS]: Terminal,
    [CATEGORIES.SERVICES]: Briefcase,
    [CATEGORIES.BLOG]: FileText,
    [CATEGORIES.SOCIAL]: Share2,
    [CATEGORIES.ACTIONS]: Copy,
}

function ItemIcon({ category, type }) {
    const Icon = type === 'action' ? Zap : CATEGORY_ICON[category] || Code2
    return <Icon className="h-4 w-4 shrink-0 text-muted" strokeWidth={1.5} aria-hidden="true" />
}
ItemIcon.propTypes = { category: PropTypes.string, type: PropTypes.string }

// Registry categories are upper-case keys; show them in sentence case.
const sentenceCase = (value = '') => value.charAt(0) + value.slice(1).toLowerCase()

// ---------------------------------------------------------------------------
// HIGHLIGHT TITLE
// ---------------------------------------------------------------------------
function HighlightedTitle({ segments }) {
    if (!segments || segments.length === 0) return null
    return (
        <span>
            {segments.map((seg, i) =>
                seg.highlight ? (
                    <mark key={i} className="bg-transparent text-paper underline decoration-rule underline-offset-4">
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
    let label = 'Open'
    if (type === 'external') label = 'Visit ↗'
    else if (type === 'action') label = 'Run'
    return (
        <span className="ml-2 hidden shrink-0 text-[13px] text-muted group-aria-selected:inline">
            {label}
        </span>
    )
}
ActionIndicator.propTypes = { type: PropTypes.string }

// ---------------------------------------------------------------------------
// RESULT ITEM
// ---------------------------------------------------------------------------
function CommandItem({ cmd, onSelect, titleSegments }) {
    const techStack = cmd._techStack && cmd._techStack.length > 0
        ? cmd._techStack.slice(0, 4).join(', ')
        : null

    return (
        <Command.Item
            value={cmd.id}
            onSelect={() => onSelect(cmd)}
            className="palette-item group"
        >
            <ItemIcon category={cmd.category} type={cmd.type} />

            <div className="min-w-0 flex-1">
                <div className="flex min-w-0 items-center gap-2">
                    <span className="truncate text-[15px] leading-snug text-paper">
                        {titleSegments ? <HighlightedTitle segments={titleSegments} /> : cmd.title}
                    </span>
                    {cmd.badge && (
                        <span className="shrink-0 rounded-control border border-rule px-1.5 py-0.5 text-[12px] leading-none text-muted">
                            {cmd.badge}
                        </span>
                    )}
                    <ActionIndicator type={cmd.type} />
                </div>
                {(techStack || cmd.desc) && (
                    <p className="mt-0.5 truncate text-[13px] leading-snug text-muted">
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
        <div className="px-3 pb-1 pt-4 text-[13px] text-muted first:pt-2">
            {sentenceCase(category)}
        </div>
    )
}
GroupHeading.propTypes = { category: PropTypes.string }

// ---------------------------------------------------------------------------
// FILTER CHIPS
// ---------------------------------------------------------------------------
function FilterChips({ activeFilter, onFilterChange }) {
    return (
        <div className="scrollbar-none flex shrink-0 items-center gap-4 overflow-x-auto border-b border-rule px-4" role="group" aria-label="Filter results">
            {FILTER_TABS.map((tab) => (
                <button
                    key={tab.id}
                    type="button"
                    onClick={() => onFilterChange(tab.id)}
                    className="palette-filter"
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
            {hasRecents && (
                <div className="mb-2">
                    <div className="flex items-center justify-between px-3 pt-2">
                        <span className="text-[13px] text-muted">Recent</span>
                        <button type="button" onClick={onClearRecents} className="palette-text-button">
                            Clear all
                        </button>
                    </div>
                    <ul>
                        {recents.map((item) => (
                            <li key={item.ts || item.query} className="flex items-center">
                                <button type="button" className="palette-row flex-1" onClick={() => onQuerySelect(item.query)}>
                                    <Clock className="h-4 w-4 shrink-0 text-muted" strokeWidth={1.5} aria-hidden="true" />
                                    <span className="truncate">{item.query}</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => onRemoveRecent(item.query)}
                                    className="palette-icon-button"
                                    aria-label={`Remove ${item.query} from recent searches`}
                                >
                                    <X className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <div className="px-3 pt-2 text-[13px] text-muted">Try</div>
            <ul>
                {EXPLORE_SUGGESTIONS.map((sug) => (
                    <li key={sug.id}>
                        <button type="button" className="palette-row w-full" onClick={() => onQuerySelect(sug.query)}>
                            <Search className="h-4 w-4 shrink-0 text-muted" strokeWidth={1.5} aria-hidden="true" />
                            <span className="truncate">{sug.label}</span>
                        </button>
                    </li>
                ))}
            </ul>
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
        <div className="px-6 py-8">
            <p className="text-[15px] text-paper">No results for &ldquo;{query}&rdquo;</p>
            <p className="mt-1 text-small text-muted">Check the spelling, or try one of these:</p>
            <ul className="mt-3 flex flex-wrap gap-x-4">
                {hints.map((hint) => (
                    <li key={hint}>
                        <button type="button" onClick={() => onQuerySelect(hint.toLowerCase())} className="palette-text-button text-paper">
                            {hint}
                        </button>
                    </li>
                ))}
            </ul>
            <button type="button" onClick={onClear} className="palette-text-button mt-2 underline decoration-rule underline-offset-4">
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
        <span className="flex shrink-0 items-center gap-1.5 text-[13px] text-paper" role="status">
            <Check className="h-4 w-4 shrink-0" strokeWidth={1.5} aria-hidden="true" />
            {message}
        </span>
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
    const surfaceRef = useRef(null)
    const { recents, addRecent, removeRecent, clearRecents } = useRecentSearches()

    // Tab stays inside the palette, Esc closes it, focus returns to the opener.
    useFocusTrap(surfaceRef, isOpen, { onEscape: onClose, initialFocusRef: inputRef })

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
        const groups = {}
        for (const cmd of searchResults) {
            if (!groups[cmd.category]) groups[cmd.category] = []
            groups[cmd.category].push(cmd)
        }
        return groups
    }, [searchResults])

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

    // Body scroll lock — restores the previous value (the drawer may hold its own lock)
    useEffect(() => {
        if (!isOpen) return undefined
        const previousOverflow = document.body.style.overflow
        document.body.style.overflow = 'hidden'
        return () => { document.body.style.overflow = previousOverflow }
    }, [isOpen])

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            const isK = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k'
            if (isK) {
                e.preventDefault()
                if (isOpen) onClose()
                else window.dispatchEvent(new CustomEvent('open-command-palette'))
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isOpen, onClose])

    // Reset state when closed
    useEffect(() => {
        if (!isOpen) {
            setSearch('')
            setToastMessage('')
            setActiveFilter('all')
        }
    }, [isOpen])

    // Handle selection
    const handleSelectCommand = useCallback((cmd) => {
        // Show a confirmation, then close; a clipboard failure just closes.
        const copy = (text, message) => {
            try {
                navigator.clipboard.writeText(text)
                setToastMessage(message)
                setTimeout(() => onClose(), 1000)
            } catch (_) { onClose() }
        }

        try {
            if (cmd.type === 'internal' || cmd.type === 'external') {
                addRecent(search.trim() || cmd.title)
                onClose()
                setSearch('')
            }

            if (cmd.type === 'internal') {
                navigate(cmd.url)
            } else if (cmd.type === 'external') {
                if (cmd.url.startsWith('mailto:') || cmd.url.startsWith('tel:')) {
                    window.location.href = cmd.url
                } else {
                    window.open(cmd.url, '_blank', 'noopener,noreferrer')
                }
            } else if (cmd.type === 'action') {
                if (cmd.actionId === 'copy-email') copy('kumar.gaurav.yadav2007@gmail.com', 'Email copied!')
                else if (cmd.actionId === 'copy-url') copy(window.location.href, 'Link copied!')
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
    const hasHeader = headerHeight > 0
    const desktopPaddingTop = hasHeader ? headerHeight + 12 : 24
    const desktopMaxHeight = `calc(100vh - ${hasHeader ? headerHeight + 24 : 48}px)`

    return (
        <div
            className={`fixed inset-0 z-[500] flex justify-center bg-ink/80 sm:px-4 ${isMobile ? 'items-end' : 'items-start'}`}
            style={isMobile ? undefined : { paddingTop: `${desktopPaddingTop}px` }}
            onClick={onClose}
        >
            <div
                ref={surfaceRef}
                role="dialog"
                aria-modal="true"
                aria-label="Search the site"
                className="flex w-full flex-col rounded-t-dialog border border-rule bg-ink-raised shadow-dialog sm:rounded-dialog"
                style={{
                    maxWidth: isMobile ? '100%' : '640px',
                    maxHeight: isMobile ? '100dvh' : desktopMaxHeight,
                    paddingBottom: isMobile ? 'env(safe-area-inset-bottom, 0px)' : undefined,
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <Command
                    label="Search the site"
                    shouldFilter={false}
                    className="flex h-full max-h-full w-full flex-col overflow-hidden"
                >
                    <div className="palette-search flex shrink-0 items-center gap-3 border-b border-rule pl-4 pr-2">
                        <Search className="h-4 w-4 shrink-0 text-muted" strokeWidth={1.5} aria-hidden="true" />
                        <Command.Input
                            ref={inputRef}
                            value={search}
                            onValueChange={setSearch}
                            placeholder="Search pages, projects, articles…"
                            className="palette-input"
                            autoComplete="off"
                            spellCheck={false}
                            maxLength={120}
                            aria-label="Search the site"
                        />
                        <div className="flex shrink-0 items-center gap-1">
                            <ToastBadge message={toastMessage} />
                            {search && !toastMessage && (
                                <button type="button" onClick={() => setSearch('')} className="palette-icon-button" aria-label="Clear search">
                                    <X className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
                                </button>
                            )}
                            <button type="button" onClick={onClose} className="palette-text-button px-2" aria-label="Close search">
                                <span className="hidden font-mono text-[12px] sm:inline">Esc</span>
                                <X className="h-4 w-4 sm:hidden" strokeWidth={1.5} aria-hidden="true" />
                            </button>
                        </div>
                    </div>

                    <FilterChips activeFilter={activeFilter} onFilterChange={setActiveFilter} />

                    <Command.List
                        ref={listRef}
                        className="min-h-0 flex-1 overflow-y-auto overscroll-contain"
                        aria-label="Search results"
                    >
                        {!isSearching && (
                            <IdleState
                                recents={recents}
                                onQuerySelect={handleQuerySelect}
                                onClearRecents={clearRecents}
                                onRemoveRecent={removeRecent}
                            />
                        )}

                        {isSearching && searchResults.length > 0 && (
                            <div className="p-2">
                                {CATEGORY_ORDER.map((cat) => {
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

                    <div className="hidden shrink-0 items-center justify-between border-t border-rule px-4 py-2 text-[13px] text-muted sm:flex">
                        <div className="flex items-center gap-4">
                            <span><kbd className="palette-kbd">↑</kbd> <kbd className="palette-kbd">↓</kbd> to move</span>
                            <span><kbd className="palette-kbd">↵</kbd> to open</span>
                            <span><kbd className="palette-kbd">Esc</kbd> to close</span>
                        </div>
                        <span aria-live="polite">
                            {isSearching ? `${searchResults.length} result${searchResults.length !== 1 ? 's' : ''}` : ''}
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
