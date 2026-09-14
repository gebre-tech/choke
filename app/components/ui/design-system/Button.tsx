'use client'

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { Loader2 } from 'lucide-react'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  loading?: boolean
  icon?: ReactNode
  iconPosition?: 'left' | 'right'
  fullWidth?: boolean
}

const baseStyles = `
  inline-flex items-center justify-center gap-2
  font-medium rounded-xl
  transition-all duration-200 ease-out
  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
  disabled:opacity-50 disabled:cursor-not-allowed
  select-none
`

const variantStyles = {
  primary: `
    bg-[rgb(var(--color-primary))] text-white
    hover:bg-[rgb(var(--color-primary-dark))] active:bg-[rgb(var(--color-primary-dark))]
    shadow-[0_4px_14px_0_rgb(var(--color-primary)/0.3)]
    focus-visible:ring-[rgb(var(--color-primary))]
  `,
  secondary: `
    bg-[rgb(var(--color-background))] text-[rgb(var(--color-text))] border border-[rgb(var(--color-border))]
    hover:bg-[rgb(var(--color-border)/0.5)] active:bg-[rgb(var(--color-border))]
    focus-visible:ring-[rgb(var(--color-text-muted))]
  `,
  outline: `
    bg-transparent text-[rgb(var(--color-primary))] border-2 border-[rgb(var(--color-primary))]
    hover:bg-[rgb(var(--color-primary)/0.1)] active:bg-[rgb(var(--color-primary)/0.2)]
    focus-visible:ring-[rgb(var(--color-primary))]
  `,
  ghost: `
    bg-transparent text-[rgb(var(--color-text-muted))]
    hover:bg-[rgb(var(--color-background))] active:bg-[rgb(var(--color-border))]
    focus-visible:ring-[rgb(var(--color-text-muted))]
  `,
  danger: `
    bg-red-600 text-white
    hover:bg-red-700 active:bg-red-800
    shadow-[0_4px_14px_0_rgb(239_68_68/0.3)]
    focus-visible:ring-red-500
  `,
  success: `
    bg-[rgb(var(--color-primary))] text-white
    hover:bg-[rgb(var(--color-primary-dark))] active:bg-[rgb(var(--color-primary-dark))]
    shadow-[0_4px_14px_0_rgb(var(--color-primary)/0.3)]
    focus-visible:ring-[rgb(var(--color-primary))]
  `,
}

const sizeStyles = {
  xs: 'px-2.5 py-1.5 text-xs gap-1',
  sm: 'px-3 py-1.5 text-sm gap-1.5',
  md: 'px-4 py-2 text-sm gap-2',
  lg: 'px-6 py-3 text-base gap-2',
  xl: 'px-8 py-4 text-lg gap-3',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      loading = false,
      icon,
      iconPosition = 'left',
      fullWidth = false,
      disabled,
      className = '',
      style,
      ...props
    },
    ref
  ) => {
    const widthStyles = fullWidth ? 'w-full' : ''

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyles} ${className}`}
        style={style}
        {...props}
      >
        {loading && (
          <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
        )}
        {!loading && icon && iconPosition === 'left' && (
          <span className="flex items-center" aria-hidden="true">{icon}</span>
        )}
        <span>{children}</span>
        {!loading && icon && iconPosition === 'right' && (
          <span className="flex items-center" aria-hidden="true">{icon}</span>
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'

export const IconButton = forwardRef<HTMLButtonElement, ButtonProps & { 'aria-label': string }>(
  ({ children, variant = 'ghost', size = 'md', loading = false, className = '', 'aria-label': ariaLabel, ...props }, ref) => {
    const sizeStyles = {
      xs: 'p-1.5',
      sm: 'p-2',
      md: 'p-2.5',
      lg: 'p-3',
      xl: 'p-4',
    }

    const variantStyles = {
      primary: 'bg-[rgb(var(--color-primary))] text-white hover:bg-[rgb(var(--color-primary-dark))]',
      secondary: 'bg-[rgb(var(--color-background))] text-[rgb(var(--color-text))] hover:bg-[rgb(var(--color-border)/0.5)]',
      outline: 'border-2 border-[rgb(var(--color-primary))] text-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-primary)/0.1)]',
      ghost: 'text-[rgb(var(--color-text-muted))] hover:bg-[rgb(var(--color-background))]',
      danger: 'bg-red-600 text-white hover:bg-red-700',
      success: 'bg-[rgb(var(--color-primary))] text-white hover:bg-[rgb(var(--color-primary-dark))]',
    }

    return (
      <button
        ref={ref}
        disabled={loading}
        aria-label={ariaLabel}
        className={`
          inline-flex items-center justify-center rounded-xl
          transition-all duration-200 ease-out
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
          disabled:opacity-50 disabled:cursor-not-allowed
          ${variantStyles[variant]} ${sizeStyles[size]} ${className}
        `}
        {...props}
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : children}
      </button>
    )
  }
)

IconButton.displayName = 'IconButton'