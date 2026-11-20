// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Source: https://github.com/ggauravky/Dev-Portfolio
//
// POST /api/chat — the site assistant (P-chat-1, D-097–D-102). The logic lives
// in lib/chat/ (outside api/, so none of it becomes a route of its own).
// maxDuration and the corpus index file are also set in vercel.json
// ("functions"), because Vercel reads them statically.

import handler from '../lib/chat/handler.js'

export default handler
