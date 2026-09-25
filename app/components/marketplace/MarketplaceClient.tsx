'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import type { MarketProduct, MarketLink } from './types'
import ProductCard from './ProductCard'
import QuickView from './QuickView'
import { Search, X, PlusCircle, Mountain, CalendarDays, Globe, MapPin, Video, MessageSquare, Link as LinkIcon, SlidersHorizontal, ShoppingBag, Leaf } from 'lucide-react'

const LINK_ICONS: Record<string, typeof LinkIcon> = {
  WEBSITE: Globe,
  BOOKING: MapPin,
  PURCHASE: MapPin,
  LOCATION: MapPin,
  SOCIAL: MessageSquare,
  VIDEO: Video,
  OTHER: LinkIcon,
}

type SortKey = 'default' | 'price-asc' | 'price-desc' | 'newest'

const CATEGORY_LABELS: Record<string, string> = {
  HONEY: 'Honey', COFFEE: 'Coffee', CRAFTS: 'Crafts', SPICES: 'Spices', BAMBOO: 'Bamboo',
  FOOD: 'Foods', DAIRY: 'Milk & dairy', RESTAURANT: 'Restaurants',
  GUEST_HOUSE: 'Guest houses', MART: 'Marts & essentials', APPAREL: 'Choke shirts & clothing',
  OTHER: 'Other',
}

const SORTS: { key: SortKey; label: string }[] = [
  { key: 'default', label: 'Recommended' },
  { key: 'newest', label: 'Newest first' },
  { key: 'price-asc', label: 'Price: low to high' },
  { key: 'price-desc', label: 'Price: high to low' },
]

type ExperienceItem = {
  id: string
  name: string
  description: string
  type: string
  price: number
  media: { id: string; title: string; type: string; url: string }[]
  links: MarketLink[]
}

