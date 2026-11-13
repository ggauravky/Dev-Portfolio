// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Source: https://github.com/ggauravky/Dev-Portfolio

// Browser network errors ("Failed to fetch", Safari's "Load failed", Firefox's
// "NetworkError…") mean the API could not be reached, not that sign-in was refused.
const NETWORK_ERROR = /failed to fetch|load failed|networkerror|network request failed|err_network|timed? ?out/i

export const AUTH_NETWORK_MESSAGE =
    "Sign-in couldn't reach the server. Check your connection, then try again."

/** Turns raw auth/network errors into copy a visitor can act on. */
export function friendlyAuthError(message) {
    if (!message) return ''
    if (NETWORK_ERROR.test(message)) return AUTH_NETWORK_MESSAGE
    return message
}
