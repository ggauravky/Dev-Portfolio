// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Source: https://github.com/ggauravky/Dev-Portfolio

import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'

const SHEET_TRANSITION_MS = 210

const groupByYear = (items) => items.reduce((groups, item) => {
    const year = new Date(item.date).getFullYear().toString()
    if (!groups[year]) groups[year] = []
    groups[year].push(item)
    return groups
}, {})

const formatNavDate = (item) => {
    const date = new Date(`${item.date}T00:00:00`)
    if (Number.isNaN(date.getTime())) return item.dateLabel

    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
    }).format(date)
}

function JourneyEventButton({ item, isActive, isObscured, onSelect, onHover }) {
    return (
        <button
            type="button"
            className={`journey-index-event ${isActive ? 'is-active' : ''}`}
            aria-current={isActive ? 'step' : undefined}
            aria-label={`Go to ${item.title}, ${item.dateLabel}`}
            tabIndex={isObscured ? -1 : 0}
            onClick={() => onSelect(item.id)}
            onMouseEnter={() => onHover?.(item.id)}
            onMouseLeave={() => onHover?.(null)}
            onFocus={() => onHover?.(item.id)}
            onBlur={() => onHover?.(null)}
        >
            <span className="journey-index-marker" aria-hidden="true">
                <span className="journey-index-marker-line" />
                <span className="journey-index-marker-dot" />
            </span>
            <span className="journey-index-event-copy">
                <span className="journey-index-event-title">{item.title}</span>
                <span className="journey-index-event-meta">
                    {formatNavDate(item)} <span aria-hidden="true">·</span> {item.category}
                </span>
            </span>
        </button>
    )
}

JourneyEventButton.propTypes = {
    item: PropTypes.shape({
        id: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        date: PropTypes.string.isRequired,
        dateLabel: PropTypes.string.isRequired,
        category: PropTypes.string.isRequired,
    }).isRequired,
    isActive: PropTypes.bool.isRequired,
    isObscured: PropTypes.bool.isRequired,
    onSelect: PropTypes.func.isRequired,
    onHover: PropTypes.func,
}

