'use client'

import { forwardRef, type HTMLAttributes } from 'react'

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular' | 'card' | 'list'
  width?: string | number
  height?: string | number
  lines?: number
  animation?: 'pulse' | 'wave' | 'none'
}

const baseStyles = `
  bg-stone-200 rounded
  overflow-hidden
  select-none
  pointer-events-none
`

const animationStyles = {
  pulse: 'animate-pulse',
  wave: 'animate-wave',
  none: '',
}

export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  ({ variant = 'text', width = '100%', height, lines, animation = 'pulse', className = '', ...props }, ref) => {
    const skeletonElements = []

    if (variant === 'circular') {
      skeletonElements.push(
        <div
          ref={ref}
          key="circle"
          className={`${baseStyles} rounded-full ${animationStyles[animation]} ${className}`}
          style={{ width, height, ...props.style }}
          {...props}
        />
      )
    } else if (variant === 'rectangular') {
      skeletonElements.push(
        <div
          ref={ref}
          key="rect"
          className={`${baseStyles} ${animationStyles[animation]} ${className}`}
          style={{ width, height: height || '1rem', ...props.style }}
          {...props}
        />
      )
    } else if (variant === 'card') {
      const lineCount = lines || 3
      for (let i = 0; i < lineCount; i++) {
        skeletonElements.push(
          <div
            key={`line-${i}`}
            className={`${baseStyles} ${animationStyles[animation]} mb-3`}
            style={{
              width: i === lineCount - 1 ? '60%' : '100%',
              height: i === 0 ? '1.25rem' : '0.875rem',
              borderRadius: '0.5rem',
            }}
          />
        )
      }
    } else if (variant === 'list') {
      const lineCount = lines || 4
      for (let i = 0; i < lineCount; i++) {
        skeletonElements.push(
          <div
            key={`item-${i}`}
            className="flex items-center gap-3 mb-4"
          >
            <div
              className={`${baseStyles} rounded-full ${animationStyles[animation]}`}
              style={{ width: '3rem', height: '3rem' }}
            />
            <div className="flex-1 space-y-2">
              <div className={`${baseStyles} ${animationStyles[animation]} h-4`} style={{ width: '40%' }} />
              <div className={`${baseStyles} ${animationStyles[animation]} h-3`} style={{ width: '60%' }} />
            </div>
          </div>
        )
      }
    } else {
      // text variant
      const lineCount = lines || 1
      for (let i = 0; i < lineCount; i++) {
        skeletonElements.push(
          <div
            key={`line-${i}`}
            ref={i === 0 ? ref : undefined}
            className={`${baseStyles} ${animationStyles[animation]} mb-2`}
            style={{
              width: i === lineCount - 1 ? '70%' : '100%',
              height: '0.875rem',
            }}
          />
        )
      }
    }

    return <div {...props}>{skeletonElements}</div>
  }
)

Skeleton.displayName = 'Skeleton'

export const SkeletonCard = () => (
  <div className="space-y-4">
    <Skeleton variant="rectangular" height="200px" width="100%" className="rounded-xl" />
    <Skeleton variant="card" lines={3} className="px-4" />
    <Skeleton variant="rectangular" height="40px" width="30%" className="rounded-lg" />
  </div>
)

export const SkeletonTable = ({ rows = 5, columns = 4 }) => (
  <div className="space-y-3">
    <div className="flex gap-4">
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton key={`header-${i}`} variant="text" width={i === 0 ? '80px' : '60px'} height="12px" />
      ))}
    </div>
    {Array.from({ length: rows }).map((_, row) => (
      <div key={`row-${row}`} className="flex gap-4">
        {Array.from({ length: columns }).map((_, col) => (
          <Skeleton key={`${row}-${col}`} variant="text" width={col === 0 ? '100px' : '60px'} height="14px" />
        ))}
      </div>
    ))}
  </div>
)

export const SkeletonList = ({ items = 5, showAvatar = true, lines = 2 }) => (
  <div className="space-y-4">
    {Array.from({ length: items }).map((_, i) => (
      <div key={`item-${i}`} className="flex gap-3">
        {showAvatar && <Skeleton variant="circular" width="48px" height="48px" />}
        <Skeleton variant="card" lines={lines} />
      </div>
    ))}
  </div>
)

export const SkeletonForm = ({ fields = 4 }) => (
  <div className="space-y-4">
    {Array.from({ length: fields }).map((_, i) => (
      <div key={`field-${i}`} className="space-y-1.5">
        <Skeleton variant="text" width="30%" height="14px" />
        <Skeleton variant="rectangular" height="44px" width="100%" className="rounded-xl" />
      </div>
    ))}
  </div>
)