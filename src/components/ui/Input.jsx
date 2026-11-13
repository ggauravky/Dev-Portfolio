// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Source: https://github.com/ggauravky/Dev-Portfolio

import { forwardRef, useEffect, useId, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import './ui.css'

/**
 * Fields (DESIGN.md "Inputs"): a floating label, an animated focus line, inline
 * validation and a success state.
 * - `error` (controlled) always wins. Otherwise `validate(value)` runs on blur,
 *   then on every change once the field has been touched; it returns an error
 *   message or nothing.
 * - Success shows when `success` is set, or when `validate` passes on a
 *   non-empty, touched field.
 * - `shake` (opt-in): the box shakes once (< 400 ms, transform only, off under
 *   reduced motion) when an error appears, and again whenever `shake` changes
 *   while an error is shown (e.g. a submit attempt counter).
 * - `errorRole`: the error's role, "alert" by default. Pass null when the page
 *   announces errors through its own polite live region.
 */
function useField({ id, hint, error, validate, success, onBlur, onChange }) {
    const autoId = useId()
    const fieldId = id || autoId
    const [touched, setTouched] = useState(false)
    const [ownError, setOwnError] = useState('')
    const [passed, setPassed] = useState(false)

    const run = (value) => {
        if (!validate) return
        const message = validate(value) || ''
        setOwnError(message)
        setPassed(!message && String(value ?? '').length > 0)
    }

    const shownError = error || ownError
    const showSuccess = !shownError && (success || passed)

    let describedBy
    if (shownError) describedBy = `${fieldId}-error`
    else if (hint) describedBy = `${fieldId}-hint`

    return {
        fieldId,
        shownError,
        showSuccess,
        controlProps: {
            id: fieldId,
            'aria-invalid': shownError ? true : undefined,
            'aria-describedby': describedBy,
            onBlur: (event) => {
                setTouched(true)
                run(event.target.value)
                onBlur?.(event)
            },
            onChange: (event) => {
                if (touched) run(event.target.value)
                onChange?.(event)
            },
        },
    }
}

function useShake(error, shake) {
    const boxRef = useRef(null)
    useEffect(() => {
        const el = boxRef.current
        if (!shake || !error || !el) return undefined
        el.classList.remove('is-shaking')
        void el.offsetWidth // restart the animation
        el.classList.add('is-shaking')
        const timer = window.setTimeout(() => el.classList.remove('is-shaking'), 400)
        return () => window.clearTimeout(timer)
    }, [error, shake])
    return boxRef
}

function Field({ id, label, hint, error, success, multiline, floated, shake, errorRole = 'alert', className, children }) {
    const boxRef = useShake(error, shake)
    let state = ''
    if (error) state = 'is-error'
    else if (success) state = 'is-success'
    return (
        <div className={`field ${multiline ? 'field--multiline' : ''} ${floated ? 'field--floated' : ''} ${state} ${className}`.replace(/\s+/g, ' ').trim()}>
            <div ref={boxRef} className="field__box">
                {children}
                {label ? <label htmlFor={id} className="field__label">{label}</label> : null}
                <span className="field__line" aria-hidden="true" />
                {success ? (
                    <svg className="field__status" viewBox="0 0 16 16" aria-hidden="true">
                        <path d="M3.5 8.5l3 3 6-7" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                ) : null}
            </div>
            {hint && !error ? <p id={`${id}-hint`} className="field__hint">{hint}</p> : null}
            {error ? <p id={`${id}-error`} className="field__error" role={errorRole || undefined}>{error}</p> : null}
        </div>
    )
}

Field.propTypes = {
    id: PropTypes.string.isRequired,
    label: PropTypes.node,
    hint: PropTypes.node,
    error: PropTypes.node,
    success: PropTypes.bool,
    multiline: PropTypes.bool,
    floated: PropTypes.bool,
    shake: PropTypes.oneOfType([PropTypes.bool, PropTypes.number, PropTypes.string]),
    errorRole: PropTypes.string,
    className: PropTypes.string,
    children: PropTypes.node,
}

const fieldPropTypes = {
    id: PropTypes.string,
    label: PropTypes.node,
    hint: PropTypes.node,
    error: PropTypes.node,
    validate: PropTypes.func,
    success: PropTypes.bool,
    placeholder: PropTypes.string,
    shake: PropTypes.oneOfType([PropTypes.bool, PropTypes.number, PropTypes.string]),
    errorRole: PropTypes.string,
    className: PropTypes.string,
    onBlur: PropTypes.func,
    onChange: PropTypes.func,
}

export const Input = forwardRef(function Input(
    { id, label, hint, error, validate, success, placeholder, shake, errorRole, className = '', type = 'text', onBlur, onChange, ...rest },
    ref,
) {
    const { fieldId, shownError, showSuccess, controlProps } = useField({ id, hint, error, validate, success, onBlur, onChange })
    return (
        <Field id={fieldId} label={label} hint={hint} error={shownError} success={showSuccess} floated={Boolean(placeholder)} shake={shake} errorRole={errorRole} className={className}>
            <input ref={ref} type={type} className="field__control" placeholder={placeholder || ' '} {...controlProps} {...rest} />
        </Field>
    )
})

Input.propTypes = { ...fieldPropTypes, type: PropTypes.string }

export const Textarea = forwardRef(function Textarea(
    { id, label, hint, error, validate, success, placeholder, shake, errorRole, className = '', rows = 5, onBlur, onChange, ...rest },
    ref,
) {
    const { fieldId, shownError, showSuccess, controlProps } = useField({ id, hint, error, validate, success, onBlur, onChange })
    return (
        <Field id={fieldId} label={label} hint={hint} error={shownError} success={showSuccess} floated={Boolean(placeholder)} shake={shake} errorRole={errorRole} multiline className={className}>
            <textarea ref={ref} rows={rows} className="field__control" placeholder={placeholder || ' '} {...controlProps} {...rest} />
        </Field>
    )
})

Textarea.propTypes = { ...fieldPropTypes, rows: PropTypes.number }

export default Input
