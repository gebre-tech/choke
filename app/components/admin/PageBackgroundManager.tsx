'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import { adminApi, useAsyncData, Modal, Field, inputCls, Err, Badge } from '@/components/admin/ui'
import { MediaThumb } from '@/components/media/MediaViewer'
import { Loader2, Plus, X, Image as ImageIcon, Film, Edit2, Trash2, ChevronUp, ChevronDown, Star, LayoutDashboard, ShoppingBag, Home } from 'lucide-react'

type PageBackground = {
  id: string
  title: string
  type: 'IMAGE' | 'VIDEO' | 'AUDIO'
  url: string
  provider: string | null
  videoId: string | null
  altText: string | null
  caption: string | null
  sortOrder: number
  isActive: boolean
  page: string
  section: string | null
}

const PAGES = [
  { id: 'home', label: 'Homepage', icon: Home },
  { id: 'marketplace', label: 'Marketplace', icon: ShoppingBag },
  { id: 'booking', label: 'Booking', icon: LayoutDashboard },
]

const SECTIONS: Record<string, { id: string; label: string }[]> = {
  home: [
    { id: 'hero', label: 'Hero Section' },
    { id: 'cottages', label: 'Cottages Section' },
    { id: 'experiences', label: 'Experiences Section' },
    { id: 'marketplace-preview', label: 'Marketplace Preview' },
  ],
  marketplace: [
    { id: 'hero', label: 'Hero Section' },
    { id: 'experiences', label: 'Experiences Section' },
    { id: 'products', label: 'Products Section' },
  ],
  booking: [
    { id: 'hero', label: 'Hero Section' },
    { id: 'form', label: 'Booking Form' },
  ],
}

