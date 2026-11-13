// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Unauthorized copying, modification, or distribution of this software,
// via any medium, is strictly prohibited without the express written
// consent of the author. See LICENSE for details.
// Source: https://github.com/ggauravky/Dev-Portfolio

// Contact (P5, refined D-078–D-081). The form posts to the existing /api/contact
// endpoint. Validation mirrors backend/middleware/validator.js (name 2–100,
// subject 5–200, message 10–2000) and runs on blur only: typing never raises an
// error, it only clears one once the field is valid. Server errors still map
// back onto the fields. Submit swaps arrow → spinner → check in one fixed slot,
// so the button never changes size. Errors and submit states are announced
// through one polite live region.
// Motion moments: (1) line-masked section headings, (2) the inputs' focus line,
// (3) the submit state (spinner, check draw-in). The error shake is feedback,
// < 400 ms and off under reduced motion, like every draw here.

import { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import PropTypes from 'prop-types'
import { AtSign, BookOpen, BriefcaseBusiness, Camera, ChartColumn, FileDown, MessageCircle, SquareCode } from 'lucide-react'
import useSEO from '../hooks/useSEO'
import PageHead from '../components/page/PageHead'
import { STATIC_HEADS } from '../lib/pageHeads'
import PageSection from '../components/page/PageSection'
import { Button, Input, Textarea, TextLink } from '../components/ui'
import { siteStatus } from '../data/siteStatus'
import { validateEmail, validateRequired } from '../lib/validate'
import { useFinePointer } from '../lib/motion'
import { GithubIcon } from '../utils/radialConfig'
import './Contact.css'

const MESSAGE_MAX = 2000
const MESSAGE_WARN = Math.floor(MESSAGE_MAX * 0.9)
const SENT_MS = 2000
const EMPTY = { name: '', email: '', subject: '', message: '' }

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '')

const RULES = {
    name: validateRequired('your name', 2, 100),
    email: validateEmail,
    subject: validateRequired('a subject', 5, 200),
    message: validateRequired('a message', 10, MESSAGE_MAX),
}
const LABELS = { name: 'Name', email: 'Email', subject: 'Subject', message: 'Message' }

// Optional intent. It only prefills the Subject: /api/contact reads name, email,
// subject and message and drops anything else, so it isn't sent separately.
const INTENTS = [
    { value: 'Internship', subject: 'Internship opportunity' },
    { value: 'Freelance project', subject: 'Freelance project' },
    { value: 'Collaboration', subject: 'Collaboration idea' },
    { value: 'Just saying hi', subject: 'Just saying hi' },
]
const PREFILLS = new Set(INTENTS.map((intent) => intent.subject))

const isMac = () => typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent || '')

