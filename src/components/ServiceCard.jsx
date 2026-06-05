// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Unauthorized copying, modification, or distribution of this software,
// via any medium, is strictly prohibited without the express written
// consent of the author. See LICENSE for details.
// Source: https://github.com/ggauravky/Dev-Portfolio

import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'

function ServiceCard({ service, featured = false }) {
    return (
        <article
            className={`group relative overflow-hidden rounded-lg border backdrop-blur-sm p-6 sm:p-8 transition-all duration-350 hover:-translate-y-1.5 ${
                featured
                    ? 'bg-obsidian-card border-cyber/30 hover:border-cyber/60 shadow-lg shadow-cyber/5'
                    : 'bg-obsidian-card border-obsidian-border hover:border-toxic/40'
            }`}
        >
            <div className="absolute inset-0 bg-gradient-to-br from-toxic/[0.01] to-transparent pointer-events-none" />

            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                <h3 className="text-xl sm:text-2xl font-display font-bold uppercase text-white leading-tight">{service.title}</h3>
                {service.badge ? (
                    <span className="w-fit shrink-0 text-[10px] font-mono font-bold text-toxic px-2.5 py-1 rounded bg-toxic/5 border border-toxic/15 uppercase">
                        {service.badge}
                    </span>
                ) : null}
            </div>

            <p className="text-2xl sm:text-3xl font-display font-black text-toxic mb-1">{service.priceLabel}</p>
            <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-wider mb-5">// Secure checkout via Cashfree (UPI, cards, netbanking)</p>

            {service.outcomePromise ? (
                <div className="mb-5 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3.5">
                    <p className="text-[9px] font-mono font-bold uppercase tracking-widest text-emerald-400 mb-1">// Expected Outcome</p>
                    <p className="text-xs sm:text-sm text-emerald-200/90 leading-relaxed font-semibold">{service.outcomePromise}</p>
                </div>
            ) : null}

            <p className="text-zinc-400 text-sm sm:text-base leading-relaxed mb-5">{service.summary}</p>

            <ul className="space-y-3 mb-6">
                {service.features.map((feature) => (
                    <li key={feature} className="text-zinc-300 text-sm sm:text-base flex items-start gap-2.5">
                        <span className="text-toxic font-mono shrink-0 select-none">→</span>
                        <span>{feature}</span>
                    </li>
                ))}
            </ul>

            <div className="mb-6 rounded-lg border border-obsidian-border bg-obsidian/50 p-4">
                <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500 mb-2.5">// In View Details</p>
                <div className="grid grid-cols-3 gap-2 text-[10px] font-mono uppercase tracking-wider">
                    <span className="rounded border border-obsidian-border bg-obsidian-card px-2 py-1.5 text-zinc-400 text-center">Deliverables</span>
                    <span className="rounded border border-obsidian-border bg-obsidian-card px-2 py-1.5 text-zinc-400 text-center">Best For</span>
                    <span className="rounded border border-obsidian-border bg-obsidian-card px-2 py-1.5 text-zinc-400 text-center">Timeline</span>
                </div>
            </div>

            <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Link
                    to={service.path}
                    className="inline-flex items-center justify-center gap-2 border border-zinc-800 hover:border-toxic text-zinc-300 hover:text-toxic font-bold px-4 py-3 rounded-full transition-all duration-300 text-xs uppercase tracking-wider font-mono"
                >
                    <span>View Details</span>
                    <span>→</span>
                </Link>

                <Link
                    to={`/booknow?service=${service.slug}`}
                    className="inline-flex items-center justify-center gap-2 bg-toxic hover:bg-white text-obsidian font-bold px-4 py-3 rounded-full transition-all duration-300 hover:scale-[1.02] text-xs uppercase tracking-wider font-mono"
                >
                    <span>Book Now</span>
                </Link>
            </div>
        </article>
    )
}

ServiceCard.propTypes = {
    service: PropTypes.shape({
        slug: PropTypes.string,
        path: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        summary: PropTypes.string,
        priceLabel: PropTypes.string.isRequired,
        features: PropTypes.arrayOf(PropTypes.string).isRequired,
        outcomePromise: PropTypes.string,
        badge: PropTypes.string,
    }).isRequired,
    featured: PropTypes.bool,
}

export default ServiceCard
