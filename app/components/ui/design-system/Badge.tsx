'use client'

import { type HTMLAttributes, forwardRef } from 'react'

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'neutral'
  size?: 'xs' | 'sm' | 'md' | 'lg'
  dot?: boolean
  removable?: boolean
  onRemove?: () => void
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = 'default', size = 'md', dot = false, removable = false, onRemove, className = '', children, ...props }, ref) => {
    const variantStyles = {
      default: 'bg-stone-100 text-stone-700 border-stone-200',
      success: 'bg-emerald-50 text-emerald-700 border-emerald-100',
      warning: 'bg-amber-50 text-amber-700 border-amber-100',
      error: 'bg-red-50 text-red-700 border-red-100',
      info: 'bg-blue-50 text-blue-700 border-blue-100',
      neutral: 'bg-stone-100 text-stone-600 border-stone-200',
    }

    const sizeStyles = {
      xs: 'px-2 py-0.5 text-[10px] gap-0.5',
      sm: 'px-2.5 py-0.5 text-xs gap-1',
      md: 'px-3 py-1 text-sm gap-1.5',
      lg: 'px-4 py-1.5 text-base gap-2',
    }

    return (
      <span
        ref={ref}
        className={`
          inline-flex items-center font-medium rounded-full border
          transition-colors duration-150
          ${variantStyles[variant]} ${sizeStyles[size]} ${className}
        `}
        {...props}
      >
        {dot && (
          <span
            className={`
              w-1.5 h-1.5 rounded-full
              ${variant === 'success' && 'bg-emerald-500'}
              ${variant === 'warning' && 'bg-amber-500'}
              ${variant === 'error' && 'bg-red-500'}
              ${variant === 'info' && 'bg-blue-500'}
              ${variant === 'default' && 'bg-stone-400'}
              ${variant === 'neutral' && 'bg-stone-400'}
            `}
            aria-hidden="true"
          />
        )}
        <span>{children}</span>
        {removable && (
          <button
            onClick={onRemove}
            type="button"
            className="ml-1 p-0.5 rounded hover:bg-black/10 transition-colors"
            aria-label="Remove"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" />
            </svg>
          </button>
        )}
      </span>
    )
  }
)

Badge.displayName = 'Badge'

export interface StatusBadgeProps {
  status: string
  size?: 'xs' | 'sm' | 'md' | 'lg'
}

const statusConfig: Record<string, { variant: BadgeProps['variant']; label: string }> = {
  published: { variant: 'success', label: 'Published' },
  draft: { variant: 'neutral', label: 'Draft' },
  pending: { variant: 'warning', label: 'Pending' },
  rejected: { variant: 'error', label: 'Rejected' },
  active: { variant: 'success', label: 'Active' },
  inactive: { variant: 'neutral', label: 'Inactive' },
  confirmed: { variant: 'success', label: 'Confirmed' },
  cancelled: { variant: 'error', label: 'Cancelled' },
  processing: { variant: 'warning', label: 'Processing' },
  shipped: { variant: 'info', label: 'Shipped' },
  delivered: { variant: 'success', label: 'Delivered' },
  failed: { variant: 'error', label: 'Failed' },
  completed: { variant: 'success', label: 'Completed' },
}

export const StatusBadge = ({ status, size = 'md' }: StatusBadgeProps) => {
  const config = statusConfig[status.toLowerCase()] || { variant: 'default', label: status }
  return <Badge variant={config.variant} size={size} dot>{config.label}</Badge>
}