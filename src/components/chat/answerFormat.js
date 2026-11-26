// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Source: https://github.com/ggauravky/Dev-Portfolio
//
// The small formatting answers may use (D-109): paragraphs, "- " and "1. "
// lists, **bold** names, site paths in parentheses and links. Parsed into
// plain data (no HTML strings), so React renders it without innerHTML. Links
// are kept only for site paths and a short list of known hosts; anything else
// stays text. Headings, code fences and stray markup are shown as text.

// Hosts an answer may link to (the owner's public profiles and the site).
const SAFE_HOSTS = new Set([
    'ggauravky.vercel.app', 'github.com', 'www.linkedin.com', 'linkedin.com', 'leetcode.com',
    'www.codechef.com', 'www.geeksforgeeks.org', 'geeksforgeeks.org',
    'instagram.com', 'www.instagram.com', 'x.com', 'twitter.com',
])
const SITE_HOST = 'ggauravky.vercel.app'
const PATH_RE = /^\/[\w\-/#.]*$/

/** A safe link target, or null: { href, internal }. */
export function safeHref(raw) {
    const url = String(raw || '').trim()
    // Tap to call or write: digits-only tel:, one plain address for mailto:.
    if (/^tel:\+?\d{6,15}$/.test(url)) return { href: url, internal: false, plain: true }
    if (/^mailto:[^\s@/?#]+@[^\s@/?#]+\.[a-z]{2,}$/i.test(url)) return { href: url, internal: false, plain: true }
    if (PATH_RE.test(url) && !url.startsWith('//')) return { href: url, internal: true }
    let parsed
    try { parsed = new URL(url) } catch { return null }
    if (parsed.protocol !== 'https:' || !SAFE_HOSTS.has(parsed.hostname)) return null
    if (parsed.hostname === SITE_HOST) {
        const path = `${parsed.pathname}${parsed.hash}` || '/'
        return PATH_RE.test(path) ? { href: path, internal: true } : null
    }
    return { href: parsed.href, internal: false }
}

// **bold** | [label](url) | (/site/path) | bare https URL | citation [2] or [1, 3]
// (a citation never follows a letter or digit: "array[0]" stays text)
const INLINE_RE = /\*\*([^*\n]+?)\*\*|\[([^\]\n]{1,120})\]\(([^)\s]+)\)|\((\/[\w\-/#.]*)\)|(https?:\/\/[^\s)<>"]+)|\s?(?<![A-Za-z0-9_])\[(\d{1,2}(?:\s*,\s*\d{1,2})*)\](?!\()/g

/** Inline text → [{ t: 'text'|'strong'|'link'|'cite', v, href?, internal?, n? }]. */
export function parseInline(text) {
    const out = []
    let last = 0
    const push = (part) => {
        const prev = out[out.length - 1]
        if (part.t === 'text' && prev?.t === 'text') prev.v += part.v
        else if (part.v) out.push(part)
    }
    for (const m of String(text).matchAll(INLINE_RE)) {
        if (m.index > last) push({ t: 'text', v: text.slice(last, m.index) })
        if (m[6] !== undefined) {
            // Source markers (D-113): one part per number.
            for (const n of m[6].split(',')) out.push({ t: 'cite', v: n.trim(), n: Number(n) })
        } else if (m[1] !== undefined) {
            push({ t: 'strong', v: m[1] })
        } else if (m[2] !== undefined) {
            const link = safeHref(m[3])
            push(link ? { t: 'link', v: m[2], ...link } : { t: 'text', v: m[2] })
        } else if (m[4] !== undefined) {
            const link = safeHref(m[4])
            if (link) {
                push({ t: 'text', v: '(' })
                push({ t: 'link', v: m[4], ...link })
                push({ t: 'text', v: ')' })
            } else {
                push({ t: 'text', v: m[0] })
            }
        } else {
            // A bare URL: trailing punctuation belongs to the sentence.
            const url = m[5].replace(/[.,;:!?]+$/, '')
            const link = safeHref(url)
            push(link ? { t: 'link', v: url, ...link } : { t: 'text', v: url })
            if (url.length < m[5].length) push({ t: 'text', v: m[5].slice(url.length) })
        }
        last = m.index + m[0].length
    }
    if (last < text.length) push({ t: 'text', v: text.slice(last) })
    return out
}

const BULLET = /^\s*[-*•]\s+/
const NUMBER = /^\s*\d{1,2}[.)]\s+/
const HEADING = /^\s*(#{1,6})\s+(.+?)\s*#*\s*$/
const TABLE_ROW = /^\s*\|.*\|\s*$/
const TABLE_RULE = /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/
const cells = (line) => line.trim().replace(/^\||\|$/g, '').split('|').map((cell) => cell.trim())

/**
 * Answer text → blocks (D-134):
 *   { type: 'p', inline } | { type: 'ul'|'ol', items: [inline] }
 *   { type: 'heading', level, inline }   (### headings in long answers)
 *   { type: 'table', head: [text], rows: [[text]] }   (cells parsed inline when rendered)
 * While an answer streams, an unclosed "**" is dropped so it never flashes,
 * and a table shows once its header rule has arrived.
 */
export function parseAnswer(text) {
    let source = String(text || '').replace(/\r\n?/g, '\n')
        .replace(/^```[^\n]*$/gm, '')
    if ((source.match(/\*\*/g) || []).length % 2) source = source.replace(/\*\*(?![\s\S]*\*\*)/, '')
    const blocks = []
    for (const chunk of source.split(/\n{2,}/)) {
        let paragraph = []
        let list = null
        let table = null
        const flushParagraph = () => {
            if (paragraph.length) blocks.push({ type: 'p', inline: parseInline(paragraph.join(' ')) })
            paragraph = []
        }
        const flushList = () => {
            if (list) blocks.push(list)
            list = null
        }
        const flushTable = () => {
            if (!table) return
            // A pipe line without a header rule is just text.
            if (table.length >= 2 && TABLE_RULE.test(table[1])) {
                const head = cells(table[0])
                const rows = table.slice(2).map(cells).map((row) => head.map((_, i) => row[i] ?? ''))
                blocks.push({ type: 'table', head, rows })
            } else {
                paragraph.push(...table.map((l) => l.trim()))
                flushParagraph()
            }
            table = null
        }
        const lines = chunk.split('\n')
        const final = chunk === source.split(/\n{2,}/).at(-1)
        for (const [n, line] of lines.entries()) {
            if (!line.trim()) continue
            // A table row still arriving (the answer streams): held until it closes.
            if (final && n === lines.length - 1 && /^\s*\|/.test(line) && !TABLE_ROW.test(line)) continue
            if (TABLE_ROW.test(line) || (table && TABLE_RULE.test(line))) {
                flushParagraph()
                flushList()
                table = table || []
                table.push(line)
                continue
            }
            flushTable()
            const heading = line.match(HEADING)
            if (heading) {
                flushParagraph()
                flushList()
                blocks.push({ type: 'heading', level: Math.min(4, Math.max(3, heading[1].length)), inline: parseInline(heading[2]) })
                continue
            }
            const kind = BULLET.test(line) ? 'ul' : NUMBER.test(line) ? 'ol' : null
            if (kind) {
                flushParagraph()
                if (list?.type !== kind) {
                    flushList()
                    list = { type: kind, items: [] }
                }
                list.items.push(parseInline(line.replace(kind === 'ul' ? BULLET : NUMBER, '')))
            } else if (list && /^\s{2,}\S/.test(line)) {
                // An indented continuation of the last item.
                list.items[list.items.length - 1].push({ t: 'text', v: ` ${line.trim()}` })
            } else {
                flushList()
                paragraph.push(line.trim())
            }
        }
        flushTable()
        flushParagraph()
        flushList()
    }
    return blocks
}

const plain = (inline) => inline.filter((part) => part.t !== 'cite').map((part) => part.v).join('')
const plainCell = (cell) => plain(parseInline(cell))

/** The answer as plain text (for Copy): markup removed, links kept as text. */
export const answerPlainText = (text) => parseAnswer(text)
    .map((block) => {
        if (block.type === 'p' || block.type === 'heading') return plain(block.inline)
        if (block.type === 'table') return [block.head, ...block.rows].map((row) => row.map(plainCell).join(' | ')).join('\n')
        return block.items.map((item, i) => `${block.type === 'ol' ? `${i + 1}.` : '-'} ${plain(item)}`).join('\n')
    })
    .join('\n\n')
