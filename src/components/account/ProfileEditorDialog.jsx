import { useEffect, useId, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { Camera, Link as LinkIcon, Loader2, LockKeyhole, MapPin, Trash2, X } from 'lucide-react'
import toast from 'react-hot-toast'
import useAuth from '../../hooks/useAuth'

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
            className="fixed inset-0 z-[120] flex items-end justify-center bg-black/75 p-0 backdrop-blur-sm sm:items-center sm:p-5"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget && !isSaving) onClose()
            }}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                className="max-h-[92vh] w-full overflow-y-auto rounded-t-2xl border border-[#2a2a31] bg-[#0d0d0f] shadow-2xl shadow-black/70 sm:max-w-2xl sm:rounded-xl"
            >
                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#232329] bg-[#0d0d0f]/95 px-5 py-4 backdrop-blur sm:px-6">
                    <div>
                        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#c5f82a]">Account profile</p>
                        <h2 id={titleId} className="mt-1 font-display text-xl font-semibold text-white">Edit your profile</h2>
                    </div>
                    <button type="button" onClick={onClose} disabled={isSaving} className="rounded-md border border-[#2a2a31] p-2 text-zinc-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-[#c5f82a]" aria-label="Close profile editor">
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 p-5 sm:p-6">
                    <div className="flex flex-col gap-4 border-b border-[#232329] pb-6 sm:flex-row sm:items-center">
                        <img src={previewUrl || user?.picture} alt={`${user?.name || 'User'} profile preview`} className="h-20 w-20 rounded-full border border-[#c5f82a]/50 bg-[#17171b] object-cover" referrerPolicy="no-referrer" />
                        <div className="flex-1">
                            <p className="text-sm font-medium text-white">Profile image</p>
                            <p className="mt-1 text-xs leading-relaxed text-zinc-500">JPEG, PNG, or WebP. Maximum 5 MB. Images are cropped to a square.</p>
                            <div className="mt-3 flex flex-wrap gap-2">
                                <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-[#34343b] px-3 py-2 text-xs font-medium text-zinc-200 hover:border-[#c5f82a]/50 hover:text-[#c5f82a] focus-within:ring-2 focus-within:ring-[#c5f82a]">
                                    <Camera className="h-3.5 w-3.5" />
                                    {avatarFile ? 'Choose another' : 'Change image'}
                                    <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleAvatarChange} className="sr-only" />
                                </label>
                                {user?.hasCustomAvatar ? (
                                    <button type="button" onClick={handleRemoveAvatar} disabled={isRemovingAvatar || isSaving} className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-xs text-zinc-500 hover:bg-rose-500/10 hover:text-rose-300 disabled:opacity-50">
                                        {isRemovingAvatar ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                                        Remove custom image
                                    </button>
                                ) : null}
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2">
                        <label className="block sm:col-span-2">
                            <span className="text-xs font-medium text-zinc-300">Display name</span>
                            <input ref={firstInputRef} name="displayName" value={form.displayName} onChange={handleFieldChange} maxLength={80} required className="mt-2 w-full rounded-md border border-[#2a2a31] bg-[#151518] px-3.5 py-3 text-sm text-white outline-none placeholder:text-zinc-700 focus:border-[#c5f82a]/70 focus:ring-2 focus:ring-[#c5f82a]/15" />
                        </label>
                        <label className="block sm:col-span-2">
                            <span className="flex items-center justify-between text-xs font-medium text-zinc-300"><span>Bio</span><span className="font-mono text-[10px] text-zinc-600">{form.bio.length}/180</span></span>
                            <textarea name="bio" value={form.bio} onChange={handleFieldChange} maxLength={180} rows={3} placeholder="A short note about you" className="mt-2 w-full resize-none rounded-md border border-[#2a2a31] bg-[#151518] px-3.5 py-3 text-sm leading-relaxed text-white outline-none placeholder:text-zinc-700 focus:border-[#c5f82a]/70 focus:ring-2 focus:ring-[#c5f82a]/15" />
                        </label>
                        <label className="block">
                            <span className="flex items-center gap-1.5 text-xs font-medium text-zinc-300"><MapPin className="h-3.5 w-3.5" />Location</span>
                            <input name="location" value={form.location} onChange={handleFieldChange} maxLength={80} placeholder="Lucknow, India" className="mt-2 w-full rounded-md border border-[#2a2a31] bg-[#151518] px-3.5 py-3 text-sm text-white outline-none placeholder:text-zinc-700 focus:border-[#c5f82a]/70 focus:ring-2 focus:ring-[#c5f82a]/15" />
                        </label>
                        <label className="block">
                            <span className="flex items-center gap-1.5 text-xs font-medium text-zinc-300"><LinkIcon className="h-3.5 w-3.5" />Website</span>
                            <input name="website" type="url" value={form.website} onChange={handleFieldChange} maxLength={300} placeholder="https://example.com" className="mt-2 w-full rounded-md border border-[#2a2a31] bg-[#151518] px-3.5 py-3 text-sm text-white outline-none placeholder:text-zinc-700 focus:border-[#c5f82a]/70 focus:ring-2 focus:ring-[#c5f82a]/15" />
                        </label>
                        <label className="block sm:col-span-2">
                            <span className="flex items-center gap-1.5 text-xs font-medium text-zinc-300"><LockKeyhole className="h-3.5 w-3.5" />Google account email</span>
                            <input value={user?.email || ''} readOnly className="mt-2 w-full cursor-not-allowed rounded-md border border-[#242429] bg-[#111113] px-3.5 py-3 text-sm text-zinc-500 outline-none" />
                            <span className="mt-1.5 block text-[11px] text-zinc-600">Managed by Google and locked for account security.</span>
                        </label>
                    </div>

                    {error ? <p role="alert" className="rounded-md border border-rose-500/25 bg-rose-500/8 px-3 py-2.5 text-sm text-rose-300">{error}</p> : null}

                    <div className="flex flex-col-reverse gap-2 border-t border-[#232329] pt-5 sm:flex-row sm:justify-end">
                        <button type="button" onClick={onClose} disabled={isSaving} className="rounded-md border border-[#2a2a31] px-4 py-2.5 text-sm text-zinc-300 hover:border-[#45454e] hover:text-white disabled:opacity-50">Cancel</button>
                        <button type="submit" disabled={isSaving} className="inline-flex items-center justify-center gap-2 rounded-md bg-[#c5f82a] px-4 py-2.5 text-sm font-semibold text-[#09090a] hover:bg-[#d4ff50] focus:outline-none focus:ring-2 focus:ring-[#c5f82a] focus:ring-offset-2 focus:ring-offset-[#0d0d0f] disabled:cursor-wait disabled:opacity-60">
                            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                            {isSaving ? 'Saving...' : 'Save profile'}
                        </button>
                    </div>
                </form>
            </div>
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
