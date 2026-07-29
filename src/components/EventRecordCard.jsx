// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Unauthorized copying, modification, or distribution of this software,
// via any medium, is strictly prohibited without the express written
// consent of the author. See LICENSE for details.
// Source: https://github.com/ggauravky/Dev-Portfolio

import PropTypes from 'prop-types'
import LazyImage from './LazyImage'

const formatEventDate = (value) => {
    const parsed = new Date(value)
    if (Number.isNaN(parsed.getTime())) {
        return value
    }

    return parsed.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    })
}

const getEventDateLabel = (event) => event.dateLabel || formatEventDate(event.date)

const renderEventCover = (event, hasImages, coverImage) => {
    if (hasImages) {
        return (
            <div className="mb-4">
                <a
                    href={coverImage}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative block overflow-hidden rounded-xl border border-slate-700/80"
                >
                    <LazyImage
                        src={coverImage}
                        alt={`${event.title} cover`}
                        className="h-48 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
                    <span className="absolute bottom-2 right-2 rounded-full border border-slate-500/70 bg-slate-900/80 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-100">
                        {event.images.length} Photos
                    </span>
                </a>
            </div>
        )
    }

    return (
        <div className="mb-4 rounded-xl border border-dashed border-slate-600 bg-slate-800/50 p-4">
            <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg border border-slate-600 bg-slate-700/70 flex items-center justify-center">
                    <svg className="h-4 w-4 text-slate-300" fill="none" viewBox="0 0 24 24" strokeWidth={1.6} stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 7.5h16.5M3.75 12h16.5m-16.5 4.5h16.5" />
                    </svg>
                </div>
                <p className="text-sm text-slate-300">Event images will be added here</p>
            </div>
        </div>
    )
}

const renderWorkshop = (workshop) => {
    if (!workshop) {
        return null
    }

    return (
        <div className="mt-3 rounded-xl border border-cyan-500/25 bg-cyan-500/10 p-3">
            <p className="text-[11px] uppercase tracking-widest text-cyan-300">Workshop</p>
            <p className="mt-1 text-sm text-cyan-100 leading-relaxed">{workshop}</p>
        </div>
    )
}

const renderSpeakers = (event) => {
    if (!Array.isArray(event.speakers) || event.speakers.length === 0) {
        return null
    }

    return (
        <div className="mt-3">
            <p className="text-[11px] uppercase tracking-widest text-slate-500 mb-2">Speakers</p>
            <div className="flex flex-wrap gap-2">
                {event.speakers.map((speaker) => (
                    <span
                        key={`${event.id}-speaker-${speaker}`}
                        className="rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-1 text-xs text-slate-300"
                    >
                        {speaker}
                    </span>
                ))}
            </div>
        </div>
    )
}

const renderHighlights = (event) => {
    if (!Array.isArray(event.highlights) || event.highlights.length === 0) {
        return null
    }

    return (
        <div className="mt-3">
            <p className="text-[11px] uppercase tracking-widest text-slate-500 mb-2">Key Highlights</p>
            <ul className="space-y-1.5">
                {event.highlights.map((point) => (
                    <li key={`${event.id}-highlight-${point}`} className="text-sm text-slate-300 flex gap-2 leading-relaxed">
                        <span className="mt-2 h-1.5 w-1.5 rounded-full bg-cyan-400 shrink-0" />
                        <span>{point}</span>
                    </li>
                ))}
            </ul>
        </div>
    )
}

const renderCompanions = (event) => {
    if (!Array.isArray(event.companions) || event.companions.length === 0) {
        return null
    }

    return (
        <p className="mt-3 text-sm text-slate-300">
            <span className="text-slate-500">With:</span> {event.companions.join(', ')}
        </p>
    )
}

