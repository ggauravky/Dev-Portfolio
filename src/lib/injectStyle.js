// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Source: https://github.com/ggauravky/Dev-Portfolio
//
// cssCodeSplit is off (D-046), so any plain `import './x.css'` lands in the one
// render-blocking stylesheet on every page. Page-only CSS is imported with
// `?inline` instead and injected here when its lazy chunk first evaluates,
// which is before that page renders (D-128). Idempotent per id. The CSP allows
// injected <style> (style-src 'unsafe-inline', D-124).

export default function injectStyle(id, css) {
    if (typeof document === 'undefined' || !css || document.getElementById(id)) return
    const style = document.createElement('style')
    style.id = id
    style.textContent = css
    document.head.appendChild(style)
}
