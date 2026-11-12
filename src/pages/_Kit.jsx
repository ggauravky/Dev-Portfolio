// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Dev-only UI kit sheet (/_kit). Mounted only when import.meta.env.DEV, so it is
// not in the production bundle and has no vercel.json rewrite.

import { useState } from 'react'
import { Button, TextLink, Input, Textarea, Tag, Card, Rule } from '../components/ui'

const VARIANTS = ['primary', 'secondary', 'ghost', 'link']

function Kit() {
    const [loading, setLoading] = useState(false)

    const simulate = () => {
        setLoading(true)
        setTimeout(() => setLoading(false), 1500)
    }

    return (
        <main className="mx-auto max-w-[1200px] space-y-16 px-4 py-16 sm:px-6 lg:px-8">
            <h1 className="font-serif text-h2 text-paper">UI kit</h1>

            <section aria-labelledby="kit-buttons" className="space-y-6">
                <h2 id="kit-buttons" className="font-serif text-h3 text-paper">Buttons</h2>
                {VARIANTS.map((variant) => (
                    <div key={variant} className="flex flex-wrap items-center gap-4">
                        <span className="w-24 text-small text-muted">{variant}</span>
                        <Button variant={variant}>Book a session</Button>
                        <Button variant={variant} disabled>Disabled</Button>
                        <Button variant={variant} loading={loading} onClick={simulate}>Send message</Button>
                        <Button variant={variant} to="/projects">As a link</Button>
                    </div>
                ))}
            </section>

            <section aria-labelledby="kit-links" className="space-y-4">
                <h2 id="kit-links" className="font-serif text-h3 text-paper">Links</h2>
                <p className="max-w-[60ch] text-body text-muted">
                    Running text with an <TextLink to="/about" underlined>internal link</TextLink> and an{' '}
                    <TextLink href="https://github.com/ggauravky" external underlined>external one</TextLink>.
                </p>
                <div className="flex gap-6">
                    <TextLink to="/blog">Paper link</TextLink>
                    <TextLink to="/blog" tone="muted">Muted link</TextLink>
                    <TextLink to="/_kit" tone="muted" aria-current="page">Current page</TextLink>
                </div>
            </section>

            <section aria-labelledby="kit-fields" className="grid max-w-xl gap-6">
                <h2 id="kit-fields" className="font-serif text-h3 text-paper">Fields</h2>
                <Input label="Name" placeholder="Your name" hint="As you'd like to be addressed." />
                <Input label="Email" type="email" defaultValue="not-an-email" error="Enter an email address like name@example.com." />
                <Input label="Disabled" disabled defaultValue="Read only" />
                <Textarea label="Message" placeholder="What are you building?" />
            </section>

            <section aria-labelledby="kit-tags" className="space-y-4">
                <h2 id="kit-tags" className="font-serif text-h3 text-paper">Tags</h2>
                <div className="flex flex-wrap gap-2">
                    {['React', 'Node.js', 'MongoDB', 'Python'].map((tag) => <Tag key={tag}>{tag}</Tag>)}
                </div>
            </section>

            <section aria-labelledby="kit-cards">
                <h2 id="kit-cards" className="mb-6 font-serif text-h3 text-paper">Cards (rows)</h2>
                <Card meta={<span className="font-mono">2026</span>} title="A titled row" to="/projects">
                    A card is a hairline row with the meta in a margin column.
                </Card>
                <Card meta="No link" title="Row without a link">Body copy in muted text.</Card>
                <Rule />
            </section>
        </main>
    )
}

export default Kit
