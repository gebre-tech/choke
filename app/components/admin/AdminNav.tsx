'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/admin', label: 'Overview' },
  { href: '/admin/cottages', label: 'Cottages' },
  { href: '/admin/experiences', label: 'Experiences' },
  { href: '/admin/products', label: 'Products' },
  { href: '/admin/bookings', label: 'Bookings' },
  { href: '/admin/orders', label: 'Orders' },
  { href: '/admin/submissions', label: 'Submissions' },
  { href: '/admin/calendar', label: 'Calendar' },
  { href: '/admin/guests', label: 'Guests' },
  { href: '/admin/media', label: 'Media' },
  { href: '/admin/settings', label: 'Settings' },
]

export default function AdminNav() {
  const pathname = usePathname()

  return (
    <nav className="flex flex-wrap gap-2">
      {links.map((l) => {
        const active = l.href === '/admin' ? pathname === '/admin' : pathname.startsWith(l.href)
        return (
          <Link
            key={l.href}
            href={l.href}
            className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
              active ? 'bg-emerald-600 text-white' : 'text-stone-300 hover:bg-white/10'
            }`}
          >
            {l.label}
          </Link>
        )
      })}
    </nav>
  )
}