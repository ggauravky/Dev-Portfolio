// GitHub activity, last-known-good (D-094): `node --test scripts/github-activity.test.mjs`
// Simulates upstream failures (403, 500, network, malformed) and a successful
// refresh, for both the Vercel function and the browser store. No network.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import handler, { summarise, loadActivity, CACHE_OK, CACHE_FAIL } from '../api/github-activity.js'
import { readLastKnownGood, refreshActivity, isValidActivity, newerOf } from '../src/lib/githubActivity.js'
import { formatGitHubStat } from '../src/lib/liveStatus.js'
import seed from '../src/data/githubActivitySeed.js'

const json = (status, body, headers = {}) => new Response(body === undefined ? null : JSON.stringify(body), {
    status, headers: { 'content-type': 'application/json', ...headers },
})
const memoryStorage = () => {
    const map = new Map()
    return { getItem: (k) => (map.has(k) ? map.get(k) : null), setItem: (k, v) => map.set(k, String(v)), map }
}
const days = [
    { date: '2026-11-12', count: 12 },
    { date: '2026-11-13', count: 0 },
    { date: '2026-11-14', count: 3 },
]
const fakeRes = () => {
    const res = { headers: {}, code: 0, body: undefined }
    res.setHeader = (k, v) => { res.headers[k.toLowerCase()] = v }
    res.status = (c) => { res.code = c; return res }
    res.json = (b) => { res.body = b; return res }
    res.end = () => res
    return res
}

// ── Server ──────────────────────────────────────────────────────────────────
test('summarise: count from total, last active day, ignores future days', () => {
    const s = summarise([...days, { date: '2099-01-01', count: 9 }], 1999, '2026-11-14')
    assert.deepEqual(s, { count: 1999, asOf: '2026-11-14', lastActive: '2026-11-14' })
    assert.equal(summarise(days, undefined, '2026-11-14').count, 15)
    assert.throws(() => summarise([], 5))
})

for (const [label, fetchImpl] of [
    ['403 rate limit', async () => json(403, { message: 'rate limited' })],
    ['500', async () => json(500, {})],
    ['network error', async () => { throw new TypeError('fetch failed') }],
    ['malformed body', async () => json(200, { total: { lastYear: 'NaN' }, contributions: 'oops' })],
]) {
    test(`function: ${label} → 502, no-store, nothing cached`, async () => {
        await assert.rejects(loadActivity({ token: '', fetchImpl }))
        const original = globalThis.fetch
        globalThis.fetch = fetchImpl
        const errorLog = console.error
        console.error = () => {}
        try {
            const res = fakeRes()
            await handler({ method: 'GET', headers: {} }, res)
            assert.equal(res.code, 502)
            assert.equal(res.headers['cache-control'], CACHE_FAIL)
        } finally {
            globalThis.fetch = original
            console.error = errorLog
        }
    })
}

test('function: success → 200, CDN cache 30 min + stale-while-revalidate/stale-if-error, ETag 304', async () => {
    const original = globalThis.fetch
    globalThis.fetch = async () => json(200, { total: { lastYear: 1999 }, contributions: days }, { etag: 'W/"x"' })
    try {
        const res = fakeRes()
        await handler({ method: 'GET', headers: {} }, res)
        assert.equal(res.code, 200)
        assert.equal(res.body.count, 1999)
        assert.equal(res.headers['cache-control'], CACHE_OK)
        assert.match(CACHE_OK, /s-maxage=1800/)
        assert.match(CACHE_OK, /stale-if-error/)
        const again = fakeRes()
        await handler({ method: 'GET', headers: { 'if-none-match': res.headers.etag } }, again)
        assert.equal(again.code, 304)
    } finally {
        globalThis.fetch = original
    }
})

test('function: GraphQL failure with a token falls back to the no-auth API', async () => {
    const fetchImpl = async (url) => (String(url).includes('graphql') ? json(401, {}) : json(200, { total: { lastYear: 7 }, contributions: days }))
    const result = await loadActivity({ token: 'bad-token', fetchImpl })
    assert.equal(result.count, 7)
    assert.equal(result.source, 'contributions-api')
})

// ── Browser store ───────────────────────────────────────────────────────────
const good = { count: 2001, asOf: '2026-11-15', lastActive: '2026-11-15', updatedAt: '2026-11-15T09:00:00Z', source: 'contributions-api' }

test('seed is valid and is the first render with an empty store', () => {
    assert.ok(isValidActivity(seed))
    assert.deepEqual(readLastKnownGood({ storage: memoryStorage() }), seed)
})

for (const [label, fetchImpl] of [
    ['403', async () => json(403, { error: 'x' })],
    ['500', async () => json(500, { error: 'x' })],
    ['network', async () => { throw new TypeError('offline') }],
    ['malformed', async () => json(200, { count: 'NaN', asOf: null })],
    ['undefined count', async () => json(200, { asOf: '2026-11-15', lastActive: null, updatedAt: '2026-11-15T00:00:00Z' })],
]) {
    test(`store: ${label} keeps the last-known-good value and writes nothing`, async () => {
        const storage = memoryStorage()
        const warn = console.warn
        console.warn = () => {}
        try {
            const kept = await refreshActivity(seed, { fetchImpl, storage })
            assert.equal(kept, seed)
            assert.equal(storage.map.size, 0)
            assert.equal(formatGitHubStat(kept), '1,999 contributions in the last year, last on 14 Nov')
        } finally {
            console.warn = warn
        }
    })
}

test('store: a successful refresh is persisted and wins on the next load', async () => {
    const storage = memoryStorage()
    const next = await refreshActivity(seed, { fetchImpl: async () => json(200, good), storage })
    assert.equal(next.count, 2001)
    assert.equal(readLastKnownGood({ storage }).count, 2001)
    // An older answer (e.g. a stale CDN copy) never replaces a newer value.
    const older = { ...good, count: 5, updatedAt: '2026-01-01T00:00:00Z' }
    assert.equal((await refreshActivity(next, { fetchImpl: async () => json(200, older), storage })).count, 2001)
})

test('store: a corrupt stored copy falls back to the seed', () => {
    const storage = memoryStorage()
    storage.setItem('gh_activity_lkg_v1', '{not json')
    assert.deepEqual(readLastKnownGood({ storage }), seed)
    assert.equal(newerOf(null, undefined), null)
})

test('display: never prints NaN/undefined/null; omits the line with no value', () => {
    assert.equal(formatGitHubStat(null), null)
    assert.equal(formatGitHubStat({ count: undefined, lastActive: null }), null)
    assert.equal(formatGitHubStat({ count: 0, lastActive: null }), '0 contributions in the last year')
    for (const v of [seed, good]) assert.doesNotMatch(formatGitHubStat(v), /NaN|undefined|null/)
})
