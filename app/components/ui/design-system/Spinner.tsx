'use client'

import { type HTMLAttributes, forwardRef } from 'react'

export interface SpinnerProps extends HTMLAttributes<HTMLDivElement> {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  color?: 'primary' | 'secondary' | 'white' | 'current'
  thickness?: number
  speed?: 'slow' | 'normal' | 'fast'
  ariaLabel?: string
}

const sizeStyles = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12',
}

const colorStyles = {
  primary: 'text-emerald-600',
  secondary: 'text-stone-500',
  white: 'text-white',
  current: 'text-current',
}

const speedStyles = {
  slow: 'animate-spin-slow',
  normal: 'animate-spin',
  fast: 'animate-spin-fast',
}

export const Spinner = forwardRef<HTMLDivElement, SpinnerProps>(
  ({ size = 'md', color = 'primary', thickness = 2, speed = 'normal', className = '', 'aria-label': ariaLabel = 'Loading', ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="status"
        aria-label={ariaLabel}
        aria-live="polite"
        className={`
          inline-flex
          ${sizeStyles[size]}
          ${colorStyles[color]}
          ${speedStyles[speed]}
          ${className}
        `}
        {...props}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="w-full h-full"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth={2}
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        <span className="sr-only">Loading...</span>
      </div>
    )
  }
)

Spinner.displayName = 'Spinner'

export interface SpinnerOverlayProps {
  message?: string
  size?: 'sm' | 'md' | 'lg'
  fullScreen?: boolean
}

export const SpinnerOverlay = ({ message = 'Loading...', size = 'md', fullScreen = false }: SpinnerOverlayProps) => {
  return (
    <div
      className={`
        fixed inset-0 z-[1700] flex items-center justify-center
        ${fullScreen ? 'bg-white' : 'bg-black/50'}
      `}
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col items-center gap-3 text-center p-6">
        <Spinner size="md" color={fullScreen ? 'primary' : 'white'} />
        {message && <p className="text-sm font-medium text-stone-600">{message}</p>}
      </div>
    </div>
  )
}

export const SpinnerButton = ({ children, loading, size = 'md', ...props }: { children: React.ReactNode; loading: boolean; size?: 'xs' | 'sm' | 'md' | 'lg' } & React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  return (
    <button disabled={loading} {...props}>
      <span className="flex items-center justify-center gap-2">
        {loading && <Spinner size="sm" color="white" />}
        {children}
      </span>
    </button>
  )
}