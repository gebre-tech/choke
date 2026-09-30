'use client'
import Link from 'next/link'
import { Mountain, ShoppingBag, User, Menu, X } from 'lucide-react'
import { useCartStore } from '@/store/cart'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import CartDrawer from './CartDrawer'
import toast from 'react-hot-toast'
import { useAuth } from '@/components/AuthProvider'

type HeaderSettings = { siteName?: string; logoUrl?: string; tagline?: string }

export default function Header({ settings }: { settings?: HeaderSettings }) {
  const [cartOpen, setCartOpen] = useState(false)
  const [site, setSite] = useState<HeaderSettings>(settings ?? {})
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const { user: session, isLoading: sessionLoading, clearSession } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const items = useCartStore((s) => s.items)
  const total = items.reduce((sum, i) => sum + i.quantity, 0)
  const isHome = pathname === '/'

  useEffect(() => {
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
    if (loggingOut) return
    setLoggingOut(true)
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST' })
      if (!response.ok) throw new Error('Could not sign out')
      clearSession()
      setMobileOpen(false)
      router.refresh()
    } catch {
      toast.error('Could not sign out. Please try again.')
    } finally {
      setLoggingOut(false)
    }
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
                aria-current={pathname === link.href ? 'page' : undefined}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {sessionLoading ? (
              <div className="hidden h-9 w-28 animate-pulse rounded-full bg-stone-100 md:block" aria-label="Checking account" />
            ) : session ? (
              <div className="hidden md:flex items-center gap-2">
                <span className={`flex items-center gap-1.5 text-sm font-medium ${isTransparent ? 'text-white/80' : 'text-stone-600'}`}>
                  <User className="w-4 h-4" aria-hidden="true" />
                  {session.firstName}
                </span>
                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className={`text-sm px-3 py-1.5 rounded-full transition-all ${
                    isTransparent
                      ? 'text-white/85 hover:text-white hover:bg-white/10'
                      : 'text-stone-600 hover:text-red-700 hover:bg-red-50'
                  }`}
                >
                  {loggingOut ? 'Signing out…' : 'Log out'}
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
                      ? 'bg-emerald-700 text-white hover:bg-emerald-800'
                      : 'bg-emerald-700 text-white hover:bg-emerald-800'
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
                <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-700 text-[10px] font-bold text-white" aria-hidden="true">
                  {total}
                </span>
              )}
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-expanded={mobileOpen}
              aria-controls="mobile-navigation"
              className={`md:hidden p-2.5 rounded-full transition-all ${
                isTransparent && !mobileOpen
                  ? 'text-white/80 hover:text-white hover:bg-white/10'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
              aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <nav id="mobile-navigation" aria-label="Mobile navigation" hidden={!mobileOpen} className="md:hidden bg-white border-t border-stone-100 shadow-xl">
            <div className="container mx-auto px-4 py-4 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  aria-current={pathname === link.href ? 'page' : undefined}
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
                {sessionLoading ? (
                  <span className="flex items-center gap-2 px-3 py-2 text-sm text-stone-600"><span className="h-4 w-4 animate-spin rounded-full border-2 border-stone-300 border-t-emerald-700" /> Checking account…</span>
                ) : session ? (
                  <>
                    <span className="flex items-center gap-1.5 text-sm text-stone-600 flex-1">
                      <User className="w-4 h-4" /> {session.firstName}
                    </span>
                    <button onClick={handleLogout} disabled={loggingOut} className="text-sm text-red-500 hover:text-red-700 font-medium disabled:opacity-60">
                      {loggingOut ? 'Signing out…' : 'Log out'}
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/login" onClick={() => setMobileOpen(false)} className="flex-1 text-center py-2.5 border border-stone-200 rounded-xl text-sm font-medium text-stone-600">
                      Sign in
                    </Link>
                    <Link href="/register" onClick={() => setMobileOpen(false)} className="flex-1 text-center py-2.5 bg-emerald-700 rounded-xl text-sm font-semibold text-white hover:bg-emerald-800">
                      Join
                    </Link>
                  </>
                )}
              </div>
            </div>
        </nav>
      </header>
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  )
}
