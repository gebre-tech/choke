'use client'

import { useRef, useState } from 'react'
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
  Err,
} from '@/components/admin/ui'
import { MediaThumb, MediaViewer } from '@/components/media/MediaViewer'
import {
  MediaType,
  formatBytes,
  mediaLabel,
  type GalleryMedia,
} from '@/lib/media-shared'
import { Loader2, Plus, Upload, Link2, Pencil, Play } from 'lucide-react'

type AdminMedia = GalleryMedia & {
  scope: string
  isActive: boolean
  sortOrder: number
  sizeBytes: number | null
  cottageId: string | null
  experienceId: string | null
  productId: string | null
  cottage?: { id: string; name: string } | null
  experience?: { id: string; name: string } | null
  product?: { id: string; name: string } | null
}

type Options = { id: string; name: string }[]

const emptyMedia: AdminMedia = {
  id: '',
  title: '',
  type: 'IMAGE',
  url: '',
  provider: null,
  videoId: null,
  scope: 'GALLERY',
  isActive: true,
  sortOrder: 0,
  sizeBytes: null,
  cottageId: null,
  experienceId: null,
  productId: null,
}

function toGallery(m: AdminMedia): GalleryMedia {
  return {
    id: m.id,
    title: m.title,
    type: m.type,
    url: m.url,
    provider: m.provider,
    videoId: m.videoId,
    caption: m.caption,
    altText: m.altText,
    mimeType: m.mimeType,
  }
}