const renderGallery = (event, galleryImages) => {
    if (galleryImages.length === 0) {
        return null
    }

    return (
        <div className="mt-3">
            <p className="text-[11px] uppercase tracking-widest text-slate-500 mb-2">More Moments</p>
            <div className="grid grid-cols-5 gap-2">
                {galleryImages.map((image, imageIndex) => (
                    <a
                        key={`${event.id}-img-${image}`}
                        href={image}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group relative overflow-hidden rounded-lg border border-slate-700/70"
                    >
                        <LazyImage
                            src={image}
                            alt={`${event.title} ${imageIndex + 2}`}
                            className="h-14 w-full object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                    </a>
                ))}
            </div>
        </div>
    )
}

const renderHashtags = (event) => {
    if (!Array.isArray(event.hashtags) || event.hashtags.length === 0) {
        return null
    }

    return (
        <div className="mt-3 flex flex-wrap gap-2">
            {event.hashtags.map((tag) => (
                <span
                    key={`${event.id}-tag-${tag}`}
                    className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-1 text-[11px] text-cyan-200"
                >
                    #{tag}
                </span>
            ))}
        </div>
    )
}

const renderSource = (source) => {
    if (!source) {
        return null
    }

    return <p className="mt-3 text-xs uppercase tracking-widest text-slate-500">Source: {source}</p>
}

function EventRecordCard({ event, index = 0 }) {
    const hasImages = Array.isArray(event.images) && event.images.length > 0
    const coverImage = hasImages ? event.images[0] : ''
    const galleryImages = hasImages ? event.images.slice(1) : []

    return (
        <article
            className="rounded-2xl border border-slate-700/70 bg-slate-900/55 p-4 sm:p-5 hover:border-cyan-500/45 hover:-translate-y-1 transition-all duration-300 animate-slideUp overflow-hidden"
            style={{ animationDelay: `${index * 0.06}s` }}
        >
            {renderEventCover(event, hasImages, coverImage)}

            <div className="flex items-start justify-between gap-3">
                <h3 className="text-base sm:text-lg font-semibold text-slate-100 leading-snug">{event.title}</h3>
                <div className="flex flex-col gap-1.5 items-end">
                    <span className="shrink-0 rounded-full border border-cyan-500/35 bg-cyan-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-cyan-300">
                        {event.participation}
                    </span>
                    {event.eventType ? (
                        <span className="shrink-0 rounded-full border border-purple-500/35 bg-purple-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-purple-200">
                            {event.eventType}
                        </span>
                    ) : null}
                </div>
            </div>

            <div className="mt-2 flex flex-wrap gap-2">
                <span className="rounded-full border border-slate-600/70 bg-slate-800 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-300">
                    {getEventDateLabel(event)}
                </span>
                {event.location ? (
                    <span className="rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-indigo-200">
                        {event.location}
                    </span>
                ) : null}
            </div>

            <p className="mt-2 text-sm text-slate-300"><span className="text-slate-500">Organizer:</span> {event.organizer}</p>
            <p className="mt-2 text-sm text-slate-400 leading-relaxed">{event.note}</p>

            {renderWorkshop(event.workshop)}
            {renderSpeakers(event)}
            {renderHighlights(event)}
            {renderCompanions(event)}
            {renderGallery(event, galleryImages)}
            {renderHashtags(event)}
            {renderSource(event.source)}
        </article>
    )
}

EventRecordCard.propTypes = {
    event: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        title: PropTypes.string.isRequired,
        date: PropTypes.string.isRequired,
        organizer: PropTypes.string.isRequired,
        participation: PropTypes.string.isRequired,
        note: PropTypes.string.isRequired,
        dateLabel: PropTypes.string,
        eventType: PropTypes.string,
        location: PropTypes.string,
        workshop: PropTypes.string,
        source: PropTypes.string,
        speakers: PropTypes.arrayOf(PropTypes.string),
        highlights: PropTypes.arrayOf(PropTypes.string),
        companions: PropTypes.arrayOf(PropTypes.string),
        hashtags: PropTypes.arrayOf(PropTypes.string),
        images: PropTypes.arrayOf(PropTypes.string),
    }).isRequired,
    index: PropTypes.number,
}

export default EventRecordCard
