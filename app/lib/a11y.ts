export function generateId(prefix = 'id') {
  return `${prefix}-${Math.random().toString(36).substring(2, 9)}`
}

export function useIds(...prefixes: string[]) {
  const ids = prefixes.map(generateId)
  return ids
}

export function getAriaDescribedBy(...ids: (string | undefined | false)[]) {
  return ids.filter(Boolean).join(' ') || undefined
}

export function getAriaLabelledBy(...ids: (string | undefined | false)[]) {
  return ids.filter(Boolean).join(' ') || undefined
}

export function visuallyHidden(): React.CSSProperties {
  return {
    position: 'absolute',
    width: '1px',
    height: '1px',
    padding: 0,
    margin: '-1px',
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    whiteSpace: 'nowrap',
    border: 0,
  }
}

export const srOnly = 'sr-only'

export function announceToScreenReader(message: string, politeness: 'polite' | 'assertive' = 'polite') {
  if (typeof window === 'undefined') return

  const announcer = document.createElement('div')
  announcer.setAttribute('role', 'status')
  announcer.setAttribute('aria-live', politeness)
  announcer.setAttribute('aria-atomic', 'true')
  Object.assign(announcer.style, {
    position: 'absolute',
    width: '1px',
    height: '1px',
    padding: 0,
    margin: '-1px',
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    whiteSpace: 'nowrap',
    border: 0,
  })
  announcer.textContent = message
  document.body.appendChild(announcer)

  setTimeout(() => {
    document.body.removeChild(announcer)
  }, 1000)
}

export function trapFocus(container: HTMLElement, previousElement?: HTMLElement | null) {
  const focusableElements = container.querySelectorAll<HTMLElement>(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  )

  const firstElement = focusableElements[0]
  const lastElement = focusableElements[focusableElements.length - 1]

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        e.preventDefault()
        lastElement?.focus()
      }
    } else {
      if (document.activeElement === lastElement) {
        e.preventDefault()
        firstElement?.focus()
      }
    }
  }

  document.addEventListener('keydown', handleKeyDown)
  firstElement?.focus()

  return () => {
    document.removeEventListener('keydown', handleKeyDown)
    previousElement?.focus()
  }
}

export function isFocusable(element: HTMLElement): boolean {
  if (element.hasAttribute('tabindex') && element.getAttribute('tabindex') !== '-1') {
    return true
  }
  const focusableTags = ['button', 'a', 'input', 'select', 'textarea']
  return focusableTags.includes(element.tagName.toLowerCase())
}

export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
  ).filter((el) => {
    const style = window.getComputedStyle(el)
    return style.display !== 'none' && style.visibility !== 'hidden' && !el.hasAttribute('disabled')
  })
}

export function focusFirst(container: HTMLElement) {
  const elements = getFocusableElements(container)
  elements[0]?.focus()
}

export function focusLast(container: HTMLElement) {
  const elements = getFocusableElements(container)
  elements[elements.length - 1]?.focus()
}