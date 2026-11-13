/** @type {import('tailwindcss').Config} */

// v2 tokens live as CSS variables in src/index.css (RGB channels, so opacity
// modifiers like `bg-ink/80` work). See docs/DESIGN.md — direction A, Monograph.
function token(name) {
  return `rgb(var(--${name}) / <alpha-value>)`;
}

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: { DEFAULT: token("ink"), raised: token("ink-raised") },
        rule: token("rule"),
        paper: token("paper"),
        muted: token("muted"),
        accent: token("accent"),
      },
      fontFamily: {
        serif: ["var(--font-serif)"],
        sans: ["var(--font-sans)"],
        mono: ["var(--font-mono)"],
      },
      fontSize: {
        display: ["var(--text-display)", { lineHeight: "0.95", letterSpacing: "-0.02em" }],
        h2: ["var(--text-h2)", { lineHeight: "1.1", letterSpacing: "-0.01em" }],
        h3: ["var(--text-h3)", { lineHeight: "1.25" }],
        body: ["var(--text-body)", { lineHeight: "1.6" }],
        small: ["var(--text-small)", { lineHeight: "1.5" }],
      },
      // 8px spacing scale: use Tailwind's 2/4/6/8/12/16/24/32 (8–128px).
      // Named aliases for the two radii and the one shadow in the system.
      borderRadius: {
        control: "var(--radius-control)",
        dialog: "var(--radius-dialog)",
      },
      boxShadow: {
        dialog: "var(--shadow-dialog)",
      },
    },
  },
  plugins: [],
};
