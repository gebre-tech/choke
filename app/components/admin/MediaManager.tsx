'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import { adminApi, useAsyncData, Modal, Field, inputCls, Err } from '@/components/admin/ui'
import { MediaThumb } from '@/components/media/MediaViewer'
import { mediaLabel, type GalleryMedia } from '@/lib/media-shared'
import { Loader2, Plus, X, Image as ImageIcon, Star, ChevronUp, ChevronDown, Edit2, FileText } from 'lucide-react'

type MediaRow = GalleryMedia & {
  scope: string
  cottageId: string | null
  experienceId: string | null
  productId: string | null
  sortOrder?: number
  altText?: string | null
  caption?: string | null
}

const ID_KEY = {
  cottage: 'cottageId',
  experience: 'experienceId',
  product: 'productId',
} as const

export default function MediaManager({
  entityType,
  entityId,
}: {
  entityType: keyof typeof ID_KEY
  entityId: string
}) {
  const idKey = ID_KEY[entityType]
  const { data, loading, refresh } = useAsyncData<{ media: MediaRow[] }>(() =>
    adminApi('/api/admin/media')
  )
  const [picker, setPicker] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)
  const [editing, setEditing] = useState<MediaRow | null>(null)

  if (!entityId) {
    return (
      <div className="border-t border-stone-200 pt-4">
        <p className="text-xs text-stone-400">
          Save this item first, then you can add photos, videos and audio from the media library.
        </p>
      </div>
    )
  }

  const all = data?.media ?? []
  const attached = all
    .filter((m) => m[idKey] === entityId)
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
  const available = all.filter((m) => m[idKey] !== entityId)

  const patch = async (m: MediaRow, body: Record<string, unknown>) => {
    setBusy(true)
    setError('')
    try {
      await adminApi(`/api/admin/media/${m.id}`, { method: 'PATCH', body })
      refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Update failed')
    } finally {
      setBusy(false)
    }
  }

  const makeCover = async (m: MediaRow) => {
    const minSort = Math.min(...attached.map((x) => x.sortOrder ?? 0))
    await patch(m, { sortOrder: minSort - 1 })
    toast.success(`"${m.title}" is now the cover`)
  }

  const move = async (m: MediaRow, dir: -1 | 1) => {
    const idx = attached.findIndex((x) => x.id === m.id)
    const neighbor = attached[idx + dir]
    if (!neighbor) return
    const a = m.sortOrder ?? 0
    const b = neighbor.sortOrder ?? 0
    setBusy(true)
    setError('')
    try {
      await adminApi(`/api/admin/media/${neighbor.id}`, { method: 'PATCH', body: { sortOrder: a } })
      await adminApi(`/api/admin/media/${m.id}`, { method: 'PATCH', body: { sortOrder: b } })
      refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Reorder failed')
    } finally {
      setBusy(false)
    }
  }

  const attach = async (m: MediaRow) => {
    setBusy(true)
    setError('')
    try {
      await adminApi(`/api/admin/media/${m.id}`, { method: 'PATCH', body: { [idKey]: entityId } })
      toast.success(`Attached "${m.title}"`)
      refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Attach failed')
    } finally {
      setBusy(false)
    }
  }

  const detach = async (m: MediaRow) => {
    setBusy(true)
    setError('')
    try {
      await adminApi(`/api/admin/media/${m.id}`, { method: 'PATCH', body: { [idKey]: null } })
      toast.success('Removed')
      refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to remove')
    } finally {
      setBusy(false)
    }
  }

  const uploadThenAttach = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setUploading(true)
    setError('')
    try {
      const form = new FormData()
      for (const f of Array.from(files)) form.append('files', f)
      const res = await fetch('/api/admin/media/upload', { method: 'POST', body: form })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Upload failed')
      const created: { id: string }[] = data.media ?? []
      for (const c of created) {
        await adminApi(`/api/admin/media/${c.id}`, { method: 'PATCH', body: { [idKey]: entityId } })
      }
      toast.success(`${created.length} file(s) uploaded & attached`)
      refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleMediaEdit = async (e: React.FormEvent<HTMLFormElement>, media: MediaRow) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const formData = new FormData(e.currentTarget)
      await adminApi(`/api/admin/media/${media.id}`, {
        method: 'PATCH',
        body: {
          title: formData.get('title'),
          altText: formData.get('altText') || null,
          caption: formData.get('caption') || null,
        },
      })
      toast.success('Media updated')
      setEditing(null)
      refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Update failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="border-t border-stone-200 pt-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold">Media</span>
        <button
          type="button"
          onClick={() => setPicker(true)}
          className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border border-emerald-200 text-emerald-700 hover:bg-emerald-50"
        >
          <Plus className="w-3 h-3" /> Add media
        </button>
      </div>

      {error && <Err message={error} />}

      {loading && (
        <p className="text-xs text-stone-400 flex items-center gap-1">
          <Loader2 className="w-3 h-3 animate-spin" /> Loading…
        </p>
      )}

      {attached.length === 0 && !loading && (
        <p className="text-xs text-stone-400">
          No media attached yet — add photos, videos or audio from the library.
        </p>
      )}

      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {attached.map((m, i) => (
          <div key={m.id} className="relative group rounded-lg overflow-hidden">
            <div className="aspect-square">
              <MediaThumb media={m} />
            </div>
            {i === 0 && attached.length > 1 && (
              <span className="absolute top-1 left-1 text-[9px] font-bold bg-amber-400 text-amber-900 px-1.5 py-0.5 rounded-full">
                Cover
              </span>
            )}
            <span className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1 p-1.5 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity">
              {m.type === 'IMAGE' && i > 0 ? (
                <button
                  type="button"
                  onClick={() => makeCover(m)}
                  disabled={busy}
                  className="w-5 h-5 rounded bg-white/20 hover:bg-white/40 text-white flex items-center justify-center"
                  title="Make cover"
                >
                  <Star className="w-3 h-3" />
                </button>
              ) : (
                <span />
              )}
              <button
                type="button"
                onClick={() => move(m, -1)}
                disabled={busy || i === 0}
                className="w-5 h-5 rounded bg-white/20 hover:bg-white/40 text-white flex items-center justify-center disabled:opacity-30"
                title="Move earlier"
              >
                <ChevronUp className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={() => move(m, 1)}
                disabled={busy || i === attached.length - 1}
                className="w-5 h-5 rounded bg-white/20 hover:bg-white/40 text-white flex items-center justify-center disabled:opacity-30"
                title="Move later"
              >
                <ChevronDown className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={() => setEditing(m)}
                disabled={busy}
                className="w-5 h-5 rounded bg-white/20 hover:bg-white/40 text-white flex items-center justify-center"
                title="Edit details"
              >
                <FileText className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={() => detach(m)}
                disabled={busy}
                className="w-5 h-5 rounded bg-red-500/80 hover:bg-red-500 text-white flex items-center justify-center"
                title="Remove"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          </div>
        ))}
      </div>

      {picker && (
        <Modal open onClose={() => setPicker(false)} title={`Add media to this ${entityType}`}>
          <div className="space-y-4">
            <label className="flex items-center gap-2 text-sm px-4 py-3 rounded-xl border border-dashed border-emerald-300 bg-emerald-50 text-emerald-800 cursor-pointer hover:bg-emerald-100">
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Upload new file(s) and attach
              <input
                type="file"
                multiple
                accept="image/*,video/*,audio/*"
                className="hidden"
                onChange={(e) => uploadThenAttach(e.target.files)}
                disabled={uploading}
              />
            </label>

            {available.length === 0 ? (
              <p className="text-sm text-stone-400">
                No other media in the library — upload files above or add links from the Media page.
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-80 overflow-y-auto">
                {available.map((m) => (
                  <div key={m.id} className="rounded-xl border border-stone-200 overflow-hidden">
                    <div className="aspect-video">
                      <MediaThumb media={m} />
                    </div>
                    <div className="p-2 space-y-1">
                      <p className="text-xs font-semibold line-clamp-1">{m.title}</p>
                      <p className="text-[10px] text-stone-400">{mediaLabel(m.scope)}</p>
                      <button
                        type="button"
                        onClick={() => attach(m)}
                        disabled={busy}
                        className="w-full text-xs px-2 py-1 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-50"
                      >
                        Attach
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <p className="text-[11px] text-stone-400 flex items-center gap-1">
              <ImageIcon className="w-3 h-3" /> You can edit titles, captions and attachments anytime in Admin → Media.
            </p>
          </div>
        </Modal>
      )}

      {editing && (
        <Modal open onClose={() => setEditing(null)} title="Edit media details">
          <form onSubmit={(e) => handleMediaEdit(e, editing!)} className="space-y-4">
            {error && <Err message={error} />}
            <Field label="Title">
              <input {...{ className: inputCls, name: 'title', defaultValue: editing.title, required: true }} />
            </Field>
            <Field label="Alt text (for accessibility)">
              <input {...{ className: inputCls, name: 'altText', defaultValue: editing.altText || '', placeholder: 'Brief description for screen readers' }} />
            </Field>
            <Field label="Caption (shown on detail page)">
              <textarea {...{ className: inputCls, name: 'caption', defaultValue: editing.caption || '', rows: 2, placeholder: 'Optional caption displayed with the media' }} />
            </Field>
            <div className="flex gap-3 pt-2">
              <div className="flex-1"><button type="submit" disabled={busy} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2 px-4 rounded-xl disabled:opacity-50">{busy ? 'Saving…' : 'Save'}</button></div>
              <button type="button" onClick={() => setEditing(null)} className="px-6 py-2.5 rounded-xl border border-stone-300 text-stone-600">Cancel</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}