// WhatsApp leads: it's the fastest way to reach me. Same platforms, same links.
// `brand` is each platform's one colour, shown on the icon only on hover/focus.
const PLATFORMS = [
    { label: 'WhatsApp', href: 'https://wa.me/918542036499', handle: '+91 8542036499', note: 'The fastest way to reach me', icon: MessageCircle, brand: '#25D366', lead: true },
    { label: 'GitHub', href: siteStatus.links.github, handle: '@ggauravky', note: 'Code, projects and open source', icon: GithubIcon, brand: '#f0f6fc' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/gauravky/', handle: '@gauravky', note: 'Professional updates and experience', icon: BriefcaseBusiness, brand: '#0A66C2' },
    { label: 'LeetCode', href: 'https://leetcode.com/u/gauravky/', handle: '@gauravky', note: 'Problem solving and DSA', icon: SquareCode, brand: '#FFA116' },
    { label: 'Kaggle', href: 'https://www.kaggle.com/kgauravky', handle: '@kgauravky', note: 'ML notebooks and data experiments', icon: ChartColumn, brand: '#20BEFF' },
    { label: 'GeeksforGeeks', href: 'https://www.geeksforgeeks.org/profile/gauravky', handle: '@gauravky', note: 'DSA notes and practice', icon: BookOpen, brand: '#2F8D46' },
    { label: 'X', href: 'https://x.com/xgauravky', handle: '@xgauravky', note: 'Thoughts, updates and tech notes', icon: AtSign, brand: '#f0f6fc' },
    { label: 'Instagram', href: 'https://www.instagram.com/the_gau_rav/', handle: '@the_gau_rav', note: 'Behind the scenes', icon: Camera, brand: '#E4405F' },
]

/** Arrow, spinner and check share one fixed slot; only one shows at a time. */
function SubmitIcon({ status }) {
    return (
        <span className="ct-icon" data-state={status}>
            <span className="ct-icon__arrow">→</span>
            {status === 'sending' ? <span className="btn__spinner" /> : null}
            <span className="ct-icon__check">
                <span className="ct-icon__wipe">
                    <svg viewBox="0 0 16 16" width="16" height="16">
                        <path d="M3 8.5l3 3 7-7" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </span>
            </span>
        </span>
    )
}

SubmitIcon.propTypes = { status: PropTypes.oneOf(['idle', 'sending', 'sent']).isRequired }

function ContactForm() {
    const [data, setData] = useState(EMPTY)
    const [errors, setErrors] = useState({})
    const [touched, setTouched] = useState({})
    const [attempt, setAttempt] = useState(1) // bumps on each failed submit, re-shaking errored fields
    const [status, setStatus] = useState('idle') // idle | sending | sent
    const [intent, setIntent] = useState('')
    const [formError, setFormError] = useState('')
    const [thanks, setThanks] = useState(null)
    const [announcement, setAnnouncement] = useState('')
    const finePointer = useFinePointer()
    const sentTimer = useRef(0)

    useEffect(() => () => window.clearTimeout(sentTimer.current), [])

    const update = (name, value) => {
        setData((d) => ({ ...d, [name]: value }))
        // Typing only ever clears an error, once the value is valid.
        if (errors[name] && !RULES[name](value)) setErrors((e) => ({ ...e, [name]: undefined }))
        if (thanks) setThanks(null)
    }

    const field = (name) => ({
        name,
        value: data[name],
        error: errors[name],
        errorRole: null,
        shake: attempt,
        success: Boolean(touched[name] && data[name] && !errors[name] && !RULES[name](data[name])),
        onChange: (event) => update(name, event.target.value),
        onBlur: (event) => {
            const message = RULES[name](event.target.value) || undefined
            setTouched((t) => ({ ...t, [name]: true }))
            setErrors((e) => ({ ...e, [name]: message }))
            if (message) setAnnouncement(`${LABELS[name]}: ${message}`)
        },
    })

    const chooseIntent = (option) => {
        setIntent(option.value)
        const current = data.subject.trim()
        if (!current || PREFILLS.has(current)) update('subject', option.subject)
    }

    const fail = (message) => {
        setFormError(message)
        setAnnouncement(message)
    }

    const submit = async (event) => {
        event.preventDefault()
        if (status === 'sending') return
        const form = event.currentTarget
        const found = Object.fromEntries(Object.entries(RULES).map(([k, rule]) => [k, rule(data[k]) || undefined]))
        const invalid = Object.keys(RULES).filter((k) => found[k])
        if (invalid.length) {
            setErrors(found)
            setTouched({ name: true, email: true, subject: true, message: true })
            setAttempt((n) => n + 1)
            setFormError('')
            const first = invalid[0]
            setAnnouncement(`${invalid.length === 1 ? 'One field needs' : `${invalid.length} fields need`} attention. ${LABELS[first]}: ${found[first]}`)
            form.elements[first]?.focus()
            return
        }

        window.clearTimeout(sentTimer.current)
        setFormError('')
        setThanks(null)
        setStatus('sending')
        setAnnouncement('Sending your message…')
        try {
            const response = await fetch(`${API_URL}/api/contact`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            })
            const body = await response.json().catch(() => ({}))
            if (response.ok) {
                const firstName = data.name.trim().split(/\s+/)[0]
                const email = data.email.trim()
                setThanks({ name: firstName, email })
                setStatus('sent')
                setData(EMPTY)
                setErrors({})
                setTouched({})
                setIntent('')
                setAnnouncement(`Message sent. Thanks, ${firstName}. I’ll reply to ${email}.`)
                sentTimer.current = window.setTimeout(() => setStatus('idle'), SENT_MS)
                return
            }
            // Never clear what was typed on failure.
            setStatus('idle')
            if (body.errors?.length) {
                const mapped = Object.fromEntries(body.errors.map((e) => [e.field, e.message]))
                setErrors(mapped)
                setAttempt((n) => n + 1)
                const first = Object.keys(RULES).find((k) => mapped[k])
                if (first) {
                    setAnnouncement(`${LABELS[first]}: ${mapped[first]}`)
                    form.elements[first]?.focus()
                } else {
                    fail(body.errors[0].message || 'The message didn’t send. Please try again.')
                }
            } else {
                fail(body.message || 'The message didn’t send. Please try again.')
            }
        } catch {
            setStatus('idle')
            fail('Couldn’t reach the server. Check your connection and try again.')
        }
    }

    // ⌘/Ctrl+Enter submits from any field.
    const onKeyDown = (event) => {
        if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
            event.preventDefault()
            event.currentTarget.requestSubmit()
        }
    }

    const length = data.message.length
    let countTone = ''
    if (length >= MESSAGE_MAX) countTone = ' is-full'
    else if (length >= MESSAGE_WARN) countTone = ' is-warn'

    return (
        <form className="ct-form" onSubmit={submit} onKeyDown={onKeyDown} noValidate>
            <div className="ct-form__pair">
                <Input label="Name" autoComplete="name" required maxLength={100} {...field('name')} />
                <Input label="Email" type="email" autoComplete="email" spellCheck={false} required {...field('email')} />
            </div>
            <fieldset className="pj-seg ct-intent" role="radiogroup">
                <legend className="pj-seg__legend">What’s it about? <span className="ct-intent__opt">Optional</span></legend>
                <div className="pj-seg__options">
                    {INTENTS.map((option) => (
                        <label key={option.value} className="pj-seg__option">
                            <input
                                type="radio"
                                name="intent"
                                value={option.value}
                                checked={intent === option.value}
                                onChange={() => chooseIntent(option)}
                            />
                            <span>{option.value}</span>
                        </label>
                    ))}
                </div>
            </fieldset>
            <Input label="Subject" required maxLength={200} {...field('subject')} />
            <Textarea
                label="Message"
                rows={7}
                required
                maxLength={MESSAGE_MAX}
                hint={<span className={`ct-count${countTone}`}>{length} / {MESSAGE_MAX}</span>}
                {...field('message')}
            />
            <div className="pg-actions ct-form__actions">
                <Button
                    type="submit"
                    className="ct-submit"
                    data-state={status}
                    aria-keyshortcuts="Meta+Enter Control+Enter"
                    icon={<SubmitIcon status={status} />}
                >
                    <span className="ct-submit__label">
                        <span data-on={status !== 'sent'}>Send message</span>
                        <span data-on={status === 'sent'}>Sent</span>
                    </span>
                </Button>
                {finePointer ? (
                    <kbd className="ct-kbd" aria-hidden="true">{isMac() ? '⌘⏎' : 'Ctrl ⏎'}</kbd>
                ) : null}
            </div>
            {formError ? <p className="field__error ct-form__error">{formError}</p> : null}
            {thanks ? (
                <div className="ct-thanks">
                    <p className="ct-thanks__title">Thanks, {thanks.name} — it’s in my inbox.</p>
                    <p className="ct-thanks__meta">I’ll reply to <span translate="no">{thanks.email}</span>.</p>
                </div>
            ) : null}
            <p className="sr-only" aria-live="polite" aria-atomic="true">{announcement}</p>
        </form>
    )
}

