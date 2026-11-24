// Non-sensitive "this browser signed in before" hint (D-123).
// It holds no token and grants nothing: the session itself stays in the
// HttpOnly `portfolio_session` cookie. The hint only decides whether a page
// that does not need auth should spend an idle-time /api/auth/me call to show
// the avatar menu. A forged hint costs one extra /me call; a missing one means
// the avatar appears on the next auth-gated page instead.

const KEY = 'pf_session_hint'

export const hasSessionHint = () => {
    try {
        return globalThis.localStorage?.getItem(KEY) === '1'
    } catch {
        return false
    }
}

export const setSessionHint = (signedIn) => {
    try {
        if (signedIn) globalThis.localStorage?.setItem(KEY, '1')
        else globalThis.localStorage?.removeItem(KEY)
    } catch {
        // Storage blocked: the gated pages still check the session themselves.
    }
}