export default function AdminMediaPage() {
  const { data, loading, error, refresh } = useAsyncData<{ media: AdminMedia[] }>(() =>
    adminApi('/api/admin/media')
  )
  const [urlModal, setUrlModal] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [playing, setPlaying] = useState<GalleryMedia | null>(null)
  const [editing, setEditing] = useState<AdminMedia | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const { data: cottages } = useAsyncData<{ cottages: Options }>(() => adminApi('/api/admin/cottages'))
  const { data: experiences } = useAsyncData<{ experiences: Options }>(() => adminApi('/api/admin/experiences'))
  const { data: products } = useAsyncData<{ products: Options }>(() => adminApi('/api/admin/products'))

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setUploading(true)
    try {
      const form = new FormData()
      for (const f of Array.from(files)) form.append('files', f)
      const res = await fetch('/api/admin/media/upload', { method: 'POST', body: form })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Upload failed')
      const okCount = data.media?.length ?? 0
      if (data.failures?.length) {
        data.failures.forEach((fl: { name: string; reason: string }) =>
          toast.error(`${fl.name}: ${fl.reason}`)
        )
      }
      if (okCount > 0) {
        toast.success(okCount === 1 ? '1 file uploaded' : `${okCount} files uploaded`)
        refresh()
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Upload failed')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const remove = async (m: AdminMedia) => {
    await adminApi(`/api/admin/media/${m.id}`, { method: 'DELETE' })
    toast.success('Media deleted')
    refresh()
  }

  const toggleActive = async (m: AdminMedia) => {
    await adminApi(`/api/admin/media/${m.id}`, { method: 'PATCH', body: { isActive: !m.isActive } })
    refresh()
  }

  const kindLabel = (m: AdminMedia) => {
    if (m.cottage) return `Cottage: ${m.cottage.name}`
    if (m.experience) return `Experience: ${m.experience.name}`
    if (m.product) return `Product: ${m.product.name}`
    return null
  }

  const list = data?.media ?? []

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h2 className="text-2xl font-bold">Media Library</h2>
        <div className="flex items-center gap-2">
          <input
            ref={fileRef}
            type="file"
            multiple
            accept="image/*,video/*,audio/*"
            className="hidden"
            onChange={(e) => handleUpload(e.target.files)}
          />
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white px-4 py-2 rounded-full text-sm font-semibold"
          >
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            Upload files
          </button>
          <button
            onClick={() => setUrlModal(true)}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-full text-sm font-semibold"
          >
            <Link2 className="w-4 h-4" /> Add link
          </button>
        </div>
      </div>

      {loading && (
        <p className="flex items-center gap-2 text-stone-500">
          <Loader2 className="w-5 h-5 animate-spin" /> Loading…
        </p>
      )}
      {error && <Err message={error} />}

      {data && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {list.map((m) => {
              const attached = kindLabel(m)
              return (
                <div key={m.id} className="bg-white rounded-2xl shadow overflow-hidden">
                  <div className="relative aspect-video group">
                    <MediaThumb media={toGallery(m)} />
                    <span
                      className="absolute top-2 left-2 cursor-pointer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Badge value={m.type} />
                    </span>
                    {m.type !== 'IMAGE' && (
                      <button
                        onClick={() => setPlaying(toGallery(m))}
                        className="absolute inset-0 flex items-center justify-center group-hover:bg-black/10"
                      >
                        <span className="w-10 h-10 rounded-full bg-white/80 flex items-center justify-center">
                          <Play className="w-5 h-5 text-emerald-700 fill-emerald-700 ml-0.5" />
                        </span>
                      </button>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-semibold line-clamp-1">{m.title}</p>
                    <p className="text-xs text-stone-400">
                      {mediaLabel(m.scope)}
                      {attached ? ` · ${attached}` : ''} · {formatBytes(m.sizeBytes)}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => setPlaying(toGallery(m))}
                        className="text-xs px-2.5 py-1.5 rounded-lg border border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                      >
                        Play
                      </button>
                      <button
                        onClick={() => setEditing(m)}
                        className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-50"
                      >
                        <Pencil className="w-3 h-3" /> Edit
                      </button>
                      <button
                        onClick={() => toggleActive(m)}
                        className={`text-xs px-2.5 py-1.5 rounded-lg border ${
                          m.isActive
                            ? 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                            : 'border-stone-200 text-stone-400 hover:bg-stone-50'
                        }`}
                        title={m.isActive ? 'Visible on the gallery page' : 'Hidden from public'}
                      >
                        {m.isActive ? 'Visible' : 'Hidden'}
                      </button>
                      <ConfirmDeleteButton onConfirm={() => remove(m)} />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {list.length === 0 && (
            <p className="text-stone-400 bg-white rounded-2xl shadow p-10 text-center">
              No media yet — upload photos, videos or audio, or add a YouTube/Vimeo link.
            </p>
          )}
        </>
      )}

      <AddLinkModal
        open={urlModal}
        onClose={() => setUrlModal(false)}
        onSaved={() => {
          setUrlModal(false)
          refresh()
        }}
      />

      {editing && (
        <EditMediaModal
          media={editing}
          cottages={cottages?.cottages ?? []}
          experiences={experiences?.experiences ?? []}
          products={products?.products ?? []}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null)
            refresh()
          }}
        />
      )}

      <MediaViewer media={playing} onClose={() => setPlaying(null)} />
    </div>
  )
}

function AddLinkModal({
  open,
  onClose,
  onSaved,
}: {
  open: boolean
  onClose: () => void
  onSaved: () => void
}) {
  const empty = { ...emptyMedia, scope: 'GALLERY' }
  const [form, setForm] = useState(empty)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await adminApi('/api/admin/media', {
        method: 'POST',
        body: {
          title: form.title,
          url: form.url,
          type: form.type,
          scope: form.scope,
          caption: form.caption ?? '',
        },
      })
      toast.success('Media added')
      onSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add media')
    } finally {
      setBusy(false)
    }
  }

  if (!open) return null
  return (
    <Modal open={open} onClose={onClose} title="Add media from link">
      <form onSubmit={submit} className="space-y-4">
        {error && <Err message={error} />}
        <Field label="Link (image, video/audio file, or YouTube / Vimeo)">
          <input
            className={inputCls}
            value={form.url}
            onChange={(e) => set('url', e.target.value)}
            placeholder="https://…"
            required
          />
        </Field>
        <Field label="Title">
          <input className={inputCls} value={form.title} onChange={(e) => set('title', e.target.value)} />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Type">
            <select
              className={inputCls}
              value={form.type}
              onChange={(e) => set('type', e.target.value as MediaType)}
            >
              <option value="IMAGE">Image</option>
              <option value="VIDEO">Video</option>
              <option value="AUDIO">Audio</option>
            </select>
          </Field>
          <Field label="Section">
            <select
              className={inputCls}
              value={form.scope}
              onChange={(e) => set('scope', e.target.value)}
            >
              <option value="GALLERY">Public gallery</option>
              <option value="COTTAGE">Cottage</option>
              <option value="EXPERIENCE">Experience</option>
              <option value="PRODUCT">Product</option>
            </select>
          </Field>
        </div>
        <Field label="Caption (optional)">
          <input className={inputCls} value={form.caption ?? ''} onChange={(e) => set('caption', e.target.value)} />
        </Field>
        <SaveButton busy={busy}>Add media</SaveButton>
      </form>
    </Modal>
  )
}

