'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import { adminApi, useAsyncData, Modal, Field, inputCls, Err, SaveButton } from '@/components/admin/ui'
import { Loader2, Plus, X, ExternalLink, Edit2, Trash2, GripVertical } from 'lucide-react'

const LINK_TYPES = ['WEBSITE', 'BOOKING', 'PURCHASE', 'LOCATION', 'SOCIAL', 'VIDEO', 'OTHER'] as const

const ID_KEY = {
  cottage: 'cottageId',
  experience: 'experienceId',
  product: 'productId',
} as const

const LINK_TYPE_LABELS: Record<string, string> = {
  WEBSITE: 'Website',
  BOOKING: 'Booking',
  PURCHASE: 'Purchase',
  LOCATION: 'Location',
  SOCIAL: 'Social Media',
  VIDEO: 'Video',
  OTHER: 'Other',
}

type LinkRow = {
  id: string
  type: string
  title: string
  url: string
  description: string | null
  openInNewTab: boolean
  sortOrder: number
  isActive: boolean
  cottageId: string | null
  experienceId: string | null
  productId: string | null
  cottage?: { id: string; name: string } | null
  experience?: { id: string; name: string } | null
  product?: { id: string; name: string } | null
  createdAt: string
}

export default function LinkManager({
  entityType,
  entityId,
}: {
  entityType: keyof typeof ID_KEY
  entityId: string
}) {
  const idKey = ID_KEY[entityType]
  const { data, loading, refresh } = useAsyncData<{ links: LinkRow[] }>(() =>
    adminApi(`/api/admin/links?${idKey}=${entityId}`)
  )
  const [modal, setModal] = useState<{ open: boolean; link: LinkRow | null }>({ open: false, link: null })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  if (!entityId) {
    return (
      <div className="border-t border-stone-200 pt-4">
        <p className="text-xs text-stone-400">
          Save this item first, then you can add external links.
        </p>
      </div>
    )
  }

  const links = data?.links ?? []

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const formData = new FormData(e.currentTarget)
      const payload: Record<string, unknown> = {
        type: formData.get('type'),
        title: formData.get('title'),
        url: formData.get('url'),
        description: formData.get('description') || null,
        openInNewTab: formData.get('openInNewTab') === 'on',
        sortOrder: Number(formData.get('sortOrder') ?? 0),
        [idKey]: entityId,
      }
      const path = modal.link ? `/api/admin/links/${modal.link.id}` : '/api/admin/links'
      await adminApi(path, { method: modal.link ? 'PATCH' : 'POST', body: payload })
      toast.success(modal.link ? 'Link updated' : 'Link added')
      setModal({ open: false, link: null })
      refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save')
    } finally {
      setBusy(false)
    }
  }

  const openEdit = (link: LinkRow) => setModal({ open: true, link })
  const openCreate = () => setModal({ open: true, link: null })

  const remove = async (id: string) => {
    if (!confirm('Delete this link?')) return
    setBusy(true)
    try {
      await adminApi(`/api/admin/links/${id}`, { method: 'DELETE' })
      toast.success('Link deleted')
      refresh()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Delete failed')
    } finally {
      setBusy(false)
    }
  }

  const reorder = async (fromIdx: number, toIdx: number) => {
    if (fromIdx === toIdx) return
    const newLinks = [...links]
    const [moved] = newLinks.splice(fromIdx, 1)
    newLinks.splice(toIdx, 0, moved)
    setBusy(true)
    try {
      for (let i = 0; i < newLinks.length; i++) {
        if (newLinks[i].sortOrder !== i) {
          await adminApi(`/api/admin/links/${newLinks[i].id}`, {
            method: 'PATCH',
            body: { sortOrder: i },
          })
        }
      }
      refresh()
    } catch (e) {
      toast.error('Reorder failed')
    } finally {
      setBusy(false)
    }
  }

  const defaultSort = links.length

  return (
    <div className="border-t border-stone-200 pt-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold">External Links</span>
        <button type="button" onClick={openCreate} className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border border-emerald-200 text-emerald-700 hover:bg-emerald-50">
          <Plus className="w-3 h-3" /> Add link
        </button>
      </div>

      {error && <Err message={error} />}
      {loading && <p className="text-xs text-stone-400 flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Loading…</p>}
      {links.length === 0 && !loading && <p className="text-xs text-stone-400">No links added yet.</p>}

      <div className="space-y-2">
        {links.map((link, i) => (
          <div key={link.id} className="border border-stone-200 rounded-xl p-3">
            <div className="flex items-start gap-3">
              <button
                type="button"
                onMouseDown={() => { /* prevent drag on button */ }}
                className="text-stone-300 hover:text-stone-500 cursor-grab active:cursor-grabbing self-start pt-1"
                title="Drag to reorder"
              >
                <GripVertical className="w-4 h-4" />
              </button>
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-100 text-emerald-700">
                    {LINK_TYPE_LABELS[link.type] ?? link.type}
                  </span>
                  {!link.isActive && <span className="text-[10px] text-stone-400">(inactive)</span>}
                </div>
                <p className="font-medium line-clamp-1">{link.title}</p>
                <p className="text-sm text-stone-500 truncate">{link.url}</p>
                {link.description && <p className="text-xs text-stone-400 line-clamp-2">{link.description}</p>}
                <div className="flex items-center gap-3 text-[11px] text-stone-400">
                  <label className="flex items-center gap-1">
                    <input type="checkbox" checked={link.openInNewTab} disabled className="w-3 h-3" />
                    Open in new tab
                  </label>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button type="button" onClick={() => openEdit(link)} className="text-stone-400 hover:text-emerald-600 p-1" title="Edit"><Edit2 className="w-4 h-4" /></button>
                <button type="button" onClick={() => remove(link.id)} className="text-stone-400 hover:text-red-600 p-1" title="Delete"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {modal.open && (
        <Modal open onClose={() => setModal({ open: false, link: null })} title={modal.link ? 'Edit link' : 'Add link'}>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <Err message={error} />}
            <Field label="Link type">
              <select {...{ className: inputCls, name: 'type', defaultValue: modal.link?.type || 'WEBSITE', disabled: busy }} required>
                {LINK_TYPES.map((t) => <option key={t} value={t}>{LINK_TYPE_LABELS[t]}</option>)}
              </select>
            </Field>
            <Field label="Title">
              <input {...{ className: inputCls, name: 'title', defaultValue: modal.link?.title || '', required: true }} />
            </Field>
            <Field label="URL">
              <input {...{ className: inputCls, name: 'url', type: 'url', defaultValue: modal.link?.url || '', required: true, placeholder: 'https://example.com' }} />
            </Field>
            <Field label="Description (optional)">
              <textarea {...{ className: inputCls, name: 'description', defaultValue: modal.link?.description || '', rows: 2, placeholder: 'Brief description of this link' }} />
            </Field>
            <Field label="Sort order">
              <input {...{ className: inputCls, name: 'sortOrder', type: 'number', min: '0', defaultValue: modal.link?.sortOrder ?? defaultSort }} />
            </Field>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" name="openInNewTab" defaultChecked={modal.link?.openInNewTab !== false} />
              Open in new tab
            </label>
            <div className="flex gap-3 pt-2">
              <div className="flex-1"><SaveButton busy={busy}>{modal.link ? 'Save changes' : 'Add link'}</SaveButton></div>
              <button type="button" onClick={() => setModal({ open: false, link: null })} className="px-6 py-2.5 rounded-xl border border-stone-300 text-stone-600">Cancel</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}