function Contact() {
    useSEO({
        title: 'Contact - Gaurav Portfolio | Hire Python & AI Developer | Get in Touch',
        description: 'Contact Gaurav Kumar Yadav. Reach out for internship opportunities, entry-level positions, freelance projects, or collaborations. Python Developer & AI enthusiast from Lucknow, India.',
        keywords: 'Contact Gaurav Portfolio, Contact Gaurav Kumar Yadav, Portfolio Contact, Hire Python Developer, Hire AI Developer, Internship Developer Lucknow, Freelance Developer India',
        ogImage: 'https://ggauravky.vercel.app/images/profile.jpg',
        additionalJsonLd: {
            '@type': 'FAQPage',
            mainEntity: [
                {
                    '@type': 'Question',
                    name: 'How can I contact Gaurav Kumar Yadav?',
                    acceptedAnswer: {
                        '@type': 'Answer',
                        text: 'You can contact Gaurav Kumar Yadav via email at kumar.gaurav.yadav2007@gmail.com, on WhatsApp at +91 8542036499, through the contact form at https://ggauravky.vercel.app/contact, or on LinkedIn at https://www.linkedin.com/in/gauravky/.'
                    }
                },
                {
                    '@type': 'Question',
                    name: 'Is Gaurav Kumar Yadav available for internships?',
                    acceptedAnswer: {
                        '@type': 'Answer',
                        text: 'Yes. Gaurav Kumar Yadav is open to internship opportunities, entry-level developer positions, and freelance projects in AI/ML, web development, and full-stack engineering.'
                    }
                },
                {
                    '@type': 'Question',
                    name: 'What is the fastest way to reach Gaurav Kumar Yadav?',
                    acceptedAnswer: {
                        '@type': 'Answer',
                        text: 'WhatsApp (+91 8542036499) is the fastest channel for a quick response. For professional queries, email at kumar.gaurav.yadav2007@gmail.com or LinkedIn are recommended.'
                    }
                },
                {
                    '@type': 'Question',
                    name: 'What is Gaurav Kumar Yadav\'s GitHub profile?',
                    acceptedAnswer: {
                        '@type': 'Answer',
                        text: 'Gaurav Kumar Yadav\'s GitHub profile is at https://github.com/ggauravky. It contains open source projects in React, Node.js, Python, and AI/ML.'
                    }
                }
            ]
        }
    })

    const [copied, setCopied] = useState(false)
    const copyEmail = async () => {
        try {
            await navigator.clipboard.writeText(siteStatus.email)
            setCopied(true)
            toast.success('Email copied.')
            setTimeout(() => setCopied(false), 2000)
        } catch {
            toast.error('Couldn’t copy. Select the address instead.')
        }
    }

    return (
        <main className="pg contact">
            <PageHead head={STATIC_HEADS['/contact']}>
                <p className="ct-email">
                    <TextLink href={`mailto:${siteStatus.email}`} translate="no">{siteStatus.email}</TextLink>
                    <Button variant="link" onClick={copyEmail}>
                        <span aria-live="polite">{copied ? 'Copied' : 'Copy email'}</span>
                    </Button>
                </p>
            </PageHead>

            <PageSection id="message" index={1} title="Send a message">
                <ContactForm />
            </PageSection>

            <PageSection id="elsewhere" index={2} title="Elsewhere">
                <ul className="pg-rows ct-rows">
                    {PLATFORMS.map(({ label, href, handle, note, icon: Icon, brand, lead }) => (
                        <li key={label} className={`pg-row ct-row${lead ? ' ct-row--lead' : ''}`} style={{ '--brand': brand }}>
                            <p className="pg-row__label ct-row__label">
                                <span className="ct-row__icon" aria-hidden="true"><Icon className="ct-row__svg" strokeWidth={1.6} /></span>
                                {label}
                            </p>
                            <div className="pg-row__body">
                                <TextLink href={href} external translate="no">{handle}</TextLink>
                                <p className="pg-row__meta ct-note">{note}</p>
                            </div>
                        </li>
                    ))}
                    <li className="pg-row ct-row" style={{ '--brand': 'rgb(var(--paper))' }}>
                        <p className="pg-row__label ct-row__label">
                            <span className="ct-row__icon" aria-hidden="true"><FileDown className="ct-row__svg" strokeWidth={1.6} /></span>
                            Resume
                        </p>
                        <div className="pg-row__body">
                            <TextLink href={siteStatus.resumeUrl} external aria-label="resume.pdf (PDF, opens in a new tab)">resume.pdf</TextLink>
                            <p className="pg-row__meta ct-note">Experience, skills and education in one PDF</p>
                        </div>
                    </li>
                </ul>
            </PageSection>
        </main>
    )
}

export default Contact
