// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Source: https://github.com/ggauravky/Dev-Portfolio
//
// Launch-video recorder (dev-only, not part of the build).
// Drives a real Chromium against the production build and records each shot as
// its own clip. The Remotion project in launch-video/ composites them.
//
//   node scripts/launch-video/record.mjs hero                      # desktop
//   node scripts/launch-video/record.mjs chat --profile mobile     # phone
//   node scripts/launch-video/record.mjs all [--profile mobile]
//   … --base https://ggauravky.vercel.app                          # another server
//
// Output: launch-video/public/clips/<profile>/<shot>.mp4 (git-ignored, re-recordable)
// and launch-video/src/captures/<profile>-<shot>.json: the boxes of the elements
// the script crops on, in CSS px at capture time (committed, small).
//
// The chat shot needs a working /api/chat: run `npm run chat:dev` beside the
// preview (vite preview proxies /api/chat to :8787). Each run sends one real question.
//
// Capture: Chrome's screencast (CDP Page.startScreencast). Every painted frame
// arrives with its paint timestamp, so the clip is the real-time motion of the
// site, re-timed to a constant 60 fps by ffmpeg, at JPEG quality 92. Holds cost
// no frames: a still screen is one frame with a long duration.
// Timing: cursor moves use the site's own motion tokens (src/lib/motion.js).
//
// Needs: `npm run build && npm run preview` (http://localhost:4173) or --base,
// ffmpeg on PATH, and Playwright: the project's, or the global @playwright/cli
// (set PLAYWRIGHT_CORE to its playwright-core folder), plus CHROME_PATH if the
// bundled browser version isn't installed.

import { createRequire } from 'node:module'
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { DURATION, EASE } from '../../src/lib/motion.js'

const HERE = dirname(fileURLToPath(import.meta.url))
const VIDEO = resolve(HERE, '../../launch-video')
// Viewports. Desktop is the design width, 1440×810, at density 3: a 640×360
// CSS-px crop is a native 1920×1080 frame, so Remotion can punch in on the
// name without upscaling. Mobile is a 390×844 phone at its real density.
const PROFILES = {
    desktop: { viewport: { width: 1440, height: 810 }, density: 3, mobile: false },
    mobile: { viewport: { width: 390, height: 844 }, density: 3, mobile: true },
}
const FPS = 60
const ORDER = ['hero', 'projects', 'chat', 'journey']

const args = process.argv.slice(2)
const flag = (name, fallback) => {
    const i = args.indexOf(`--${name}`)
    return i === -1 ? fallback : args[i + 1]
}
const BASE = flag('base', 'http://localhost:4173').replace(/\/+$/, '')
const PROFILE_NAME = flag('profile', 'desktop')
const PROFILE = PROFILES[PROFILE_NAME]
if (!PROFILE) throw new Error(`unknown --profile "${PROFILE_NAME}"; have: ${Object.keys(PROFILES).join(', ')}`)
const VIEWPORT = PROFILE.viewport
const DENSITY = PROFILE.density
const OUTPUT = { width: VIEWPORT.width * DENSITY, height: VIEWPORT.height * DENSITY }
// Clips are large and re-recordable, so they're git-ignored; the layout data
// (element boxes at capture time) is small and is what the script crops by.
const OUT = join(VIDEO, 'public', 'clips', PROFILE_NAME)
const META = join(VIDEO, 'src', 'captures')
const shotNames = args.filter((a, i) => !a.startsWith('--') && !args[i - 1]?.startsWith('--'))

// ── Playwright, from the project or the global CLI install ──────────────────
async function loadChromium() {
    for (const name of ['playwright', 'playwright-core']) {
        try { return (await import(name)).chromium } catch { /* not in the project */ }
    }
    const fallback = process.env.PLAYWRIGHT_CORE
        || join(process.env.APPDATA || '', 'npm/node_modules/@playwright/cli/node_modules/playwright-core')
    if (existsSync(fallback)) return createRequire(import.meta.url)(fallback).chromium
    throw new Error('Playwright not found: install it, or set PLAYWRIGHT_CORE to a playwright-core folder.')
}

