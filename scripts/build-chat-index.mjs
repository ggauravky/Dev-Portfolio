// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Source: https://github.com/ggauravky/Dev-Portfolio
//
// Builds lib/chat/corpus-index.json from the site's data and the owner's
// knowledge base (D-100, D-109).
//   npm run chat:index           embed new or changed texts (needs GEMINI_API_KEY
//                                in the environment or .env.local), write the file
//   npm run chat:index -- --check  no network, no writes: warn when the committed
//                                index is out of date (runs inside `npm run build`)
// Without a key it still writes every chunk, keeping vectors whose text is
// unchanged; chunks without a vector make the API fall back to keyword search.
//
// The index holds:
// - chunks: retrieval text with a document vector each
// - faqKeys: every FAQ question and its alternate phrasings, embedded as
//   queries, so a visitor's question is matched question-to-question
// - aliases: the names a visitor may use for each project (name boost)
// Vectors are stored as int8 (enc "i8"): a quarter of float32's size, and the
// cosine ranking is unchanged to about two decimal places.

import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { buildCorpus, hashText, loadSiteData } from '../lib/chat/corpus.js'
import { embedDocuments } from '../lib/chat/providers.js'
import { EMBED_DIM, EMBED_MODEL } from '../lib/chat/config.js'
import { encodeVector } from '../lib/chat/retrieve.js'

const INDEX = new URL('../lib/chat/corpus-index.json', import.meta.url)
const ENV_LOCAL = new URL('../.env.local', import.meta.url)
const ENC = 'i8'
const check = process.argv.includes('--check')

function readKey() {
    if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY
    if (!existsSync(ENV_LOCAL)) return ''
    const row = readFileSync(ENV_LOCAL, 'utf8').split(/\r?\n/).find((line) => /^\s*GEMINI_API_KEY\s*=/.test(line))
    return row ? row.split('=').slice(1).join('=').trim().replace(/^['"]|['"]$/g, '') : ''
}

const readIndex = () => {
    try { return JSON.parse(readFileSync(INDEX, 'utf8')) } catch { return { chunks: [], faqKeys: [] } }
}

const { chunks, aliases, profiles } = buildCorpus(await loadSiteData())
const faqKeys = chunks
    .filter((c) => c.faq)
    .flatMap((c) => [c.faq.question, ...c.faq.alternates].map((text) => ({ chunkId: c.id, text, hash: hashText(`q:${text}`) })))

const previous = readIndex()
const reusable = previous.model === EMBED_MODEL && previous.dim === EMBED_DIM && previous.enc === ENC
const oldChunks = new Map((previous.chunks || []).map((c) => [c.id, c]))
const oldKeys = new Map((previous.faqKeys || []).map((k) => [k.hash, k]))
const version = hashText([...chunks.map((c) => c.hash), ...faqKeys.map((k) => k.hash)].join(''))

if (check) {
    const stale = chunks.filter((c) => oldChunks.get(c.id)?.hash !== c.hash).length
        + faqKeys.filter((k) => !oldKeys.has(k.hash)).length
    const unembedded = (previous.chunks || []).filter((c) => !c.vec).length
    if (previous.version !== version || unembedded) {
        console.warn(`[chat:index] lib/chat/corpus-index.json is out of date: ${stale} new/changed texts, ${unembedded} chunks without vectors. Run \`npm run chat:index\` with GEMINI_API_KEY set.`)
    } else {
        console.log(`[chat:index] up to date (${chunks.length} chunks, ${faqKeys.length} FAQ keys, version ${version}).`)
    }
    process.exit(0)
}

const key = readKey()
const reuseChunk = (c) => {
    const old = oldChunks.get(c.id)
    return reusable && old && old.hash === c.hash && old.vec ? old.vec : null
}
const reuseKey = (k) => (reusable ? oldKeys.get(k.hash)?.vec || null : null)

const chunksToEmbed = chunks.filter((c) => !reuseChunk(c))
const keysToEmbed = faqKeys.filter((k) => !reuseKey(k))
const fresh = new Map()
const progress = (label) => (message) => process.stdout.write(`\r[chat:index] ${label}: ${message}          `)

if (key && (chunksToEmbed.length || keysToEmbed.length)) {
    console.log(`[chat:index] embedding ${chunksToEmbed.length} chunks and ${keysToEmbed.length} FAQ keys with ${EMBED_MODEL} (${EMBED_DIM} dims)…`)
    if (chunksToEmbed.length) {
        const vectors = await embedDocuments(chunksToEmbed, { key, onProgress: progress('chunks') })
        chunksToEmbed.forEach((c, i) => fresh.set(`c:${c.id}`, encodeVector(vectors[i])))
    }
    if (keysToEmbed.length) {
        const vectors = await embedDocuments(keysToEmbed, { key, taskType: 'RETRIEVAL_QUERY', onProgress: progress('faq keys') })
        keysToEmbed.forEach((k, i) => fresh.set(`k:${k.hash}`, encodeVector(vectors[i])))
    }
    process.stdout.write('\n')
} else if (chunksToEmbed.length || keysToEmbed.length) {
    console.warn(`[chat:index] no GEMINI_API_KEY: ${chunksToEmbed.length} chunks and ${keysToEmbed.length} FAQ keys written without vectors (keyword search only).`)
}

const output = {
    version,
    model: EMBED_MODEL,
    dim: EMBED_DIM,
    enc: ENC,
    builtAt: new Date().toISOString(),
    aliases,
    profiles,
    chunks: chunks.map((c) => ({ ...c, vec: fresh.get(`c:${c.id}`) || reuseChunk(c) })),
    faqKeys: faqKeys.map((k) => ({ ...k, vec: fresh.get(`k:${k.hash}`) || reuseKey(k) })),
}
writeFileSync(INDEX, `${JSON.stringify(output)}\n`)
const withVectors = output.chunks.filter((c) => c.vec).length
const keysWithVectors = output.faqKeys.filter((k) => k.vec).length
console.log(`[chat:index] wrote ${output.chunks.length} chunks (${withVectors} with vectors) and ${output.faqKeys.length} FAQ keys (${keysWithVectors} with vectors), version ${version}.`)
