// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Unauthorized copying, modification, or distribution of this software,
// via any medium, is strictly prohibited without the express written
// consent of the author. See LICENSE for details.
// Source: https://github.com/ggauravky/Dev-Portfolio

// Contact (P5). The form posts to the existing /api/contact endpoint. Inline
// validation mirrors backend/middleware/validator.js (name 2–100, subject
// 5–200, message 10–2000) so the server rarely has to say no; its errors still
// map back onto the fields. Success replaces the form with a confirmation.
// Motion moments: (1) line-masked section headings, (2) the inputs' focus line.

import { useState } from 'react'
import toast from 'react-hot-toast'
import useSEO from '../hooks/useSEO'
import PageHead from '../components/page/PageHead'
import { STATIC_HEADS } from '../lib/pageHeads'
import PageSection from '../components/page/PageSection'
import { Button, Input, Textarea, TextLink } from '../components/ui'
import { siteStatus } from '../data/siteStatus'
import { validateEmail } from '../lib/validate'
import './Contact.css'

const MESSAGE_MAX = 2000
const EMPTY = { name: '', email: '', subject: '', message: '' }

const capital = (s) => `${s[0].toUpperCase()}${s.slice(1)}`
const between = (label, min, max) => (value) => {
    const v = String(value || '').trim()
    if (!v) return `Enter ${label}.`
    if (v.length < min) return `${capital(label)} needs at least ${min} characters.`
    if (v.length > max) return `${capital(label)} can be at most ${max} characters.`
    return ''
}

const RULES = {
    name: between('your name', 2, 100),
    email: validateEmail,
    subject: between('a subject', 5, 200),
    message: between('a message', 10, MESSAGE_MAX),
}

const PLATFORMS = [
    { label: 'GitHub', href: siteStatus.links.github, handle: '@ggauravky', note: 'Code, projects and open source' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/gauravky/', handle: '@gauravky', note: 'Professional updates and experience' },
    { label: 'WhatsApp', href: 'https://wa.me/918542036499', handle: '+91 8542036499', note: 'The fastest way to reach me' },
    { label: 'LeetCode', href: 'https://leetcode.com/u/gauravky/', handle: '@gauravky', note: 'Problem solving and DSA' },
    { label: 'Kaggle', href: 'https://www.kaggle.com/kgauravky', handle: '@kgauravky', note: 'ML notebooks and data experiments' },
    { label: 'GeeksforGeeks', href: 'https://www.geeksforgeeks.org/profile/gauravky', handle: '@gauravky', note: 'DSA notes and practice' },
    { label: 'X', href: 'https://x.com/xgauravky', handle: '@xgauravky', note: 'Thoughts, updates and tech notes' },
    { label: 'Instagram', href: 'https://www.instagram.com/the_gau_rav/', handle: '@the_gau_rav', note: 'Behind the scenes' },
]

function ContactForm() {
    const [data, setData] = useState(EMPTY)
    const [errors, setErrors] = useState({})
    const [status, setStatus] = useState('idle') // idle | sending | sent

    const field = (name) => ({
        name,
        value: data[name],
        validate: RULES[name],
        error: errors[name],
        onChange: (event) => {
            setData((d) => ({ ...d, [name]: event.target.value }))
            if (errors[name]) setErrors((e) => ({ ...e, [name]: undefined }))
        },
    })

    const submit = async (event) => {
        event.preventDefault()
        const form = event.currentTarget
        const found = Object.fromEntries(Object.entries(RULES).map(([k, rule]) => [k, rule(data[k]) || undefined]))
        const first = Object.keys(RULES).find((k) => found[k])
        if (first) {
            setErrors(found)
            form.elements[first]?.focus()
            return
        }
        setStatus('sending')
        try {
            const api = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '')
            const response = await fetch(`${api}/api/contact`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            })
            const body = await response.json().catch(() => ({}))
            if (response.ok) {
                setStatus('sent')
                setData(EMPTY)
                return
            }
            setStatus('idle')
            if (body.errors?.length) {
                setErrors(Object.fromEntries(body.errors.map((e) => [e.field, e.message])))
            } else {
                toast.error(body.message || 'The message didn’t send. Please try again.')
            }
        } catch {
            setStatus('idle')
            toast.error('Couldn’t reach the server. Check your connection and try again.')
        }
    }

    if (status === 'sent') {
        return (
            <div className="ct-sent" role="status" tabIndex={-1} ref={(el) => el?.focus()}>
                <p className="ct-sent__title"><span className="pg-dot" aria-hidden="true" /> Message sent.</p>
                <p className="pg-intro">Thanks. I’ll reply to the email you gave.</p>
                <Button variant="secondary" onClick={() => setStatus('idle')}>Send another</Button>
            </div>
        )
    }

    return (
        <form className="ct-form" onSubmit={submit} noValidate>
            <div className="ct-form__pair">
                <Input label="Name" autoComplete="name" required maxLength={100} {...field('name')} />
                <Input label="Email" type="email" autoComplete="email" spellCheck={false} required {...field('email')} />
            </div>
            <Input label="Subject" required maxLength={200} {...field('subject')} />
            <Textarea
                label="Message"
                rows={7}
                required
                maxLength={MESSAGE_MAX}
                hint={`${data.message.length} / ${MESSAGE_MAX}`}
                {...field('message')}
            />
            <div className="pg-actions ct-form__actions">
                <Button type="submit" loading={status === 'sending'} arrow>Send message</Button>
            </div>
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
                <ul className="pg-rows">
                    {PLATFORMS.map((p) => (
                        <li key={p.label} className="pg-row">
                            <p className="pg-row__label">{p.label}</p>
                            <div className="pg-row__body">
                                <TextLink href={p.href} external translate="no">{p.handle}</TextLink>
                                <p className="pg-row__meta ct-note">{p.note}</p>
                            </div>
                        </li>
                    ))}
                    <li className="pg-row">
                        <p className="pg-row__label">Resume</p>
                        <div className="pg-row__body">
                            <TextLink href={siteStatus.resumeUrl} external>resume.pdf</TextLink>
                            <p className="pg-row__meta ct-note">Experience, skills and education in one PDF</p>
                        </div>
                    </li>
                </ul>
            </PageSection>
        </main>
    )
}

export default Contact
