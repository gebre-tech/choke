'use client'

import { type ReactNode, useId } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export interface TabItem {
  id: string
  label: string
  icon?: ReactNode
  disabled?: boolean
  badge?: number
}

export interface TabsProps {
  tabs: TabItem[]
  activeTab: string
  onChange: (tabId: string) => void
  variant?: 'default' | 'pills' | 'underline'
  className?: string
  children?: ReactNode
}

export const Tabs = ({ tabs, activeTab, onChange, variant = 'default', className = '', children }: TabsProps) => {
  return (
    <div className={className}>
      <div
        role="tablist"
        aria-label="Tabs"
        className={`
          flex gap-1
          ${variant === 'pills' ? 'bg-stone-100 p-1 rounded-xl' : ''}
          ${variant === 'underline' ? 'border-b border-stone-200' : ''}
        `}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`${tab.id}-panel`}
            id={`${tab.id}-trigger`}
            disabled={tab.disabled}
            onClick={() => !tab.disabled && onChange(tab.id)}
            className={`
              flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2
              ${tab.disabled ? 'opacity-50 cursor-not-allowed' : ''}
              ${variant === 'pills'
                ? activeTab === tab.id
                  ? 'bg-white text-emerald-700 shadow-sm'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                : variant === 'underline'
                ? activeTab === tab.id
                  ? 'border-b-2 border-emerald-600 text-emerald-600'
                  : 'text-stone-500 hover:text-stone-900'
                : activeTab === tab.id
                ? 'bg-emerald-50 text-emerald-700'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
              }
            `}
          >
            {tab.icon && <span className="flex-shrink-0 mr-1">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.badge && <span className="ml-1.5 px-1.5 py-0.5 text-[10px] font-semibold bg-emerald-100 text-emerald-700 rounded-full">{tab.badge}</span>}
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        {tabs.map((tab) => (
          <motion.div
            key={tab.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            role="tabpanel"
            id={`${tab.id}-panel`}
            aria-labelledby={`${tab.id}-trigger`}
            hidden={activeTab !== tab.id}
            className="mt-4"
          >
            {children}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}