export default function PageBackgroundManager() {
  const { data, loading, refresh } = useAsyncData<{ backgrounds: PageBackground[] }>(() =>
    adminApi('/api/admin/page-backgrounds')
  )
  const [picker, setPicker] = useState(false)
  const [editing, setEditing] = useState<PageBackground | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)
  const [selectedPage, setSelectedPage] = useState('home')
  const [selectedSection, setSelectedSection] = useState('hero')

  const all = data?.backgrounds ?? []
  const filtered = all.filter((m) => m.page === selectedPage && m.section === selectedSection)
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))

  const patch = async (m: PageBackground, body: Record<string, unknown>) => {
    setBusy(true)
    setError('')
    try {
      await adminApi(`/api/admin/page-backgrounds/${m.id}`, { method: 'PATCH', body })
      refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Update failed')
    } finally {
      setBusy(false)
    }
  }

  const move = async (m: PageBackground, dir: -1 | 1) => {
    const idx = filtered.findIndex((x) => x.id === m.id)
    const neighbor = filtered[idx + dir]
    if (!neighbor) return
    const a = m.sortOrder ?? 0
    const b = neighbor.sortOrder ?? 0
    setBusy(true)
    setError('')
    try {
      await adminApi(`/api/admin/page-backgrounds/${neighbor.id}`, { method: 'PATCH', body: { sortOrder: a } })
      await adminApi(`/api/admin/page-backgrounds/${m.id}`, { method: 'PATCH', body: { sortOrder: b } })
      refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Reorder failed')
    } finally {
      setBusy(false)
    }
  }

  const makePrimary = async (m: PageBackground) => {
    const minSort = Math.min(...filtered.map((x) => x.sortOrder ?? 0))
    await patch(m, { sortOrder: minSort - 1 })
    toast.success(`"${m.title}" is now the primary background`)
  }

  const handleDelete = async (m: PageBackground) => {
    setBusy(true)
    setError('')
    try {
      await adminApi(`/api/admin/page-backgrounds/${m.id}`, { method: 'DELETE' })
      toast.success('Background deleted')
      refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Delete failed')
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
        await adminApi(`/api/admin/page-backgrounds/${c.id}`, {
          method: 'PATCH',
          body: { page: selectedPage, section: selectedSection },
        })
      }
      toast.success(`${created.length} file(s) uploaded & attached`)
      refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleEdit = async (e: React.FormEvent<HTMLFormElement>, media: PageBackground) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const formData = new FormData(e.currentTarget)
      await adminApi(`/api/admin/page-backgrounds/${media.id}`, {
        method: 'PATCH',
        body: {
          title: formData.get('title'),
          altText: formData.get('altText') || null,
          caption: formData.get('caption') || null,
          page: formData.get('page'),
          section: formData.get('section') || null,
        },
      })
      toast.success('Background updated')
      setEditing(null)
      refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Update failed')
    } finally {
      setBusy(false)
    }
  }

  if (loading) {
    return (
      <p className="text-xs text-stone-400 flex items-center gap-1">
        <Loader2 className="w-3 h-3 animate-spin" /> Loading…
      </p>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <h2 className="text-xl font-bold">Page Backgrounds</h2>
        <p className="text-sm text-stone-500">Manage multimedia backgrounds for each page section</p>
      </div>

      {error && <Err message={error} />}

      <div className="bg-white rounded-2xl shadow p-4 space-y-4">
        <div className="flex flex-wrap gap-2">
          {PAGES.map((page) => {
            const Icon = page.icon
            return (
              <button
                key={page.id}
                onClick={() => {
                  setSelectedPage(page.id)
                  setSelectedSection(SECTIONS[page.id]?.[0]?.id ?? 'hero')
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  selectedPage === page.id
                    ? 'bg-emerald-600 text-white'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                <Icon className="w-4 h-4" /> {page.label}
              </button>
            )
          })}
        </div>

        {SECTIONS[selectedPage] && (
          <div className="flex flex-wrap gap-2 pt-2 border-t border-stone-100">
            {SECTIONS[selectedPage].map((section) => (
              <button
                key={section.id}
                onClick={() => setSelectedSection(section.id)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  selectedSection === section.id
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {section.label}
              </button>
            ))}
          </div>
        )}

        <div className="flex justify-end">
          <button
            onClick={() => setPicker(true)}
            className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border border-emerald-200 text-emerald-700 hover:bg-emerald-50"
          >
            <Plus className="w-3 h-3" /> Add background
          </button>
        </div>

        {filtered.length === 0 && (
          <p className="text-xs text-stone-400">
            No backgrounds for this section — add images, videos or external links.
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((m, i) => (
            <div key={m.id} className="relative group rounded-lg overflow-hidden border border-stone-200">
              <div className="aspect-video">
                <MediaThumb media={m as any} />
              </div>
              <div className="p-2 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold line-clamp-1">{m.title}</p>
                  {i === 0 && filtered.length > 1 && (
                    <span className="text-[9px] font-bold bg-amber-400 text-amber-900 px-1.5 py-0.5 rounded-full">Primary</span>
                  )}
                </div>
                <p className="text-[10px] text-stone-400 flex items-center gap-1">
                  <Badge value={m.type} />
                  {m.provider && <span className="text-[9px] px-1 py-0.5 bg-stone-100 rounded">{m.provider}</span>}
                </p>
                <div className="flex items-center gap-1 pt-1 border-t border-stone-100">
                  {m.type === 'IMAGE' && i > 0 && (
                    <button
                      onClick={() => makePrimary(m)}
                      disabled={busy}
                      className="flex-1 text-xs px-2 py-1 rounded bg-white hover:bg-stone-50 border border-stone-200 text-stone-600 disabled:opacity-50"
                      title="Set as primary"
                    >
                      <Star className="w-3 h-3 mx-auto" /> Primary
                    </button>
                  )}
                  <button
                    onClick={() => move(m, -1)}
                    disabled={busy || i === 0}
                    className="w-7 h-7 rounded bg-white hover:bg-stone-50 border border-stone-200 text-stone-600 disabled:opacity-30"
                    title="Move earlier"
                  >
                    <ChevronUp className="w-3 h-3 mx-auto" />
                  </button>
                  <button
                    onClick={() => move(m, 1)}
                    disabled={busy || i === filtered.length - 1}
                    className="w-7 h-7 rounded bg-white hover:bg-stone-50 border border-stone-200 text-stone-600 disabled:opacity-30"
                    title="Move later"
                  >
                    <ChevronDown className="w-3 h-3 mx-auto" />
                  </button>
                  <button
                    onClick={() => setEditing(m)}
                    disabled={busy}
                    className="w-7 h-7 rounded bg-white hover:bg-stone-50 border border-stone-200 text-stone-600"
                    title="Edit details"
                  >
                    <Edit2 className="w-3 h-3 mx-auto" />
                  </button>
                  <button
                    onClick={() => handleDelete(m)}
                    disabled={busy}
                    className="w-7 h-7 rounded bg-red-50 hover:bg-red-100 border border-red-200 text-red-600"
                    title="Delete"
                  >
                    <Trash2 className="w-3 h-3 mx-auto" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {picker && (
        <Modal open onClose={() => setPicker(false)} title={`Add background to ${PAGES.find(p => p.id === selectedPage)?.label} → ${SECTIONS[selectedPage]?.find(s => s.id === selectedSection)?.label}`} size="xl">
          <div className="space-y-4">
            <label className="flex items-center gap-2 text-sm px-4 py-3 rounded-xl border border-dashed border-emerald-300 bg-emerald-50 text-emerald-800 cursor-pointer hover:bg-emerald-100">
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Upload new file(s) and attach
              <input
                type="file"
                multiple
                accept="image/*,video/*"
                className="hidden"
                onChange={(e) => uploadThenAttach(e.target.files)}
                disabled={uploading}
              />
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto">
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-stone-700">Or add external link</h4>
                <form onSubmit={(e) => {
                  e.preventDefault()
                  const fd = new FormData(e.currentTarget)
                  const url = fd.get('url') as string
                  const type = fd.get('type') as 'IMAGE' | 'VIDEO'
                  if (!url) return
                  // This would need a new API endpoint to create from URL
                  toast.success('External link support coming soon')
                }}>
                  <div className="space-y-2">
                    <div>
                      <label className="block text-xs font-medium text-stone-600 mb-1">URL</label>
                      <input
                        name="url"
                        type="url"
                        required
                        className={inputCls}
                        placeholder="https://... (YouTube, Vimeo, or direct image/video URL)"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-stone-600 mb-1">Type</label>
                      <select name="type" className={inputCls}>
                        <option value="IMAGE">Image</option>
                        <option value="VIDEO">Video (YouTube/Vimeo)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-stone-600 mb-1">Title</label>
                      <input name="title" type="text" required className={inputCls} placeholder="Background title" />
                    </div>
                    <button type="submit" className="w-full text-xs px-2 py-1 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500">Add Link</button>
                  </div>
                </form>
              </div>

              {all.filter(m => m.page !== selectedPage || m.section !== selectedSection).length === 0 ? (
                <p className="text-sm text-stone-400 col-span-2">
                  No other media in the library — upload files above or add links.
                </p>
              ) : (
                <>
                  {all.filter(m => m.page !== selectedPage || m.section !== selectedSection).map((m) => (
                    <div key={m.id} className="rounded-xl border border-stone-200 overflow-hidden">
                      <div className="aspect-video">
                        <MediaThumb media={m as any} />
                      </div>
                      <div className="p-2 space-y-1">
                        <p className="text-xs font-semibold line-clamp-1">{m.title}</p>
                        <p className="text-[10px] text-stone-400">Page: {m.page} · Section: {m.section || '—'}</p>
                        <button
                          type="button"
                          onClick={() => patch(m, { page: selectedPage, section: selectedSection })}
                          disabled={busy}
                          className="w-full text-xs px-2 py-1 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-50"
                        >
                          Attach to this section
                        </button>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </Modal>
      )}

      {editing && (
        <Modal open onClose={() => setEditing(null)} title="Edit background details">
          <form onSubmit={(e) => handleEdit(e, editing!)} className="space-y-4">
            {error && <Err message={error} />}
            <Field label="Title">
              <input {...{ className: inputCls, name: 'title', defaultValue: editing.title, required: true }} />
            </Field>
            <Field label="Page">
              <select {...{ className: inputCls, name: 'page', defaultValue: editing.page }} required>
                {PAGES.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
              </select>
            </Field>
            <Field label="Section">
              <select {...{ className: inputCls, name: 'section', defaultValue: editing.section || '' }}>
                <option value="">None (page-wide)</option>
                {SECTIONS[editing.page]?.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
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