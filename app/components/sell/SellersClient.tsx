'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { useAsyncData, Field, inputCls, Badge } from '@/components/admin/ui'
import { classifyPublicMediaUrl, type PublicMediaUrl } from '@/lib/media-shared'
import { Loader2, Plus, X, Trash2, Pencil, LogIn } from 'lucide-react'

type SessionUser = { id: string; email: string; role: string; firstName: string }

type MediaLight = {
  id: string
  title: string
  type: string
  url: string
  provider: string | null
  videoId: string | null
}

type ProductItem = {
  id: string
  name: string
  description: string
  price: number
  category: string
  stock: number
  producerName: string
  producerLocation: string
  isOrganic: boolean
  weight: number | null
  publicationStatus: string
  rejectionReason: string | null
  media: MediaLight[]
}

type ExperienceItem = {
  id: string
  name: string
  description: string
  price: number
  type: string
  duration: number | null
  capacity: number
  cottageId: string | null
  publicationStatus: string
  rejectionReason: string | null
  media: MediaLight[]
}

const PRODUCT_CATEGORIES = ['HONEY', 'COFFEE', 'CRAFTS', 'SPICES', 'BAMBOO', 'OTHER']
const EXPERIENCE_TYPES = ['STARGAZING', 'TREKKING', 'CITY_LIGHTS', 'SUNRISE_SUNSET', 'CULTURAL_TOUR', 'BIRD_WATCHING']

const STATUS_LABEL: Record<string, string> = {
  PENDING: 'Pending review',
  PUBLISHED: 'Live',
  REJECTED: 'Rejected',
}

