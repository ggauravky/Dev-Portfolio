// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Source: https://github.com/ggauravky/Dev-Portfolio
//
// Single source of truth for live site status (DESIGN.md "Single sources of
// truth"). The dock, footer, ⌘K and Contact read from here; nothing else should
// hard-code these values.
//
// ⚠ PLACEHOLDERS — the owner fills these in P3. Do not invent values.
// While a value is `null`, every surface hides that piece instead of guessing.

export const siteStatus = {
    /**
     * Availability shown as the dock's status dot and in the footer.
     * Fill in P3, e.g. { available: true, label: '…owner's words…' }.
     */
    availability: { available: true, label: 'Open for internships & freelance' }, // owner, P3

    /**
     * "Currently building" line for the footer colophon.
     * Fill in P3, e.g. { title: '…', href: '/projects/…' }.
     */
    currentlyBuilding: null, // ⚠ PLACEHOLDER — owner skipped in P3; hidden everywhere

    // Existing facts (from the contact page, ⌘K registry and footer).
    email: 'kumar.gaurav.yadav2007@gmail.com',
    resumeUrl: '/resume.pdf',
    links: {
        github: 'https://github.com/ggauravky',
        linkedin: 'https://linkedin.com/in/gauravky',
    },
}

export const isAvailable = () => siteStatus.availability?.available === true
