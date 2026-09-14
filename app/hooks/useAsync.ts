import { useState, useCallback, useEffect, useRef } from 'react'

export interface AsyncState<T> {
  data: T | null
  error: Error | null
  isLoading: boolean
  isError: boolean
  isSuccess: boolean
}

export interface UseAsyncOptions<T> {
  immediate?: boolean
  onSuccess?: (data: T) => void
  onError?: (error: Error) => void
  retryCount?: number
  retryDelay?: number
}

export function useAsync<T>(
  asyncFn: () => Promise<T>,
  options: UseAsyncOptions<T> = {}
) {
  const { immediate = true, onSuccess, onError, retryCount = 0, retryDelay = 1000 } = options

  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    error: null,
    isLoading: immediate,
    isError: false,
    isSuccess: false,
  })

  const retryCountRef = useRef(0)
  const mountedRef = useRef(true)

  const execute = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, isError: false }))

    try {
      const data = await asyncFn()
      if (!mountedRef.current) return

      setState({
        data,
        error: null,
        isLoading: false,
        isError: false,
        isSuccess: true,
      })
      onSuccess?.(data)
      retryCountRef.current = 0
    } catch (error) {
      if (!mountedRef.current) return

      const err = error instanceof Error ? error : new Error(String(error))

      if (retryCountRef.current < retryCount) {
        retryCountRef.current++
        setTimeout(execute, retryDelay * retryCountRef.current)
        return
      }

      setState({
        data: null,
        error: err,
        isLoading: false,
        isError: true,
        isSuccess: false,
      })
      onError?.(err)
    }
  }, [asyncFn, onSuccess, onError, retryCount, retryDelay])

  const reset = useCallback(() => {
    setState({
      data: null,
      error: null,
      isLoading: false,
      isError: false,
      isSuccess: false,
    })
    retryCountRef.current = 0
  }, [])

  const retry = useCallback(() => {
    retryCountRef.current = 0
    execute()
  }, [execute])

  useEffect(() => {
    if (immediate) {
      execute()
    }
    return () => {
      mountedRef.current = false
    }
  }, [execute, immediate])

  return { ...state, execute, reset, retry }
}

export function useLazyAsync<T>(asyncFn: () => Promise<T>, options: UseAsyncOptions<T> = {}) {
  return useAsync(asyncFn, { ...options, immediate: false })
}

export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(handler)
  }, [value, delay])

  return debouncedValue
}

export function useLocalStorageState<T>(key: string, initialValue: T) {
  const [state, setState] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch {
      return initialValue
    }
  })

  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    setState((prev) => {
      const valueToStore = value instanceof Function ? value(prev) : value
      if (typeof window !== 'undefined') {
        try {
          window.localStorage.setItem(key, JSON.stringify(valueToStore))
        } catch (error) {
          console.error(`Error setting localStorage key "${key}":`, error)
        }
      }
      return valueToStore
    })
  }, [key])

  return [state, setValue] as const
}

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const media = window.matchMedia(query)
    if (media.matches !== matches) {
      setMatches(media.matches)
    }

    const listener = (event: MediaQueryListEvent) => setMatches(event.matches)
    media.addEventListener('change', listener)
    return () => media.removeEventListener('change', listener)
  }, [matches, query])

  return matches
}

export function useWindowSize() {
  const [size, setSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleResize = () => {
      setSize({ width: window.innerWidth, height: window.innerHeight })
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return size
}

export function useIntersectionObserver(
  options: IntersectionObserverInit = {}
): [React.RefObject<HTMLDivElement | null>, boolean] {
  const ref = useRef<HTMLDivElement | null>(null)
  const [isIntersecting, setIsIntersecting] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting)
    }, options)

    observer.observe(element)
    return () => observer.disconnect()
  }, [options])

  return [ref, isIntersecting]
}