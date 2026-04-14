// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Unauthorized copying, modification, or distribution of this software,
// via any medium, is strictly prohibited without the express written
// consent of the author. See LICENSE for details.
// Source: https://github.com/ggauravky/Dev-Portfolio

/**
 * Backend Wake-Up Utility
 * 
 * This utility pings the backend health endpoint to prevent cold starts
 * on services like Render that sleep after 15 minutes of inactivity.
 * 
 * Usage: Call pingBackend() when the app loads to wake up the backend
 * before users reach the contact form.
 */

/**
 * Ping the backend health endpoint to wake it up
 * @returns {Promise<boolean>} True if ping successful, false otherwise
 */
export const pingBackend = async () => {
    try {
        // Get backend URL from environment variable
        const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '')
        
        // Silent ping to health endpoint with timeout
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout
        
        const response = await fetch(`${API_URL}/health`, {
            method: 'GET',
            signal: controller.signal,
            // Don't send credentials for health check
            mode: 'cors',
        })
        
        clearTimeout(timeoutId)
        
        return response.ok
    } catch {
        // Keep ping operation silent for end users.
        return false
    }
}

/**
 * Ping backend with retry logic
 * Useful for ensuring backend is definitely awake
 * @param {number} maxRetries - Maximum number of retry attempts
 * @param {number} delayMs - Delay between retries in milliseconds
 * @returns {Promise<boolean>}
 */
export const pingBackendWithRetry = async (maxRetries = 2, delayMs = 3000) => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        const success = await pingBackend()
        
        if (success) {
            return true
        }
        
        // If not the last attempt, wait before retrying
        if (attempt < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, delayMs))
        }
    }
    
    return false
}

/**
 * Start periodic pinging to keep backend alive
 * Useful if you want to keep the backend warm throughout the session
 * @param {number} intervalMinutes - Minutes between pings (default: 10)
 * @returns {number} Interval ID that can be used to stop pinging with clearInterval()
 */
export const startPeriodicPing = (intervalMinutes = 10) => {
    // Initial ping
    pingBackend()
    
    // Set up periodic pings
    const intervalMs = intervalMinutes * 60 * 1000
    const intervalId = setInterval(() => {
        pingBackend()
    }, intervalMs)
    
    return intervalId
}

/**
 * Stop periodic pinging
 * @param {number} intervalId - The interval ID returned by startPeriodicPing
 */
export const stopPeriodicPing = (intervalId) => {
    if (intervalId) {
        clearInterval(intervalId)
    }
}
