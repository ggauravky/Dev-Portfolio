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
        hashes.add(`'sha256-${createHash('sha256').update(match[2]).digest('base64')}'`)
    }
}
const wanted = [...hashes].sort()

const vercelText = readFileSync(vercelPath, 'utf8')
const cspKey = /"key": "Content-Security-Policy(?:-Report-Only)?",\s*"value": "([^"]*)"/
const cspMatch = vercelText.match(cspKey)
if (!cspMatch) {
    console.error('csp-hashes: no Content-Security-Policy header in vercel.json')
    process.exit(1)
}
const policy = cspMatch[1]
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
    writeFileSync(vercelPath, vercelText.replace(policy, nextPolicy))
    console.log(`csp-hashes: wrote ${wanted.length} hash(es) to vercel.json`)
    process.exit(0)
}

console.error('csp-hashes: vercel.json script-src hashes do not match the built HTML.')
console.error(`  built:  ${wanted.join(' ')}`)
console.error(`  config: ${current.join(' ')}`)
console.error('  Run `npm run build:csp` (or `node scripts/csp-hashes.mjs --write` after a build) and commit vercel.json.')
process.exit(1)
