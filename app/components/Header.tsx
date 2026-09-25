'use client'
import Link from 'next/link'
import { Mountain, ShoppingBag, User, Menu, X } from 'lucide-react'
import { useCartStore } from '@/store/cart'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import CartDrawer from './CartDrawer'

type SessionUser = { id: string; email: string; role: string; firstName: string }
type HeaderSettings = { siteName?: string; logoUrl?: string; tagline?: string }

export default function Header({ settings }: { settings?: HeaderSettings }) {
  const [cartOpen, setCartOpen] = useState(false)
  const [session, setSession] = useState<SessionUser | null>(null)
  const [site, setSite] = useState<HeaderSettings>(settings ?? {})
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const items = useCartStore((s) => s.items)
  const total = items.reduce((sum, i) => sum + i.quantity, 0)
  const isHome = pathname === '/'

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((d) => { if (d?.authenticated) setSession(d.user) })
      .catch(() => {})
    fetch('/api/site')
      .then((r) => r.json())
      .then((d) => d?.settings && setSite(d.settings))
      .catch(() => {})
  }, [])

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    setSession(null)
    setMobileOpen(false)
    router.refresh()
  }

  const navLinks = [
    { href: '/book', label: 'Stay' },
    { href: '/marketplace', label: 'Marketplace' },
    { href: '/media', label: 'Gallery' },
    ...(session?.role === 'ADMIN' ? [{ href: '/admin', label: 'Admin' }] : []),
  ]

  const isTransparent = isHome && !scrolled && !mobileOpen

  return (
    <>
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <header
        className={`fixed top-0 w-full z-50 transition-all duration-500 ${
          isTransparent
            ? 'bg-transparent'
            : 'bg-white/95 backdrop-blur-xl shadow-sm border-b border-stone-100'
        }`}
        role="banner"
      >
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5 font-black text-lg"
            aria-label={`${site.siteName ?? 'Choke Mountains Ecovillage'} - Home`}
          >
            {site.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={site.logoUrl} alt="" className="h-9 w-auto max-w-[180px] object-contain" />
            ) : (
              <>
                <div className={`p-1.5 rounded-xl ${isTransparent ? 'bg-white/10' : 'bg-emerald-50'}`}>
                  <Mountain
                    className={`w-5 h-5 ${isTransparent ? 'text-emerald-300' : 'text-emerald-600'}`}
                    aria-hidden="true"
                  />
                </div>
                <span className={`tracking-tight ${isTransparent ? 'text-white' : 'text-stone-900'}`}>
                  Choke <span className={isTransparent ? 'text-emerald-300' : 'text-emerald-600'}>Mountains</span>
                </span>
              </>
            )}
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  pathname === link.href
                    ? isTransparent
                      ? 'bg-white/15 text-white'
                      : 'bg-emerald-50 text-emerald-700'
                    : isTransparent
                    ? 'text-white/80 hover:text-white hover:bg-white/10'
                    : 'text-stone-600 hover:text-emerald-600 hover:bg-stone-50'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {session ? (
              <div className="hidden md:flex items-center gap-2">
                <span className={`flex items-center gap-1.5 text-sm font-medium ${isTransparent ? 'text-white/80' : 'text-stone-600'}`}>
                  <User className="w-4 h-4" aria-hidden="true" />
                  {session.firstName}
                </span>
                <button
                  onClick={handleLogout}
                  className={`text-sm px-3 py-1.5 rounded-full transition-all ${
                    isTransparent
                      ? 'text-white/60 hover:text-white hover:bg-white/10'
                      : 'text-stone-400 hover:text-red-600 hover:bg-red-50'
                  }`}
                >
                  Log out
                </button>
              </div>
            ) : (
              <div className="hidden md:flex gap-2 text-sm">
                <Link
                  href="/login"
                  className={`px-4 py-2 rounded-full font-medium transition-all ${
                    isTransparent
                      ? 'text-white/80 hover:text-white hover:bg-white/10'
                      : 'text-stone-600 hover:text-emerald-600'
                  }`}
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className={`px-4 py-2 rounded-full font-semibold transition-all ${
                    isTransparent
                      ? 'bg-emerald-500 text-white hover:bg-emerald-400'
                      : 'bg-emerald-600 text-white hover:bg-emerald-500'
                  } shadow-sm`}
                >
                  Join
                </Link>
              </div>
            )}

            {/* Cart */}
            <button
              onClick={() => setCartOpen(true)}
              className={`relative p-2.5 rounded-full transition-all ${
                isTransparent
                  ? 'text-white/80 hover:text-white hover:bg-white/10'
                  : 'text-stone-600 hover:text-emerald-600 hover:bg-stone-100'
              }`}
              aria-label={total > 0 ? `Shopping cart with ${total} items` : 'Empty shopping cart'}
            >
              <ShoppingBag className="w-5 h-5" aria-hidden="true" />
              {total > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-emerald-500 text-white text-[10px] font-bold w-4.5 h-4.5 w-5 h-5 rounded-full flex items-center justify-center" aria-hidden="true">
                  {total}
                </span>
              )}
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className={`md:hidden p-2.5 rounded-full transition-all ${
                isTransparent && !mobileOpen
                  ? 'text-white/80 hover:text-white hover:bg-white/10'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
              aria-label="Toggle navigation"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden bg-white border-t border-stone-100 shadow-xl">
            <div className="container mx-auto px-4 py-4 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`block px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    pathname === link.href
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-3 border-t border-stone-100 flex gap-2">
                {session ? (
                  <>
                    <span className="flex items-center gap-1.5 text-sm text-stone-500 flex-1">
                      <User className="w-4 h-4" /> {session.firstName}
                    </span>
                    <button onClick={handleLogout} className="text-sm text-red-500 hover:text-red-700 font-medium">
                      Log out
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/login" onClick={() => setMobileOpen(false)} className="flex-1 text-center py-2.5 border border-stone-200 rounded-xl text-sm font-medium text-stone-600">
                      Sign in
                    </Link>
                    <Link href="/register" onClick={() => setMobileOpen(false)} className="flex-1 text-center py-2.5 bg-emerald-600 rounded-xl text-sm font-semibold text-white">
                      Join
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </header>
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  )
}