async function api<T = unknown>(path: string, options: { method?: string; body?: unknown } = {}) {
  const res = await fetch(path, {
    method: options.method ?? 'GET',
    headers: options.body === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(typeof data.error === 'string' ? data.error : `Request failed (${res.status})`)
  return data as T
}

type MediaRow = { url: string; hint: string; ok: boolean }

export default function SellersClient({ cottages }: { cottages: { id: string; name: string }[] }) {
  const [session, setSession] = useState<SessionUser | null>(null)
  const [checked, setChecked] = useState(false)
  const [tab, setTab] = useState<'PRODUCT' | 'EXPERIENCE'>('PRODUCT')

  const listings = useAsyncData<{ products: ProductItem[]; experiences: ExperienceItem[] }>(() =>
    Promise.all([
      api<{ products: ProductItem[] }>('/api/submissions/products'),
      api<{ experiences: ExperienceItem[] }>('/api/submissions/experiences'),
    ]).then(([p, e]) => ({ products: p.products, experiences: e.experiences }))
  )

  const loadListings = useCallback(() => listings.refresh(), [listings])

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((d) => {
        if (d?.authenticated) setSession(d.user)
      })
      .catch(() => {})
      .finally(() => setChecked(true))
  }, [])

  if (!checked) {
    return (
      <p className="flex items-center gap-2 text-stone-500">
        <Loader2 className="w-5 h-5 animate-spin" /> Checking…
      </p>
    )
  }

  if (!session) {
    return (
      <div className="bg-white rounded-2xl shadow p-8 text-center">
        <LogIn className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
        <h2 className="text-xl font-bold mb-2">Sign in to start selling</h2>
        <p className="text-stone-500 mb-4 text-sm">
          You&apos;ll be able to submit products and experiences with photos and videos. An admin
          reviews each listing before it goes live.
        </p>
        <Link href="/login" className="inline-block bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2.5 rounded-full font-semibold">
          Sign in
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex gap-3">
        {(['PRODUCT', 'EXPERIENCE'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors ${
              tab === t ? 'bg-emerald-600 text-white' : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
            }`}
          >
            {t === 'PRODUCT' ? 'Sell a product' : 'Offer an experience'}
          </button>
        ))}
      </div>

      {tab === 'PRODUCT' ? (
        <ProductForm onSubmitSuccess={loadListings} cottages={cottages} />
      ) : (
        <ExperienceForm onSubmitSuccess={loadListings} cottages={cottages} />
      )}

      <MyListings session={session} data={listings} onEdited={loadListings} defaultTab={tab} />
    </div>
  )
}

function MediaLinks({
  rows,
  onChange,
}: {
  rows: MediaRow[]
  onChange: (rows: MediaRow[]) => void
}) {
  const add = () => onChange([...rows, { url: '', hint: '', ok: false }])
  const update = (i: number, url: string) => {
    const next = [...rows]
    next[i] = { url, hint: '', ok: false }
    if (url.trim()) {
      const c = classifyPublicMediaUrl(url)
      next[i] = c.ok
        ? { url, hint: c.type === 'VIDEO' ? 'Video embed' : 'Image', ok: true }
        : { url, hint: c.error, ok: false }
    }
    onChange(next)
  }
  return (
    <div className="space-y-2">
      <p className="text-xs text-stone-500">
        Add photos with https image links (jpg/png/webp/gif) and videos with YouTube/Vimeo links.
        Link and file upload management is available to admins.
      </p>
      {rows.map((r, i) => (
        <div key={i} className="flex items-center gap-2">
          <input
            className={inputCls}
            value={r.url}
            onChange={(e) => update(i, e.target.value)}
            placeholder="https://image.jpg or youtube.com/watch?v=…"
          />
          {r.url.trim() && (
            <span className={`text-[11px] shrink-0 ${r.ok ? 'text-emerald-600' : 'text-red-600'}`}>
              {r.hint}
            </span>
          )}
          {rows.length > 1 && (
            <button type="button" onClick={() => onChange(rows.filter((_, j) => j !== i))} className="text-stone-400 hover:text-red-600 shrink-0">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      ))}
      <button type="button" onClick={add} className="flex items-center gap-1 text-xs text-emerald-700 hover:underline">
        <Plus className="w-3 h-3" /> Add media link
      </button>
    </div>
  )
}

const mediaFromRows = (rows: MediaRow[]) =>
  rows
    .filter((r) => r.ok && r.url.trim())
    .map((r) => classifyPublicMediaUrl(r.url))
    .filter((c): c is Extract<PublicMediaUrl, { ok: true }> => c.ok)

function ProductForm({
  onSubmitSuccess,
  cottages,
}: {
  onSubmitSuccess: () => void
  cottages: { id: string; name: string }[]
}) {
  const [f, setF] = useState({
    name: '',
    description: '',
    price: '',
    category: 'HONEY',
    stock: '10',
    producerName: 'Choke Mountains Community',
    producerLocation: 'West Gojam Zone, Amhara Region, Ethiopia',
    isOrganic: true,
    weight: '',
  })
  const [media, setMedia] = useState<MediaRow[]>([])
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((p) => ({ ...p, [k]: v }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setErr('')
    try {
      const urls = mediaFromRows(media)
      const invalid = media.filter((m) => m.url.trim() && !m.ok)
      if (invalid.length > 0) {
        throw new Error('One or more media links are not allowed (only https images or YouTube/Vimeo).')
      }
      await api('/api/submissions/products', {
        method: 'POST',
        body: {
          name: f.name,
          description: f.description,
          price: Number(f.price),
          category: f.category,
          stock: Number(f.stock),
          producerName: f.producerName,
          producerLocation: f.producerLocation,
          isOrganic: f.isOrganic,
          weight: f.weight ? Number(f.weight) : null,
          media: urls.map((u) => u.url),
        },
      })
      toast.success('Product submitted for review')
      setF({ ...f, name: '', description: '', price: '', stock: '10', weight: '' })
      setMedia([])
      onSubmitSuccess()
    } catch (err2) {
      setErr(err2 instanceof Error ? err2.message : 'Submission failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} className="bg-white rounded-2xl shadow p-6 space-y-4">
      <h2 className="text-lg font-bold">New product listing</h2>
      {err && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{err}</p>}
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Name">
          <input className={inputCls} value={f.name} onChange={(e) => set('name', e.target.value)} required />
        </Field>
        <Field label="Price (ETB)">
          <input className={inputCls} type="number" min="1" step="0.01" value={f.price} onChange={(e) => set('price', e.target.value)} required />
        </Field>
        <Field label="Category">
          <select className={inputCls} value={f.category} onChange={(e) => set('category', e.target.value)}>
            {PRODUCT_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="Stock">
          <input className={inputCls} type="number" min="0" value={f.stock} onChange={(e) => set('stock', e.target.value)} required />
        </Field>
        <Field label="Producer / group">
          <input className={inputCls} value={f.producerName} onChange={(e) => set('producerName', e.target.value)} />
        </Field>
        <Field label="Location">
          <input className={inputCls} value={f.producerLocation} onChange={(e) => set('producerLocation', e.target.value)} />
        </Field>
        <Field label="Weight (kg, optional)">
          <input className={inputCls} type="number" min="0" step="0.01" value={f.weight} onChange={(e) => set('weight', e.target.value)} />
        </Field>
        <label className="flex items-center gap-2 text-sm cursor-pointer pt-6">
          <input type="checkbox" checked={f.isOrganic} onChange={(e) => set('isOrganic', e.target.checked)} className="w-4 h-4 accent-emerald-600" />
          Organic
        </label>
      </div>
      <Field label="Description">
        <textarea className={inputCls} rows={2} value={f.description} onChange={(e) => set('description', e.target.value)} />
      </Field>
      <MediaLinks rows={media} onChange={setMedia} />
      <button type="submit" disabled={busy} className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white font-semibold py-2.5 px-8 rounded-full flex items-center justify-center gap-2">
        {busy && <Loader2 className="w-4 h-4 animate-spin" />}
        Submit for review
      </button>
    </form>
  )
}

function ExperienceForm({
  onSubmitSuccess,
  cottages,
}: {
  onSubmitSuccess: () => void
  cottages: { id: string; name: string }[]
}) {
  const [f, setF] = useState({
    name: '',
    description: '',
    price: '',
    type: 'STARGAZING',
    duration: '',
    capacity: '10',
    startTime: '',
    endTime: '',
    cottageId: '',
  })
  const [media, setMedia] = useState<MediaRow[]>([])
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((p) => ({ ...p, [k]: v }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setErr('')
    try {
      const invalid = media.filter((m) => m.url.trim() && !m.ok)
      if (invalid.length > 0) {
        throw new Error('One or more media links are not allowed (only https images or YouTube/Vimeo).')
      }
      const urls = mediaFromRows(media)
      await api('/api/submissions/experiences', {
        method: 'POST',
        body: {
          name: f.name,
          description: f.description,
          price: Number(f.price),
          type: f.type,
          duration: f.duration ? Number(f.duration) : null,
          capacity: Number(f.capacity),
          startTime: f.startTime || null,
          endTime: f.endTime || null,
          cottageId: f.cottageId || null,
          media: urls.map((u) => u.url),
        },
      })
      toast.success('Experience submitted for review')
      setF({ ...f, name: '', description: '', price: '', duration: '', cottageId: '' })
      setMedia([])
      onSubmitSuccess()
    } catch (err2) {
      setErr(err2 instanceof Error ? err2.message : 'Submission failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} className="bg-white rounded-2xl shadow p-6 space-y-4">
      <h2 className="text-lg font-bold">New experience offering</h2>
      {err && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{err}</p>}
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Name">
          <input className={inputCls} value={f.name} onChange={(e) => set('name', e.target.value)} required />
        </Field>
        <Field label="Type">
          <select className={inputCls} value={f.type} onChange={(e) => set('type', e.target.value)}>
            {EXPERIENCE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </Field>
        <Field label="Price (ETB)">
          <input className={inputCls} type="number" min="1" step="0.01" value={f.price} onChange={(e) => set('price', e.target.value)} required />
        </Field>
        <Field label="Duration (minutes)">
          <input className={inputCls} type="number" min="1" value={f.duration} onChange={(e) => set('duration', e.target.value)} />
        </Field>
        <Field label="Capacity">
          <input className={inputCls} type="number" min="1" value={f.capacity} onChange={(e) => set('capacity', e.target.value)} required />
        </Field>
        <Field label="Linked cottage (optional)">
          <select className={inputCls} value={f.cottageId} onChange={(e) => set('cottageId', e.target.value)}>
            <option value="">None</option>
            {cottages.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </Field>
        <Field label="Start time (HH:MM)">
          <input className={inputCls} placeholder="20:00" value={f.startTime} onChange={(e) => set('startTime', e.target.value)} />
        </Field>
        <Field label="End time (HH:MM)">
          <input className={inputCls} placeholder="21:30" value={f.endTime} onChange={(e) => set('endTime', e.target.value)} />
        </Field>
      </div>
      <Field label="Description">
        <textarea className={inputCls} rows={2} value={f.description} onChange={(e) => set('description', e.target.value)} />
      </Field>
      <MediaLinks rows={media} onChange={setMedia} />
      <button type="submit" disabled={busy} className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white font-semibold py-2.5 px-8 rounded-full flex items-center justify-center gap-2">
        {busy && <Loader2 className="w-4 h-4 animate-spin" />}
        Submit for review
      </button>
    </form>
  )
}

function MyListings({
  session,
  data,
  onEdited,
  defaultTab,
}: {
  session: SessionUser
  data: { data: { products: ProductItem[]; experiences: ExperienceItem[] } | null; loading: boolean }
  onEdited: () => void
  defaultTab: 'PRODUCT' | 'EXPERIENCE'
}) {
  const [removing, setRemoving] = useState('')

  const del = async (kind: 'products' | 'experiences', id: string) => {
    setRemoving(id)
    try {
      await api(`/api/submissions/${kind}/${id}`, { method: 'DELETE' })
      toast.success('Removed')
      onEdited()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Delete failed')
    } finally {
      setRemoving('')
    }
  }

  const products = data.data?.products ?? []
  const experiences = data.data?.experiences ?? []
  const all = [
    ...products.map((p) => ({
      id: p.id,
      kind: 'products' as const,
      name: p.name,
      price: p.price,
      category: p.category,
      status: p.publicationStatus,
      reason: p.rejectionReason,
      cover: p.media[0]?.url,
      key: `p-${p.id}`,
    })),
    ...experiences.map((e) => ({
      id: e.id,
      kind: 'experiences' as const,
      name: e.name,
      price: e.price,
      category: e.type,
      status: e.publicationStatus,
      reason: e.rejectionReason,
      cover: e.media[0]?.url,
      key: `e-${e.id}`,
    })),
  ].sort((a, b) => a.key.localeCompare(b.key))

  return (
    <section className="bg-white rounded-2xl shadow p-6">
      <h2 className="text-lg font-bold mb-4">My listings</h2>
      {data.loading && (
        <p className="flex items-center gap-2 text-stone-500 text-sm">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading…
        </p>
      )}
      {!data.loading && all.length === 0 && <p className="text-sm text-stone-400">You haven&apos;t submitted anything yet.</p>}
      <div className="space-y-2">
        {!data.loading &&
          all.map((l) => (
            <div key={l.key} className="flex flex-wrap items-center gap-3 border border-stone-100 rounded-xl p-3">
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-stone-100 shrink-0">
                {l.cover ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={l.cover} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="w-full h-full flex items-center justify-center text-stone-300 text-xs">∅</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium line-clamp-1">{l.name}</p>
                <p className="text-xs text-stone-500">
                  {l.kind === 'products' ? 'Product' : 'Experience'} · {l.category} · ETB {l.price.toLocaleString()}
                </p>
              </div>
              <div className="text-sm">
                {l.status === 'REJECTED' ? (
                  <span title={l.reason ?? ''} className="text-red-600 font-medium">Rejected</span>
                ) : l.status === 'PUBLISHED' ? (
                  <Badge value="CONFIRMED" />
                ) : (
                  <span className="text-amber-600 font-medium">{STATUS_LABEL[l.status] ?? l.status}</span>
                )}
              </div>
              {l.status === 'PENDING' && (
                <button
                  onClick={() => del(l.kind, l.id)}
                  disabled={removing === l.id}
                  className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  {removing === l.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                  Remove
                </button>
              )}
              <span className="text-[10px] text-stone-300">
                {l.reason ? `· ${l.reason}` : ''}
              </span>
            </div>
          ))}
      </div>
    </section>
  )
}