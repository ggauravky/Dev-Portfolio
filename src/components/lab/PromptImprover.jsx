// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Unauthorized copying, modification, or distribution of this software,
// via any medium, is strictly prohibited without the express written
// consent of the author. See LICENSE for details.
// Source: https://github.com/ggauravky/Dev-Portfolio

import { useCallback, useMemo, useState } from 'react'
import { logMlUsage } from '../../utils/mlLogger'

const STOP_WORDS = new Set([
    'the', 'a', 'an', 'and', 'or', 'for', 'with', 'about', 'to', 'of', 'in', 'on',
    'is', 'are', 'was', 'were', 'be', 'this', 'that', 'it', 'as', 'at', 'from', 'by',
    'my', 'your', 'our', 'their', 'i', 'we', 'you'
])

// Load a <script> tag from CDN once; resolve immediately if already present.
const loadScript = (src) =>
    new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) { resolve(); return }
        const s = document.createElement('script')
        s.src = src
        s.crossOrigin = 'anonymous'
        s.onload = resolve
        s.onerror = () => reject(new Error(`Failed to load: ${src}`))
        document.head.appendChild(s)
    })

// compromise@14 exposes window.nlp when loaded as a browser script.
const COMPROMISE_CDN = 'https://cdn.jsdelivr.net/npm/compromise@14.14.5/builds/compromise.min.js'

let compromisePromise = null

const loadCompromise = async () => {
    if (!compromisePromise) {
        compromisePromise = (async () => {
            await loadScript(COMPROMISE_CDN)
            const nlp = window.nlp
            if (!nlp) throw new Error('NLP library failed to load. Please refresh and try again.')
            return nlp
        })()
    }
    return compromisePromise
}

const normalizeText = (value) => String(value || '').replace(/\s+/g, ' ').trim()

const unique = (items) => [...new Set(items.filter(Boolean))]

const detectAction = (rawText, verbs) => {
    const text = rawText.toLowerCase()
    const verbSet = new Set(verbs.map((item) => item.toLowerCase()))

    if (text.includes('compare') || verbSet.has('compare')) return 'Compare'
    if (text.includes('debug') || text.includes('fix') || verbSet.has('debug')) return 'Diagnose and improve'
    if (text.includes('design') || text.includes('architecture') || verbSet.has('design')) return 'Design'
    if (text.includes('build') || text.includes('create') || verbSet.has('build') || verbSet.has('create')) return 'Create'
    if (text.includes('explain') || text.includes('teach') || verbSet.has('explain') || verbSet.has('teach')) return 'Explain'
    if (text.includes('write') || text.includes('draft') || verbSet.has('write') || verbSet.has('draft')) return 'Write'

    return 'Provide'
}

const detectOutputFormat = (rawText) => {
    const text = rawText.toLowerCase()
    if (/\bjson\b/.test(text)) return 'JSON format'
    if (/\btable\b/.test(text)) return 'table format'
    if (/\bemail\b/.test(text)) return 'email format'
    if (/\bbullet|list\b/.test(text)) return 'bullet points'
    if (/\bstep\b|\broadmap\b/.test(text)) return 'step-by-step format'
    return 'structured sections with bullets'
}

const detectTone = (rawText, adjectives) => {
    const text = rawText.toLowerCase()
    const adjectiveSet = new Set(adjectives.map((item) => item.toLowerCase()))

    if (text.includes('casual') || adjectiveSet.has('casual')) return 'casual and clear'
    if (text.includes('friendly') || adjectiveSet.has('friendly')) return 'friendly and practical'
    if (text.includes('formal') || adjectiveSet.has('formal')) return 'formal and precise'
    if (text.includes('persuasive') || adjectiveSet.has('persuasive')) return 'persuasive and credible'
    return 'professional and concise'
}

const detectAudience = (rawText) => {
    const text = rawText.toLowerCase()
    if (text.includes('beginner')) return 'beginners'
    if (text.includes('student')) return 'students'
    if (text.includes('recruiter')) return 'recruiters'
    if (text.includes('manager')) return 'managers'
    if (text.includes('client')) return 'clients'
    if (text.includes('developer')) return 'developers'
    return ''
}

const extractConstraints = (rawText) => {
    const matches = rawText.match(/\b\d+\s?(words?|lines?|bullets?|steps?|minutes?|chars?|characters?)\b/gi) || []
    return unique(matches.map((item) => item.trim()))
}

