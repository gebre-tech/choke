'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import {
  adminApi,
  useAsyncData,
  Modal,
  Field,
  inputCls,
  Badge,
  ConfirmDeleteButton,
  SaveButton,
  SecondaryButton,
  Err,
  PageHeader,
  Section,
  DataTable,
  SearchInput,
  EmptyState,
  LoadingState,
} from '@/components/admin/ui'
import { Loader2, Plus, Home, Trash2, Package } from 'lucide-react'
import MediaManager from '@/components/admin/MediaManager'
import LinkManager from '@/components/admin/LinkManager'
import { Select } from '@/components/admin/ui'

type Cottage = {
  id: string
  name: string
  description: string
  pricePerNight: number
  capacity: number
  bedrooms: number
  beds: number
  bathrooms: number
  hasTelescope: boolean
  hasFireplace: boolean
  hasPrivateDeck: boolean
  hasKitchenette: boolean
  hasHeatedFloors: boolean
  hasWifi: boolean
  isAvailable: boolean
  totalUnits: number
  availableUnits: number
  altitude: number | null
  viewDescription: string | null
  _count?: { bookings: number }
}

const emptyCottage: Cottage = {
  id: '',
  name: '',
  description: '',
  pricePerNight: 2500,
  capacity: 2,
  bedrooms: 1,
  beds: 1,
  bathrooms: 1,
  hasTelescope: false,
  hasFireplace: false,
  hasPrivateDeck: false,
  hasKitchenette: false,
  hasHeatedFloors: false,
  hasWifi: false,
  isAvailable: true,
  totalUnits: 1,
  availableUnits: 1,
  altitude: null,
  viewDescription: '',
}

function CottageForm({
  initial,
  onSaved,
  onCancel,
}: {
  initial: Cottage
  onSaved: () => void
  onCancel: () => void
}) {
  const [form, setForm] = useState<Cottage>(initial)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const editing = Boolean(initial.id)

  const set = <K extends keyof Cottage>(key: K, value: Cottage[K]) =>
    setForm((f) => ({ ...f, [key]: value }))

  const toggle = (key: keyof Cottage) => set(key, !form[key])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const payload = {
        name: form.name,
        description: form.description,
        pricePerNight: Number(form.pricePerNight),
        capacity: Number(form.capacity),
        bedrooms: Number(form.bedrooms),
        beds: Number(form.beds),
        bathrooms: Number(form.bathrooms),
        hasTelescope: form.hasTelescope,
        hasFireplace: form.hasFireplace,
        hasPrivateDeck: form.hasPrivateDeck,
        hasKitchenette: form.hasKitchenette,
        hasHeatedFloors: form.hasHeatedFloors,
        hasWifi: form.hasWifi,
        isAvailable: form.isAvailable,
        totalUnits: Number(form.totalUnits),
        availableUnits: Number(form.availableUnits),
        altitude: form.altitude === null ? null : Number(form.altitude),
        viewDescription: form.viewDescription,
      }
      const path = editing ? `/api/admin/cottages/${initial.id}` : '/api/admin/cottages'
      await adminApi(path, { method: editing ? 'PATCH' : 'POST', body: payload })
      toast.success(editing ? 'Cottage updated' : 'Cottage created')
      onSaved()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save')
    } finally {
      setBusy(false)
    }
  }

  const checkbox = (key: keyof Cottage, label: string) => (
    <label className="flex items-center gap-2 text-sm cursor-pointer">
      <input
        type="checkbox"
        checked={Boolean(form[key])}
        onChange={() => toggle(key)}
        className="w-4 h-4 accent-emerald-600 rounded border-stone-300"
      />
      <span className="font-medium">{label}</span>
    </label>
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">{error}</div>}

      <Section title="Basic Information">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Name">
            <input className={inputCls} value={form.name} onChange={(e) => set('name', e.target.value)} required />
          </Field>
          <Field label="Price per night (ETB)">
            <input
              className={inputCls}
              type="number"
              min="1"
              step="0.01"
              value={form.pricePerNight}
              onChange={(e) => set('pricePerNight', Number(e.target.value))}
              required
            />
          </Field>
        </div>
        <Field label="Description">
          <textarea className={inputCls} rows={3} value={form.description} onChange={(e) => set('description', e.target.value)} />
        </Field>
      </Section>

      <Section title="Capacity & Layout">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Field label="Capacity">
            <input className={inputCls} type="number" min="1" value={form.capacity} onChange={(e) => set('capacity', Number(e.target.value))} />
          </Field>
          <Field label="Bedrooms">
            <input className={inputCls} type="number" min="0" value={form.bedrooms} onChange={(e) => set('bedrooms', Number(e.target.value))} />
          </Field>
          <Field label="Beds">
            <input className={inputCls} type="number" min="0" value={form.beds} onChange={(e) => set('beds', Number(e.target.value))} />
          </Field>
          <Field label="Bathrooms">
            <input className={inputCls} type="number" min="0" value={form.bathrooms} onChange={(e) => set('bathrooms', Number(e.target.value))} />
          </Field>
          <Field label="Total units">
            <input className={inputCls} type="number" min="1" value={form.totalUnits} onChange={(e) => set('totalUnits', Number(e.target.value))} />
          </Field>
          <Field label="Available units">
            <input className={inputCls} type="number" min="0" value={form.availableUnits} onChange={(e) => set('availableUnits', Number(e.target.value))} />
          </Field>
          <Field label="Altitude (m)">
            <input
              className={inputCls}
              type="number"
              placeholder="4070"
              value={form.altitude ?? ''}
              onChange={(e) => set('altitude', e.target.value === '' ? null : Number(e.target.value))}
            />
          </Field>
        </div>
      </Section>

      <Section title="Amenities & Features">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {checkbox('hasTelescope', 'Telescope')}
          {checkbox('hasFireplace', 'Fireplace')}
          {checkbox('hasPrivateDeck', 'Private deck')}
          {checkbox('hasKitchenette', 'Kitchenette')}
          {checkbox('hasHeatedFloors', 'Heated floors')}
          {checkbox('hasWifi', 'Wi-Fi')}
          {checkbox('isAvailable', 'Available for booking')}
        </div>
      </Section>

      <Section title="View Description">
        <Field label="View description">
          <textarea className={inputCls} rows={2} value={form.viewDescription ?? ''} onChange={(e) => set('viewDescription', e.target.value)} />
        </Field>
      </Section>

      <div className="flex gap-3 pt-2 border-t border-stone-100">
        <div className="flex-1">
          <SaveButton busy={busy}>{editing ? 'Save changes' : 'Create cottage'}</SaveButton>
        </div>
        <SecondaryButton type="button" onClick={onCancel}>Cancel</SecondaryButton>
      </div>

      <MediaManager entityType="cottage" entityId={initial.id} />
      <LinkManager entityType="cottage" entityId={initial.id} />
    </form>
  )
}

