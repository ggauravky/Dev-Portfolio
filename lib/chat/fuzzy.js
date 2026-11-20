// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Source: https://github.com/ggauravky/Dev-Portfolio
//
// Spelling tolerance shared by the conversation layer and retrieval (D-110,
// D-111). A word is only ever replaced by a word from a known list (the
// corpus's words, or the intent keywords), and only when it is close:
// - 4–5 letters: just a missing double letter ("skils") or two swapped letters ("wrok")
// - 6–8 letters: one edit ("intenship", "instagarm")
// - 9+ letters: two edits
// So "Paris" never becomes "parts", and a word nobody misspells stays as it is.

/** Optimal-string-alignment distance, giving up past `max`. */
export function editDistance(a, b, max = 2) {
    if (Math.abs(a.length - b.length) > max) return max + 1
    let prev2 = null
    let prev = Array.from({ length: b.length + 1 }, (_, j) => j)
    for (let i = 1; i <= a.length; i += 1) {
        const row = [i]
        let rowMin = i
        for (let j = 1; j <= b.length; j += 1) {
            const cost = a[i - 1] === b[j - 1] ? 0 : 1
            let value = Math.min(prev[j] + 1, row[j - 1] + 1, prev[j - 1] + cost)
            if (prev2 && i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) value = Math.min(value, prev2[j - 2] + 1)
            row.push(value)
            rowMin = Math.min(rowMin, value)
        }
        if (rowMin > max) return max + 1
        prev2 = prev
        prev = row
    }
    return prev[b.length]
}

/** The typos people make on short words: a missing double letter, or a swap. */
export function shortTypo(token, word) {
    if (word.length === token.length + 1) {
        for (let i = 1; i < word.length; i += 1) {
            if (word[i] === word[i - 1] && word.slice(0, i) + word.slice(i + 1) === token) return true
        }
        return false
    }
    if (word.length !== token.length) return false
    const diff = [...word].map((ch, i) => (ch === token[i] ? -1 : i)).filter((i) => i >= 0)
    return diff.length === 2 && diff[1] === diff[0] + 1 && word[diff[0]] === token[diff[1]] && word[diff[1]] === token[diff[0]]
}

export const typoBudget = (word, twoFrom = 9) => (word.length >= twoFrom ? 2 : word.length >= 4 ? 1 : 0)

/**
 * The closest known word to `token`, or null. `known` is [word, weight][] (a
 * higher weight wins a tie, e.g. how many chunks use the word). The first
 * letter must match, except for a swap of the first two letters: people
 * rarely get the first letter wrong, and it keeps the search fast.
 */
export function nearest(token, known, { lenient = null, twoEditsFrom = 9 } = {}) {
    // A curated list can afford two edits from 7 letters ("abiites" → "abilities"),
    // but only towards a long word (9+ letters): two edits away from a short
    // word is usually a different real word.
    const budget = typoBudget(token, twoEditsFrom)
    if (!budget) return null
    let best = null
    for (const [word, weight] of known) {
        if (Math.abs(word.length - token.length) > budget) continue
        if (word[0] !== token[0] && !(word[0] === token[1] && word[1] === token[0])) continue
        // Short words collide with other real words ("paris"/"parts"), so a
        // short target takes only a missing double letter or a swap. A typo
        // that shortened a longer word ("gitub" → "github") is one edit.
        // `lenient`: a few short words whose plain one-letter typos are common
        // and unambiguous ("phne" → "phone", "emal" → "email").
        if (word.length <= 5 && !shortTypo(token, word) && !lenient?.has(word)) continue
        const d = editDistance(token, word, budget)
        if (d === 2 && word.length < 9) continue
        if (d <= budget && (!best || d < best.d || (d === best.d && weight > best.weight))) best = { word, d, weight }
    }
    return best ? best.word : null
}

/**
 * Replace misspelled words in `text` with known words; everything else
 * (punctuation, case of untouched words) is kept. `isKnown(word)` says a word
 * is already right; `known` is the list to correct towards.
 * Returns { text, fixes: Map(original → corrected) }.
 */
export function fixText(text, known, isKnown, options = {}) {
    const fixes = new Map()
    const out = String(text || '').replace(/[\p{L}]+/gu, (word) => {
        const lower = word.toLowerCase()
        // A capital inside a word is a name ("InstaX", "TaskNexus"): never "fixed".
        if (lower.length < 4 || /\p{Ll}\p{Lu}/u.test(word) || isKnown(lower)) return word
        if (fixes.has(lower)) return fixes.get(lower)
        const fixed = nearest(lower, known, options)
        if (!fixed || fixed === lower) return word
        fixes.set(lower, fixed)
        return fixed
    })
    return { text: out, fixes }
}