// ── Motion: the site's easing curve, as a function of t ─────────────────────
function cubicBezier([x1, y1, x2, y2]) {
    const bx = (t) => 3 * (1 - t) ** 2 * t * x1 + 3 * (1 - t) * t ** 2 * x2 + t ** 3
    const by = (t) => 3 * (1 - t) ** 2 * t * y1 + 3 * (1 - t) * t ** 2 * y2 + t ** 3
    return (x) => {
        if (x <= 0) return 0
        if (x >= 1) return 1
        let lo = 0
        let hi = 1
        for (let i = 0; i < 32; i++) { // bisection on x(t) = x
            const mid = (lo + hi) / 2
            if (bx(mid) < x) lo = mid
            else hi = mid
        }
        return by((lo + hi) / 2)
    }
}
const ease = cubicBezier(EASE)
// A slower, symmetric curve for long cursor travel (a hand doesn't snap).
const travel = cubicBezier([0.45, 0, 0.25, 1])
const sleep = (ms) => new Promise((done) => setTimeout(done, Math.max(0, ms)))

/** Moves the real mouse along a path of points, in `ms`, one event per frame. */
async function glide(page, cursor, points, ms, curve = ease) {
    const path = [{ ...cursor }, ...points]
    const lengths = path.slice(1).map((p, i) => Math.hypot(p.x - path[i].x, p.y - path[i].y))
    const total = lengths.reduce((a, b) => a + b, 0) || 1
    const start = Date.now()
    for (;;) {
        const t = Math.min(1, (Date.now() - start) / ms)
        let along = curve(t) * total
        let i = 0
        while (i < lengths.length - 1 && along > lengths[i]) { along -= lengths[i]; i += 1 }
        const k = lengths[i] ? Math.min(1, along / lengths[i]) : 1
        const x = path[i].x + (path[i + 1].x - path[i].x) * k
        const y = path[i].y + (path[i + 1].y - path[i].y) * k
        // As many pointer events as the round trip allows: the site's
        // pointer-driven effects repaint per event, so a sparse stream looks stepped.
        await page.mouse.move(x, y)
        cursor.x = x
        cursor.y = y
        if (t >= 1) return
    }
}

/** Smooth catmull-rom points through `knots`, for a natural sweep. */
function curvePath(knots, perSegment = 24) {
    const out = []
    for (let i = 0; i < knots.length - 1; i++) {
        const p0 = knots[i - 1] || knots[i]
        const p1 = knots[i]
        const p2 = knots[i + 1]
        const p3 = knots[i + 2] || p2
        for (let s = 1; s <= perSegment; s++) {
            const t = s / perSegment
            const t2 = t * t
            const t3 = t2 * t
            const f = (a, b, c, d) => 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3)
            out.push({ x: f(p0.x, p1.x, p2.x, p3.x), y: f(p0.y, p1.y, p2.y, p3.y) })
        }
    }
    return out
}

async function settle(page) {
    await page.waitForLoadState('networkidle')
    await page.evaluate(() => document.fonts.ready)
    // The hero name's weight axis arms after load + idle (HeroName.jsx).
    await page.evaluate(() => new Promise((done) => (window.requestIdleCallback || setTimeout)(done, { timeout: 1500 })))
    await sleep(800)
}

const box = (page, selector) => page.locator(selector).first().boundingBox()
const centre = (b, fx = 0.5, fy = 0.5) => ({ x: b.x + b.width * fx, y: b.y + b.height * fy })

/** Viewport boxes of every element matching `selector`, as plain {x, y, width, height}. */
const boxes = (page, selector) => page.locator(selector).evaluateAll((els) => els.map((el) => {
    const r = el.getBoundingClientRect()
    return { x: r.x, y: r.y, width: r.width, height: r.height }
}))

/** Viewport box of an element's text (not its block), or null. */
const textBox = (page, selector) => page.evaluate((sel) => {
    const el = document.querySelector(sel)
    if (!el) return null
    const range = document.createRange()
    range.selectNodeContents(el)
    const r = range.getBoundingClientRect()
    return { x: r.x, y: r.y, width: r.width, height: r.height }
}, selector)

/**
 * The hero's layout, for framing. The name's words and the rail are
 * display:block (as wide as their column), so they're measured by their
 * letters/text. `chrome` (the fixed top wordmark) and `lede` are what the
 * camera must not cut through.
 */
