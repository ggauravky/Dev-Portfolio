// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Source: https://github.com/ggauravky/Dev-Portfolio
//
// Index filters behind one hairline row on phones (unslop audit P-4/J-5, D-116).
// Below 768px the controls start closed, unless a filter is already applied
// (a shared link), so the first screen shows the index, not a control panel.
// From 768px up the toggle is hidden and the controls always show. The row is
// the Journey entry recipe: label on the left, "+" / "−" on the right.

import { useId, useState } from 'react'
import PropTypes from 'prop-types'

function FilterDisclosure({ label, summary = '', defaultOpen = false, children }) {
    const [open, setOpen] = useState(defaultOpen)
    const panelId = useId()

    return (
        <div className="filter-disclosure">
            <button
                type="button"
                className="filter-disclosure__toggle"
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => setOpen((value) => !value)}
            >
                <span>
                    {label}
                    {summary ? <span className="filter-disclosure__summary"> · {summary}</span> : null}
                </span>
                <span className="filter-disclosure__sign" aria-hidden="true">{open ? '−' : '+'}</span>
            </button>
            <div id={panelId} className="filter-disclosure__panel" data-open={open}>
                {children}
            </div>
        </div>
    )
}

FilterDisclosure.propTypes = {
    label: PropTypes.string.isRequired,
    summary: PropTypes.string,
    defaultOpen: PropTypes.bool,
    children: PropTypes.node.isRequired,
}

export default FilterDisclosure
