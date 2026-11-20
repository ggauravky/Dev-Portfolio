// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Source: https://github.com/ggauravky/Dev-Portfolio
//
// Local harness for POST /api/chat (P-chat-1), no dependencies:
//   node scripts/chat-dev-server.mjs        → http://localhost:8787/api/chat
// Reads GROQ_API_KEY, GEMINI_API_KEY, CHAT_MONGODB_URI, CHAT_IP_HASH_SALT from
// the environment or .env.local. With no keys it answers from the template;
// with no Mongo URI it uses the in-memory store. Adds Vercel's req.body and
// res.status/json helpers so the real handler runs unchanged.

import { createServer } from 'node:http'
import { existsSync, readFileSync } from 'node:fs'

const ENV_LOCAL = new URL('../.env.local', import.meta.url)
if (existsSync(ENV_LOCAL)) {
    for (const line of readFileSync(ENV_LOCAL, 'utf8').split(/\r?\n/)) {
        const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
        if (match && !(match[1] in process.env)) process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, '')
    }
}

const { createChatHandler } = await import('../lib/chat/handler.js')
const handler = createChatHandler()
const PORT = Number(process.env.PORT || 8787)

createServer((req, res) => {
    res.status = (code) => { res.statusCode = code; return res }
    res.json = (body) => {
        res.setHeader('Content-Type', 'application/json; charset=utf-8')
        res.end(JSON.stringify(body))
        return res
    }
    if (!req.url.startsWith('/api/chat')) return res.status(404).json({ error: 'not found' })
    let raw = ''
    req.setEncoding('utf8')
    req.on('data', (part) => {
        raw += part
        if (raw.length > 64 * 1024) req.destroy()
    })
    req.on('end', async () => {
        try { req.body = raw ? JSON.parse(raw) : undefined } catch { req.body = undefined }
        await handler(req, res)
    })
    return undefined
}).listen(PORT, () => console.log(`chat harness on http://localhost:${PORT}/api/chat`))