async function heroLayout(page) {
    const words = await page.locator('.hero-name__word').evaluateAll((els) => els.map((word) => {
        const rects = [...word.querySelectorAll('.hero-name__ch')].map((ch) => ch.getBoundingClientRect())
        const x = Math.min(...rects.map((r) => r.left))
        const y = Math.min(...rects.map((r) => r.top))
        return { x, y, width: Math.max(...rects.map((r) => r.right)) - x, height: Math.max(...rects.map((r) => r.bottom)) - y }
    }))
    return {
        words,
        rail: await textBox(page, '.home-hero__meta'),
        lede: await box(page, '.home-hero__lede'),
        actions: await box(page, '.home-hero__actions'),
        live: await box(page, '.hero-live'),
        chrome: await box(page, '.chrome-wordmark'),
    }
}

/** Document y of an element's top, or null when it isn't on the page. */
const docTop = (page, selector) => page.evaluate((sel) => {
    const el = document.querySelector(sel)
    return el ? el.getBoundingClientRect().top + window.scrollY : null
}, selector)

/**
 * Scrolls the window to `toY` in `ms` along `curve`, one step per round trip,
 * like a trackpad: the site's scroll-driven reveals, the Journey spine and the
 * sticky year all run off real scroll positions.
 */
async function scrollGlide(page, toY, ms, curve = travel) {
    const fromY = await page.evaluate(() => window.scrollY)
    const max = await page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight)
    const target = Math.max(0, Math.min(max, toY))
    const start = Date.now()
    for (;;) {
        const t = Math.min(1, (Date.now() - start) / ms)
        await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), fromY + (target - fromY) * curve(t))
        if (t >= 1) return
    }
}

async function click(page) {
    await page.mouse.down()
    await sleep(70)
    await page.mouse.up()
}

