// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Source: https://github.com/ggauravky/Dev-Portfolio

import { createContext, useContext } from 'react'

/**
 * Broadcasts the current opening-sequence state to any descendant.
 *
 * 'splash'   — SplashScreen is visible; AppLayout is inert
 * 'settling' — wordmark is traveling to navbar; hero is about to reveal
 * 'ready'    — everything is fully interactive
 */
export const OpeningContext = createContext('ready')

/** Convenience hook — returns the current openingState string. */
export function useOpeningState() {
    return useContext(OpeningContext)
}
