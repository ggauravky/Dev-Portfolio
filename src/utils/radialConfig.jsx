// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Minimal & Premium Contextual Radial Navigation Configuration
// Source: https://github.com/ggauravky/Dev-Portfolio

import PropTypes from 'prop-types'
import {
    FolderKanban,
    FileText,
    Mail,
    Coffee,
    Command
} from 'lucide-react'

// Lucide-styled GitHub SVG Icon with identical stroke & viewbox properties
const GithubIcon = ({ className = 'h-5 w-5', strokeWidth = 1.8 }) => (
    <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
        <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
)
GithubIcon.propTypes = { className: PropTypes.string, strokeWidth: PropTypes.number }

// Center Action Configuration (Command Palette)
export const RADIAL_CENTER_ACTION = {
    title: 'Command Palette',
    subtitle: 'Search everything',
    icon: Command,
    actionId: 'open-command-palette'
}

// 5 Outer Actions Maximum (Clean & Minimal)
export const RADIAL_ITEMS = [
    {
        id: 'radial-projects',
        title: 'Projects',
        subtitle: 'View my work',
        type: 'internal',
        route: '/projects',
        icon: FolderKanban,
        shortcut: 'P'
    },
    {
        id: 'radial-resume',
        title: 'Resume',
        subtitle: 'Download Resume',
        type: 'action',
        actionId: 'download-resume',
        icon: FileText,
        shortcut: 'R'
    },
    {
        id: 'radial-github',
        title: 'GitHub',
        subtitle: 'Open GitHub Profile',
        type: 'external',
        url: 'https://github.com/ggauravky',
        icon: GithubIcon,
        shortcut: 'GH'
    },
    {
        id: 'radial-support',
        title: 'Buy Me a Coffee',
        subtitle: 'Support my work',
        type: 'internal',
        route: '/support',
        icon: Coffee,
        shortcut: 'S'
    },
    {
        id: 'radial-contact',
        title: 'Contact',
        subtitle: "Let's connect",
        type: 'internal',
        route: '/contact',
        icon: Mail,
        shortcut: 'C'
    }
]

/**
 * Filter non-interactive targets to preserve native context menu
 */
export const isInteractiveTarget = (target) => {
    if (!target || !(target instanceof HTMLElement)) return false

    // Check text selection
    const selection = window.getSelection()
    if (selection && selection.toString().trim().length > 0) {
        return true
    }

    const interactiveTags = new Set([
        'A', 'BUTTON', 'INPUT', 'TEXTAREA', 'SELECT', 'LABEL', 'IMG', 'VIDEO', 'AUDIO', 'IFRAME', 'OPTION', 'SUMMARY', 'DETAILS', 'CODE', 'PRE', 'CANVAS', 'FORM', 'DIALOG'
    ])

    const interactiveRoles = new Set([
        'button', 'link', 'textbox', 'checkbox', 'radio', 'switch', 'option', 'menuitem', 'tab', 'searchbox', 'combobox', 'gridcell'
    ])

    let current = target
    while (current && current !== document.body) {
        if (interactiveTags.has(current.tagName)) return true
        const role = current.getAttribute('role')
        if (role && interactiveRoles.has(role.toLowerCase())) return true
        if (current.isContentEditable || current.getAttribute('contenteditable') === 'true') return true
        if (current.getAttribute('data-no-radial') === 'true' || current.getAttribute('data-interactive') === 'true') return true
        if (
            current.classList.contains('interactive') ||
            current.classList.contains('no-radial') ||
            current.classList.contains('cmdk-overlay') ||
            current.classList.contains('cmdk-root')
        ) return true

        current = current.parentElement
    }

    return false
}
