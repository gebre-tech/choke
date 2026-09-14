import { useState, useEffect, useCallback, useRef } from 'react'

export interface DraftData<T> {
  data: T
  timestamp: number
  version: number
}

export interface UseDraftOptions<T> {
  key: string
  initialData: T
  autoSaveInterval?: number
  maxAge?: number
  onAutoSave?: (data: T) => void
  onLoad?: (data: T) => void
}

export interface UseDraftReturn<T> {
  data: T
  setData: (updater: T | Partial<T> | ((prev: T) => T | Partial<T>)) => void
  isDirty: boolean
  lastSaved: number | null
  saveDraft: (data: T) => Promise<void>
  loadDraft: () => Promise<void>
  clearDraft: () => Promise<void>
  resetToInitial: () => void
}

export function useDraft<T>(options: UseDraftOptions<T>): UseDraftReturn<T> {
  const {
    key,
    initialData,
    autoSaveInterval = 30000,
    maxAge = 7 * 24 * 60 * 60 * 1000,
    onAutoSave,
    onLoad,
  } = options

  const [data, setDataState] = useState<T>(initialData)
  const [isDirty, setIsDirty] = useState(false)
  const [lastSaved, setLastSaved] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const initialDataRef = useRef(initialData)
  const autoSaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pendingSaveRef = useRef<T | null>(null)

  const loadDraft = useCallback(async () => {
    try {
      if (typeof window === 'undefined') return

      const stored = localStorage.getItem(key)
      if (stored) {
        const draft: DraftData<T> = JSON.parse(stored)
        const age = Date.now() - draft.timestamp

        if (age < maxAge) {
          setDataState(draft.data)
          setLastSaved(draft.timestamp)
          onLoad?.(draft.data)
        } else {
          localStorage.removeItem(key)
        }
      } else {
        setDataState(initialDataRef.current)
      }
    } catch (error) {
      console.error('Failed to load draft:', error)
      setDataState(initialDataRef.current)
    } finally {
      setIsLoading(false)
    }
  }, [key, maxAge, onLoad])

  const saveDraft = useCallback(async (dataToSave?: T) => {
    const dataToPersist = dataToSave ?? data
    const draft: DraftData<T> = {
      data: dataToPersist,
      timestamp: Date.now(),
      version: 1,
    }

    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(key, JSON.stringify(draft))
      }
      setLastSaved(Date.now())
      setIsDirty(false)
      onAutoSave?.(dataToPersist)
    } catch (error) {
      console.error('Failed to save draft:', error)
      throw error
    }
  }, [key, data, onAutoSave])

  const clearDraft = useCallback(async () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(key)
    }
    setIsDirty(false)
    setLastSaved(null)
  }, [key])

  const setData = useCallback((updater: T | Partial<T> | ((prev: T) => T | Partial<T>)) => {
    setDataState((prev) => {
      if (typeof updater === 'function') {
        const result = (updater as (prev: T) => T | Partial<T>)(prev)
        return { ...prev, ...result }
      }
      return { ...prev, ...updater }
    })
    setIsDirty(true)
  }, [])

  const resetToInitial = useCallback(() => {
    setDataState(initialDataRef.current)
    setIsDirty(false)
  }, [])

  useEffect(() => {
    loadDraft()
  }, [loadDraft])

  useEffect(() => {
    if (!isDirty || isLoading) return

    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current)
    }

    autoSaveTimeoutRef.current = setTimeout(() => {
      saveDraft()
    }, autoSaveInterval)
  }, [data, isDirty, isLoading, autoSaveInterval, saveDraft])

  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current)
      }
    }
  }, [])

  return {
    data,
    setData,
    isDirty,
    lastSaved,
    saveDraft,
    loadDraft,
    clearDraft,
    resetToInitial,
  }
}

export function useDebouncedCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  return useCallback(
    ((...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      timeoutRef.current = setTimeout(() => {
        callback(...args)
      }, delay)
    }) as T,
    [callback, delay]
  )
}

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error)
    }
  }, [key, storedValue])

  return [storedValue, setValue] as const
}