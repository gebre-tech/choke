'use client'

import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes, type SelectHTMLAttributes, useId } from 'react'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  hint?: string
  error?: string
  leadingIcon?: React.ReactNode
  trailingIcon?: React.ReactNode
  fullWidth?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, hint, error, leadingIcon, trailingIcon, fullWidth = true, className = '', id: providedId, ...props }, ref) => {
    const generatedId = useId()
    const id = providedId || generatedId
    const hintId = `${id}-hint`
    const errorId = `${id}-error`
    const describedBy = [hint && hintId, error && errorId].filter(Boolean).join(' ') || undefined

    return (
      <div className={fullWidth ? 'w-full' : ''}>
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-stone-900 mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          {leadingIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
              {leadingIcon}
            </div>
          )}
          <input
            ref={ref}
            id={id}
            aria-describedby={describedBy}
            aria-invalid={error ? 'true' : 'false'}
            className={`
              w-full
              bg-white border rounded-xl
              px-3.5 py-2.5 text-sm text-stone-900 placeholder:text-stone-400
              transition-all duration-200 ease-out
              focus:outline-none focus:ring-2 focus:ring-offset-0
              disabled:bg-stone-50 disabled:text-stone-500 disabled:cursor-not-allowed
              ${leadingIcon ? 'pl-10' : ''} ${trailingIcon ? 'pr-10' : ''}
              ${error
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                : 'border-stone-200 hover:border-stone-300 focus:border-emerald-500 focus:ring-emerald-500/20'
              }
              ${className}
            `}
            {...props}
          />
          {trailingIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-stone-400">
              {trailingIcon}
            </div>
          )}
        </div>
        {error && (
          <p id={errorId} className="mt-1.5 text-sm text-red-600 flex items-center gap-1" role="alert">
            <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            {error}
          </p>
        )}
        {hint && !error && (
          <p id={hintId} className="mt-1.5 text-sm text-stone-500">{hint}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  hint?: string
  error?: string
  fullWidth?: boolean
  minRows?: number
  maxRows?: number
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, hint, error, fullWidth = true, minRows = 3, maxRows, className = '', id: providedId, ...props }, ref) => {
    const generatedId = useId()
    const id = providedId || generatedId
    const hintId = `${id}-hint`
    const errorId = `${id}-error`
    const describedBy = [hint && hintId, error && errorId].filter(Boolean).join(' ') || undefined

    return (
      <div className={fullWidth ? 'w-full' : ''}>
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-stone-900 mb-1.5">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={id}
          aria-describedby={describedBy}
          aria-invalid={error ? 'true' : 'false'}
          rows={minRows}
          style={maxRows ? { maxHeight: `calc(${maxRows} * 1.5rem + 0.75rem)` } : undefined}
          className={`
            w-full bg-white border rounded-xl
            px-3.5 py-2.5 text-sm text-stone-900 placeholder:text-stone-400
            transition-all duration-200 ease-out resize-y
            focus:outline-none focus:ring-2 focus:ring-offset-0
            disabled:bg-stone-50 disabled:text-stone-500 disabled:cursor-not-allowed
            ${error
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
              : 'border-stone-200 hover:border-stone-300 focus:border-emerald-500 focus:ring-emerald-500/20'
            }
            ${className}
          `}
          {...props}
        />
        {error && (
          <p id={errorId} className="mt-1.5 text-sm text-red-600 flex items-center gap-1" role="alert">
            <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            {error}
          </p>
        )}
        {hint && !error && <p id={hintId} className="mt-1.5 text-sm text-stone-500">{hint}</p>}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  hint?: string
  error?: string
  options: SelectOption[]
  placeholder?: string
  fullWidth?: boolean
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, hint, error, options, placeholder, fullWidth = true, className = '', id: providedId, ...props }, ref) => {
    const generatedId = useId()
    const id = providedId || generatedId
    const hintId = `${id}-hint`
    const errorId = `${id}-error`
    const describedBy = [hint && hintId, error && errorId].filter(Boolean).join(' ') || undefined

    return (
      <div className={fullWidth ? 'w-full' : ''}>
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-stone-900 mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={id}
            aria-describedby={describedBy}
            aria-invalid={error ? 'true' : 'false'}
            className={`
              w-full appearance-none bg-white border rounded-xl
              px-3.5 py-2.5 text-sm text-stone-900
              transition-all duration-200 ease-out
              focus:outline-none focus:ring-2 focus:ring-offset-0
              disabled:bg-stone-50 disabled:text-stone-500 disabled:cursor-not-allowed
              ${error
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                : 'border-stone-200 hover:border-stone-300 focus:border-emerald-500 focus:ring-emerald-500/20'
              }
              pr-10 ${className}
            `}
            {...props}
          >
            {placeholder && (
              <option value="" disabled selected hidden>{placeholder}</option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-stone-400">
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
        {error && (
          <p id={errorId} className="mt-1.5 text-sm text-red-600 flex items-center gap-1" role="alert">
            <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 100-2v-3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 100-1-1H9z" clipRule="evenodd" />
            </svg>
            {error}
          </p>
        )}
        {hint && !error && <p id={hintId} className="mt-1.5 text-sm text-stone-500">{hint}</p>}
      </div>
    )
  }
)

Select.displayName = 'Select'

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
  description?: string
  error?: boolean
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, description, error = false, className = '', id: providedId, ...props }, ref) => {
    const generatedId = useId()
    const id = providedId || generatedId

    return (
      <label className="flex items-start gap-3 cursor-pointer" htmlFor={id}>
        <input
          ref={ref}
          type="checkbox"
          id={id}
          aria-invalid={error}
          className={`
            mt-0.5 w-4.5 h-4.5 rounded border-2
            transition-all duration-200 ease-out
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500
            checked:bg-emerald-600 checked:border-emerald-600
            hover:checked:bg-emerald-700
            ${error ? 'border-red-300' : 'border-stone-300'}
            ${className}
          `}
          {...props}
        />
        {label && (
          <div className="text-sm leading-relaxed">
            <span className="font-medium text-stone-900">{label}</span>
            {description && <p className="text-stone-500 mt-0.5">{description}</p>}
          </div>
        )}
      </label>
    )
  }
)

