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
            className={`group relative overflow-hidden rounded-2xl border backdrop-blur-sm p-5 sm:p-6 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl ${
                featured
                    ? 'bg-gradient-to-br from-blue-600/12 via-purple-600/12 to-cyan-600/12 border-cyan-500/40 shadow-cyan-500/10'
                    : 'bg-slate-800/70 border-slate-700/70 hover:border-cyan-500/40 hover:shadow-cyan-500/10'
            }`}
        >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(120%_90%_at_0%_0%,rgba(34,211,238,0.14),transparent)]" />

            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                <h3 className="text-xl sm:text-2xl font-bold text-slate-100 leading-tight">{service.title}</h3>
                {service.badge ? (
                    <span className="w-fit shrink-0 text-xs font-semibold text-cyan-300 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30">
                        {service.badge}
                    </span>
                ) : null}
            </div>

            <p className="text-cyan-300 font-bold text-2xl sm:text-3xl mb-4">{service.priceLabel}</p>
            <p className="text-slate-400 text-xs mb-4">Secure checkout via Cashfree (UPI, cards, netbanking, wallets)</p>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-4">{service.summary}</p>

            <ul className="space-y-2.5 mb-6">
                {service.features.map((feature) => (
                    <li key={feature} className="text-slate-300 text-sm sm:text-base flex items-start gap-2">
                        <span className="mt-1 h-2 w-2 rounded-full bg-blue-400 shrink-0" />
                        <span>{feature}</span>
                    </li>
                ))}
            </ul>

            <div className="mb-5 rounded-xl border border-slate-700/80 bg-slate-900/45 p-3">
                <p className="text-[11px] uppercase tracking-widest text-slate-500 mb-2">In View Details</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    <span className="rounded-lg border border-slate-700/70 bg-slate-800/70 px-2.5 py-1.5 text-slate-300 text-center">Deliverables</span>
                    <span className="rounded-lg border border-slate-700/70 bg-slate-800/70 px-2.5 py-1.5 text-slate-300 text-center">Best For</span>
                    <span className="rounded-lg border border-slate-700/70 bg-slate-800/70 px-2.5 py-1.5 text-slate-300 text-center">Timeline</span>
                </div>
            </div>

            <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <Link
                    to={service.path}
                    className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 font-semibold text-sm sm:text-base text-slate-200 border border-slate-700 hover:border-cyan-500/40 hover:text-cyan-300 transition-colors"
                >
                    <span>View Details</span>
                    <span>{'->'}</span>
                </Link>

                <Link
                    to={`/booknow?service=${service.slug}`}
                    className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 font-semibold text-sm sm:text-base text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 transition-all duration-300 hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    <span>Book Now</span>
                    <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
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
        badge: PropTypes.string,
    }).isRequired,
    featured: PropTypes.bool,
}

export default ServiceCard
