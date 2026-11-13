// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Source: https://github.com/ggauravky/Dev-Portfolio
//
// S1 top chrome: only a tiny fixed wordmark and a Resume link, drawn with
// mix-blend-mode: difference. A signed-in user also gets the account menu here
// (D-002: Sign-in itself stays out of the navigation).

import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import PropTypes from 'prop-types'
import toast from 'react-hot-toast'
import useAuth from '../../hooks/useAuth'
import { siteStatus } from '../../data/siteStatus'
import './TopChrome.css'

const getProfileInitial = (user) => String(user?.name || user?.email || 'U').slice(0, 1).toUpperCase()

function ProfileAvatar({ user }) {
    const [imageFailed, setImageFailed] = useState(false)
    useEffect(() => setImageFailed(false), [user?.picture])

    if (user?.picture && !imageFailed) {
        return (
            <img
                src={user.picture}
                alt=""
                className="h-7 w-7 shrink-0 rounded-control object-cover"
                referrerPolicy="no-referrer"
                onError={() => setImageFailed(true)}
            />
        )
    }
    return (
        <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-control border border-rule text-small text-paper" aria-hidden="true">
            {getProfileInitial(user)}
        </span>
    )
}

ProfileAvatar.propTypes = { user: PropTypes.object }

function AccountMenu({ user, onLogout }) {
    const [open, setOpen] = useState(false)
    const rootRef = useRef(null)
    const buttonRef = useRef(null)
    const { pathname } = useLocation()

    useEffect(() => setOpen(false), [pathname])

    useEffect(() => {
        if (!open) return undefined
        const closeIfOutside = (event) => {
            if (!rootRef.current?.contains(event.target)) setOpen(false)
        }
        const onKey = (event) => {
            if (event.key === 'Escape') {
                setOpen(false)
                buttonRef.current?.focus()
            }
        }
        document.addEventListener('mousedown', closeIfOutside)
        document.addEventListener('keydown', onKey)
        document.addEventListener('focusin', closeIfOutside)
        return () => {
            document.removeEventListener('mousedown', closeIfOutside)
            document.removeEventListener('keydown', onKey)
            document.removeEventListener('focusin', closeIfOutside)
        }
    }, [open])

    return (
        <div ref={rootRef} className="relative">
            <button
                ref={buttonRef}
                type="button"
                onClick={() => setOpen((value) => !value)}
                className="chrome-icon-button"
                aria-label="Account menu"
                aria-expanded={open}
                aria-controls="chrome-account-menu"
            >
                <ProfileAvatar user={user} />
            </button>
            {open ? (
                <div id="chrome-account-menu" className="absolute right-0 top-full mt-2 w-64 rounded-dialog border border-rule bg-ink-raised py-2 shadow-dialog">
                    <div className="border-b border-rule px-4 pb-3 pt-1">
                        <p className="truncate text-small text-paper">{user.name || 'Google account'}</p>
                        <p className="truncate text-small text-muted">{user.email}</p>
                    </div>
                    <Link to="/my-activity" className="chrome-menu-item">My activity</Link>
                    <button type="button" onClick={onLogout} className="chrome-menu-item">Log out</button>
                </div>
            ) : null}
        </div>
    )
}

AccountMenu.propTypes = {
    user: PropTypes.object.isRequired,
    onLogout: PropTypes.func.isRequired,
}

function TopChrome() {
    const { user, isAuthenticated, signOut } = useAuth()
    const signedIn = isAuthenticated && Boolean(user)

    const handleLogout = useCallback(async () => {
        try {
            await signOut()
            toast.success('Logged out')
        } catch (error) {
            toast.error(error?.message || 'Unable to log out right now')
        }
    }, [signOut])

    // The header itself carries the blend: a fixed element is its own stacking
    // context, so blending on a child would only mix with the transparent header.
    // The account menu sits outside it so the avatar and panel are not inverted.
    return (
        <>
            <header id="site-header" className={`chrome ${signedIn ? 'has-account' : ''}`}>
                <Link to="/" className="chrome-wordmark" aria-label="Gaurav Kumar Yadav, home">
                    Gaurav Kumar Yadav
                </Link>
                <a
                    href={siteStatus.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="chrome-link"
                    aria-label="Resume (PDF, opens in a new tab)"
                >
                    Resume <span aria-hidden="true">↗</span>
                </a>
            </header>
            {signedIn ? (
                <div className="chrome-account">
                    <AccountMenu user={user} onLogout={handleLogout} />
                </div>
            ) : null}
        </>
    )
}

export default TopChrome