// ── Shots ───────────────────────────────────────────────────────────────────
// prepare() runs before recording, play() is recorded, meta() runs after
// prepare and returns the layout the script crops on.
const SHOTS = {
    /**
     * Hero (beats 1–2, desktop only: the weight axis needs a fine pointer).
     * The name paints statically by design (S6, D-031: it is the LCP element and
     * never animates in); what moves is its weight axis under the cursor.
     *
     * Desktop: the video's first frame must already show the effect, so the
     * cursor rests inside "Gaurav" before recording (the letters round it are
     * already thin) and leaves on the site's own easing, which starts fast:
     * through the word and back along its lower half (the 3 s hook), then down
     * through "Kumar" and "Yadav" and over to the live panel.
     *
     * Mobile: the weight axis needs a fine pointer, so the phone pass is the
     * hero (name, lede, live panel stacked) for beat 2 in 9:16: a thumb scroll
     * that brings the panel up to where the rail was, then the clock ticks.
     */
    hero: {
        path: '/',
        // Seconds into the clip at which the live panel's clock should change
        // minute (it ticks on the minute), so "live" is seen, not claimed:
        // desktop just after the cursor reaches the panel; mobile early in beat 2.
        tickAt: { desktop: 6.2, mobile: 3.0 },
        async prepare(page, cursor) {
            if (PROFILE.mobile) return
            const [gaurav] = (await heroLayout(page)).words
            cursor.x = gaurav.x + gaurav.width * 0.82
            cursor.y = gaurav.y + gaurav.height * 0.4
            await page.mouse.move(cursor.x + 30, cursor.y)
            await glide(page, cursor, [{ x: cursor.x, y: cursor.y }], DURATION.base)
            await sleep(DURATION.slow * 2) // the dot fades in and the letters settle thin
        },
        meta: heroLayout,
        async play(page, cursor, mark) {
            if (PROFILE.mobile) {
                const { rail, lede } = await heroLayout(page)
                await sleep(500)
                await mark('scroll')
                await scrollGlide(page, lede.y - rail.y, 2000)
                await sleep(3500)
                return
            }
            const { words, live } = await heroLayout(page)
            const at = (w, fx, fy) => ({ x: w.x + w.width * fx, y: w.y + w.height * fy })
            // 0–3 s: the hook. Left along the upper half, back along the lower.
            await glide(page, cursor, curvePath([{ ...cursor }, at(words[0], 0.5, 0.35), at(words[0], -0.04, 0.5)]), 1500, ease)
            await glide(page, cursor, curvePath([{ ...cursor }, at(words[0], 0.3, 0.75), at(words[0], 0.75, 0.7), at(words[0], 1.02, 0.6)]), 1400, travel)
            // Then down through the other two lines while the video pulls back.
            await glide(page, cursor, curvePath([
                { ...cursor },
                at(words[1], 0.9, 0.5), at(words[1], 0.1, 0.55),
                at(words[2], 0.1, 0.5), at(words[2], 0.95, 0.55),
            ]), 1800, travel)
            // Over to the live panel and hold: it's read in beat 2.
            await glide(page, cursor, [{ x: live.x - 40, y: live.y + live.height * 0.45 }], 800, travel)
            await sleep(2000)
        },
    },

    /**
     * Projects (beat 3). Starts on the case studies, already scrolled into view
     * (the header is not the point). Desktop: the cursor moves down the index,
     * each row's preview following it on the site's spring, then clicks
     * SmartMess (the cleanest arch frontispiece, D-117) and the title and image
     * carry into the case study (View Transitions). Mobile has no hover preview
     * (fine pointers only), so the phone pass is a tap on the same row.
     */
    projects: {
        path: '/projects',
        target: 'smartmess',
        async prepare(page, cursor) {
            if (PROFILE.mobile) {
                // Start on the first case study; play() scrolls down to SmartMess.
                const group = await docTop(page, '.pj-group')
                await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), group - 72)
            } else {
                const group = await docTop(page, '.pj-group')
                await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), group - 32)
                cursor.x = VIEWPORT.width * 0.8
                cursor.y = VIEWPORT.height * 0.22
                await page.mouse.move(cursor.x, cursor.y)
            }
            await sleep(DURATION.slow * 2) // scroll-driven row reveals finish
        },
        async meta(page) {
            return {
                rows: await boxes(page, '.pj-group .pj-row__title'),
                target: await box(page, `.pj-group a[href$="/projects/${SHOTS.projects.target}"] .pj-row__title`),
                chrome: await box(page, '.chrome-wordmark'),
            }
        },
        async play(page, cursor, mark) {
            const selector = `.pj-group a[href$="/projects/${SHOTS.projects.target}"] .pj-row__title`
            let target = await box(page, selector)
            if (PROFILE.mobile) {
                // A thumb's scroll down the index (rows reveal as they enter),
                // stopping with SmartMess a third of the way down, then a tap.
                await sleep(600)
                await mark('scroll')
                const top = await docTop(page, selector)
                await scrollGlide(page, top - VIEWPORT.height * 0.35, 2400)
                await sleep(900)
                target = await box(page, selector)
                await mark('tap')
                const at = centre(target, 0.3, 0.5)
                await page.touchscreen.tap(at.x, at.y)
            } else {
                const rows = (await boxes(page, '.pj-group .pj-row__title')).filter((r) => r.y < target.y - 1)
                await mark('hover')
                for (const [i, row] of rows.entries()) {
                    await glide(page, cursor, [centre(row, 0.4, 0.55)], i === 0 ? DURATION.slow * 1.5 : DURATION.slow, travel)
                    await sleep(i === 0 ? 650 : 380)
                }
                await glide(page, cursor, [centre(target, 0.4, 0.55)], DURATION.slow, travel)
                await sleep(700)
                await mark('click')
                await click(page)
            }
            await page.waitForURL(`**/projects/${SHOTS.projects.target}`)
            await page.waitForSelector('.case-frontis__img')
            await sleep(DURATION.slow + 200)
            await mark('arrived', { frontis: '.case-frontis', head: '.case-head__main', chrome: '.chrome-wordmark' })
            await sleep(2600)
        },
    },

    /**
     * Chat (beat 4): Ask in the dock, the panel wipes up from it while the site
     * recedes, then the question is picked from the chat's own starter list (a
     * real feature, and faster to watch than typing), and the answer streams.
     * Marks the moments the script cuts on (the beat jump-cuts from the
     * question to the end of the answer, no speed-up).
     */
    chat: {
        path: '/',
        question: 'How does Kanoon-Mate work under the hood?',
        async prepare(page, cursor) {
            cursor.x = VIEWPORT.width * 0.62
            cursor.y = VIEWPORT.height * 0.62
            if (!PROFILE.mobile) await page.mouse.move(cursor.x, cursor.y)
        },
        async play(page, cursor, mark) {
            await sleep(500)
            const ask = centre(await box(page, '.dock-ask'))
            if (PROFILE.mobile) {
                await mark('ask')
                await page.touchscreen.tap(ask.x, ask.y)
            } else {
                await glide(page, cursor, [ask], DURATION.slow * 2, travel)
                await sleep(DURATION.base)
                await mark('ask')
                await click(page)
            }
            await sleep(DURATION.slow + 400)
            const starter = page.locator('.chat-suggest__item', { hasText: SHOTS.chat.question }).first()
            const at = centre(await starter.boundingBox(), 0.3, 0.5)
            if (PROFILE.mobile) {
                await sleep(DURATION.base)
                await mark('send')
                await page.touchscreen.tap(at.x, at.y)
            } else {
                await glide(page, cursor, [at], DURATION.slow * 1.5, travel)
                await sleep(DURATION.base)
                await mark('send')
                await click(page)
            }
            await page.waitForFunction(() => {
                const answers = document.querySelectorAll('.chat-a')
                const last = answers[answers.length - 1]
                return last && last.textContent.trim().length > 0
            }, null, { timeout: 30000, polling: 50 })
            await mark('answering')
            // Until the answer has streamed and finished its reveal (aria-busy off).
            await page.waitForFunction(() => {
                const answers = document.querySelectorAll('.chat-a')
                const last = answers[answers.length - 1]
                return last && last.getAttribute('aria-busy') === 'false' && last.textContent.trim().length > 40
            }, null, { timeout: 30000, polling: 100 })
            await mark('done', { answer: '.chat-a', question: '.chat-q' })
            await sleep(4500) // a phone answer can finish fast; the beat needs time to read it
        },
    },

    /**
     * Journey (beat 5): starts on the timeline and scrolls steadily through
     * the last 2026 entries into 2025, so the spine fill grows and the sticky
     * year label changes on screen.
     */
    journey: {
        path: '/journey',
        async prepare(page, cursor) {
            // Off the list, so no hover preview opens while scrolling.
            cursor.x = VIEWPORT.width - 24
            cursor.y = VIEWPORT.height - 24
            if (!PROFILE.mobile) await page.mouse.move(cursor.x, cursor.y)
            const y2025 = await page.evaluate(() => {
                const title = [...document.querySelectorAll('.jr-year__title')].find((el) => el.textContent.trim() === '2025')
                return title.getBoundingClientRect().top + window.scrollY
            })
            // Start ~1.6 viewports above 2025, so the label changes mid-shot.
            await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), y2025 - VIEWPORT.height * 1.6)
            await sleep(DURATION.slow * 2)
        },
        async meta(page) {
            return { timeline: await box(page, '.jr-timeline'), chrome: await box(page, '.chrome-wordmark') }
        },
        async play(page, cursor, mark) {
            await sleep(300)
            await mark('scroll')
            const from = await page.evaluate(() => window.scrollY)
            await scrollGlide(page, from + VIEWPORT.height * 2.2, 4200, cubicBezier([0.3, 0.1, 0.7, 0.9]))
            await sleep(600)
        },
    },
}

