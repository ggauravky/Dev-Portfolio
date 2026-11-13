// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Source: https://github.com/ggauravky/Dev-Portfolio
//
// S3 — the Lucknow arch (DESIGN.md "Signature layer"). A cusped, pointed Awadhi
// arch: three foils a side meeting at a pointed crown, on straight jambs. One SVG
// clipPath in objectBoundingBox units, so it fits any box; the hairline outline
// is the same path drawn 8px outside the masked image.

import PropTypes from 'prop-types'
import { ARCH_ID, ARCH_PATH } from '../lib/arch'

export { ARCH_ID, ARCH_PATH }

/** Arch-masked frame. Children (usually an image) fill it and are clipped. */
function Arch({ children, className = '', outline = true }) {
    return (
        <div className={`arch ${className}`.trim()}>
            <svg className="arch__defs" width="0" height="0" aria-hidden="true" focusable="false">
                <defs>
                    <clipPath id={ARCH_ID} clipPathUnits="objectBoundingBox">
                        <path d={ARCH_PATH} />
                    </clipPath>
                </defs>
            </svg>
            {outline ? (
                <svg className="arch__outline" viewBox="0 0 1 1" preserveAspectRatio="none" aria-hidden="true" focusable="false">
                    <path d={ARCH_PATH} vectorEffect="non-scaling-stroke" />
                </svg>
            ) : null}
            <div className="arch__mask">{children}</div>
        </div>
    )
}

Arch.propTypes = {
    children: PropTypes.node,
    className: PropTypes.string,
    outline: PropTypes.bool,
}

export default Arch
