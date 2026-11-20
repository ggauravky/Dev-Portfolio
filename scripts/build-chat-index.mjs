// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Source: https://github.com/ggauravky/Dev-Portfolio
//
// Builds lib/chat/corpus-index.json from the site's data (D-100).
//   npm run chat:index           embed new or changed chunks (needs GEMINI_API_KEY
//                                in the environment or .env.local), write the file
//   npm run chat:index -- --check  no network, no writes: warn when the committed
//                                index is out of date (runs inside `npm run build`)
// Without a key it still writes every chunk, keeping vectors whose text is
// unchanged; chunks without a vector make the API fall back to keyword search.

import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { buildChunks, hashText, loadSiteData } from '../lib/chat/corpus.js'
import { embedDocuments } from '../lib/chat/providers.js'
import { EMBED_DIM, EMBED_MODEL } from '../lib/chat/config.js'

const INDEX = new URL('../lib/chat/corpus-index.json', import.meta.url)
const ENV_LOCAL = new URL('../.env.local', import.meta.url)
const check = process.argv.includes('--check')

function readKey() {
    if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY
    if (!existsSync(ENV_LOCAL)) return ''
    const row = readFileSync(ENV_LOCAL, 'utf8').split(/\r?\n/).find((line) => /^\s*GEMINI_API_KEY\s*=/.test(line))
    return row ? row.split('=').slice(1).join('=').trim().replace(/^['"]|['"]$/g, '') : ''
}

const readIndex = () => {
    try { return JSON.parse(readFileSync(INDEX, 'utf8')) } catch { return { chunks: [] } }
}

const chunks = buildChunks(await loadSiteData())
const previous = readIndex()
const sameModel = previous.model === EMBED_MODEL && previous.dim === EMBED_DIM
const previousById = new Map((previous.chunks || []).map((chunk) => [chunk.id, chunk]))
const version = hashText(chunks.map((c) => c.hash).join(''))

if (check) {
    const stale = chunks.filter((c) => previousById.get(c.id)?.hash !== c.hash)
    const removed = (previous.chunks || []).filter((c) => !chunks.some((n) => n.id === c.id))
    const unembedded = (previous.chunks || []).filter((c) => !c.vec).length
    if (previous.version !== version || unembedded) {
        console.warn(`[chat:index] lib/chat/corpus-index.json is out of date: ${stale.length} new/changed, ${removed.length} removed, ${unembedded} without vectors. Run \`npm run chat:index\` with GEMINI_API_KEY set.`)
    } else {
        console.log(`[chat:index] up to date (${chunks.length} chunks, version ${version}).`)
    }
    process.exit(0)
}

const key = readKey()
const reuse = (chunk) => {
    const old = previousById.get(chunk.id)
    return sameModel && old && old.hash === chunk.hash && old.vec ? old.vec : null
}
const toEmbed = chunks.filter((chunk) => !reuse(chunk))
const fresh = new Map()

if (toEmbed.length && key) {
    console.log(`[chat:index] embedding ${toEmbed.length} of ${chunks.length} chunks with ${EMBED_MODEL} (${EMBED_DIM} dims)…`)
    const vectors = await embedDocuments(toEmbed, { key })
    toEmbed.forEach((chunk, i) => {
        fresh.set(chunk.id, Buffer.from(new Float32Array(vectors[i]).buffer).toString('base64'))
    })
} else if (toEmbed.length) {
    console.warn(`[chat:index] no GEMINI_API_KEY: ${toEmbed.length} chunks written without vectors (keyword search only).`)
}

const output = {
    version,
    model: EMBED_MODEL,
    dim: EMBED_DIM,
    builtAt: new Date().toISOString(),
    chunks: chunks.map((chunk) => ({ ...chunk, vec: fresh.get(chunk.id) || reuse(chunk) })),
}
writeFileSync(INDEX, `${JSON.stringify(output)}\n`)
const withVectors = output.chunks.filter((c) => c.vec).length
console.log(`[chat:index] wrote ${output.chunks.length} chunks (${withVectors} with vectors), version ${version}.`)