function EditMediaModal({
  media,
  cottages,
  experiences,
  products,
  onClose,
  onSaved,
}: {
  media: AdminMedia
  cottages: Options
  experiences: Options
  products: Options
  onClose: () => void
  onSaved: () => void
}) {
  const [form, setForm] = useState<AdminMedia>(media)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const set = <K extends keyof AdminMedia>(k: K, v: AdminMedia[K]) =>
    setForm((f) => ({ ...f, [k]: v }))

  const attachKind = form.cottageId ? 'cottage' : form.experienceId ? 'experience' : form.productId ? 'product' : 'none'
  const options: Options = attachKind === 'cottage' ? cottages : attachKind === 'experience' ? experiences : attachKind === 'product' ? products : []
  const attachId = attachKind === 'cottage' ? form.cottageId : attachKind === 'experience' ? form.experienceId : attachKind === 'product' ? form.productId : ''

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const payload: Record<string, unknown> = {
        title: form.title,
        caption: form.caption ?? '',
        altText: form.altText ?? '',
        sortOrder: Number(form.sortOrder),
        cottageId: null,
        experienceId: null,
        productId: null,
      }
      if (attachKind === 'cottage') payload.cottageId = attachId || null
      if (attachKind === 'experience') payload.experienceId = attachId || null
      if (attachKind === 'product') payload.productId = attachId || null
      await adminApi(`/api/admin/media/${media.id}`, { method: 'PATCH', body: payload })
      toast.success('Media updated')
      onSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal open onClose={onClose} title={`Edit: ${media.title}`}>
      <form onSubmit={submit} className="space-y-4">
        {error && <Err message={error} />}
        <div className="grid grid-cols-2 gap-4">
          <Field label="Title">
            <input className={inputCls} value={form.title} onChange={(e) => set('title', e.target.value)} required />
          </Field>
          <Field label="Sort order">
            <input
              className={inputCls}
              type="number"
              value={form.sortOrder}
              onChange={(e) => set('sortOrder', Number(e.target.value))}
            />
          </Field>
        </div>
        <Field label="Caption">
          <input className={inputCls} value={form.caption ?? ''} onChange={(e) => set('caption', e.target.value)} />
        </Field>
        <Field label="Alt text (accessibility)">
          <input className={inputCls} value={form.altText ?? ''} onChange={(e) => set('altText', e.target.value)} />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Type">
            <select className={inputCls} value={form.type} onChange={(e) => set('type', e.target.value as MediaType)}>
              <option value="IMAGE">Image</option>
              <option value="VIDEO">Video</option>
              <option value="AUDIO">Audio</option>
            </select>
          </Field>
          <Field label="Visible on public gallery">
            <select
              className={inputCls}
              value={form.isActive ? 'yes' : 'no'}
              onChange={(e) => set('isActive', e.target.value === 'yes')}
            >
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </Field>
        </div>
        <Field label="Attach to">
          <select
            className={inputCls}
            value={attachKind}
            onChange={(e) => {
              const k = e.target.value
              set('cottageId', k === 'cottage' ? cottages[0]?.id ?? null : null)
              set('experienceId', k === 'experience' ? experiences[0]?.id ?? null : null)
              set('productId', k === 'product' ? products[0]?.id ?? null : null)
            }}
          >
            <option value="none">Nothing (public gallery)</option>
            <option value="cottage">Cottage</option>
            <option value="experience">Experience</option>
            <option value="product">Product</option>
          </select>
        </Field>
        {attachKind !== 'none' && (
          <Field label={`Select ${attachKind}`}>
            <select
              className={inputCls}
              value={attachId ?? ''}
              onChange={(e) => {
                if (attachKind === 'cottage') set('cottageId', e.target.value || null)
                if (attachKind === 'experience') set('experienceId', e.target.value || null)
                if (attachKind === 'product') set('productId', e.target.value || null)
              }}
            >
              {options.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </select>
          </Field>
        )}
        <div className="flex gap-3">
          <div className="flex-1">
            <SaveButton busy={busy}>Save changes</SaveButton>
          </div>
          <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-xl border border-stone-300 text-stone-600">
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  )
}