function formatFeatures(c: Cottage) {
  const features = [
    c.hasTelescope && 'Telescope',
    c.hasFireplace && 'Fireplace',
    c.hasPrivateDeck && 'Private deck',
    c.hasWifi && 'Wi-Fi',
  ].filter(Boolean)
  return features.length ? features.join(' · ') : '—'
}

export default function AdminCottagesPage() {
  const { data, loading, error, refresh } = useAsyncData<{ cottages: Cottage[] }>(() =>
    adminApi('/api/admin/cottages')
  )
  const [modal, setModal] = useState<{ open: boolean; cottage: Cottage | null }>({ open: false, cottage: null })
  const [search, setSearch] = useState('')

  const remove = async (id: string) => {
    await adminApi(`/api/admin/cottages/${id}`, { method: 'DELETE' })
    toast.success('Cottage deleted')
    refresh()
  }

  const filtered = data?.cottages.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.description.toLowerCase().includes(search.toLowerCase())
  ) ?? []

  const columns = [
    { key: 'name', header: 'Cottage', className: 'w-56', render: (c: Cottage) => (
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
          <Home className="w-5 h-5 text-emerald-600" />
        </div>
        <div className="min-w-0">
          <p className="font-medium truncate">{c.name}</p>
          <p className="text-xs text-stone-400">{c.bedrooms} bed · {c.bathrooms} bath · sleeps {c.capacity}</p>
        </div>
      </div>
    )},
    { key: 'price', header: 'Price/night', className: 'w-36', render: (c: Cottage) => <span className="font-medium">ETB {c.pricePerNight.toLocaleString()}</span> },
    { key: 'capacity', header: 'Capacity', className: 'w-24', render: (c: Cottage) => <span className="text-stone-600">{c.capacity} guests</span> },
    { key: 'units', header: 'Units', className: 'w-28', render: (c: Cottage) => <span className="text-stone-600">{c.availableUnits}/{c.totalUnits} available</span> },
    { key: 'features', header: 'Features', render: (c: Cottage) => <span className="text-xs text-stone-500">{formatFeatures(c)}</span> },
    { key: 'status', header: 'Status', className: 'w-32', render: (c: Cottage) => <Badge value={c.isAvailable ? 'ACTIVE' : 'INACTIVE'} /> },
    { key: 'bookings', header: 'Bookings', className: 'w-24 text-center', render: (c: Cottage) => <span className="text-stone-500">{c._count?.bookings ?? 0}</span> },
    { key: 'actions', header: 'Actions', className: 'w-48', render: (c: Cottage) => (
      <div className="flex items-center gap-2">
        <button onClick={() => setModal({ open: true, cottage: c })} className="btn btn-secondary px-3 py-1.5 text-xs">Edit</button>
        <ConfirmDeleteButton onConfirm={() => remove(c.id)} label="Delete" />
      </div>
    )},
  ]

  return (
    <div className="animate-in">
      <PageHeader
        title="Cottages"
        subtitle="Manage cottage listings and availability"
        action={
          <button onClick={() => setModal({ open: true, cottage: emptyCottage })} className="btn btn-primary">
            <Plus className="w-4 h-4" /> Add cottage
          </button>
        }
      />

      {loading && <LoadingState message="Loading cottages…" />}
      {error && <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">{error}</div>}

      <Section>
        <SearchInput value={search} onChange={setSearch} placeholder="Search cottages by name or description…" />
      </Section>

      <Section>
        <DataTable
          columns={columns}
          data={filtered}
          keyExtractor={(c) => c.id}
          emptyMessage="No cottages match your search"
          emptyIcon={<Home className="w-12 h-12 text-stone-300" />}
        />
      </Section>

      <Modal
        open={modal.open}
        onClose={() => setModal({ open: false, cottage: null })}
        title={modal.cottage?.id ? `Edit ${modal.cottage.name}` : 'Add cottage'}
        size="xl"
      >
        {modal.cottage && (
          <CottageForm
            initial={modal.cottage}
            onSaved={() => { setModal({ open: false, cottage: null }); refresh() }}
            onCancel={() => setModal({ open: false, cottage: null })}
          />
        )}
      </Modal>
    </div>
  )
}