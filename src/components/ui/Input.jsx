// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Source: https://github.com/ggauravky/Dev-Portfolio

import { forwardRef, useId } from 'react'
import PropTypes from 'prop-types'
import './ui.css'

// Shared label / hint / error wiring for Input and Textarea.
function Field({ id, label, hint, error, className, children }) {
    return (
        <div className={`field ${className}`.trim()}>
            {label ? <label htmlFor={id} className="field__label">{label}</label> : null}
            {children}
            {hint && !error ? <p id={`${id}-hint`} className="field__hint">{hint}</p> : null}
            {error ? <p id={`${id}-error`} className="field__error" role="alert">{error}</p> : null}
        </div>
    )
}

Field.propTypes = {
    id: PropTypes.string.isRequired,
    label: PropTypes.node,
    hint: PropTypes.node,
    error: PropTypes.node,
    className: PropTypes.string,
    children: PropTypes.node,
}

function useFieldProps({ id, hint, error }) {
    const autoId = useId()
    const fieldId = id || autoId
    let describedBy
    if (error) describedBy = `${fieldId}-error`
    else if (hint) describedBy = `${fieldId}-hint`
    return {
        fieldId,
        controlProps: {
            id: fieldId,
            'aria-invalid': error ? true : undefined,
            'aria-describedby': describedBy,
        },
    }
}

const fieldPropTypes = {
    id: PropTypes.string,
    label: PropTypes.node,
    hint: PropTypes.node,
    error: PropTypes.node,
    className: PropTypes.string,
}

export const Input = forwardRef(function Input({ id, label, hint, error, className = '', type = 'text', ...rest }, ref) {
    const { fieldId, controlProps } = useFieldProps({ id, hint, error })
    return (
        <Field id={fieldId} label={label} hint={hint} error={error} className={className}>
            <input ref={ref} type={type} className="field__control" {...controlProps} {...rest} />
        </Field>
    )
})

Input.propTypes = { ...fieldPropTypes, type: PropTypes.string }

export const Textarea = forwardRef(function Textarea({ id, label, hint, error, className = '', rows = 5, ...rest }, ref) {
    const { fieldId, controlProps } = useFieldProps({ id, hint, error })
    return (
        <Field id={fieldId} label={label} hint={hint} error={error} className={className}>
            <textarea ref={ref} rows={rows} className="field__control" {...controlProps} {...rest} />
        </Field>
    )
})

Textarea.propTypes = { ...fieldPropTypes, rows: PropTypes.number }

export default Input
