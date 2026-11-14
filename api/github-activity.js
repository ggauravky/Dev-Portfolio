// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Source: https://github.com/ggauravky/Dev-Portfolio
//
// GET /api/github-activity — last-year GitHub contribution count for the hero
// live panel and the footer colophon (D-094).
//
// The Vercel CDN is the persisted last-known-good value: a success is cached for
// 30 minutes (s-maxage) and then served stale while one background request
// revalidates it. A failure is never cached (no-store, 502), so the CDN keeps
// serving the previous good copy (stale-if-error) and the browser keeps its own
// copy or the committed seed. Upstream traffic is at most ~2 requests per hour
// per CDN region, far under any rate limit.
//
// Upstreams, in order:
//   1. GitHub GraphQL, only when GITHUB_TOKEN is set (server-side env var, never
//      VITE_*). A fine-grained token with no permissions reads public data.
//   2. github-contributions-api.jogruber.de (no auth), with If-None-Match against
//      the ETag remembered by a warm instance.

const USER = 'ggauravky'
const TIMEOUT_MS = 6000
const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/

export const CACHE_OK = 'public, max-age=0, s-maxage=1800, stale-while-revalidate=86400, stale-if-error=604800'
export const CACHE_FAIL = 'no-store'

// Warm-instance memory for conditional requests to the no-auth upstream.
let jogruberMemo = null // { etag, days, total }

/** Reduce a list of { date, count } days to the one value the site shows. */
export function summarise(days, total, today = new Date().toISOString().slice(0, 10)) {
    if (!Array.isArray(days) || days.length === 0) throw new Error('no contribution days')
    const past = days.filter((d) => d && ISO_DAY.test(d.date) && Number.isInteger(d.count) && d.count >= 0 && d.date <= today)
    if (past.length === 0) throw new Error('no valid past days')
    const count = Number.isInteger(total) && total >= 0 ? total : past.reduce((sum, d) => sum + d.count, 0)
    const last = [...past].reverse().find((d) => d.count > 0)
    return { count, asOf: past[past.length - 1].date, lastActive: last ? last.date : null }
}

async function fromGraphQL(token, fetchImpl) {
    const query = `query($login:String!){user(login:$login){contributionsCollection{contributionCalendar{totalContributions weeks{contributionDays{date contributionCount}}}}}}`
    const res = await fetchImpl('https://api.github.com/graphql', {
        method: 'POST',
        headers: { Authorization: `bearer ${token}`, 'Content-Type': 'application/json', 'User-Agent': 'portfolio-activity' },
        body: JSON.stringify({ query, variables: { login: USER } }),
        signal: AbortSignal.timeout(TIMEOUT_MS),
    })
    if (!res.ok) throw new Error(`graphql HTTP ${res.status}`)
    const json = await res.json()
    const cal = json?.data?.user?.contributionsCollection?.contributionCalendar
    if (!cal || !Array.isArray(cal.weeks)) throw new Error('graphql: unexpected shape')
    const days = cal.weeks.flatMap((w) => w.contributionDays || []).map((d) => ({ date: d.date, count: d.contributionCount }))
    return { ...summarise(days, cal.totalContributions), source: 'github-graphql' }
}

async function fromJogruber(fetchImpl) {
    const headers = { Accept: 'application/json', 'User-Agent': 'portfolio-activity' }
    if (jogruberMemo?.etag) headers['If-None-Match'] = jogruberMemo.etag
    const res = await fetchImpl(`https://github-contributions-api.jogruber.de/v4/${USER}?y=last`, {
        headers,
        signal: AbortSignal.timeout(TIMEOUT_MS),
    })
    if (res.status === 304 && jogruberMemo) {
        return { ...summarise(jogruberMemo.days, jogruberMemo.total), source: 'contributions-api' }
    }
    if (!res.ok) throw new Error(`contributions-api HTTP ${res.status}`)
    const json = await res.json()
    if (!Array.isArray(json?.contributions)) throw new Error('contributions-api: unexpected shape')
    const total = json.total?.lastYear
    const summary = summarise(json.contributions, total)
    const etag = res.headers.get('etag')
    jogruberMemo = etag ? { etag, days: json.contributions, total } : null
    return { ...summary, source: 'contributions-api' }
}

/** Try each upstream; throws only when all of them fail. */
export async function loadActivity({ token = process.env.GITHUB_TOKEN, fetchImpl = fetch } = {}) {
    const errors = []
    if (token) {
        try { return await fromGraphQL(token, fetchImpl) } catch (e) { errors.push(e.message) }
    }
    try { return await fromJogruber(fetchImpl) } catch (e) { errors.push(e.message) }
    throw new Error(errors.join('; '))
}

/** Weak ETag over the value (not the timestamp), so an unchanged count is a 304. */
function etagFor({ count, asOf, lastActive }) {
    const key = `${count}|${asOf}|${lastActive}`
    let h = 0
    for (let i = 0; i < key.length; i += 1) h = (h * 31 + key.charCodeAt(i)) | 0
    return `W/"gh-${(h >>> 0).toString(36)}"`
}

export default async function handler(req, res) {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
        res.setHeader('Allow', 'GET, HEAD')
        return res.status(405).json({ error: 'Use GET.' })
    }
    try {
        const activity = await loadActivity()
        const etag = etagFor(activity)
        res.setHeader('Cache-Control', CACHE_OK)
        res.setHeader('ETag', etag)
        if (req.headers['if-none-match'] === etag) return res.status(304).end()
        return res.status(200).json({ ...activity, updatedAt: new Date().toISOString() })
    } catch (error) {
        // Leave every cached copy untouched: nothing here is stored.
        console.error('[github-activity] refresh failed:', error.message)
        res.setHeader('Cache-Control', CACHE_FAIL)
        return res.status(502).json({ error: 'upstream unavailable' })
    }
}
