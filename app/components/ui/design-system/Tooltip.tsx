'use client'

import { useState, useRef, useEffect, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Portal } from '@/components/ui/design-system/Portal'

export interface TooltipProps {
  content: ReactNode
  children: ReactNode
  position?: 'top' | 'bottom' | 'left' | 'right'
  delay?: number
  className?: string
}

const positions = {
  top: { tooltip: 'bottom-2 left-1/2 -translate-x-1/2', arrow: 'top-full left-1/2 -translate-x-1/2' },
  bottom: { tooltip: 'top-2 left-1/2 -translate-x-1/2', arrow: 'bottom-full left-1/2 -translate-x-1/2' },
  left: { tooltip: 'right-2 top-1/2 -translate-y-1/2', arrow: 'left-full top-1/2 -translate-y-1/2' },
  right: { tooltip: 'left-2 top-1/2 -translate-y-1/2', arrow: 'right-full top-1/2 -translate-y-1/2' },
}

export const Tooltip = ({ content, children, position = 'top', delay = 200, className = '' }: TooltipProps) => {
  const [visible, setVisible] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const triggerRef = useRef<HTMLDivElement>(null)

  const show = () => {
    timeoutRef.current = setTimeout(() => setVisible(true), delay)
  }

  const hide = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setVisible(false)
  }

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  const pos = positions[position]

  return (
    <div className="relative inline-flex">
      <div
        ref={triggerRef}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
        className="inline-flex"
      >
        {children}
      </div>

      <AnimatePresence>
        {visible && (
          <Portal>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.1, ease: 'easeOut' }}
              className={`fixed z-[1600] pointer-events-none ${className}`}
              style={{
                top: triggerRef.current?.getBoundingClientRect().top,
                left: triggerRef.current?.getBoundingClientRect().left,
              }}
            >
              <div
                className={`
                  absolute ${pos.tooltip}
                  px-2.5 py-1.5 text-xs font-medium text-white bg-stone-900
                  rounded-lg shadow-lg whitespace-nowrap max-w-xs
                `}
              >
                {content}
                <div
                  className={`
                    absolute w-0 h-0 border-4 border-transparent ${pos.arrow}
                  `}
                  style={{
                    borderBottomColor: position === 'top' ? '#1c1917' : undefined,
                    borderTopColor: position === 'bottom' ? '#1c1917' : undefined,
                    borderRightColor: position === 'left' ? '#1c1917' : undefined,
                    borderLeftColor: position === 'right' ? '#1c1917' : undefined,
                  }}
                />
              </div>
            </motion.div>
          </Portal>
        )}
      </AnimatePresence>
    </div>
  )
}

export interface HelpTooltipProps {
  title: string
  content: ReactNode
  children: ReactNode
  position?: 'top' | 'bottom' | 'left' | 'right'
}

export const HelpTooltip = ({ title, content, children, position = 'top' }: HelpTooltipProps) => {
  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)

  return (
    <div className="relative inline-flex">
      {children}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(!open)}
        className="ml-1.5 p-1 rounded-full text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors"
        aria-label="Show help"
        aria-expanded={open}
      >
        <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <Portal>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.1, ease: 'easeOut' }}
              className="fixed z-[1600]"
              style={{
                top: triggerRef.current?.getBoundingClientRect().top,
                left: triggerRef.current?.getBoundingClientRect().left,
              }}
            >
              <div className={`absolute ${positions[position].tooltip}`}>
                <div className="px-3 py-2.5 text-sm bg-white border border-stone-200 rounded-xl shadow-lg max-w-sm">
                  <h4 className="font-medium text-stone-900 mb-1">{title}</h4>
                  <div className="text-sm text-stone-600">{content}</div>
                </div>
                <div className={`absolute ${positions[position].arrow} w-0 h-0 border-4 border-transparent border-b-stone-200`} />
              </div>
            </motion.div>
          </Portal>
        )}
      </AnimatePresence>
    </div>
  )
}