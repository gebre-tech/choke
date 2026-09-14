'use client'

import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'
import { type ReactNode } from 'react'

export interface BreadcrumbItem {
  label: string
  href?: string
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[]
  separator?: ReactNode
  className?: string
}

export const Breadcrumb = ({ items, separator = <ChevronRight className="w-4 h-4" />, className = '' }: BreadcrumbProps) => {
  return (
    <nav className={`flex items-center gap-1.5 text-sm ${className}`} aria-label="Breadcrumb">
      <ol className="flex items-center gap-1.5">
        <li>
          <Link href="/" className="flex items-center gap-1.5 text-stone-400 hover:text-stone-600 transition-colors">
            <Home className="w-4 h-4" />
          </Link>
        </li>
        {items.map((item, index) => (
          <li key={item.label} className="flex items-center">
            {index < items.length - 1 ? (
              <>
                {item.href ? (
                  <Link href={item.href} className="text-stone-400 hover:text-stone-600 transition-colors">
                    {item.label}
                  </Link>
                ) : (
                  <span className="text-stone-400">{item.label}</span>
                )}
                <span className="mx-1.5 text-stone-300" aria-hidden="true">{separator}</span>
              </>
            ) : (
              <span className="text-stone-900 font-medium" aria-current="page">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}