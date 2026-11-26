// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Source: https://github.com/ggauravky/Dev-Portfolio
//
// The visitor's language (D-134). The chat answers in the language the visitor
// writes in (English, Hindi in Devanagari, or Hinglish: Hindi in Latin script),
// or the one they ask for ("in Hindi", "hindi mein batao"). The site itself
// stays English (D-034); only generated chat replies follow the visitor (D-135).
//
// For retrieval only, Hindi and Hinglish words are mapped to the English words
// the knowledge base uses ("प्रोजेक्ट" → "projects", "kyu" → "why"), so a Hindi
// question finds the same evidence as its English twin. The model still sees
// the visitor's own words.

const DEVANAGARI = /[ऀ-ॿ]/g

// Common Hinglish function words. Two or more in a message (or one in a very
// short one) make it Hinglish; English words alone never do.
const HINGLISH = new Set(('hai hain tha thi kya kyu kyun kyon kaise kaisa kaun kaunsa konsa konse kaunse kitne kitna banaye banaya banai '
    + 'uska uski uske unka unki unke iska iski iske isme ismein mein mai bhai yaar batao bataiye bata samjhao samjhaiye '
    + 'karna karta karte kiya kiye chahiye sakta sakte wala wali hota hoti nahi nahin aur bhi sabse acha accha achha '
    + 'dono teeno pehla pichla sawal jawab baat kaam naukri kaha kahan usne unhone maine mujhe hum tum aap apne').split(' '))

/** 'hi' (Devanagari), 'hinglish' (Hindi in Latin letters) or 'en'. */
export function detectLanguage(text) {
    const raw = String(text || '')
    const letters = raw.match(/\p{L}/gu) || []
    if (!letters.length) return 'en'
    const deva = (raw.match(DEVANAGARI) || []).length
    if (deva / letters.length > 0.3) return 'hi'
    const words = raw.toLowerCase().match(/[a-z]+/g) || []
    const hits = words.filter((w) => HINGLISH.has(w)).length
    if (hits >= 2 || (hits === 1 && words.length <= 3)) return 'hinglish'
    return 'en'
}

/** A language the visitor asks for explicitly, or null. */
export function requestedLanguage(text) {
    const t = String(text || '').toLowerCase()
    if (/\b(in|into|to)\s+hindi\b|\bhindi\s+(me|mein|mai|main)\b|हिंदी\s*में|हिन्दी\s*में/.test(t)) return 'hi'
    if (/\b(in|into|to)\s+hinglish\b|\bhinglish\s+(me|mein|mai)\b/.test(t)) return 'hinglish'
    if (/\b(in|into|to)\s+english\b|\benglish\s+(me|mein|mai)\b|अंग्रेज़ी\s*में|अंग्रेजी\s*में/.test(t)) return 'en'
    return null
}

/** The language to answer in: an explicit request wins, then the message itself. */
export const replyLanguage = (text) => requestedLanguage(text) || detectLanguage(text)

export const LANGUAGE_NAMES = { en: 'English', hi: 'Hindi (Devanagari script)', hinglish: 'Hinglish (Hindi in Latin script, as the visitor wrote)' }

// Retrieval-side glossary: Hindi/Hinglish → the knowledge base's English words.
const GLOSSARY = [
    [/प्रोजेक्ट(्स)?|परियोजना(एं|ओं)?/g, 'projects'],
    [/बनाए|बनाये|बनाया|बनाई|बनाएं/g, 'built'],
    [/कौन[- ]?कौन|कौन ?सा|कौन ?से|कौन/g, 'which'],
    [/क्या/g, 'what'], [/क्यों|क्यूं/g, 'why'], [/कैसे|कैसा/g, 'how'], [/कितने|कितना|कितनी/g, 'how many'],
    [/अनुभव/g, 'experience'], [/कौशल|स्किल्स?/g, 'skills'], [/शिक्षा|पढ़ाई|पढ़ता|पढ़ते/g, 'education'],
    [/इंटर्नशिप/g, 'internship'], [/नौकरी|जॉब/g, 'job'], [/सेवाएं|सेवाएँ|सेवा|सर्विस(ेज़)?/g, 'services'],
    [/कीमत|दाम|मूल्य|फीस/g, 'price'], [/संपर्क/g, 'contact'], [/हायर|नियुक्त/g, 'hire'],
    [/सबसे अच्छा|सबसे बढ़िया|बेस्ट/g, 'best'], [/कमज़ोरी|कमजोरी|कमज़ोरियाँ|कमियाँ|कमियां/g, 'weaknesses'],
    [/ताकत|खूबियाँ|खूबियां/g, 'strengths'], [/गौरव/g, 'Gaurav'], [/हैकाथॉन|हैकथॉन/g, 'hackathon'],
    [/ब्लॉग/g, 'blog'], [/तकनीक|टेक्नोलॉजी/g, 'technology'], [/डेटाबेस/g, 'database'],
    [/इस्तेमाल|उपयोग/g, 'use'], [/तुलना/g, 'compare'], [/आर्किटेक्चर|संरचना/g, 'architecture'],
    [/मोंगोडीबी/g, 'MongoDB'], [/रिएक्ट/g, 'React'], [/पायथन/g, 'Python'],
]
const HINGLISH_WORDS = {
    kyu: 'why', kyun: 'why', kyon: 'why', kaise: 'how', kaisa: 'how', kya: 'what', konsa: 'which', kaunsa: 'which', konse: 'which',
    kaunse: 'which', kaun: 'who', kitne: 'how many', kitna: 'how much', banaye: 'built', banaya: 'built', banai: 'built',
    sabse: 'most', acha: 'good', accha: 'good', achha: 'good', kaam: 'work', naukri: 'job', istemal: 'use', dono: 'both',
    teeno: 'all three', kamzori: 'weaknesses', kamjori: 'weaknesses', kamiyan: 'weaknesses', taakat: 'strengths',
    padhai: 'education', padhta: 'study', farak: 'difference', fark: 'difference', mein: 'in', me: 'in',
    // Function words with no search value: dropped, so they don't count as unknown words.
    ne: '', se: '', ko: '', ka: '', ki: '', ke: '', hai: '', hain: '', tha: '', thi: '', bhai: '', yaar: '', karna: '', kiya: 'did',
    usko: 'him', unko: 'him', uska: 'his', uske: 'his', uski: 'his', chahiye: 'should', batao: 'tell', bataiye: 'tell', wala: '', wale: '',
}

/**
 * The question in the knowledge base's words, for searching only. Hinglish
 * words are mapped only in a Hinglish message ("me" is English elsewhere).
 */
export function retrievalText(text, language = detectLanguage(text)) {
    let out = String(text || '')
    for (const [re, word] of GLOSSARY) out = out.replace(re, ` ${word} `)
    if (language === 'hinglish') out = out.replace(/\b[a-z]+\b/gi, (w) => (Object.hasOwn(HINGLISH_WORDS, w.toLowerCase()) ? HINGLISH_WORDS[w.toLowerCase()] : w))
    return out.replace(/\s+/g, ' ').trim()
}
