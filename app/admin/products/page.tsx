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
import { Loader2, Plus, Image, Trash2, ChevronDown, ChevronUp, Package } from 'lucide-react'
import MediaManager from '@/components/admin/MediaManager'
import LinkManager from '@/components/admin/LinkManager'
import { Select } from '@/components/admin/ui'

type Product = {
  id: string
  name: string
  description: string
  price: number
  category: string
  stock: number
  minimumStock: number
  producerName: string
  producerLocation: string
  isOrganic: boolean
  weight: number | null
  isActive: boolean
  published?: boolean
  publicationStatus?: string
  rejectionReason?: string | null
  submittedBy?: { id: string; email: string } | null
  _count?: { orderItems: number }
  media?: {
    id: string
    title: string
    type: string
    url: string
    scope: string
    sortOrder: number
    isActive: boolean
  }[]
}

const CATEGORIES = ['HONEY', 'COFFEE', 'CRAFTS', 'SPICES', 'BAMBOO']

const emptyProduct: Product = {
  id: '',
  name: '',
  description: '',
  price: 0,
  category: 'HONEY',
  stock: 0,
  minimumStock: 5,
  producerName: 'Taeme Abakidan Community',
  producerLocation: 'Dega Damot, Ethiopia',
  isOrganic: true,
  weight: null,
  isActive: true,
}

