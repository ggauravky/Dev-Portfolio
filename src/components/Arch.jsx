// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Source: https://github.com/ggauravky/Dev-Portfolio
//
// S3 — the Lucknow arch (DESIGN.md "Signature layer"). A cusped, pointed Awadhi
// arch: three foils a side meeting at a pointed crown, on straight jambs. One SVG
// clipPath in objectBoundingBox units, so it fits any box; the hairline outline
// is the same path drawn 8px outside the masked image.

import PropTypes from 'prop-types'

export const ARCH_ID = 'lucknow-arch'

export const ARCH_PATH =
    'M0,1 L0,0.46 Q0,0.3464 0.1093,0.265 Q0.1274,0.1447 0.2738,0.1136 Q0.359,0.0134 0.5,0 ' +
    'Q0.641,0.0134 0.7262,0.1136 Q0.8726,0.1447 0.8907,0.265 Q1,0.3464 1,0.46 L1,1 Z'

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
