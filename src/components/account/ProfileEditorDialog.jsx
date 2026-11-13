import { useEffect, useId, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { X } from 'lucide-react'
import toast from 'react-hot-toast'
import useAuth from '../../hooks/useAuth'
import { useFocusTrap } from '../../hooks/useFocusTrap'
import { Button, Input, Textarea } from '../ui'
import '../../styles/activity.css'

const ACCEPTED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])
const MAX_FILE_SIZE = 5 * 1024 * 1024

const validateWebsite = (value) => {
    if (!value) return true
    try {
        const url = new URL(value)
        return ['http:', 'https:'].includes(url.protocol)
    } catch {
        return false
    }
}

export default function ProfileEditorDialog({ isOpen, onClose, openerRef }) {
    const { user, updateProfile, uploadAvatar, removeAvatar } = useAuth()
    const titleId = useId()
    const firstInputRef = useRef(null)
    const dialogRef = useRef(null)
    const [form, setForm] = useState({ displayName: '', bio: '', location: '', website: '' })
    const [avatarFile, setAvatarFile] = useState(null)
    const [previewUrl, setPreviewUrl] = useState('')
    const [error, setError] = useState('')
    const [isSaving, setIsSaving] = useState(false)
    const [isRemovingAvatar, setIsRemovingAvatar] = useState(false)

    useEffect(() => {
        if (!isOpen) return
        setForm({
            displayName: user?.displayName || user?.name || '',
            bio: user?.bio || '',
            location: user?.location || '',
            website: user?.website || '',
        })
        setAvatarFile(null)
        setPreviewUrl('')
        setError('')
        const focusTimer = window.setTimeout(() => firstInputRef.current?.focus(), 40)
        const handleKeyDown = (event) => {
            if (event.key === 'Escape' && !isSaving) onClose()
        }
        document.addEventListener('keydown', handleKeyDown)
        const previousOverflow = document.body.style.overflow
        document.body.style.overflow = 'hidden'

        return () => {
            window.clearTimeout(focusTimer)
            document.removeEventListener('keydown', handleKeyDown)
            document.body.style.overflow = previousOverflow
            openerRef?.current?.focus()
        }
    }, [isOpen, isSaving, onClose, openerRef, user])

    useEffect(() => {
        if (!avatarFile) {
            setPreviewUrl('')
            return undefined
        }
        const objectUrl = URL.createObjectURL(avatarFile)
        setPreviewUrl(objectUrl)
        return () => URL.revokeObjectURL(objectUrl)
    }, [avatarFile])

    useFocusTrap(dialogRef, isOpen, { initialFocusRef: firstInputRef })

    if (!isOpen) return null

    const handleFieldChange = (event) => {
        const { name, value } = event.target
        setForm((current) => ({ ...current, [name]: value }))
        setError('')
    }

    const handleAvatarChange = (event) => {
        const file = event.target.files?.[0]
        event.target.value = ''
        if (!file) return
        if (!ACCEPTED_TYPES.has(file.type)) {
            setError('Choose a JPEG, PNG, or WebP image.')
            return
        }
        if (file.size > MAX_FILE_SIZE) {
            setError('Profile image must be 5 MB or smaller.')
            return
        }
        setAvatarFile(file)
        setError('')
    }

    const handleSubmit = async (event) => {
        event.preventDefault()
        const clean = {
            displayName: form.displayName.trim(),
            bio: form.bio.trim(),
            location: form.location.trim(),
            website: form.website.trim(),
        }
        if (clean.displayName.length < 2 || clean.displayName.length > 80) {
            setError('Display name must be between 2 and 80 characters.')
            return
        }
        if (clean.bio.length > 180 || clean.location.length > 80 || clean.website.length > 300) {
            setError('One or more profile fields are too long.')
            return
        }
        if (!validateWebsite(clean.website)) {
            setError('Website must start with http:// or https://.')
            return
        }

        setIsSaving(true)
        setError('')
        try {
            await updateProfile(clean)
            if (avatarFile) await uploadAvatar(avatarFile)
            toast.success('Profile updated')
            onClose()
        } catch (requestError) {
            setError(requestError?.message || 'Unable to update your profile right now.')
        } finally {
            setIsSaving(false)
        }
    }

    const handleRemoveAvatar = async () => {
        if (!user?.hasCustomAvatar || isRemovingAvatar) return
        setIsRemovingAvatar(true)
        setError('')
        try {
            await removeAvatar()
            setAvatarFile(null)
            toast.success('Custom profile image removed')
        } catch (requestError) {
            setError(requestError?.message || 'Unable to remove your profile image.')
        } finally {
            setIsRemovingAvatar(false)
        }
    }

    return (
        <div
            className="fixed inset-0 z-[120] flex items-end justify-center overflow-y-auto bg-ink/80 sm:items-center sm:px-4 sm:py-6"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget && !isSaving) onClose()
            }}
        >
            <section
                ref={dialogRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                className="relative max-h-[92vh] w-full overflow-y-auto rounded-t-dialog border border-rule bg-ink-raised shadow-dialog sm:max-w-2xl sm:rounded-dialog"
            >
                <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-rule bg-ink-raised px-6 py-4 sm:px-8">
                    <div>
                        <p className="font-mono text-[13px] text-muted">Account profile</p>
                        <h2 id={titleId} className="mt-1 font-serif text-h3 text-paper">Edit your profile</h2>
                    </div>
                    <button type="button" onClick={onClose} disabled={isSaving} className="-mr-2 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-control text-muted hover:bg-paper/[0.06] hover:text-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-50" aria-label="Close profile editor">
                        <X className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 p-6 sm:p-8">
                    <div className="flex flex-col gap-4 border-b border-rule pb-6 sm:flex-row sm:items-center">
                        <img src={previewUrl || user?.picture} alt={`${user?.name || 'User'} profile preview`} className="ac-avatar" referrerPolicy="no-referrer" />
                        <div className="flex-1">
                            <p className="text-paper">Profile image</p>
                            <p className="mt-1 text-small text-muted">JPEG, PNG, or WebP. Maximum 5 MB. Images are cropped to a square.</p>
                            <div className="mt-2 flex flex-wrap items-center gap-2">
                                <label className="ac-file">
                                    {avatarFile ? 'Choose another' : 'Change image'}
                                    <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleAvatarChange} className="sr-only" />
                                </label>
                                {user?.hasCustomAvatar ? (
                                    <Button variant="ghost" onClick={handleRemoveAvatar} disabled={isRemovingAvatar || isSaving} loading={isRemovingAvatar}>
                                        Remove custom image
                                    </Button>
                                ) : null}
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2">
                        <Input ref={firstInputRef} label="Display name" name="displayName" value={form.displayName} onChange={handleFieldChange} maxLength={80} required className="sm:col-span-2" />
                        <Textarea label="Bio" name="bio" value={form.bio} onChange={handleFieldChange} maxLength={180} rows={3} placeholder="A short note about you" hint={`${form.bio.length}/180`} className="sm:col-span-2" />
                        <Input label="Location" name="location" value={form.location} onChange={handleFieldChange} maxLength={80} placeholder="Lucknow, India" />
                        <Input label="Website" name="website" type="url" value={form.website} onChange={handleFieldChange} maxLength={300} placeholder="https://example.com" />
                        <Input label="Google account email" value={user?.email || ''} readOnly hint="Managed by Google and locked for account security." className="sm:col-span-2" />
                    </div>

                    {error ? <p role="alert" className="rounded-control border border-red-400/40 px-4 py-2 text-small text-red-300">{error}</p> : null}

                    <div className="flex flex-col-reverse gap-2 border-t border-rule pt-6 sm:flex-row sm:justify-end">
                        <Button variant="secondary" onClick={onClose} disabled={isSaving}>Cancel</Button>
                        <Button type="submit" loading={isSaving}>
                            {isSaving ? 'Saving...' : 'Save profile'}
                        </Button>
                    </div>
                </form>
            </section>
        </div>
    )
}

ProfileEditorDialog.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    openerRef: PropTypes.shape({ current: PropTypes.object }),
}

ProfileEditorDialog.defaultProps = {
    openerRef: null,
}