function ProductForm({
  initial,
  onSaved,
  onCancel,
}: {
  initial: Product
  onSaved: () => void
  onCancel: () => void
}) {
  const [form, setForm] = useState<Product>(initial)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const editing = Boolean(initial.id)

  const set = <K extends keyof Product>(key: K, value: Product[K]) =>
    setForm((f) => ({ ...f, [key]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const payload = {
        name: form.name,
        description: form.description,
        price: Number(form.price),
        category: form.category,
        stock: Number(form.stock),
        minimumStock: Number(form.minimumStock),
        producerName: form.producerName,
        producerLocation: form.producerLocation,
        isOrganic: form.isOrganic,
        weight: form.weight === null || form.weight === 0 ? null : Number(form.weight),
        isActive: form.isActive,
      }
      const path = editing ? `/api/admin/products/${initial.id}` : '/api/admin/products'
      await adminApi(path, { method: editing ? 'PATCH' : 'POST', body: payload })
      toast.success(editing ? 'Product updated' : 'Product created')
      onSaved()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save')
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <Err message={error} />}

      <Section title="Basic Information">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Name">
            <input className={inputCls} value={form.name} onChange={(e) => set('name', e.target.value)} required />
          </Field>
          <Field label="Price (ETB)">
            <input
              className={inputCls}
              type="number"
              min="1"
              step="0.01"
              value={form.price}
              onChange={(e) => set('price', Number(e.target.value))}
              required
            />
          </Field>
          <Field label="Category">
            <Select value={form.category} onChange={(e) => set('category', e.target.value)} required>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </Select>
          </Field>
          <Field label="Producer">
            <input className={inputCls} value={form.producerName} onChange={(e) => set('producerName', e.target.value)} />
          </Field>
          <Field label="Producer location">
            <input className={inputCls} value={form.producerLocation} onChange={(e) => set('producerLocation', e.target.value)} />
          </Field>
          <Field label="Weight (kg)" hint="Leave 0 for none">
            <input
              className={inputCls}
              type="number"
              min="0"
              step="0.01"
              value={form.weight ?? 0}
              onChange={(e) => set('weight', Number(e.target.value))}
            />
          </Field>
          <Field label="Stock">
            <input className={inputCls} type="number" min="0" value={form.stock} onChange={(e) => set('stock', Number(e.target.value))} />
          </Field>
          <Field label="Minimum stock (low-stock alert)">
            <input className={inputCls} type="number" min="0" value={form.minimumStock} onChange={(e) => set('minimumStock', Number(e.target.value))} />
          </Field>
        </div>
      </Section>

      <Section title="Description">
        <Field label="Description">
          <textarea className={inputCls} rows={3} value={form.description} onChange={(e) => set('description', e.target.value)} />
        </Field>
      </Section>

      <Section title="Settings">
        <div className="grid sm:grid-cols-2 gap-4">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={form.isOrganic} onChange={(e) => set('isOrganic', e.target.checked)} className="w-4 h-4 accent-emerald-600 rounded border-stone-300" />
            <span className="font-medium">Organic</span>
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={form.isActive} onChange={(e) => set('isActive', e.target.checked)} className="w-4 h-4 accent-emerald-600 rounded border-stone-300" />
            <span className="font-medium">Active (visible in marketplace)</span>
          </label>
        </div>
      </Section>

      <div className="flex gap-3 pt-2 border-t border-stone-100">
        <div className="flex-1">
          <SaveButton busy={busy}>{editing ? 'Save changes' : 'Create product'}</SaveButton>
        </div>
        <SecondaryButton type="button" onClick={onCancel}>Cancel</SecondaryButton>
      </div>

      <MediaManager entityType="product" entityId={initial.id} />
      <LinkManager entityType="product" entityId={initial.id} />
    </form>
  )
}

function formatMedia(media: Product['media']) {
  if (!media?.length) return '—'
  const images = media.filter((m) => m.type === 'IMAGE' && m.isActive)
  const extra = media.length - images.length
  return (
    <span title={media.map((m) => `${m.title} (${m.type})`).join('\n')}>
      {images.length} photo{images.length === 1 ? '' : 's'}
      {extra > 0 && <span className="text-stone-400"> +{extra} video/audio</span>}
    </span>
  )
}

function formatStatus(p: Product) {
  const status = p.publicationStatus ?? 'PUBLISHED'
  const fromSubmission = Boolean(p.submittedBy)
  return (
    <div className="flex flex-col gap-1.5">
      {status === 'PUBLISHED' ? (
        <Badge value="PUBLISHED" />
      ) : status === 'REJECTED' ? (
        <span title={p.rejectionReason ?? ''}><Badge value="REJECTED" /></span>
      ) : (
        <Badge value="PENDING" />
      )}
      {fromSubmission && <span className="text-[10px] text-stone-400">via submission</span>}
    </div>
  )
}

export default function AdminProductsPage() {
  const { data, loading, error, refresh } = useAsyncData<{ products: Product[] }>(() =>
    adminApi('/api/admin/products')
  )
  const [modal, setModal] = useState<{ open: boolean; product: Product | null }>({ open: false, product: null })
  const [search, setSearch] = useState('')
  const [modBusy, setModBusy] = useState(false)

  const remove = async (id: string) => {
    await adminApi(`/api/admin/products/${id}`, { method: 'DELETE' })
    toast.success('Product deleted')
    refresh()
  }

  const moderate = async (id: string, status: 'PUBLISHED' | 'REJECTED') => {
    const rejectionReason =
      status === 'REJECTED'
        ? (window.prompt('Reason for rejection (optional)') ?? '').trim()
        : ''
    setModBusy(true)
    try {
      await adminApi(`/api/admin/submissions/${id}`, {
        method: 'PUT',
        body: { entity: 'PRODUCT', status, rejectionReason },
      })
      toast.success(status === 'PUBLISHED' ? 'Listing published' : 'Listing rejected')
      refresh()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Moderation failed')
    } finally {
      setModBusy(false)
    }
  }

  const filteredProducts = data?.products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase()) ||
    p.producerName.toLowerCase().includes(search.toLowerCase())
  ) ?? []

  const columns = [
    { key: 'product', header: 'Product', className: 'w-64', render: (p: Product) => (
      <div className="flex items-center gap-3">
        {p.media?.find((m) => m.type === 'IMAGE' && m.isActive)?.url ? (
          <img src={p.media!.find((m) => m.type === 'IMAGE' && m.isActive)!.url} alt="" className="w-12 h-12 rounded-lg object-cover" />
        ) : (
          <div className="w-12 h-12 rounded-lg bg-stone-100 flex items-center justify-center">
            <Package className="w-6 h-6 text-stone-300" />
          </div>
        )}
        <div className="min-w-0">
          <p className="font-medium truncate">{p.name}</p>
          {p.submittedBy && <p className="text-[10px] text-stone-400">submitted by {p.submittedBy?.email}</p>}
        </div>
      </div>
    )},
    { key: 'category', header: 'Category', render: (p: Product) => <Badge value={p.category} /> },
    { key: 'price', header: 'Price', render: (p: Product) => <span className="font-medium">ETB {p.price.toLocaleString()}</span> },
    { key: 'stock', header: 'Stock', className: 'w-32', render: (p: Product) => {
      const low = p.stock <= p.minimumStock
      return <span className={`font-semibold ${low ? 'text-red-600' : ''}`}>{p.stock}{low && <span className="text-xs font-normal text-red-500 ml-1">(low)</span>}</span>
    }},
    { key: 'media', header: 'Media', render: (p: Product) => formatMedia(p.media) },
    { key: 'status', header: 'Status', className: 'w-40', render: (p: Product) => formatStatus(p) },
    { key: 'producer', header: 'Producer', className: 'w-40', render: (p: Product) => <span className="text-sm text-stone-500">{p.producerName}</span> },
    { key: 'orders', header: 'Orders', className: 'w-24 text-center', render: (p: Product) => <span className="text-stone-500">{p._count?.orderItems ?? 0}</span> },
    { key: 'actions', header: 'Actions', className: 'w-56', render: (p: Product) => (
      <div className="flex items-center gap-2">
        <button
          onClick={() => setModal({ open: true, product: p })}
          className="btn btn-secondary px-3 py-1.5 text-xs"
        >
          Edit
        </button>
        <ConfirmDeleteButton onConfirm={() => remove(p.id)} label="Delete" />
      </div>
    )},
  ]

  return (
    <div className="animate-in">
      <PageHeader
        title="Products"
        subtitle="Manage marketplace products and community submissions"
        action={
          <button
            onClick={() => setModal({ open: true, product: emptyProduct })}
            className="btn btn-primary"
          >
            <Plus className="w-4 h-4" />
            Add product
          </button>
        }
      />

      {loading && <LoadingState message="Loading products…" />}

      {error && <Err message={error} />}

      <Section>
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search products by name, category, or producer…"
        />
      </Section>

      <Section>
        <DataTable
          columns={columns}
          data={filteredProducts}
          keyExtractor={(p) => p.id}
          emptyMessage="No products match your search"
          emptyIcon={<Package className="w-12 h-12 text-stone-300" />}
        />
      </Section>

      <Modal
        open={modal.open}
        onClose={() => setModal({ open: false, product: null })}
        title={modal.product?.id ? `Edit ${modal.product.name}` : 'Add product'}
        size="xl"
      >
        {modal.product && (
          <ProductForm
            initial={modal.product}
            onSaved={() => {
              setModal({ open: false, product: null })
              refresh()
            }}
            onCancel={() => setModal({ open: false, product: null })}
          />
        )}
      </Modal>
    </div>
  )
}