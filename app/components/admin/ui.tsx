'use client'

import { useEffect, useRef, useState } from 'react'
import { X, Trash2, Loader2, ChevronDown, ChevronUp, Check, Search } from 'lucide-react'

export async function adminApi<T = unknown>(
  path: string,
  options: { method?: string; body?: unknown } = {}
): Promise<T> {
  const res = await fetch(path, {
    method: options.method ?? 'GET',
    headers: options.body === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const message = typeof data.error === 'string' ? data.error : `Request failed (${res.status})`
    throw new Error(message)
  }
  return data as T
}

export function useAsyncData<T>(fetcher: () => Promise<T>, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const fetcherRef = useRef(fetcher)
  fetcherRef.current = fetcher
  const [tick, setTick] = useState(0)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetcherRef.current()
      .then((d) => {
        if (!cancelled) {
          setData(d)
          setError(null)
        }
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [tick, ...deps])

  return { data, loading, error, refresh: () => setTick((t) => t + 1) }
}

export function Modal({
  open,
  onClose,
  title,
  children,
  size = 'lg',
}: {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
}) {
  if (!open) return null

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 overflow-y-auto p-4 md:py-10 animate-fade-in">
      <div className={`${sizeClasses[size]} w-full bg-white rounded-2xl shadow-xl animate-slide-up`}>
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-stone-100">
          <h2 className="text-xl font-bold text-stone-900">{title}</h2>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-600 rounded-lg hover:bg-stone-100 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function Field({
  label,
  children,
  hint,
  error,
}: {
  label: string
  children: React.ReactNode
  hint?: string
  error?: string
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="label">{label}</label>
      {children}
      {error && <span className="text-xs text-red-600 flex items-center gap-1">{error}</span>}
      {hint && !error && <span className="text-xs text-stone-400">{hint}</span>}
    </div>
  )
}

export const inputCls =
  'input'

export function Select({ className = '', ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={`${inputCls} appearance-none bg-[url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")] bg-right-3 bg-no-repeat pr-10 ${className}`}
      {...props}
    />
  )
}

export function TextArea({ className = '', ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={`${inputCls} resize-y ${className}`} {...props} />
}

export function Badge({ value }: { value: string }) {
  const variants: Record<string, string> = {
    CONFIRMED: 'badge-success',
    DELIVERED: 'badge-success',
    ACTIVE: 'badge-success',
    PUBLISHED: 'badge-success',
    PENDING: 'badge-warning',
    PROCESSING: 'badge-warning',
    FAILED: 'badge-error',
    CANCELLED: 'badge-error',
    NO_SHOW: 'badge-error',
    REJECTED: 'badge-error',
    INACTIVE: 'badge-neutral',
    DRAFT: 'badge-neutral',
  }
  const variant = variants[value] || 'badge-info'
  return <span className={`badge ${variant}`}>{value}</span>
}

export function StatCard({
  label,
  value,
  sub,
  icon,
  trend,
}: {
  label: string
  value: string | number
  sub?: string
  icon?: React.ReactNode
  trend?: { value: string; positive: boolean }
}) {
  return (
    <div className="stat-card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-stone-500">{label}</p>
          <p className="text-2xl font-bold mt-1 text-stone-900">{value}</p>
          {sub && <p className="text-xs text-stone-400 mt-1">{sub}</p>}
          {trend && (
            <span className={`inline-flex items-center gap-1 text-xs font-medium mt-2 ${trend.positive ? 'text-emerald-600' : 'text-red-600'}`}>
              {trend.positive ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              {trend.value}
            </span>
          )}
        </div>
        {icon && <div className="text-stone-300">{icon}</div>}
      </div>
    </div>
  )
}

export function ConfirmDeleteButton({
  onConfirm,
  label = 'Delete',
  confirmLabel = 'Delete this item?',
}: {
  onConfirm: () => void
  label?: string
  confirmLabel?: string
}) {
  const [confirming, setConfirming] = useState(false)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  const run = async () => {
    setBusy(true)
    setErr('')
    try {
      await onConfirm()
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Delete failed')
    } finally {
      setBusy(false)
      setConfirming(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => setConfirming((c) => !c)}
        disabled={busy}
        className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-colors ${
          confirming
            ? 'bg-red-500 text-white border-red-500'
            : 'text-red-600 border-red-200 hover:bg-red-50'
        }`}
      >
        {busy ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
        {confirming ? 'Confirm' : label}
      </button>
      {confirming && (
        <button
          onClick={run}
          disabled={busy}
          className="text-xs px-3 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-500 transition-colors"
        >
          Yes, delete
        </button>
      )}
      {err && <span className="text-xs text-red-600">{err}</span>}
    </div>
  )
}

export function SaveButton({ busy, children = 'Save', className = '' }: { busy: boolean; children?: React.ReactNode; className?: string }) {
  return (
    <button
      type="submit"
      disabled={busy}
      className={`btn btn-primary ${className}`}
    >
      {busy && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  )
}

export function SecondaryButton({ children, className = '', ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={`btn btn-secondary ${className}`} {...props}>
      {children}
    </button>
  )
}

export function GhostButton({ children, className = '', ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={`btn btn-ghost ${className}`} {...props}>
      {children}
    </button>
  )
}

export function DangerButton({ busy, children = 'Delete', className = '', ...props }: { busy?: boolean; children?: React.ReactNode; className?: string } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      disabled={busy}
      className={`btn btn-danger ${className}`}
      {...props}
    >
      {busy && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  )
}

export function Err({ message }: { message: string }) {
  return (
    <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3 flex items-center gap-2 animate-fade-in" role="alert">
      {message}
    </div>
  )
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
}) {
  return (
    <div className="empty-state animate-fade-in">
      <div className="empty-state-icon">{icon}</div>
      <h3 className="empty-state-title">{title}</h3>
      {description && <p className="empty-state-description">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="page-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>
      {action && <div className="flex items-center gap-2">{action}</div>}
    </div>
  )
}

export function Section({ title, children, className = '' }: { title?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`section ${className}`}>
      {title && <h2 className="section-title">{title}</h2>}
      {children}
    </div>
  )
}

export function Divider() {
  return <hr className="divider" />
}

export function TableContainer({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`table-container ${className}`}>{children}</div>
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  onRowClick,
  emptyMessage = 'No data available',
  emptyIcon,
  className = '',
}: {
  columns: { key: string; header: string; render: (item: T) => React.ReactNode; className?: string }[]
  data: T[]
  keyExtractor: (item: T) => string
  onRowClick?: (item: T) => void
  emptyMessage?: string
  emptyIcon?: React.ReactNode
  className?: string
}) {
  if (data.length === 0) {
    return (
      <EmptyState
        icon={emptyIcon}
        title="No data"
        description={emptyMessage}
      />
    )
  }

  return (
    <TableContainer className={className}>
      <table className="table" role="grid">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key} className={col.className}>{col.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr
              key={keyExtractor(item)}
              onClick={() => onRowClick?.(item)}
              className={onRowClick ? 'cursor-pointer' : ''}
            >
              {columns.map((col) => (
                <td key={col.key} className={col.className}>{col.render(item)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </TableContainer>
  )
}

export function SearchInput({ value, onChange, placeholder = 'Search…', className = '' }: {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}) {
  return (
    <div className="relative max-w-sm ${className}">
      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`${inputCls} pl-9 pr-9`}
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}

export function Tabs({ tabs, active, onChange }: { tabs: { id: string; label: string }[]; active: string; onChange: (id: string) => void }) {
  return (
    <div className="flex gap-1 bg-stone-100 rounded-xl p-1" role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={active === tab.id}
          onClick={() => onChange(tab.id)}
          className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
            active === tab.id
              ? 'bg-white text-emerald-600 shadow-sm'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}

export function Pagination({ page, pageSize, total, onChange }: { page: number; pageSize: number; total: number; onChange: (page: number) => void }) {
  const totalPages = Math.ceil(total / pageSize)
  if (totalPages <= 1) return null

  return (
    <nav className="flex items-center justify-center gap-1" aria-label="Pagination">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        className="btn btn-secondary p-2"
        aria-label="Previous"
      >
        <ChevronUp className="w-4 h-4" />
      </button>
      <span className="text-sm text-stone-600 px-3">
        Page {page} of {totalPages}
      </span>
      <button
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
        className="btn btn-secondary p-2"
        aria-label="Next"
      >
        <ChevronDown className="w-4 h-4" />
      </button>
    </nav>
  )
}

export function LoadingState({ message = 'Loading…', size = 'md' }: { message?: string; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-8 h-8',
  }
  return (
    <div className="flex items-center justify-center gap-2 text-stone-500 py-8">
      <Loader2 className={`${sizeClasses[size]} animate-spin`} />
      <span>{message}</span>
    </div>
  )
}

export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-stone-200 rounded ${className}`} />
  )
}