export default function MarketplaceClient({
  products,
  categories,
  experiences,
  cottages,
}: {
  products: MarketProduct[]
  categories: string[]
  experiences: ExperienceItem[]
  cottages: { id: string; name: string }[]
}) {
  const [q, setQ] = useState('')
  const [cat, setCat] = useState('all')
  const [sort, setSort] = useState<SortKey>('default')
  const [maxPrice, setMaxPrice] = useState('')
  const [organicOnly, setOrganicOnly] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [open, setOpen] = useState<MarketProduct | null>(null)

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase()
    let list = products.filter(
      (p) =>
        (cat === 'all' || p.category === cat) &&
        (!maxPrice || p.price <= Number(maxPrice)) &&
        (!organicOnly || p.isOrganic) &&
        (!term ||
          [p.name, p.description, p.producerName, p.producerLocation, p.category]
            .filter(Boolean)
            .some((v) => String(v).toLowerCase().includes(term)))
    )
    switch (sort) {
      case 'price-asc':
        list = [...list].sort((a, b) => a.price - b.price)
        break
      case 'price-desc':
        list = [...list].sort((a, b) => b.price - a.price)
        break
      case 'newest':
        list = [...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        break
    }
    return list
  }, [products, q, cat, sort, maxPrice, organicOnly])

  const hasFilters = Boolean(q || cat !== 'all' || maxPrice || organicOnly)
  const clearFilters = () => {
    setQ('')
    setCat('all')
    setSort('default')
    setMaxPrice('')
    setOrganicOnly(false)
  }

  const coverImage = (assets: { type: string; url: string }[]) =>
    assets.find((m) => m.type === 'IMAGE')?.url

  return (
    <div>
      <div className="mb-8 rounded-3xl bg-gradient-to-r from-emerald-950 to-slate-900 p-6 text-white shadow-xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">Choke community marketplace</p>
        <div className="mt-2 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h2 className="text-2xl font-bold">Everything you need from the mountain community.</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-300">
              Shop local foods, fresh milk, restaurants, guest houses, everyday essentials, and
              Choke shirts while supporting local producers and hosts.
            </p>
          </div>
          <span className="rounded-full bg-white/10 px-4 py-2 text-xs font-semibold text-emerald-100">
            {products.length} local listings
          </span>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <Link
          href="/sell"
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-full text-sm font-semibold"
        >
          <PlusCircle className="w-4 h-4" /> Sell from the community
        </Link>
        <p className="text-xs text-stone-500">
          Showcasing goods &amp; activities from {cottages.length ? `${cottages.length} scenic cottages` : 'the Choke Mountain community'}.
        </p>
      </div>

      {experiences.length > 0 && (
        <section className="mb-10">
          <h2 className="flex items-center gap-2 text-xl font-semibold text-emerald-700 mb-4">
            <Mountain className="w-5 h-5" /> Experiences &amp; activities
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {experiences.map((e) => {
              const cover = coverImage(e.media)
              return (
                <div key={e.id} className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow p-4 flex flex-col gap-3">
                  <div className="relative aspect-[16/9] rounded-xl overflow-hidden bg-gradient-to-br from-emerald-100 to-teal-200">
                    {cover ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={cover} alt={e.name} className="absolute inset-0 w-full h-full object-cover" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-emerald-700">
                        <Mountain className="w-10 h-10" />
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-semibold line-clamp-1">{e.name}</h3>
                    <p className="text-emerald-600 font-bold whitespace-nowrap">ETB {e.price.toLocaleString()}</p>
                  </div>
                  <p className="text-xs text-stone-500 uppercase tracking-wide">{e.type.replace('_', ' ')}</p>
                  <p className="text-sm text-gray-600 line-clamp-2">{e.description}</p>
                  {e.links && e.links.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {e.links.map((link: MarketLink) => {
                        const Icon = LINK_ICONS[link.type] || LinkIcon
                        return (
                          <a
                            key={link.id}
                            href={link.url}
                            target={link.openInNewTab ? '_blank' : '_self'}
                            rel={link.openInNewTab ? 'noopener noreferrer' : undefined}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-medium rounded-full border border-emerald-200 hover:bg-emerald-100"
                            title={link.description || link.url}
                          >
                            <Icon className="w-2.5 h-2.5" />
                            {link.title}
                          </a>
                        )
                      })}
                    </div>
                  )}
                  <Link
                    href="/book"
                    className="mt-auto flex items-center justify-center gap-2 bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-700 text-sm font-semibold py-2 rounded-full border border-emerald-200 hover:border-emerald-600 transition-colors"
                  >
                    <CalendarDays className="w-4 h-4" /> Book a stay
                  </Link>
                </div>
              )
            })}
          </div>
        </section>
      )}

      <div className="mb-6 rounded-2xl border border-stone-200 bg-white p-3 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search products, hosts, foods, clothing…"
            className="w-full rounded-xl border border-stone-200 bg-stone-50 py-3 pl-9 pr-9 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
          {q && (
            <button
              onClick={() => setQ('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setFiltersOpen((value) => !value)}
            className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold ${filtersOpen || hasFilters ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-stone-200 text-stone-600'}`}
          >
            <SlidersHorizontal className="h-4 w-4" /> Filters
          </button>
          <button
            onClick={() => setCat('all')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              cat === 'all'
                ? 'bg-emerald-600 text-white'
                : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
            }`}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                cat === c
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
              }`}
            >
              {CATEGORY_LABELS[c] ?? c.replaceAll('_', ' ')}
            </button>
          ))}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="ml-auto lg:ml-2 border border-stone-300 rounded-full px-3 py-2 text-xs font-medium bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {SORTS.map((s) => (
              <option key={s.key} value={s.key}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        </div>
        {filtersOpen && (
          <div className="mt-3 flex flex-wrap items-end gap-3 border-t border-stone-100 pt-3">
            <label className="text-xs font-semibold text-stone-600">
              Maximum price
              <input
                type="number"
                min="0"
                value={maxPrice}
                onChange={(event) => setMaxPrice(event.target.value)}
                placeholder="Any price"
                className="mt-1 block w-36 rounded-lg border border-stone-200 px-3 py-2 text-sm font-normal focus:border-emerald-500 focus:outline-none"
              />
            </label>
            <label className="inline-flex items-center gap-2 rounded-lg border border-stone-200 px-3 py-2 text-xs font-semibold text-stone-600">
              <input type="checkbox" checked={organicOnly} onChange={(event) => setOrganicOnly(event.target.checked)} className="h-4 w-4 accent-emerald-600" />
              <Leaf className="h-4 w-4 text-emerald-600" /> Organic only
            </label>
            {hasFilters && (
              <button type="button" onClick={clearFilters} className="text-xs font-semibold text-red-600 hover:underline">
                Clear all filters
              </button>
            )}
          </div>
        )}
      </div>

      <div className="mb-4 flex items-center justify-between gap-3">
      <p className="flex items-center gap-2 text-sm text-stone-500">
        <ShoppingBag className="h-4 w-4" />
        {filtered.length} product{filtered.length === 1 ? '' : 's'}
        {q && <> matching “{q}”</>}
      </p>
      {hasFilters && <button type="button" onClick={clearFilters} className="text-xs font-semibold text-emerald-700 hover:underline">Reset view</button>}
      </div>

      {filtered.length === 0 ? (
        <p className="text-gray-500 py-12 text-center">
          Nothing matches your search yet — try a different category or keyword.
        </p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} onOpen={() => setOpen(p)} />
          ))}
        </div>
      )}

      {open && <QuickView product={open} onClose={() => setOpen(null)} />}
    </div>
  )
}