const buildPromptIntelligence = (nlp, input) => {
    const normalized = normalizeText(input)
    const doc = nlp(normalized)

    const verbs = unique(doc.verbs().toInfinitive().out('array').map((item) => normalizeText(item)))
    const nouns = unique(doc.nouns().out('array').map((item) => normalizeText(item)))
    const adjectives = unique(doc.adjectives().out('array').map((item) => normalizeText(item)))

    const topicKeywords = nouns
        .map((item) => item.toLowerCase())
        .filter((item) => item && !STOP_WORDS.has(item))
        .slice(0, 6)

    const action = detectAction(normalized, verbs)
    const outputFormat = detectOutputFormat(normalized)
    const tone = detectTone(normalized, adjectives)
    const audience = detectAudience(normalized)
    const constraints = extractConstraints(normalized)

    const missingDetails = []
    if (!audience) missingDetails.push('target audience')
    if (!constraints.length) missingDetails.push('hard constraints')
    if (!/\bexample|sample|scenario\b/i.test(normalized)) missingDetails.push('example preference')

    return {
        normalized,
        action,
        outputFormat,
        tone,
        audience,
        constraints,
        topics: topicKeywords,
        missingDetails,
    }
}

const buildImprovedPrompt = (intel) => {
    const topicSummary = intel.topics.length ? intel.topics.join(', ') : 'the requested topic'
    const audienceLine = intel.audience ? intel.audience : 'beginner-to-intermediate readers'
    const constraintsLine = intel.constraints.length
        ? intel.constraints.join('; ')
        : 'Keep it concise, practical, and directly actionable.'

    return [
        'Role:',
        'You are an expert assistant focused on clear, practical output.',
        '',
        'Task:',
        `${intel.action} ${topicSummary} based on the request below.`,
        '',
        'Original Request:',
        `"${intel.normalized}"`,
        '',
        'Requirements:',
        `- Target audience: ${audienceLine}.`,
        `- Tone: ${intel.tone}.`,
        `- Output format: ${intel.outputFormat}.`,
        `- Constraints: ${constraintsLine}`,
        '- Include concrete examples and avoid vague statements.',
        '- Keep structure clean with headings and bullets where useful.',
        '',
        'Quality Checklist:',
        '- Start with a direct answer.',
        '- Keep logic coherent and easy to scan.',
        '- End with next actionable steps.',
    ].join('\n')
}

