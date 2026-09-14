'use client'

import { useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { adminApi, useAsyncData, Field, inputCls, SaveButton, Err } from '@/components/admin/ui'
import { Loader2, Trash2, ImagePlus, Save } from 'lucide-react'

type Settings = {
  siteName: string
  tagline: string
  contactEmail: string
  contactPhone: string
  logoUrl: string
}

export default function AdminSettingsPage() {
  const { data, loading, error, refresh } = useAsyncData<{ settings: Settings }>(() =>
    adminApi('/api/site')
  )
  const [form, setForm] = useState<Settings | null>(null)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const init = data?.settings
  if (init && !form) setForm(init)
  const f = form ?? init

  const set = <K extends keyof Settings>(k: K, v: Settings[K]) =>
    setForm((p) => (p ? { ...p, [k]: v } : p))

  const uploadLogo = async (files: FileList | null) => {
    const file = files?.[0]
    if (!file) return
    setUploading(true)
    setErr('')
    try {
      const fd = new FormData()
      fd.append('files', file)
      const res = await fetch('/api/admin/media/upload', { method: 'POST', body: fd })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error || 'Upload failed')
      const media = d.media?.[0]
      if (!media) throw new Error('Upload returned nothing')
      await adminApi('/api/admin/settings', {
        method: 'PUT',
        body: { logoUrl: media.url },
      })
      set('logoUrl', media.url)
      toast.success('Logo uploaded')
      refresh()
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Upload failed')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const removeLogo = async () => {
    await adminApi('/api/admin/settings', { method: 'PUT', body: { logoUrl: '' } })
    set('logoUrl', '')
    toast.success('Logo removed — showing default branding')
  }

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!f) return
    setSaving(true)
    setErr('')
    try {
      await adminApi('/api/admin/settings', {
        method: 'PUT',
        body: {
          siteName: f.siteName,
          tagline: f.tagline,
          contactEmail: f.contactEmail,
          contactPhone: f.contactPhone,
          logoUrl: f.logoUrl,
        },
      })
      toast.success('Branding updated')
      refresh()
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <p className="flex items-center gap-2 text-stone-500">
        <Loader2 className="w-5 h-5 animate-spin" /> Loading…
      </p>
    )
  }
  if (error) return <Err message={error} />
  if (!f) return null

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-1">Branding & Settings</h2>
        <p className="text-stone-500 text-sm">
          The logo, name and contact details appear across the public site instantly.
        </p>
      </div>

      {err && <Err message={err} />}

      <div className="bg-white rounded-2xl shadow p-6">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <ImagePlus className="w-5 h-5 text-emerald-600" /> Logo
        </h3>
        <div className="flex flex-wrap items-center gap-6">
          <div className="w-48 h-20 rounded-xl border-2 border-dashed border-stone-200 flex items-center justify-center bg-stone-50 overflow-hidden">
            {f.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={f.logoUrl} alt="Site logo" className="max-h-full max-w-full object-contain p-2" />
            ) : (
              <span className="text-xs text-stone-400">No logo — using default</span>
            )}
          </div>
          <div className="flex flex-col gap-3">
            <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" className="hidden" onChange={(e) => uploadLogo(e.target.files)} />
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white px-4 py-2 rounded-full text-sm font-semibold"
            >
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImagePlus className="w-4 h-4" />}
              {f.logoUrl ? 'Replace logo' : 'Upload logo'}
            </button>
            {f.logoUrl && (
              <button
                onClick={removeLogo}
                className="flex items-center gap-2 text-sm text-red-600 hover:underline"
              >
                <Trash2 className="w-4 h-4" /> Remove logo
              </button>
            )}
          </div>
        </div>
        <div className="mt-4">
          <Field label="…or paste a logo image URL">
            <input
              className={inputCls}
              value={f.logoUrl}
              onChange={(e) => set('logoUrl', e.target.value)}
              placeholder="https://… or /uploads/…"
              onBlur={() => {
                if (f.logoUrl) {
                  adminApi('/api/admin/settings', { method: 'PUT', body: { logoUrl: f.logoUrl } })
                    .then(() => toast.success('Logo URL saved'))
                    .then(refresh)
                    .catch(() => toast.error('Could not save logo URL'))
                }
              }}
            />
          </Field>
        </div>
      </div>

      <form onSubmit={save} className="bg-white rounded-2xl shadow p-6 space-y-4">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Save className="w-5 h-5 text-emerald-600" /> Site details
        </h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Site name">
            <input className={inputCls} value={f.siteName} onChange={(e) => set('siteName', e.target.value)} required />
          </Field>
          <Field label="Tagline">
            <input className={inputCls} value={f.tagline} onChange={(e) => set('tagline', e.target.value)} />
          </Field>
          <Field label="Contact email">
            <input className={inputCls} type="email" value={f.contactEmail} onChange={(e) => set('contactEmail', e.target.value)} />
          </Field>
          <Field label="Contact phone">
            <input className={inputCls} value={f.contactPhone} onChange={(e) => set('contactPhone', e.target.value)} />
          </Field>
        </div>
        <div className="max-w-xs">
          <SaveButton busy={saving}>Save branding</SaveButton>
        </div>
      </form>
    </div>
  )
}