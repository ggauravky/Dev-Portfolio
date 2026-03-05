// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Unauthorized copying, modification, or distribution of this software,
// via any medium, is strictly prohibited without the express written
// consent of the author. See LICENSE for details.
// Source: https://github.com/ggauravky/Dev-Portfolio

const resolveMlLogBaseUrl = () => {
    const explicitBase = (import.meta.env.VITE_ML_LOG_API_URL || import.meta.env.VITE_API_URL || '').replace(/\/$/, '')

    if (explicitBase) return explicitBase

    if (import.meta.env.PROD) {
        return ''
    }

    return 'http://localhost:5000'
}

// Upload image (as base64 canvas snapshot) + predictions to backend.
// Backend handles Cloudinary upload + MongoDB write in one shot.
// Fire-and-forget — never throws, never blocks UI.
export const uploadAndLogImage = async ({ imageBase64, predictionLabel, topPredictions }) => {
    const baseUrl = resolveMlLogBaseUrl()
    if (!baseUrl || !imageBase64) return false

    try {
        await fetch(`${baseUrl}/api/ml-log/upload-image`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                imageBase64,
                predictionLabel: String(predictionLabel || '').trim().slice(0, 180),
                topPredictions: Array.isArray(topPredictions) ? topPredictions.slice(0, 5) : [],
            }),
            keepalive: true,
        })
        return true
    } catch {
        return false
    }
}

export const logMlUsage = async (payload = {}) => {
    const baseUrl = resolveMlLogBaseUrl()
    if (!baseUrl) return false

    const demoType = String(payload.demoType || '').trim().slice(0, 40)
    if (!demoType) return false

    const body = {
        demoType,
        event: String(payload.event || 'run').trim().slice(0, 40),
        predictionLabel: String(payload.predictionLabel || '').trim().slice(0, 180),
        // Image Analyzer
        topPredictions: Array.isArray(payload.topPredictions) ? payload.topPredictions.slice(0, 5) : [],
        // Prompt Improver
        inputPrompt: String(payload.inputPrompt || '').trim().slice(0, 1200),
        improvedPrompt: String(payload.improvedPrompt || '').trim().slice(0, 4000),
        nlpAction: String(payload.nlpAction || '').trim().slice(0, 40),
        nlpTone: String(payload.nlpTone || '').trim().slice(0, 60),
    }

    try {
        await fetch(`${baseUrl}/api/ml-log`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
            keepalive: true,
        })
        return true
    } catch {
        return false
    }
}
