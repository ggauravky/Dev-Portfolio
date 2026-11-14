// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Source: https://github.com/ggauravky/Dev-Portfolio
//
// Home hero live panel (D-074), in the slot the portrait used to fill. Three
// lines at most: Lucknow time (always shown), GitHub activity (last-known-good
// value, D-094; omitted only if even the seed is missing) and availability.
// Not a widget: no box, just a hairline and the mono face. Nothing animates; the
// only change is the minute ticking over. The static shell in index.html renders
// the same rows with the time blank, so nothing shifts when React takes over.

import { siteStatus, isAvailable } from '../../data/siteStatus'
import { timeFormat, formatGitHubStat, useLucknowTime, useGitHubActivity } from '../../lib/liveStatus'

function HeroLive() {
    const now = useLucknowTime()
    // Last-known-good value (D-094): the stored copy or the seed, never a blank.
    const github = formatGitHubStat(useGitHubActivity())
    const availability = siteStatus.availability
    const available = isAvailable()

    return (
        <div
            className="hero-live"
            role="group"
            aria-label="Live status: local time in Lucknow, latest GitHub activity and current availability."
            aria-live="off"
        >
            <dl className="hero-live__list">
                <div className="hero-live__row">
                    <dt>Lucknow, India</dt>
                    <dd>
                        <time dateTime={now.toISOString()}>{timeFormat.format(now)} IST</time>
                    </dd>
                </div>
                {github ? (
                    <div className="hero-live__row">
                        <dt>GitHub</dt>
                        <dd>{github}</dd>
                    </div>
                ) : null}
                {availability ? (
                    <div className="hero-live__row hero-live__row--status">
                        <dt className="sr-only">Availability</dt>
                        <dd>
                            {available ? <span className="hero-live__dot" aria-hidden="true" /> : null}
                            {availability.label}
                        </dd>
                    </div>
                ) : null}
            </dl>
        </div>
    )
}

export default HeroLive
