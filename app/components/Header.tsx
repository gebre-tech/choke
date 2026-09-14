'use client'
import Link from 'next/link'
import { Mountain, ShoppingBag, User } from 'lucide-react'
import { useCartStore } from '@/store/cart'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import CartDrawer from './CartDrawer'

type SessionUser = { id: string; email: string; role: string; firstName: string }
type HeaderSettings = { siteName?: string; logoUrl?: string; tagline?: string }

export default function Header({ settings }: { settings?: HeaderSettings }) {
  const [cartOpen, setCartOpen] = useState(false)
  const [session, setSession] = useState<SessionUser | null>(null)
  const [site, setSite] = useState<HeaderSettings>(settings ?? {})
  const router = useRouter()
  const items = useCartStore((s) => s.items)
  const total = items.reduce((sum, i) => sum + i.quantity, 0)

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((d) => {
        if (d?.authenticated) setSession(d.user)
      })
      .catch(() => {})
    fetch('/api/site')
      .then((r) => r.json())
      .then((d) => d?.settings && setSite(d.settings))
      .catch(() => {})
  }, [])

  const brandName = (site.siteName || 'Choke Panoramic Eco-Lodge').replace(' Eco-Lodge', '')

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    setSession(null)
    router.refresh()
  }

  return (
    <>
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <header className="fixed top-0 w-full bg-white/90 backdrop-blur shadow-sm z-50" role="banner">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl" aria-label={`${site.siteName ?? 'Choke Panoramic Eco-Lodge'} - Home`}>
            {site.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={site.logoUrl} alt="" className="h-10 w-auto max-w-[180px] object-contain" />
            ) : (
              <>
                <Mountain className="text-emerald-600" aria-hidden="true" />
                {brandName.split(' ')[0]} <span className="text-emerald-600">{brandName.split(' ').slice(1).join(' ') || 'Panoramic'}</span>
              </>
            )}
          </Link>

          <nav className="hidden md:flex gap-8 text-sm font-medium text-stone-700" aria-label="Main navigation">
            <Link href="/book" className="hover:text-emerald-600">Stay</Link>
            <Link href="/marketplace" className="hover:text-emerald-600">Marketplace</Link>
            <Link href="/media" className="hover:text-emerald-600">Gallery</Link>
            {session?.role === 'ADMIN' && (
              <Link href="/admin" className="hover:text-emerald-600">Admin</Link>
            )}
          </nav>

          <div className="flex items-center gap-3">
            {session ? (
              <div className="flex items-center gap-2">
                <span className="hidden sm:flex items-center gap-1.5 text-sm text-stone-600">
                  <User className="w-4 h-4" aria-hidden="true" />
                  {session.firstName}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-sm text-stone-500 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded-md px-2 py-1"
                >
                  Log out
                </button>
              </div>
            ) : (
              <div className="hidden sm:flex gap-3 text-sm">
                <Link href="/login" className="hover:text-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 rounded-md px-2 py-1">Sign in</Link>
                <Link href="/register" className="text-emerald-700 font-semibold hover:underline focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 rounded-md px-2 py-1">Join</Link>
              </div>
            )}

            <button
              onClick={() => setCartOpen(true)}
              className="relative p-2 rounded-lg hover:bg-stone-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
              aria-label={total > 0 ? `Shopping cart with ${total} items` : 'Empty shopping cart'}
            >
              <ShoppingBag aria-hidden="true" />
              {total > 0 && (
                <span className="absolute -top-1 -right-1 bg-emerald-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center" aria-hidden="true">
                  {total}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  )
}