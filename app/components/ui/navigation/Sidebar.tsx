'use client'

import { Fragment, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Home,
  Package,
  MapPin,
  Mountain,
  Search,
  Heart,
  MessageSquare,
  Bell,
  LayoutDashboard,
  User,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Plus,
  HelpCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/design-system'

export interface NavItem {
  href: string
  label: string
  icon: React.ReactNode
  badge?: number
  roles?: string[]
  children?: NavItem[]
  external?: boolean
}

export interface UserNavProps {
  user: {
    name: string
    email: string
    role: string
    avatar?: string
  }
  items: NavItem[]
  collapsed?: boolean
  onToggleCollapse?: () => void
  onLogout: () => void
  onHelp?: () => void
}

const navigationItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" />, roles: ['ADMIN', 'TOURIST', 'INVESTOR'] },
  { href: '/products', label: 'Products', icon: <Package className="w-5 h-5" />, roles: ['ADMIN', 'TOURIST', 'INVESTOR'] },
  { href: '/cottages', label: 'Cottages', icon: <MapPin className="w-5 h-5" />, roles: ['ADMIN', 'TOURIST', 'INVESTOR'] },
  { href: '/experiences', label: 'Experiences', icon: <Mountain className="w-5 h-5" />, roles: ['ADMIN', 'TOURIST', 'INVESTOR'] },
  { href: '/search', label: 'Search', icon: <Search className="w-5 h-5" />, roles: ['ADMIN', 'TOURIST', 'INVESTOR'] },
  { href: '/favorites', label: 'Favorites', icon: <Heart className="w-5 h-5" />, roles: ['TOURIST', 'INVESTOR'] },
  { href: '/messages', label: 'Messages', icon: <MessageSquare className="w-5 h-5" />, roles: ['TOURIST', 'INVESTOR'] },
  { href: '/notifications', label: 'Notifications', icon: <Bell className="w-5 h-5" />, roles: ['ADMIN', 'TOURIST', 'INVESTOR'] },
  {
    href: '/admin',
    label: 'Admin Panel',
    icon: <Settings className="w-5 h-5" />,
    roles: ['ADMIN'],
    children: [
      { href: '/admin/products', label: 'Products', icon: <Package className="w-4 h-4" /> },
      { href: '/admin/cottages', label: 'Cottages', icon: <MapPin className="w-4 h-4" /> },
      { href: '/admin/experiences', label: 'Experiences', icon: <Mountain className="w-4 h-4" /> },
      { href: '/admin/bookings', label: 'Bookings', icon: <LayoutDashboard className="w-4 h-4" /> },
      { href: '/admin/orders', label: 'Orders', icon: <Package className="w-4 h-4" /> },
      { href: '/admin/submissions', label: 'Submissions', icon: <HelpCircle className="w-4 h-4" /> },
      { href: '/admin/media', label: 'Media', icon: <Search className="w-4 h-4" /> },
      { href: '/admin/settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
    ]
  },
]

export function Sidebar({
  user,
  items = navigationItems,
  collapsed = false,
  onToggleCollapse,
  onLogout,
  onHelp,
}: UserNavProps) {
  const pathname = usePathname()
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
  const [mobileOpen, setMobileOpen] = useState(false)

  const filteredItems = items.filter((item) => !item.roles || item.roles.includes(user.role))

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  const toggleExpand = (label: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev)
      if (next.has(label)) next.delete(label)
      else next.add(label)
      return next
    })
  }

  const renderItem = (item: NavItem, level = 0) => {
    const hasChildren = item.children && item.children.length > 0
    const expanded = expandedItems.has(item.label)
    const active = isActive(item.href)

    if (hasChildren) {
      return (
        <div key={item.label}>
          <button
            onClick={() => toggleExpand(item.label)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
              expanded || active
                ? 'bg-emerald-50 text-emerald-700'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
            aria-expanded={expanded}
          >
            <span className="flex-shrink-0">{item.icon}</span>
            <span className="flex-1 text-sm font-medium truncate">{item.label}</span>
            <ChevronRight className={`w-4 h-4 flex-shrink-0 transition-transform ${expanded ? 'rotate-90' : ''}`} />
          </button>
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden mt-1 ml-2 border-l border-emerald-200 pl-2"
              >
                {item.children!.map((child) => (
                  <Link
                    key={child.href}
                    href={child.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                      isActive(child.href)
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'text-stone-500 hover:bg-stone-100 hover:text-stone-900'
                    }`}
                  >
                    {child.icon}
                    <span>{child.label}</span>
                    {child.badge && <span className="ml-auto px-2 py-0.5 text-xs bg-emerald-100 text-emerald-700 rounded-full">{child.badge}</span>}
                  </Link>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )
    }

    return (
      <Link
        key={item.label}
        href={item.href}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
          active
            ? 'bg-emerald-50 text-emerald-700'
            : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
        }`}
      >
        <span className="flex-shrink-0">{item.icon}</span>
        {!collapsed && <span className="flex-1 text-sm font-medium truncate">{item.label}</span>}
        {item.badge && !collapsed && <span className="ml-auto px-2 py-0.5 text-xs bg-emerald-100 text-emerald-700 rounded-full">{item.badge}</span>}
      </Link>
    )
  }

  const sidebarWidth = collapsed ? 'w-16' : 'w-64'

return (
      <>
        {mobileOpen && (
          <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          aria-hidden="true"
        />
      )}
      <motion.aside
        initial={{ width: collapsed ? '4rem' : '16rem' }}
        animate={{ width: collapsed ? '4rem' : '16rem' }}
        className={`
          fixed lg:static inset-y-0 left-0 z-30
          bg-white border-r border-stone-200
          flex flex-col transition-all duration-300 ease-out
          ${sidebarWidth}
        `}
        style={{ width: collapsed ? '4rem' : '16rem' }}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-16 px-4 border-b border-stone-100">
            {!collapsed && (
              <Link href="/" className="flex items-center gap-2 font-bold text-xl text-emerald-600">
                <span className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">C</span>
                </span>
                <span>Choke</span>
              </Link>
            )}
            <button
              onClick={onToggleCollapse}
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100"
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto p-3 space-y-1" aria-label="Main navigation">
            {filteredItems.map((item) => renderItem(item))}
          </nav>

          <div className="p-3 border-t border-stone-100">
            {!collapsed && (
              <div className="space-y-2">
                <Link href="/profile" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-stone-600 hover:bg-stone-100 hover:text-stone-900 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                    {user.avatar ? (
                      <img src={user.avatar} alt="" className="w-8 h-8 rounded-full" />
                    ) : (
                      <span className="text-emerald-600 font-medium">{user.name.charAt(0)}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{user.name}</p>
                    <p className="text-xs text-stone-500 truncate">{user.email}</p>
                  </div>
                </Link>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" className="flex-1" onClick={onHelp}>
                    <HelpCircle className="w-4 h-4" />
                    <span className="hidden sm:inline">Help</span>
                  </Button>
                  <Button variant="ghost" size="sm" className="flex-1" onClick={onLogout}>
                    <LogOut className="w-4 h-4" />
                    <span className="hidden sm:inline">Logout</span>
                  </Button>
                </div>
              </div>
            )}
            {collapsed && (
              <div className="flex flex-col gap-2">
                <button className="p-2 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100" aria-label="Help">
                  <HelpCircle className="w-5 h-5" />
                </button>
                <button className="p-2 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100" aria-label="Logout" onClick={onLogout}>
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.aside>
    </>
  )
}

export function MobileNavButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="lg:hidden p-2 rounded-lg text-stone-600 hover:bg-stone-100"
      aria-label="Open menu"
    >
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>
  )
}

export function TopNav({ user, onHelp, onLogout, children }: {
  user: { name: string; email: string; role: string; avatar?: string }
  onHelp: () => void
  onLogout: () => void
  children: React.ReactNode
}) {
  return (
    <header className="hidden lg:flex items-center justify-between h-16 px-6 bg-white/90 backdrop-blur border-b border-stone-100 sticky top-0 z-20">
      <div className="flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-emerald-600">
          <span className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
            <span className="text-white font-bold text-lg">C</span>
          </span>
          <span>Choke</span>
        </Link>
        {children}
      </div>

      <div className="flex items-center gap-4">
        <div className="relative">
          <button className="flex items-center gap-2 px-3 py-2 rounded-xl text-stone-600 hover:bg-stone-100 transition-colors">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
              <span className="text-emerald-600 font-medium">{user.name.charAt(0)}</span>
            </div>
            <span className="hidden sm:block font-medium">{user.name}</span>
          </button>
        </div>
        <button onClick={onHelp} className="p-2 rounded-lg text-stone-500 hover:bg-stone-100 hover:text-stone-700" aria-label="Help">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
        <button onClick={onLogout} className="flex items-center gap-2 px-3 py-2 rounded-xl text-stone-600 hover:bg-stone-100 hover:text-red-600 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </header>
  )
}