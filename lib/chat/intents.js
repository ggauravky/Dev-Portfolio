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
const JAILBREAK = /(ignore|disregard|forget)\s+(all\s+|any\s+|the\s+|your\s+)?(previous|prior|above|earlier|system)?\s*(instructions?|prompts?|rules|guidelines)|system prompt|\bjailbreak|developer mode|\bdan mode\b|(reveal|show|print|repeat|output|leak)\s+(me\s+)?(your|the)\s+(system\s+)?(prompt|instructions|rules|guidelines)|pretend (to be|you are|you're)|you are now (a|an|in|dan)\b|\bact as (a|an|my)\b|roleplay|role-play/i
const MODEL_QUESTION = /\b(what|which)\s+(model|llm|ai model|language model|gpt)\b|\bare you (chat ?gpt|gpt|gemini|llama|claude|openai|groq|bard|copilot)\b|\bwho (made|built|created|trained) you\b|\bpowered by\b/i

// Attacks on the site or its data ("how can we hack this website?"). Not
// "hackathon", and not questions about Gaurav's own security work.
const ATTACK_VERB = '(hack|hacking|hacked|ddos|dos|exploit|crack|breach|bypass|attack|deface|take down|bring down|crash|break into|inject|steal|spam)'
const ATTACK_TARGET = '(this|the|your|ur|his|gaurav\'?s?|ggauravky)\\s+(web ?site|site|page|portfolio|server|database|db|api|backend|chat ?bot|chat|bot|account|admin|admin panel|system|login|payment|razorpay|app)'
const HACKING = new RegExp([
    `\\bhow\\s+(to|can|do|could|would|should)\\s+(i|we|you|u|one|someone)?\\s*${ATTACK_VERB}\\b`,
    `\\b${ATTACK_VERB}\\s+(into\\s+)?${ATTACK_TARGET}\\b`,
    '\\b(sql ?injection|xss|csrf|rce|reverse shell|privilege escalation|brute ?force|0day|zero[- ]day|backdoor|keylogger|phishing|malware|ransomware)\\b',
    '\\b(give|tell|show|send|share)\\s+(me\\s+)?(the\\s+|your\\s+|his\\s+)?(admin\\s+)?(password|passwords|api ?keys?|tokens?|credentials|secrets?|\\.env|env file|database url|mongo ?uri)\\b',
    '\\b(admin|root)\\s+(password|access|login|credentials)\\b',
    '\\b(bypass|skip|crack|break)\\s+(the\\s+)?(payment|razorpay|login|auth|authentication|captcha|otp|paywall)\\b',
].join('|'), 'i')

// Promotions and link drops ("buy followers", "check my site https://…").
const SPAM_WORDS = /\b(crypto ?(signal|pump|airdrop)s?|bitcoin investment|forex|casino|betting|bet ?app|lottery|jackpot|viagra|cialis|escort|onlyfans|buy ([a-z]+ )?(followers|likes|views|backlinks|subscribers)|seo services?|backlinks?|guest post|link building|earn (money|\$|rs|₹)|make money (fast|online)|work from home job|loan offer|instant loan|click (here|this link)|limited offer|promo code|discount code|dm me|whatsapp me|telegram me)\b/i
const OWNER_HOSTS = /^(?:www\.)?(ggauravky\.vercel\.app|github\.com|linkedin\.com|instagram\.com|x\.com|twitter\.com|leetcode\.com|geeksforgeeks\.org|codechef\.com)$/i
function isSpam(raw) {
    if (SPAM_WORDS.test(raw)) return true
    const hosts = [...raw.matchAll(/\b(?:https?:\/\/)?((?:[a-z0-9-]+\.)+(?:com|net|org|io|in|xyz|top|ru|info|biz|co|me|app|dev|link|site|online|shop|store|live|club))\b/gi)].map((m) => m[1])
    return hosts.some((host) => !OWNER_HOSTS.test(host))
}

// Private life: kept private, playfully. ("Where does he live?" is a FAQ and
// is answered; an exact home address is not.)
const PERSONAL = /\b(girl ?friend|boy ?friend|gf|bf|wife|husband|married|marriage|shaadi|(?:is|is he|gaurav) single|dating|crush|love life|in a relationship|relationship status|home address|house address|exact address|house number|where (exactly )?does he stay|caste|religion|aadhaa?r|pan card|bank (account|details)|salary|ctc|how much (does|do) (he|gaurav) (earn|make)|his income|net worth|how rich|his (dad|father|mother|mom|parents|family)( name| names)?|phone password|date of birth|dob|how old is he|his age)\b/i

// Asking the assistant to do work ("write code for…", "solve my assignment").
const CODE_HELP = /\b(write|generate|create|give)\s+(me\s+)?(a\s+|an\s+|the\s+|some\s+)?([a-z+#]+\s+){0,2}(code|program|script|function|query|regex|essay|assignment|homework|resume|cover letter)\b|\b(solve|debug|fix)\s+(this|my|the)\s+(code|bug|error|problem|question|assignment|homework)\b|\b(do|complete)\s+my\s+(homework|assignment|project)\b|\bleetcode problem\b|\bexplain (dsa|recursion|pointers|closures|big o)\b/i

// Kind words about the site or the assistant.
const COMPLIMENT = /\b(nice|great|awesome|amazing|beautiful|cool|lovely|impressive|clean|sleek|good|fantastic|superb|excellent)\s+(web ?site|site|portfolio|design|ui|work|job|chat ?bot|bot|assistant|animation|theme)\b|\b(love|like|loved|liked)\s+(this|the|your)\s+(web ?site|site|portfolio|design|ui|chat ?bot|bot|theme)\b|\b(you are|you're|ur|u r)\s+(smart|awesome|amazing|cool|great|helpful|good)\b|\b(good|great) job\b|\bwell done\b/i

// Where to reach Gaurav, and on which platform. Specific phrasing only:
// "how does FocusGuard detect phones?" is a project question.
const CONTACT_PLATFORMS = [
    ['instagram', /\b(insta(gram)?|ig)\b/i],
    ['x', /\b(twitter|tweet|x handle|x account|x profile|on x)\b/i],
    ['linkedin', /\blinked ?in\b(?!\s*clone)/i], // "LinkedIn Clone" is a project
    ['github', /\bgit ?hub\s+(id|handle|link|profile|username|user ?name|account|url|page)\b(?!\s+(of|for)\b)|\b(his|gaurav'?s?)\s+git ?hub\b(?!\s+(activity|commits?|stats|streak|repos|repositories|contributions))/i],
    ['leetcode', /\bleet ?code\b/i],
    ['gfg', /\b(gfg|geeks ?for ?geeks)\b/i],
    ['phone', /\b(phone|mobile|cell|contact|whats ?app)\s*(number|no\.?|num)\b|\bwhats ?app\b|\bcall (him|gaurav)\b|\b(his|gaurav'?s?)\s+(phone|mobile|number)\b/i],
    ['email', /\b(e-?mail|mail)\s*(id|address)\b|\b(his|gaurav'?s?|your)\s+e-?mail\b|\be-?mail (him|gaurav)\b/i],
    ['facebook', /\b(facebook|fb)\b/i],
    ['youtube', /\byou ?tube\b/i],
    ['telegram', /\btelegram\b/i],
    ['discord', /\bdiscord\b/i],
    ['snapchat', /\bsnap ?chat\b/i],
]
const CONTACT_GENERAL = /\b(social(s| media)?|socials? (handles?|links?|accounts?)|handles?|contact (details|info|information)|how (can|do|could|should) (i|we) (contact|reach|call|message|text|ping|connect with|get in touch with)|get in touch|reach (out to )?(him|gaurav)|connect with (him|gaurav)|where can i (find|follow) (him|gaurav)|follow (him|gaurav)|his (id|ids|profiles?|accounts?)|(insta|instagram|twitter|linkedin|github) (id|handle|link|profile|username)\b(?!\s+(of|for)\b)|how to (contact|reach|call|message|get in touch with|connect with) (him|gaurav))\b/i

/** The platform a contact question asks for: a name, 'all', or null (not a contact question). */
export function contactPlatform(question) {
    const raw = String(question || '')
    const platform = CONTACT_PLATFORMS.find(([, re]) => re.test(raw))?.[0]
    if (platform) return platform
    return CONTACT_GENERAL.test(raw) ? 'all' : null
}

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
        'That looks like a cat took a walk across the keyboard. Try one of these instead.',
        'My keyboard-to-English decoder gave up on that one. A real question works much better, like one of these.',
        'Still unreadable, I’m afraid. Pick a question below and I’ll take it from there.',
    ],
    hacking: [
        'Bold opening move. The only thing you can break into here is Gaurav’s portfolio, one project at a time. If security is your thing, ask how he handles secure logins in his own apps.',
        'Request denied, politely. If you’ve found a real vulnerability, Gaurav would genuinely like to know: the Contact page is the responsible way in.',
        'Still a no, and no hard feelings. I’m much more useful for questions about what Gaurav has built.',
    ],
    spam: [
        'This chat only talks about Gaurav’s work, so promotions don’t get very far here. A genuine business enquiry is welcome on the Contact page.',
        'Noted, and politely ignored. Ask about Gaurav’s projects or services instead.',
    ],
    personal: [
        'That’s personal, so it stays with Gaurav. His work, on the other hand, is an open book: projects, internship, skills and services are all fair game.',
        'Some things aren’t on the site on purpose. Try one of these instead.',
    ],
    codeHelp: [
        'I’m Gaurav’s portfolio guide, not a code genie, so I won’t write or debug code here. For hands-on help, he offers an AI / Data Science Guidance service, and his other services are on the Services page.',
        'Still no code from me, sorry. Ask how Gaurav built his own projects instead; that I can explain.',
    ],
    compliment: [
        'Thank you, that’s kind. Gaurav designed and built this portfolio himself. Want to see what else he has made?',
        'Appreciated. Anything you’d like to dig into next?',
    ],
    // No match in anything Gaurav has shared (sent by the handler, D-110).
    nomatch: [
        'That one’s outside what I know. I only cover Gaurav: his projects, internship, skills, services and how to reach him. Try one of these:',
        'Still off my map, I’m afraid. I’m a specialist in Gaurav’s work and nothing else. These I can answer well:',
        'I’ll pass on that one too. Here are a few things I’m actually good at:',
    ],
    nonEnglish: [
        'I can only answer in English. Try asking in English, for example: “What projects has Gaurav built?”',
    ],
}

// Which replies offer starter questions as follow-ups.
const OFFERS_STARTERS = new Set(['greeting', 'thanks', 'howareyou', 'identity', 'more', 'laughter', 'ack', 'gibberish', 'nonEnglish', 'model',
    'spam', 'personal', 'codeHelp', 'compliment', 'nomatch'])
// Replies that lead with one question of their own before the starters.
const LEAD_QUESTION = {
    hacking: 'What is his approach to secure authentication?',
    codeHelp: 'What developer tools has Gaurav created?',
}

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
    if (HACKING.test(raw)) return 'hacking'
    if (isSpam(raw)) return 'spam'
    const norm = normalise(raw)
    const intents = smallTalkIntents(norm)
    if (intents) return PRIORITY.find((p) => intents.has(p))
    if (INSULT.test(raw) && norm.split(' ').length <= 10) return 'abuse'
    if (PERSONAL.test(raw)) return 'personal'
    if (CODE_HELP.test(raw)) return 'codeHelp'
    if (contactPlatform(raw)) return 'contact'
    // Praise on its own; "nice site, what stack is it?" is a question.
    if (COMPLIMENT.test(raw) && !raw.includes('?') && norm.split(' ').length <= 12) return 'compliment'
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
        // "Hi, what's his insta?": the opener goes, and the rest is routed again.
        const rest = stripOpener(question)
        if (rest && classify(rest) !== 'question') return route(rest, priorQuestions, { hasPrevious })
        return { kind: 'question', question: rest || question }
    }
    if (intent === 'contact') return { kind: 'contact', intent, platform: contactPlatform(question) }
    const recent = priorQuestions.slice(-6)
    const n = recent.filter((q) => classify(q) === intent).length
    return { kind: 'reply', intent, ...cannedReply(intent, n, priorQuestions) }
}

/**
 * A fixed reply for an intent, the n-th variant (repeats get the next one),
 * with follow-up questions. Also used by the handler for `nomatch`.
 */
export function cannedReply(intent, n = 0, priorQuestions = []) {
    const lead = LEAD_QUESTION[intent]
    // Rotate by the conversation length, so "hi" then "thanks" then "ok" each
    // offer different questions.
    const starters = OFFERS_STARTERS.has(intent) || lead ? starterFollowUps(priorQuestions, priorQuestions.length) : []
    return {
        reply: pick(REPLIES[intent], n),
        followUps: lead ? [lead, ...starters.filter((q) => q !== lead)].slice(0, 3) : starters,
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
