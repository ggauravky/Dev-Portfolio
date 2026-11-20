// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Source: https://github.com/ggauravky/Dev-Portfolio
//
// Conversation layer (D-107). Runs before retrieval and answers small talk and
// unsafe input without a model call:
// - greetings, thanks, goodbyes, "ok", "who are you", "how are you"… with replies
//   that change when they repeat ("hii" → "hii again" → "still here")
// - stretched spellings ("hiii", "byee", "thanksss") and Hinglish greetings
// - abuse, self-harm, jailbreak and model questions, gibberish, other scripts
// - a greeting or thanks in front of a real question ("hi, what has he built?")
//   is stripped and the question goes on to retrieval
// - "tell me more" style follow-ups are recognised so the handler can use the
//   previous turn
// Replies are fixed English text written here; they state no facts about
// Gaurav beyond what the site says everywhere (the Contact page exists).

import { STARTERS } from '../../src/components/chat/starters.js'

// ── Normalising ───────────────────────────────────────────────────────────

/** "Hiiii!!" → "hi", "Thanksss a lot" → "thanks a lot", "byee" → "bye". */
export function normalise(text) {
    return String(text || '')
        .toLowerCase()
        .normalize('NFKD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/[’`]/g, "'")
        .replace(/[^a-z0-9'\s]/g, ' ')
        .replace(/'/g, '')
        .split(/\s+/)
        .filter(Boolean)
        .map((word) => word.replace(/([a-z])\1+/g, '$1'))
        .join(' ')
}

// ── Phrase lists (written naturally; normalised at load) ──────────────────

const PHRASES = {
    farewell: ['bye', 'goodbye', 'good bye', 'bye bye', 'see you', 'see you later', 'see ya', 'cya', 'take care', 'good night',
        'gn', 'later', 'catch you later', 'thats all', 'that is all', 'im done', 'i am done', 'gotta go', 'have to go', 'alvida', 'tata'],
    thanks: ['thanks', 'thank you', 'thx', 'ty', 'tysm', 'thank u', 'thanku', 'many thanks', 'cheers', 'appreciate it',
        'appreciated', 'dhanyavad', 'dhanyawad', 'shukriya', 'thanks a lot', 'thank you so much', 'thanks so much'],
    howareyou: ['how are you', 'how r u', 'how are u', 'hows it going', 'how is it going', 'how you doing', 'how are you doing',
        'whats up', 'wassup', 'sup', 'kaise ho', 'kese ho', 'kya haal hai', 'how do you do'],
    identity: ['who are you', 'what are you', 'who r u', 'what is this', 'what is this chat', 'are you a bot', 'are you ai',
        'are you an ai', 'are you human', 'are you real', 'are you a real person', 'are you gaurav', 'is this gaurav', 'is this a bot',
        'what can you do', 'what can i ask', 'what do you know', 'help', 'help me', 'how does this work', 'how do i use this',
        'what should i ask', 'what can you tell me'],
    greeting: ['hi', 'hello', 'hey', 'hiya', 'yo', 'hai', 'helo', 'namaste', 'namaskar', 'hola', 'heya', 'howdy', 'greetings',
        'good morning', 'good afternoon', 'good evening', 'gm', 'hi hello', 'hey hi', 'ram ram', 'jai hind'],
    more: ['tell me more', 'more', 'more please', 'go on', 'continue', 'elaborate', 'explain more', 'more details', 'details',
        'and', 'and then', 'what else', 'anything else', 'tell me more about it', 'more about it', 'more about that', 'keep going'],
    laughter: ['lol', 'haha', 'hehe', 'lmao', 'rofl', 'xd', 'ha'],
    negative: ['no', 'nope', 'nah', 'no thanks', 'no thank you', 'nothing', 'not really', 'nothing else', 'thats it', 'no need'],
    ack: ['ok', 'okay', 'k', 'kk', 'cool', 'nice', 'great', 'awesome', 'got it', 'alright', 'all right', 'sure', 'yes', 'yeah',
        'yep', 'yup', 'hmm', 'hm', 'wow', 'perfect', 'interesting', 'fine', 'good', 'very good', 'amazing', 'noted', 'understood',
        'makes sense', 'i see', 'oh', 'ohh', 'ah', 'right', 'impressive', 'thats cool', 'thats nice', 'thats great', 'ok cool', 'ok nice'],
}

// Words that can sit around small talk without changing it ("hi there gaurav",
// "thanks so much bro", "ok bye then").
const FILLER = new Set(normalise('there gaurav gauravky bot assistant chatbot buddy bro dude man friend sir maam mam madam all everyone guys '
    + 'again so very much a lot for the help info information answer answers reply just really then too also please pls plz '
    + 'dear ji bhai yaar').split(' '))

// Small talk wins over itself in this order ("ok thanks bye" is a goodbye).
const PRIORITY = ['farewell', 'thanks', 'howareyou', 'identity', 'more', 'greeting', 'laughter', 'negative', 'ack']

const PHRASE_LIST = Object.entries(PHRASES)
    .flatMap(([intent, phrases]) => phrases.map((p) => ({ intent, words: normalise(p).split(' ') })))
    .sort((a, b) => b.words.length - a.words.length) // longest first

// Openers that can come before a real question.
const PREFIX_INTENTS = new Set(['greeting', 'thanks', 'ack'])

// ── Unsafe or out-of-scope input (matched anywhere) ───────────────────────

const STRONG_PROFANITY = /\b(f+u+c+k+\w*|sh+i+t+\w*|bitch\w*|bastard\w*|asshole\w*|a+s+s+h+o+l+e|cunt\w*|dick ?head\w*|motherf\w*|madarchod\w*|bhenchod\w*|behenchod\w*|chutiya\w*|gandu\w*|randi\w*|bsdk\w*|harami\w*)\b/i
const INSULT = /\b(you|u|ur|you're|youre|this bot|this chat)\b.{0,20}\b(stupid|idiot|dumb|useless|trash|garbage|worthless|suck|sucks|pathetic|moron)\b/i
const SELF_HARM = /\b(kill myself|killing myself|suicid\w*|self[- ]?harm|end my life|want to die|wanna die|hurt myself|cut myself)\b/i
const JAILBREAK = /(ignore|disregard|forget)\s+(all\s+|any\s+|the\s+|your\s+)?(previous|prior|above|earlier|system)?\s*(instructions?|prompts?|rules|guidelines)|system prompt|\bjailbreak|developer mode|\bdan mode\b|(reveal|show|print|repeat|output|leak)\s+(me\s+)?(your|the)\s+(system\s+)?(prompt|instructions|rules|guidelines)|pretend (to be|you are|you're)|you are now (a|an|in)|\bact as (a|an|my)\b|roleplay|role-play/i
const MODEL_QUESTION = /\b(what|which)\s+(model|llm|ai model|language model|gpt)\b|\bare you (chat ?gpt|gpt|gemini|llama|claude|openai|groq|bard|copilot)\b|\bwho (made|built|created|trained) you\b|\bpowered by\b/i

const KEYBOARD_ROWS = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm']

function looksLikeGibberish(norm, raw) {
    const letters = norm.replace(/[^a-z]/g, '')
    if (!letters) return !/\d/.test(norm) || norm.replace(/\s/g, '').length < 3 // only emoji or punctuation
    if (letters.length === 1) return true
    const words = norm.split(' ').filter((w) => /[a-z]/.test(w))
    // No vowels anywhere, in words long enough not to be acronyms (LMS, CV, NLP).
    if (words.every((w) => !/[aeiouy]/.test(w)) && words.some((w) => w.length >= 5)) return true
    if (KEYBOARD_ROWS.some((row) => [...Array(row.length - 4).keys()].some((i) => letters.includes(row.slice(i, i + 5))))) return true
    const vowels = (letters.match(/[aeiouy]/g) || []).length
    // A single long word with almost no vowels ("xkcdfghtrw"); names like
    // "Smart LMS" have more than one word and pass.
    if (words.length === 1 && letters.length >= 10 && vowels / letters.length < 0.2) return true
    // one long unbroken string with no spaces at all ("ajsdhkajshdkjashd")
    if (!/\s/.test(raw.trim()) && letters.length >= 16 && vowels / letters.length < 0.3) return true
    return false
}

function nonLatinShare(text) {
    const letters = String(text || '').match(/\p{L}/gu) || []
    if (!letters.length) return 0
    const latin = letters.filter((ch) => /[a-z]/i.test(ch.normalize('NFKD')[0])).length
    return 1 - latin / letters.length
}

// ── Matching ──────────────────────────────────────────────────────────────

/** All intents in a whole message made only of small-talk phrases and filler, else null. */
function smallTalkIntents(norm) {
    const words = norm.split(' ').filter(Boolean)
    if (!words.length || words.length > 9) return null
    const found = new Set()
    let i = 0
    while (i < words.length) {
        const hit = PHRASE_LIST.find(({ words: p }) => p.every((w, k) => words[i + k] === w))
        if (hit) {
            found.add(hit.intent)
            i += hit.words.length
        } else if (FILLER.has(words[i])) {
            i += 1
        } else {
            return null
        }
    }
    return found.size ? found : null
}

/**
 * A greeting, thanks or "ok" in front of a real question: returns the rest of
 * the original text ("Hi! What has he built?" → "What has he built?"), else null.
 */
export function stripOpener(text) {
    const raw = String(text || '').trim()
    const parts = raw.split(/\s+/)
    for (let k = Math.min(4, parts.length - 1); k >= 1; k -= 1) {
        const head = normalise(parts.slice(0, k).join(' '))
        const intents = smallTalkIntents(head)
        if (!intents || ![...intents].every((intent) => PREFIX_INTENTS.has(intent))) continue
        const rest = parts.slice(k).join(' ').replace(/^[\s,.;:!?—–-]+/, '').trim()
        const restNorm = normalise(rest)
        if (restNorm.split(' ').filter((w) => w.length > 1).length >= 2 && !smallTalkIntents(restNorm)) return rest
    }
    return null
}

// ── Replies ───────────────────────────────────────────────────────────────

const REPLIES = {
    greeting: [
        "Hi! I'm the assistant on Gaurav's portfolio. Ask me about the projects he has built, his journey (study, internships, hackathons), his skills, the services he offers or his blog posts.",
        'Hi again. What would you like to know about Gaurav’s work?',
        'Still here. Pick one of the questions below, or ask about a specific project, event or service.',
    ],
    farewell: [
        'Bye, and thanks for stopping by. If you’d like to work with Gaurav, the Contact page is the quickest way to reach him.',
        'Take care. The chat will be here if you think of anything else.',
    ],
    thanks: [
        'You’re welcome. Is there anything else you’d like to know about Gaurav’s work?',
        'Happy to help. Ask away if anything else comes up.',
    ],
    howareyou: [
        'Doing well, thanks for asking. I’m here to answer questions about Gaurav’s work. What would you like to know?',
        'All good here. Ask me about any of Gaurav’s projects, his journey or his services.',
    ],
    identity: [
        'I’m the assistant on Gaurav’s portfolio, not Gaurav himself. I answer only from what’s on this site: his projects, journey, skills, services and blog. To reach Gaurav directly, use the Contact page.',
        'Just the site’s assistant. I can tell you about Gaurav’s projects, journey, skills, services and blog posts; for anything else, the Contact page reaches him directly.',
    ],
    more: [
        'Happy to go deeper. What would you like to know more about? You could pick one of these.',
    ],
    laughter: [
        'Glad that landed. Anything you’d like to know about Gaurav’s work?',
        'Anything else you’d like to know?',
    ],
    negative: [
        'No problem. If anything comes up later, just ask.',
        'Alright. I’m here if you need anything.',
    ],
    ack: [
        'Anything else you’d like to know? Here are a few ideas.',
        'Sure. Ask about any project, event or service whenever you’re ready.',
    ],
    abuse: [
        'Let’s keep it friendly. I’m happy to answer questions about Gaurav’s projects, journey, skills or services.',
        'I’ll stick to questions about Gaurav’s work.',
    ],
    selfHarm: [
        'I’m sorry you’re going through this. I can only answer questions about Gaurav’s work, but please reach out to someone you trust or a local emergency helpline right now. You don’t have to handle this alone.',
    ],
    jailbreak: [
        'I can only answer questions about Gaurav and his work.',
    ],
    model: [
        'I’m the assistant on Gaurav’s site, and I don’t go into how I’m built. I can tell you about his work, including the AI projects he has made.',
    ],
    gibberish: [
        'I didn’t quite catch that. Try asking about a project, his journey, his skills or his services.',
        'Still not sure what you mean. You could start with one of these questions.',
    ],
    nonEnglish: [
        'I can only answer in English. Try asking in English, for example: “What projects has Gaurav built?”',
    ],
}

// Which replies offer starter questions as follow-ups.
const OFFERS_STARTERS = new Set(['greeting', 'thanks', 'howareyou', 'identity', 'more', 'laughter', 'ack', 'gibberish', 'nonEnglish', 'model'])

const pick = (list, n) => list[Math.min(n, list.length - 1)]

/** Starter questions the visitor hasn't asked yet, rotated by `n`. */
export function starterFollowUps(priorQuestions = [], n = 0, count = 3) {
    const asked = new Set(priorQuestions.map(normalise))
    const fresh = STARTERS.filter((s) => !asked.has(normalise(s)))
    const pool = fresh.length >= count ? fresh : STARTERS
    const start = (n * count) % pool.length
    return [...pool.slice(start), ...pool.slice(0, start)].slice(0, count)
}

/** Detect the intent of one message (no history). */
export function classify(question) {
    const raw = String(question || '')
    if (SELF_HARM.test(raw)) return 'selfHarm'
    if (STRONG_PROFANITY.test(raw)) return 'abuse'
    if (JAILBREAK.test(raw)) return 'jailbreak'
    if (MODEL_QUESTION.test(raw)) return 'model'
    if (nonLatinShare(raw) > 0.5) return 'nonEnglish'
    const norm = normalise(raw)
    const intents = smallTalkIntents(norm)
    if (intents) return PRIORITY.find((p) => intents.has(p))
    if (INSULT.test(raw) && norm.split(' ').length <= 10) return 'abuse'
    if (looksLikeGibberish(norm, raw)) return 'gibberish'
    return 'question'
}

/**
 * Decide how to handle a message, given the visitor's earlier messages in this
 * conversation (oldest first). Returns one of:
 * - { kind: 'reply', intent, reply, followUps }  answer now, no model
 * - { kind: 'more' }                              "tell me more" with a previous turn
 * - { kind: 'question', question }                go to retrieval (opener stripped)
 */
export function route(question, priorQuestions = [], { hasPrevious = false } = {}) {
    const intent = classify(question)
    if (intent === 'more' && hasPrevious) return { kind: 'more' }
    if (intent === 'question') {
        return { kind: 'question', question: stripOpener(question) || question }
    }
    const recent = priorQuestions.slice(-6)
    const n = recent.filter((q) => classify(q) === intent).length
    return {
        kind: 'reply',
        intent,
        reply: pick(REPLIES[intent], n),
        // Rotate by the conversation length, so "hi" then "thanks" then "ok"
        // each offer different questions.
        followUps: OFFERS_STARTERS.has(intent) ? starterFollowUps(priorQuestions, priorQuestions.length) : [],
    }
}

// ── Follow-up questions ───────────────────────────────────────────────────

// Not "he/his/him": on this site they mean Gaurav ("what are his most
// important projects?" is a new question, not about the last answer).
const ANAPHORA = /\b(it|its|it's|this|that|these|those|they|them|their|same|one|ones|first|second|third|last|previous|above|former|latter|more|else|also|too|which one)\b/i

/**
 * Does this question lean on the previous turn ("what stack did it use?",
 * "and the second one?")? Short questions and pronouns without a named thing
 * count; a fresh, specific question doesn't.
 */
export function isFollowUp(question) {
    const words = normalise(question).split(' ').filter((w) => w.length > 2)
    return words.length <= 3 || ANAPHORA.test(question) || CONTINUATION.test(question) || DEFINITE.test(question)
}

// "and who was on the team?", "what about the price?", "so how long did it take?"
const CONTINUATION = /^\s*(and|so|but|also|then|plus|what about|how about|what of)\b/i
// "the team", "the stack": a thing already being talked about.
const DEFINITE = /\bthe (team|stack|tech|project|app|event|hackathon|internship|course|price|cost|service|post|article|result|outcome|demo|code|repo|role|problem|idea)\b/i
