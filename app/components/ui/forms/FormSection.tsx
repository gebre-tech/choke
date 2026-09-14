'use client'

import { type ReactNode, forwardRef, type HTMLAttributes, useState } from 'react'

export interface FormSectionProps extends HTMLAttributes<HTMLDivElement> {
  title?: string
  description?: string
  children: ReactNode
  collapsible?: boolean
  defaultOpen?: boolean
  className?: string
}

export const FormSection = forwardRef<HTMLDivElement, FormSectionProps>(
  ({ title, description, children, collapsible = false, defaultOpen = true, className = '', ...props }, ref) => {
    const [open, setOpen] = useState(defaultOpen)

    return (
      <div
        ref={ref}
        className={`rounded-xl border border-stone-200 bg-white overflow-hidden ${className}`}
        {...props}
      >
        {(title || collapsible) && (
          <div
            className={`flex items-center justify-between gap-4 px-5 py-4 border-b border-stone-100 ${collapsible ? 'cursor-pointer hover:bg-stone-50' : ''}`}
            onClick={collapsible ? () => setOpen(!open) : undefined}
          >
            <div>
              {title && <h3 className="text-base font-semibold text-stone-900">{title}</h3>}
              {description && <p className="text-sm text-stone-500 mt-0.5">{description}</p>}
            </div>
            {collapsible && (
              <svg
                className={`w-5 h-5 text-stone-400 transition-transform ${open ? 'rotate-180' : ''}`}
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            )}
          </div>
        )}
        <div className={open ? 'block' : 'hidden'}>
          <div className="p-5">{children}</div>
        </div>
      </div>
    )
  }
)

FormSection.displayName = 'FormSection'

export const FormField = ({
  label,
  required,
  hint,
  error,
  children,
  className = '',
}: {
  label: string
  required?: boolean
  hint?: string
  error?: string
  children: ReactNode
  className?: string
}) => (
  <div className={className}>
    <label className="block text-sm font-medium text-stone-900 mb-1.5 flex items-center gap-1">
      {label}
      {required && <span className="text-red-500" aria-hidden="true">*</span>}
    </label>
    {children}
    {error && <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1" role="alert">{error}</p>}
    {hint && !error && <p className="mt-1.5 text-sm text-stone-500">{hint}</p>}
  </div>
)

export const FormActions = ({
  children,
  className = '',
}: { children: ReactNode; className?: string }) => (
  <div className={`flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-stone-100 ${className}`}>
    {children}
  </div>
)