// CSP inline-script hashes (D-124).
//
// The site's CSP allows no inline script except the ones the build writes
// into the HTML (the pre-paint route-home toggle and the route-shell script).
// Their sha256 hashes live in vercel.json. This script recomputes them from
// dist/**/*.html after `vite build`:
//   node scripts/csp-hashes.mjs          → fail if vercel.json is out of date
//   node scripts/csp-hashes.mjs --write  → rewrite the hash list in vercel.json
// JSON-LD blocks are data, not script, so CSP does not apply to them.
// dist/stats.html (bundle visualizer) is a dev report and is skipped.

import { createHash } from 'node:crypto'
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dist = path.join(root, 'dist')
const vercelPath = path.join(root, 'vercel.json')
const SKIP = new Set(['stats.html'])

const htmlFiles = []
const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name)
        if (entry.isDirectory()) walk(full)
        else if (entry.name.endsWith('.html') && !SKIP.has(path.relative(dist, full))) htmlFiles.push(full)
    }
}
walk(dist)

const hashes = new Set()
for (const file of htmlFiles) {
    const html = readFileSync(file, 'utf8')
    for (const match of html.matchAll(/<script(?![^>]*\bsrc=)([^>]*)>([\s\S]*?)<\/script>/g)) {
        if (/type=["']?application\/(ld\+)?json/i.test(match[1])) continue
        // Hash the LF form: Vercel and CI build on Linux from LF blobs, so a Windows
        // CRLF checkout must never produce the hash that ships (D-127).
        const body = match[2].replace(/\r\n/g, '\n')
        hashes.add(`'sha256-${createHash('sha256').update(body).digest('base64')}'`)
    }
}
const wanted = [...hashes].sort()

// Read the policy by parsing the JSON, never by matching its text layout.
const CSP_KEYS = new Set(['content-security-policy', 'content-security-policy-report-only'])
let vercelText = ''
let policy = null
try {
    vercelText = readFileSync(vercelPath, 'utf8')
    const config = JSON.parse(vercelText)
    for (const block of config.headers || []) {
        const header = (block.headers || []).find((h) => CSP_KEYS.has(String(h.key).toLowerCase()))
        if (header) { policy = String(header.value); break }
    }
} catch {
    policy = null
}

if (policy === null) {
    // Vercel reads vercel.json (headers included) before the build and the file
    // the build command sees does not keep them, so this check cannot run there
    // (D-129). GitHub CI (`npm run build`, ci.yml) and local builds enforce it.
    if (process.env.VERCEL) {
        console.log('csp-hashes: skipped on Vercel (vercel.json headers are not visible to the build; CI enforces this check)')
        process.exit(0)
    }
    console.error('csp-hashes: no Content-Security-Policy header in vercel.json')
    process.exit(1)
}
const scriptSrc = policy.match(/script-src ([^;]*)/)
const current = (scriptSrc?.[1].match(/'sha256-[^']+'/g) || []).sort()

const same = current.length === wanted.length && current.every((h, i) => h === wanted[i])
if (same) {
    console.log(`csp-hashes: ${wanted.length} inline script hash(es) match vercel.json (${htmlFiles.length} HTML files)`)
    process.exit(0)
}

if (process.argv.includes('--write')) {
    const sources = scriptSrc[1].split(' ').filter((s) => !s.startsWith("'sha256-"))
    const [self, ...rest] = sources
    const nextScriptSrc = ['script-src', self, ...wanted, ...rest].join(' ')
    const nextPolicy = policy.replace(/script-src [^;]*/, nextScriptSrc)
    // Swap only the JSON string, so the file keeps its formatting.
    const before = JSON.stringify(policy)
    if (!vercelText.includes(before)) {
        console.error('csp-hashes: could not locate the policy string in vercel.json to rewrite it')
        process.exit(1)
    }
    writeFileSync(vercelPath, vercelText.replace(before, JSON.stringify(nextPolicy)))
    console.log(`csp-hashes: wrote ${wanted.length} hash(es) to vercel.json`)
    process.exit(0)
}

console.error('csp-hashes: vercel.json script-src hashes do not match the built HTML.')
console.error(`  built:  ${wanted.join(' ')}`)
console.error(`  config: ${current.join(' ')}`)
console.error('  Run `npm run build:csp` (or `node scripts/csp-hashes.mjs --write` after a build) and commit vercel.json.')
process.exit(1)