function PromptImprover() {
    const [inputPrompt, setInputPrompt] = useState('')
    const [improvedPrompt, setImprovedPrompt] = useState('')
    const [intel, setIntel] = useState(null)
    const [error, setError] = useState('')
    const [isProcessing, setIsProcessing] = useState(false)
    const [isCopied, setIsCopied] = useState(false)

    const canRun = useMemo(
        () => normalizeText(inputPrompt).length > 0 && !isProcessing,
        [inputPrompt, isProcessing]
    )

    const handleImprove = useCallback(async () => {
        const normalizedInput = normalizeText(inputPrompt)
        if (!normalizedInput || isProcessing) {
            if (!normalizedInput) {
                setError('Please enter a prompt before improving.')
            }
            return
        }

        setIsProcessing(true)
        setError('')
        setIsCopied(false)

        try {
            const nlp = await loadCompromise()
            const intelligence = buildPromptIntelligence(nlp, normalizedInput)
            const refinedPrompt = buildImprovedPrompt(intelligence)

            setIntel(intelligence)
            setImprovedPrompt(refinedPrompt)

            void logMlUsage({
                demoType: 'prompt_improver',
                event: 'improve',
                predictionLabel: intelligence.action,
                inputPrompt: normalizedInput,
                improvedPrompt: refinedPrompt,
                nlpAction: intelligence.action,
                nlpTone: intelligence.tone,
            })
        } catch (improveError) {
            setError(improveError?.message || 'Failed to improve prompt. Please try again.')
        } finally {
            setIsProcessing(false)
        }
    }, [inputPrompt, isProcessing])

    const handleCopy = useCallback(async () => {
        if (!improvedPrompt) return
        try {
            await navigator.clipboard.writeText(improvedPrompt)
            setIsCopied(true)
            setTimeout(() => setIsCopied(false), 1400)
        } catch {
            setError('Could not copy automatically. Please copy manually.')
        }
    }, [improvedPrompt])

    return (
        <div className="group relative p-6 bg-[#0e0e11] border border-[#1a1a22] rounded-lg hover:border-toxic/30 transition-all duration-300 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-toxic/5 to-cyber/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

            <div className="relative space-y-4">
                <div>
                    <svg className="w-8 h-8 text-toxic mb-3" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>
                    <h3 className="text-white font-display font-bold text-lg uppercase tracking-tight">AI Prompt Improver</h3>
                    <p className="text-[#a1a1aa] text-sm mt-1">
                        Rule-based NLP enhancement using compromise.js and structured prompt logic.
                    </p>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-mono uppercase tracking-wider text-[#a1a1aa]">
                        Input Prompt
                    </label>
                    <textarea
                        value={inputPrompt}
                        onChange={(event) => {
                            setInputPrompt(event.target.value)
                            if (error) setError('')
                        }}
                        placeholder="Example: write about javascript"
                        rows={4}
                        maxLength={1200}
                        className="w-full rounded-md border border-[#1a1a22] bg-[#070708] text-white placeholder-zinc-600 px-3 py-2 text-sm outline-none focus:border-toxic/50 focus:ring-1 focus:ring-toxic/20 transition"
                    />
                </div>

                <div className="flex flex-wrap gap-2">
                    <button
                        type="button"
                        onClick={handleImprove}
                        disabled={!canRun}
                        className="px-4 py-2 text-xs font-mono uppercase tracking-wider rounded-md bg-toxic text-black font-bold border border-toxic/50 hover:bg-toxic/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isProcessing ? 'Improving...' : 'Improve Prompt'}
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            setInputPrompt('')
                            setImprovedPrompt('')
                            setIntel(null)
                            setError('')
                            setIsCopied(false)
                        }}
                        disabled={isProcessing}
                        className="px-4 py-2 text-xs font-mono uppercase tracking-wider rounded-md bg-transparent text-[#a1a1aa] hover:text-white border border-[#1a1a22] hover:border-[#2a2a35] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Reset
                    </button>

                    {improvedPrompt && (
                        <button
                            type="button"
                            onClick={handleCopy}
                            className="px-4 py-2 text-xs font-mono uppercase tracking-wider rounded-md bg-[#1a1a22] hover:bg-[#252530] text-white border border-[#2a2a35] transition-colors"
                        >
                            {isCopied ? 'Copied' : 'Copy Output'}
                        </button>
                    )}
                </div>

                {error && (
                    <div className="text-sm text-rose-400 bg-rose-500/10 border border-rose-500/30 rounded-md px-3 py-2 font-mono">
                        Error: {error}
                    </div>
                )}

                {intel && (
                    <div className="rounded-lg border border-[#1a1a22] bg-[#070708] p-4 space-y-3">
                        <p className="text-xs font-mono uppercase tracking-wider text-zinc-500">NLP Insights</p>
                        <div className="flex flex-wrap gap-2 text-xs font-mono">
                            <span className="px-2.5 py-1 rounded-md border border-[#1a1a22] text-[#a1a1aa] bg-[#0e0e11] text-[10px] uppercase tracking-wider">Action: {intel.action}</span>
                            <span className="px-2.5 py-1 rounded-md border border-[#1a1a22] text-[#a1a1aa] bg-[#0e0e11] text-[10px] uppercase tracking-wider">Tone: {intel.tone}</span>
                            <span className="px-2.5 py-1 rounded-md border border-[#1a1a22] text-[#a1a1aa] bg-[#0e0e11] text-[10px] uppercase tracking-wider">Format: {intel.outputFormat}</span>
                            <span className="px-2.5 py-1 rounded-md border border-[#1a1a22] text-[#a1a1aa] bg-[#0e0e11] text-[10px] uppercase tracking-wider">
                                Topics: {intel.topics.length ? intel.topics.join(', ') : 'general'}
                            </span>
                        </div>
                        {intel.missingDetails.length > 0 && (
                            <p className="text-xs font-mono text-amber-400">
                                // Missing details: {intel.missingDetails.join(', ')}
                            </p>
                        )}
                    </div>
                )}

                {improvedPrompt && (
                    <div className="space-y-2">
                        <label className="text-xs font-mono uppercase tracking-wider text-[#a1a1aa]">
                            Improved Prompt
                        </label>
                        <textarea
                            value={improvedPrompt}
                            readOnly
                            rows={10}
                            className="w-full rounded-md border border-[#1a1a22] bg-[#070708] text-[#a1a1aa] px-3 py-2 text-sm font-mono leading-relaxed"
                        />
                    </div>
                )}
            </div>
        </div>
    )
}

export default PromptImprover