Checkbox.displayName = 'Checkbox'

export interface RadioOption {
  value: string
  label: string
  description?: string
  disabled?: boolean
}

export interface RadioGroupProps {
  label?: string
  name: string
  value: string
  onChange: (value: string) => void
  options: RadioOption[]
  orientation?: 'horizontal' | 'vertical'
  error?: boolean
  hint?: string
  fullWidth?: boolean
}

export const RadioGroup = ({ label, name, value, onChange, options, orientation = 'vertical', error, hint, fullWidth = true }: RadioGroupProps) => {
  const groupId = useId()

  return (
    <div className={fullWidth ? 'w-full' : ''} role="radiogroup" aria-labelledby={label ? `${groupId}-label` : undefined} aria-describedby={hint ? `${groupId}-hint` : undefined} aria-invalid={error}>
      {label && (
        <span id={`${groupId}-label`} className="block text-sm font-medium text-stone-900 mb-2">
          {label}
        </span>
      )}
      <div className={orientation === 'horizontal' ? 'flex flex-wrap gap-4' : 'space-y-2'}>
        {options.map((opt) => (
          <label key={opt.value} className={`flex items-center gap-2 cursor-pointer ${opt.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
            <input
              type="radio"
              name={name}
              value={opt.value}
              checked={value === opt.value}
              onChange={() => !opt.disabled && onChange(opt.value)}
              disabled={opt.disabled}
              className={`
                w-4.5 h-4.5 border-2 rounded-full
                transition-all duration-200 ease-out
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500
                checked:border-emerald-600 checked:bg-emerald-600
                ${opt.disabled ? 'opacity-50' : ''}
                ${error ? 'border-red-300' : 'border-stone-300'}
              `}
            />
            <div className="text-sm leading-relaxed">
              <span className="font-medium text-stone-900">{opt.label}</span>
              {opt.description && <p className="text-stone-500">{opt.description}</p>}
            </div>
          </label>
        ))}
      </div>
      {error && <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1" role="alert"><svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/></svg> Please select an option</p>}
      {hint && !error && <p id={`${groupId}-hint`} className="mt-1.5 text-sm text-stone-500">{hint}</p>}
    </div>
  )
}