// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Source: https://github.com/ggauravky/Dev-Portfolio

import { createContext, useContext } from 'react'

/**
 * Legacy opening-sequence state. The splash screen it coordinated was replaced in
 * P2 by the non-blocking Preloader (the page renders underneath it), so there is
 * no provider any more and the value is always 'ready'. Home still reads it; P3
 * removes the last user, then delete this file.
 */
export const OpeningContext = createContext('ready')

export function useOpeningState() {
    return useContext(OpeningContext)
}
