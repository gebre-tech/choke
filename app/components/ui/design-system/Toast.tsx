'use client'

import { useState, useEffect, useCallback, useContext, createContext, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react'

export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading'

export interface Toast {
  id: string
  type: ToastType
  title: string
  message?: string
  duration?: number
  action?: { label: string; onClick: () => void }
  dismissible?: boolean
}

interface ToastContextValue {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => string
  removeToast: (id: string) => void
  clearToasts: () => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).slice(2, 9)
    const newToast = { ...toast, id }
    setToasts((prev) => [...prev, newToast])
    return id
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const clearToasts = useCallback(() => {
    setToasts([])
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, clearToasts }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

const ToastContainer = ({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: string) => void }) => {
  return (
    <AnimatePresence>
      <div className="fixed bottom-4 right-4 z-[1700] flex flex-col gap-2 w-80 md:w-96 pointer-events-none">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
        ))}
      </div>
    </AnimatePresence>
  )
}

const ToastItem = ({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) => {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    if (toast.duration !== 0 && toast.type !== 'loading') {
      const timer = setTimeout(() => {
        setVisible(false)
        setTimeout(() => onRemove(toast.id), 200)
      }, toast.duration ?? 5000)
      return () => clearTimeout(timer)
    }
  }, [toast, onRemove])

  if (!visible) return null

  const typeStyles = {
    success: 'bg-emerald-600 text-white border-emerald-600',
    error: 'bg-red-600 text-white border-red-600',
    warning: 'bg-amber-600 text-white border-amber-600',
    info: 'bg-blue-600 text-white border-blue-600',
    loading: 'bg-stone-900 text-white border-stone-700',
  }

  const icons = {
    success: <CheckCircle className="w-5 h-5 flex-shrink-0" />,
    error: <AlertCircle className="w-5 h-5 flex-shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 flex-shrink-0" />,
    info: <Info className="w-5 h-5 flex-shrink-0" />,
    loading: (
      <svg className="w-5 h-5 flex-shrink-0 animate-spin" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
    ),
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 300, y: 20 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      exit={{ opacity: 0, x: 300, y: 20 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className={`relative flex items-start gap-3 p-4 rounded-xl border shadow-xl ${typeStyles[toast.type]}`}
      style={{ boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)' }}
    >
      <span className="flex-shrink-0 mt-0.5" aria-hidden="true">{icons[toast.type]}</span>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-base">{toast.title}</p>
        {toast.message && <p className="mt-1 text-sm opacity-90">{toast.message}</p>}
        {toast.action && (() => {
            const action = toast.action
            return (
              <button
                onClick={() => { action.onClick(); onRemove(toast.id) }}
                className="mt-2 text-sm font-medium underline hover:no-underline"
              >
                {action.label}
              </button>
            )
          })()}
      </div>
      {toast.dismissible !== false && (
        <button
          onClick={() => onRemove(toast.id)}
          className="flex-shrink-0 p-1 rounded-lg opacity-50 hover:opacity-100 transition-opacity"
          aria-label="Dismiss"
        >
          <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" />
          </svg>
        </button>
      )}
    </motion.div>
  )
}

export function useToastHelpers() {
  const { addToast, removeToast, clearToasts } = useToast()

  return {
    success: (title: string, message?: string, options?: Partial<Toast>) =>
      addToast({ type: 'success', title, message, ...options }),
    error: (title: string, message?: string, options?: Partial<Toast>) =>
      addToast({ type: 'error', title, message, ...options }),
    warning: (title: string, message?: string, options?: Partial<Toast>) =>
      addToast({ type: 'warning', title, message, ...options }),
    info: (title: string, message?: string, options?: Partial<Toast>) =>
      addToast({ type: 'info', title, message, ...options }),
    loading: (title: string, message?: string, options?: Partial<Toast>) =>
      addToast({ type: 'loading', title, message, duration: 0, dismissible: false, ...options }),
    remove: removeToast,
    clear: clearToasts,
  }
}