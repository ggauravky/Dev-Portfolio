// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Source: https://github.com/ggauravky/Dev-Portfolio
//
// Display formats for numbers in the site data (unslop audit V-1, D-119).
// Display only: the backend sets every charged amount (servicePricing.json),
// and the data strings stay as written.

const inr = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 })

/** 1499 → "1,499". */
export const formatAmount = (amount) => inr.format(amount)

/** "INR 1499 - INR 1999" → "INR 1,499–1,999"; "Starts at INR 1499" → "Starts at INR 1,499". */
export function formatPriceLabel(label) {
    if (!label) return ''
    const range = label.match(/^INR\s*(\d+)\s*[-–]\s*(?:INR\s*)?(\d+)$/)
    if (range) return `INR ${formatAmount(Number(range[1]))}–${formatAmount(Number(range[2]))}`
    return label.replace(/INR\s*(\d{4,})/g, (_, n) => `INR ${formatAmount(Number(n))}`)
}

/** Number ranges in running text use an en dash: "3-5 days" → "3–5 days". */
export const displayRanges = (text) => (text ? text.replace(/(\d)\s*-\s*(\d)/g, '$1–$2') : text)
