// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Recent Searches Hook — localStorage-based personalization for Command Palette
// Source: https://github.com/ggauravky/Dev-Portfolio

import { useState, useCallback } from 'react'

const STORAGE_KEY = 'gky-recent-searches'
const MAX_RECENTS = 6
const MAX_QUERY_LENGTH = 40

/** Safely read from localStorage — returns [] on failure */
function readStorage() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (!raw) return []
        const parsed = JSON.parse(raw)
        if (!Array.isArray(parsed)) return []
        // Filter out any malformed entries
        return parsed.filter(
            (item) => item && typeof item.query === 'string' && item.query.trim().length > 0
        )
    } catch (_) {
        return []
    }
}

/** Safely write to localStorage — silently fails on storage full / disabled */
function writeStorage(items) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch (_) {
        // Quota exceeded or localStorage unavailable — silently ignore
    }
}

/**
 * useRecentSearches
 *
 * Manages a short list of recent search queries in localStorage.
 * - Max 6 items
 * - Most-recent-first
 * - Deduplicated (case-insensitive)
 * - Only stores queries that led to navigation/action (call addRecent on select)
 * - Gracefully handles corrupted storage and SSR/unavailable localStorage
 */
export function useRecentSearches() {
    const [recents, setRecents] = useState(() => readStorage())

    const addRecent = useCallback((query) => {
        if (!query || typeof query !== 'string') return
        const trimmed = query.trim().slice(0, MAX_QUERY_LENGTH)
        if (trimmed.length < 2) return // Ignore single-character queries

        setRecents((prev) => {
            // Deduplicate — remove existing same entry (case-insensitive)
            const filtered = prev.filter(
                (item) => item.query.toLowerCase() !== trimmed.toLowerCase()
            )
            // Prepend new entry
            const updated = [{ query: trimmed, ts: Date.now() }, ...filtered].slice(0, MAX_RECENTS)
            writeStorage(updated)
            return updated
        })
    }, [])

    const removeRecent = useCallback((query) => {
        setRecents((prev) => {
            const updated = prev.filter(
                (item) => item.query.toLowerCase() !== query.toLowerCase()
            )
            writeStorage(updated)
            return updated
        })
    }, [])

    const clearRecents = useCallback(() => {
        try {
            localStorage.removeItem(STORAGE_KEY)
        } catch (_) { /* noop */ }
        setRecents([])
    }, [])

    return { recents, addRecent, removeRecent, clearRecents }
}
