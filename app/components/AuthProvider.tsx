'use client'

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'

export type AuthUser = {
  id: string
  email: string
  role: string
  firstName: string
}

type AuthContextValue = {
  user: AuthUser | null
  isLoading: boolean
  refreshSession: (showLoading?: boolean) => Promise<void>
  clearSession: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const requestId = useRef(0)

  const refreshSession = useCallback(async (showLoading = false) => {
    const currentRequest = ++requestId.current
    if (showLoading) setIsLoading(true)

    try {
      const response = await fetch('/api/auth/me', { cache: 'no-store' })
      if (!response.ok) throw new Error('Could not refresh the account session')
      const data = await response.json()
      if (currentRequest !== requestId.current) return

      const account = data?.user
      if (
        data?.authenticated &&
        typeof account?.id === 'string' &&
        typeof account?.email === 'string' &&
        typeof account?.role === 'string' &&
        typeof account?.firstName === 'string'
      ) {
        setUser(account as AuthUser)
      } else {
        setUser(null)
      }
    } catch {
      // Keep the last known session during a transient network failure.
    } finally {
      if (currentRequest === requestId.current) setIsLoading(false)
    }
  }, [])

  const clearSession = useCallback(() => {
    requestId.current += 1
    setUser(null)
    setIsLoading(false)
  }, [])

  useEffect(() => {
    void refreshSession()
    const handleFocus = () => { void refreshSession() }
    window.addEventListener('focus', handleFocus)
    return () => {
      requestId.current += 1
      window.removeEventListener('focus', handleFocus)
    }
  }, [refreshSession])

  return (
    <AuthContext.Provider value={{ user, isLoading, refreshSession, clearSession }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