// ── Recorder ────────────────────────────────────────────────────────────────
async function record(browser, name) {
    const shot = SHOTS[name]
    if (!shot) throw new Error(`unknown shot "${name}"; have: ${Object.keys(SHOTS).join(', ')}`)
    if (shot.desktopOnly && PROFILE.mobile) {
        console.log(`${name}: skipped on mobile (needs a fine pointer)`)
        return
    }
    const dir = join(OUT, `${name}-frames`)
    rmSync(dir, { recursive: true, force: true })
    mkdirSync(dir, { recursive: true })

    const context = await browser.newContext({
        viewport: VIEWPORT,
        deviceScaleFactor: DENSITY,
        isMobile: PROFILE.mobile,
        hasTouch: PROFILE.mobile,
        colorScheme: 'dark',
        reducedMotion: 'no-preference',
        permissions: shot.permissions || [],
    })
    // First-visit state: no stored chat thread, no seen hints.
    await context.addInitScript(() => { try { window.sessionStorage.clear() } catch { /* ignore */ } })
    const page = await context.newPage()
    const errors = []
    page.on('pageerror', (error) => errors.push(error.message))
    await page.goto(BASE + shot.path)
    await settle(page)

    const cursor = { x: VIEWPORT.width / 2, y: VIEWPORT.height / 2 }
    await shot.prepare?.(page, cursor)
    const layout = shot.meta ? await shot.meta(page) : {}
    const tickAt = shot.tickAt?.[PROFILE_NAME]
    if (tickAt !== undefined) {
        // Start recording so the next minute boundary lands `tickAt` s in.
        const now = Date.now() / 1000
        await sleep(((60 - ((now + tickAt + 0.12) % 60)) % 60) * 1000)
    }

    const cdp = await context.newCDPSession(page)
    const frames = []
    const pending = []
    cdp.on('Page.screencastFrame', ({ data, metadata, sessionId }) => {
        // Ack first: Chrome sends the next frame only after the ack.
        cdp.send('Page.screencastFrameAck', { sessionId }).catch(() => {})
        const file = join(dir, `f-${String(frames.length).padStart(5, '0')}.jpg`)
        frames.push({ file, t: metadata.timestamp })
        pending.push(writeFile(file, Buffer.from(data, 'base64')))
    })
    // Moments the script cuts on, in seconds from the clip's first frame, with
    // optional element boxes measured at that moment.
    const marks = {}
    let t0 = 0
    const mark = async (label, selectors = {}) => {
        const at = Date.now() / 1000 - t0
        const measured = {}
        for (const [key, selector] of Object.entries(selectors)) measured[key] = await box(page, selector).catch(() => null)
        marks[label] = { t: Number(at.toFixed(3)), ...(Object.keys(measured).length ? { boxes: measured } : {}) }
    }
    t0 = Date.now() / 1000
    await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 92, maxWidth: OUTPUT.width, maxHeight: OUTPUT.height, everyNthFrame: 1 })
    await sleep(120)
    const startedAt = Date.now() / 1000
    await shot.play(page, cursor, mark)
    const endedAt = Date.now() / 1000
    await cdp.send('Page.stopScreencast')
    await Promise.all(pending)
    await context.close()

    if (frames.length === 0) throw new Error(`${name}: no frames captured`)
    // Concat list: each frame lasts until the next one was painted.
    const end = frames[0].t + (endedAt - startedAt)
    const lines = ['ffconcat version 1.0']
    let seconds = 0
    frames.forEach((frame, i) => {
        const next = frames[i + 1]?.t ?? Math.max(end, frame.t + 1 / FPS)
        const duration = Math.max(1 / FPS, next - frame.t)
        seconds += duration
        lines.push(`file '${frame.file.replace(/\\/g, '/')}'`, `duration ${duration.toFixed(4)}`)
    })
    // The concat demuxer ignores the last entry's duration: repeat the last frame
    // so the final hold is kept, then trim to the exact length with -t.
    lines.push(`file '${frames.at(-1).file.replace(/\\/g, '/')}'`, `duration ${(1 / FPS).toFixed(4)}`)
    const list = join(dir, 'frames.ffconcat')
    writeFileSync(list, lines.join('\n'))

    const clip = join(OUT, `${name}.mp4`)
    execFileSync('ffmpeg', [
        '-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', list,
        '-vf', `fps=${FPS},scale=${OUTPUT.width}:${OUTPUT.height}:flags=lanczos,format=yuv420p`,
        '-t', seconds.toFixed(3),
        // Source footage for compositing: near-lossless, so text stays crisp after a punch-in.
        '-c:v', 'libx264', '-preset', 'slow', '-crf', '14', '-movflags', '+faststart', '-an', clip,
    ])
    rmSync(dir, { recursive: true, force: true })

    const capture = {
        shot: name,
        profile: PROFILE_NAME,
        viewport: VIEWPORT,
        density: DENSITY,
        fps: FPS,
        seconds: Number(seconds.toFixed(3)),
        layout,
        marks,
    }
    writeFileSync(join(META, `${PROFILE_NAME}-${name}.json`), `${JSON.stringify(capture, null, 2)}\n`)
    console.log(`${PROFILE_NAME}/${name}: ${clip} (${seconds.toFixed(1)} s, ${frames.length} painted frames, ${(frames.length / seconds).toFixed(0)}/s)${errors.length ? `, page errors: ${errors.join(' | ')}` : ''}`)
}

async function main() {
    if (shotNames.length === 0) throw new Error(`usage: record.mjs <shot…|all> [--profile desktop|mobile] [--base URL]; shots: ${ORDER.join(', ')}`)
    execFileSync('ffmpeg', ['-version'], { stdio: 'ignore' })
    mkdirSync(OUT, { recursive: true })
    mkdirSync(META, { recursive: true })
    if (shotNames.includes('all')) shotNames.splice(0, shotNames.length, ...ORDER)
    const chromium = await loadChromium()
    const browser = await chromium.launch({
        ...(process.env.CHROME_PATH ? { executablePath: resolve(process.env.CHROME_PATH) } : {}),
        args: ['--force-color-profile=srgb', '--hide-scrollbars'],
    })
    try {
        for (const name of shotNames) await record(browser, name)
    } finally {
        await browser.close()
    }
}

main().catch((error) => {
    console.error(error.message)
    process.exit(1)
})