function JourneyNavigator({
    items,
    onSelect,
    onHoverItem,
    progress,
    headerHeight = 0,
    isObscured = false,
    viewMode,
}) {
    const [activeJourneyId, setActiveJourneyId] = useState(() => items[0]?.id || '')
    const [isExpanded, setIsExpanded] = useState(false)
    const [isSheetOpen, setIsSheetOpen] = useState(false)
    const closeDelayRef = useRef(null)
    const selectDelayRef = useRef(null)
    const mobileTriggerRef = useRef(null)
    const sheetRef = useRef(null)
    const closeButtonRef = useRef(null)
    const activeJourneyIdRef = useRef(activeJourneyId)
    const itemsRef = useRef(items)
    const onSelectRef = useRef(onSelect)
    const shouldReduceMotion = useReducedMotion()

    const groupedItems = useMemo(() => groupByYear(items), [items])
    const activeItem = useMemo(
        () => items.find((item) => item.id === activeJourneyId) || items[0] || null,
        [activeJourneyId, items]
    )
    const activeIndex = activeItem
        ? items.findIndex((item) => item.id === activeItem.id)
        : -1

    const updateActiveJourney = useCallback((id) => {
        if (!id || activeJourneyIdRef.current === id) return
        activeJourneyIdRef.current = id
        setActiveJourneyId(id)
    }, [])

    const selectJourneyItem = useCallback((id, options) => {
        updateActiveJourney(id)
        onSelect(id, options)
    }, [onSelect, updateActiveJourney])

    useEffect(() => {
        itemsRef.current = items
        onSelectRef.current = onSelect
    }, [items, onSelect])

    // Keep scrollspy state local so normal scrolling only rerenders the navigator.
    useEffect(() => {
        if (!items.length) {
            activeJourneyIdRef.current = ''
            setActiveJourneyId('')
            return undefined
        }

        if (!items.some((item) => item.id === activeJourneyIdRef.current)) {
            activeJourneyIdRef.current = items[0].id
            setActiveJourneyId(items[0].id)
        }

        const elements = items
            .map((item) => document.getElementById(`journey-${item.id}`))
            .filter(Boolean)
        if (!elements.length) return undefined

        const visibleIds = new Set()
        const chooseClosestToFocus = () => {
            const focusY = window.innerHeight * 0.42
            let closestId = ''
            let closestDistance = Number.POSITIVE_INFINITY

            elements.forEach((element) => {
                if (!visibleIds.has(element.dataset.journeyId)) return
                const rect = element.getBoundingClientRect()
                const distance = Math.abs(rect.top + (rect.height / 2) - focusY)
                if (distance < closestDistance) {
                    closestDistance = distance
                    closestId = element.dataset.journeyId
                }
            })

            updateActiveJourney(closestId)
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                const id = entry.target.dataset.journeyId
                if (entry.isIntersecting) visibleIds.add(id)
                else visibleIds.delete(id)
            })
            chooseClosestToFocus()
        }, {
            root: null,
            rootMargin: '-28% 0px -48% 0px',
            threshold: [0, 0.01, 0.25, 0.5, 0.75]
        })

        elements.forEach((element) => observer.observe(element))

        const seedFrame = window.requestAnimationFrame(() => {
            const focusTop = window.innerHeight * 0.28
            const focusBottom = window.innerHeight * 0.52
            elements.forEach((element) => {
                const rect = element.getBoundingClientRect()
                if (rect.bottom >= focusTop && rect.top <= focusBottom) {
                    visibleIds.add(element.dataset.journeyId)
                }
            })
            chooseClosestToFocus()
        })

        let resizeFrame = null
        const handleResize = () => {
            if (resizeFrame !== null) return
            resizeFrame = window.requestAnimationFrame(() => {
                resizeFrame = null
                chooseClosestToFocus()
            })
        }
        window.addEventListener('resize', handleResize, { passive: true })

        return () => {
            window.cancelAnimationFrame(seedFrame)
            if (resizeFrame !== null) window.cancelAnimationFrame(resizeFrame)
            window.removeEventListener('resize', handleResize)
            observer.disconnect()
        }
    }, [items, updateActiveJourney, viewMode])

    useEffect(() => {
        let firstFrame = null
        let secondFrame = null

        const navigateFromHash = () => {
            if (!window.location.hash) return

            let hashId = window.location.hash.slice(1)
            try {
                hashId = decodeURIComponent(hashId)
            } catch {
                return
            }
            if (hashId.startsWith('journey-')) hashId = hashId.slice('journey-'.length)
            if (!itemsRef.current.some((item) => item.id === hashId)) return

            updateActiveJourney(hashId)
            secondFrame = window.requestAnimationFrame(() => {
                onSelectRef.current?.(hashId, { updateHash: false })
            })
        }

        firstFrame = window.requestAnimationFrame(navigateFromHash)
        window.addEventListener('hashchange', navigateFromHash)

        return () => {
            if (firstFrame !== null) window.cancelAnimationFrame(firstFrame)
            if (secondFrame !== null) window.cancelAnimationFrame(secondFrame)
            window.removeEventListener('hashchange', navigateFromHash)
        }
    }, [updateActiveJourney])

    const clearCloseDelay = () => {
        if (closeDelayRef.current) {
            window.clearTimeout(closeDelayRef.current)
            closeDelayRef.current = null
        }
    }

    const expandMinimap = () => {
        clearCloseDelay()
        setIsExpanded(true)
    }

    const collapseMinimap = () => {
        clearCloseDelay()
        closeDelayRef.current = window.setTimeout(() => {
            setIsExpanded(false)
            onHoverItem?.(null)
        }, 120)
    }

    const closeSheet = () => setIsSheetOpen(false)

    const selectFromSheet = (id) => {
        setIsSheetOpen(false)
        if (selectDelayRef.current) window.clearTimeout(selectDelayRef.current)
        selectDelayRef.current = window.setTimeout(
            () => selectJourneyItem(id),
            shouldReduceMotion ? 0 : SHEET_TRANSITION_MS
        )
    }

    useEffect(() => () => {
        clearCloseDelay()
        if (selectDelayRef.current) window.clearTimeout(selectDelayRef.current)
        onHoverItem?.(null)
    }, [onHoverItem])

    useEffect(() => {
        if (isObscured) {
            setIsExpanded(false)
            setIsSheetOpen(false)
            onHoverItem?.(null)
        }
    }, [isObscured, onHoverItem])

    useEffect(() => {
        if (!items.length) setIsSheetOpen(false)
    }, [items.length])

    useEffect(() => {
        const desktopQuery = window.matchMedia('(min-width: 1280px)')
        const closeSheetOnDesktop = (event) => {
            if (event.matches) setIsSheetOpen(false)
        }

        desktopQuery.addEventListener('change', closeSheetOnDesktop)
        return () => desktopQuery.removeEventListener('change', closeSheetOnDesktop)
    }, [])

    useEffect(() => {
        if (!isSheetOpen) return undefined

        const previousOverflow = document.body.style.overflow
        const previousPaddingRight = document.body.style.paddingRight
        const scrollbarGap = window.innerWidth - document.documentElement.clientWidth

        document.body.style.overflow = 'hidden'
        if (scrollbarGap > 0) document.body.style.paddingRight = `${scrollbarGap}px`
        document.body.classList.add('journey-index-open')

        const focusFrame = window.requestAnimationFrame(() => closeButtonRef.current?.focus())

        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                event.preventDefault()
                closeSheet()
                return
            }

            if (event.key !== 'Tab' || !sheetRef.current) return

            const focusable = Array.from(
                sheetRef.current.querySelectorAll('button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])')
            )
            if (!focusable.length) return

            const first = focusable[0]
            const last = focusable[focusable.length - 1]

            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault()
                last.focus()
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault()
                first.focus()
            }
        }

        document.addEventListener('keydown', handleKeyDown)

        return () => {
            window.cancelAnimationFrame(focusFrame)
            document.removeEventListener('keydown', handleKeyDown)
            document.body.style.overflow = previousOverflow
            document.body.style.paddingRight = previousPaddingRight
            document.body.classList.remove('journey-index-open')
            mobileTriggerRef.current?.focus()
        }
    }, [isSheetOpen])

    if (!items.length || !activeItem) return null

    return (
        <>
            <aside
                className={`journey-minimap ${isObscured ? 'is-obscured' : ''}`}
                data-expanded={isExpanded}
                aria-label="Journey index"
                aria-hidden={isObscured ? 'true' : undefined}
                onMouseEnter={expandMinimap}
                onMouseLeave={collapseMinimap}
                onFocusCapture={expandMinimap}
                onBlurCapture={(event) => {
                    if (!event.currentTarget.contains(event.relatedTarget)) collapseMinimap()
                }}
            >
                <div className="journey-minimap-shell">
                    {items.length > 1 && (
                        <div className="journey-minimap-progress" aria-hidden="true">
                            <motion.span style={{ scaleY: progress }} />
                        </div>
                    )}

                    <header className="journey-minimap-header">
                        <span className="journey-minimap-label-collapsed">Journey</span>
                        <span className="journey-minimap-label-expanded">Journey Index</span>
                        <span className="journey-minimap-count">{activeIndex + 1}/{items.length}</span>
                    </header>

                    <div className="journey-minimap-list">
                        {Object.entries(groupedItems).map(([year, yearItems]) => (
                            <section key={year} className="journey-index-year-group" aria-label={year}>
                                <div className={`journey-index-year ${activeItem.date.startsWith(year) ? 'is-active' : ''}`}>
                                    {year}
                                </div>
                                {yearItems.map((item) => (
                                    <JourneyEventButton
                                        key={item.id}
                                        item={item}
                                        isActive={item.id === activeItem.id}
                                        isObscured={isObscured}
                                        onSelect={selectJourneyItem}
                                        onHover={onHoverItem}
                                    />
                                ))}
                            </section>
                        ))}
                    </div>
                </div>
            </aside>

            <div
                className="journey-mobile-index"
                data-journey-mobile-index
                style={{ top: `${Math.max(headerHeight, 0)}px` }}
            >
                <button
                    ref={mobileTriggerRef}
                    type="button"
                    className="journey-mobile-index-trigger"
                    onClick={() => setIsSheetOpen(true)}
                    disabled={isObscured}
                    aria-haspopup="dialog"
                    aria-expanded={isSheetOpen}
                    aria-controls="journey-index-sheet"
                >
                    <span className="journey-mobile-year">{activeItem.date.slice(0, 4)}</span>
                    <span className="journey-mobile-divider" aria-hidden="true">·</span>
                    <span className="journey-mobile-title">{activeItem.title}</span>
                    <span className="journey-mobile-counter">{activeIndex + 1} / {items.length}</span>
                    <svg viewBox="0 0 20 20" aria-hidden="true" className="journey-mobile-chevron">
                        <path d="m5 7.5 5 5 5-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>
            </div>

            <AnimatePresence>
                {isSheetOpen && (
                    <div className="journey-sheet-layer">
                        <motion.button
                            type="button"
                            className="journey-sheet-backdrop"
                            aria-label="Close Journey Index"
                            onClick={closeSheet}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: shouldReduceMotion ? 0 : 0.18 }}
                        />
                        <motion.section
                            ref={sheetRef}
                            id="journey-index-sheet"
                            className="journey-sheet"
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="journey-index-title"
                            initial={{ y: shouldReduceMotion ? 0 : '100%', opacity: shouldReduceMotion ? 1 : 0.94 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: shouldReduceMotion ? 0 : '100%', opacity: shouldReduceMotion ? 1 : 0.94 }}
                            transition={{ duration: shouldReduceMotion ? 0 : 0.21, ease: [0.22, 1, 0.36, 1] }}
                        >
                            <div className="journey-sheet-handle" aria-hidden="true" />
                            <header className="journey-sheet-header">
                                <div>
                                    <p className="journey-sheet-eyebrow">Navigate the timeline</p>
                                    <h2 id="journey-index-title">Journey Index</h2>
                                </div>
                                <button
                                    ref={closeButtonRef}
                                    type="button"
                                    className="journey-sheet-close"
                                    onClick={closeSheet}
                                    aria-label="Close Journey Index"
                                >
                                    <svg viewBox="0 0 20 20" aria-hidden="true">
                                        <path d="m5 5 10 10M15 5 5 15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                                    </svg>
                                </button>
                            </header>

                            <div className="journey-sheet-content">
                                {Object.entries(groupedItems).map(([year, yearItems]) => (
                                    <section key={year} className="journey-sheet-year-group" aria-labelledby={`journey-sheet-year-${year}`}>
                                        <h3 id={`journey-sheet-year-${year}`}>{year}</h3>
                                        <div className="journey-sheet-events">
                                            {yearItems.map((item) => {
                                                const isActive = item.id === activeItem.id
                                                return (
                                                    <button
                                                        key={item.id}
                                                        type="button"
                                                        className={`journey-sheet-event ${isActive ? 'is-active' : ''}`}
                                                        aria-current={isActive ? 'step' : undefined}
                                                        onClick={() => selectFromSheet(item.id)}
                                                    >
                                                        <span className="journey-sheet-event-marker" aria-hidden="true" />
                                                        <span className="journey-sheet-event-copy">
                                                            <span className="journey-sheet-event-title">{item.title}</span>
                                                            <span className="journey-sheet-event-meta">
                                                                {formatNavDate(item)} <span aria-hidden="true">·</span> {item.category}
                                                            </span>
                                                        </span>
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </section>
                                ))}
                            </div>
                        </motion.section>
                    </div>
                )}
            </AnimatePresence>
        </>
    )
}

JourneyNavigator.propTypes = {
    items: PropTypes.arrayOf(PropTypes.object).isRequired,
    onSelect: PropTypes.func.isRequired,
    onHoverItem: PropTypes.func,
    progress: PropTypes.object.isRequired,
    headerHeight: PropTypes.number,
    isObscured: PropTypes.bool,
    viewMode: PropTypes.oneOf(['timeline', 'grid']).isRequired,
}

export default memo(JourneyNavigator)
