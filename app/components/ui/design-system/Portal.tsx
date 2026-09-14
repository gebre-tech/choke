'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

export function Portal({ children, containerId = 'modal-root' }: { children: ReactNode; containerId?: string }) {
  const [mounted, setMounted] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    setMounted(true)
    let container = document.getElementById(containerId)
    if (!container) {
      container = document.createElement('div')
      container.id = containerId
      document.body.appendChild(container)
    }
    containerRef.current = container as HTMLDivElement
    return () => {
      if (container && container.children.length === 0) {
        container.remove()
      }
    }
  }, [containerId])

  if (!mounted || !containerRef.current) return null

  return createPortal(children, containerRef.current)
}