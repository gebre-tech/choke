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
  PageHeader,
  Section,
  DataTable,
  SearchInput,
  EmptyState,
  LoadingState,
} from '@/components/admin/ui'
import { Loader2, Plus, MapPin, Trash2, Mountain } from 'lucide-react'
import MediaManager from '@/components/admin/MediaManager'
import LinkManager from '@/components/admin/LinkManager'
import { Select } from '@/components/admin/ui'

type Experience = {
  id: string
  name: string
  description: string
  type: string
  price: number
  duration: number | null
  capacity: number
  startTime: string | null
  endTime: string | null
  difficultyLevel: string | null
  ageRequirement: number
  includedItems: string[]
  isActive: boolean
  maxBookingsPerDay: number | null
  cottageId: string | null
  cottage?: { id: string; name: string } | null
  published?: boolean
  publicationStatus?: string
  rejectionReason?: string | null
  submittedBy?: { id: string; email: string } | null
}

type CottageOption = { id: string; name: string }

const TYPES = ['STARGAZING', 'TREKKING', 'CITY_LIGHTS', 'SUNRISE_SUNSET', 'CULTURAL_TOUR', 'BIRD_WATCHING']

function emptyExperience(): Experience {
  return {
    id: '',
    name: '',
    description: '',
    type: 'STARGAZING',
    price: 0,
    duration: null,
    capacity: 10,
    startTime: '',
    endTime: '',
    difficultyLevel: '',
    ageRequirement: 0,
    includedItems: [],
    isActive: true,
    maxBookingsPerDay: 5,
    cottageId: null,
  }
}

type FormShape = Omit<Experience, 'includedItems'> & { includedItems: string }

function ExperienceForm({
  initial,
  cottages,
  onSaved,
  onCancel,
}: {
  initial: Experience
  cottages: CottageOption[]
  onSaved: () => void
  onCancel: () => void
}) {
  const [form, setForm] = useState<FormShape>({
    ...initial,
    includedItems: initial.includedItems.join('\n'),
  })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const editing = Boolean(initial.id)

  const set = <K extends keyof FormShape>(key: K, value: FormShape[K]) =>
    setForm((f) => ({ ...f, [key]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const payload = {
        name: String(form.name),
        description: String(form.description),
        type: String(form.type),
        price: Number(form.price),
        duration: Number(form.duration) || null,
        capacity: Number(form.capacity),
        startTime: String(form.startTime) || null,
        endTime: String(form.endTime) || null,
        difficultyLevel: String(form.difficultyLevel) || null,
        ageRequirement: Number(form.ageRequirement),
        includedItems: String(form.includedItems),
        isActive: Boolean(form.isActive),
        maxBookingsPerDay: Number(form.maxBookingsPerDay) || null,
        cottageId: String(form.cottageId) || null,
      }
      const path = editing ? `/api/admin/experiences/${initial.id}` : '/api/admin/experiences'
      await adminApi(path, { method: editing ? 'PATCH' : 'POST', body: payload })
      toast.success(editing ? 'Experience updated' : 'Experience created')
      onSaved()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save')
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">{error}</div>}

      <Section title="Basic Information">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Name">
            <input className={inputCls} value={form.name} onChange={(e) => set('name', e.target.value)} required />
          </Field>
          <Field label="Type">
            <Select value={form.type} onChange={(e) => set('type', e.target.value)} required>
              {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </Select>
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
          <Field label="Duration (minutes)">
            <input
              className={inputCls}
              type="number"
              min="1"
              value={form.duration ?? ''}
              onChange={(e) => set('duration', e.target.value === '' ? null : Number(e.target.value))}
            />
          </Field>
          <Field label="Capacity">
            <input className={inputCls} type="number" min="1" value={form.capacity} onChange={(e) => set('capacity', Number(e.target.value))} required />
          </Field>
          <Field label="Max bookings per day">
            <input className={inputCls} type="number" min="1" value={form.maxBookingsPerDay ?? ''} onChange={(e) => set('maxBookingsPerDay', e.target.value === '' ? null : Number(e.target.value))} />
          </Field>
          <Field label="Start time (HH:MM)">
            <input className={inputCls} placeholder="20:00" value={form.startTime ?? ''} onChange={(e) => set('startTime', e.target.value)} />
          </Field>
          <Field label="End time (HH:MM)">
            <input className={inputCls} placeholder="21:30" value={form.endTime ?? ''} onChange={(e) => set('endTime', e.target.value)} />
          </Field>
          <Field label="Difficulty">
            <input className={inputCls} placeholder="Easy / Moderate / Hard" value={form.difficultyLevel ?? ''} onChange={(e) => set('difficultyLevel', e.target.value)} />
          </Field>
          <Field label="Minimum age">
            <input className={inputCls} type="number" min="0" value={form.ageRequirement} onChange={(e) => set('ageRequirement', Number(e.target.value))} />
          </Field>
          <Field label="Linked cottage (optional)">
            <Select value={form.cottageId ?? ''} onChange={(e) => set('cottageId', e.target.value || null)}>
              <option value="">None</option>
              {cottages.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
          </Field>
        </div>
      </Section>

      <Section title="Description">
        <Field label="Description">
          <textarea className={inputCls} rows={2} value={form.description} onChange={(e) => set('description', e.target.value)} />
        </Field>
      </Section>

      <Section title="Included Items">
        <Field label="Included items" hint="One per line or comma-separated">
          <textarea className={inputCls} rows={2} value={form.includedItems} onChange={(e) => set('includedItems', e.target.value)} />
        </Field>
      </Section>

      <Section title="Settings">
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" checked={form.isActive} onChange={(e) => set('isActive', e.target.checked)} className="w-4 h-4 accent-emerald-600 rounded border-stone-300" />
          <span className="font-medium">Active</span>
        </label>
      </Section>

      <div className="flex gap-3 pt-2 border-t border-stone-100">
        <div className="flex-1">
          <SaveButton busy={busy}>{editing ? 'Save changes' : 'Create experience'}</SaveButton>
        </div>
        <SecondaryButton type="button" onClick={onCancel}>Cancel</SecondaryButton>
      </div>

      <MediaManager entityType="experience" entityId={initial.id} />
      <LinkManager entityType="experience" entityId={initial.id} />
    </form>
  )
}

export default function AdminExperiencesPage() {
  const { data, loading, error, refresh } = useAsyncData<{
    experiences: Experience[]
  }>(() => adminApi('/api/admin/experiences'))
  const cottagesData = useAsyncData<{ cottages: CottageOption[] }>(() =>
    adminApi('/api/admin/cottages')
  )
  const [modal, setModal] = useState<{ open: boolean; experience: Experience | null }>({
    open: false,
    experience: null,
  })
  const [search, setSearch] = useState('')

  const remove = async (id: string) => {
    await adminApi(`/api/admin/experiences/${id}`, { method: 'DELETE' })
    toast.success('Experience deleted')
    refresh()
  }

  const cottages = cottagesData.data?.cottages ?? []
  const filtered = data?.experiences.filter((e) =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.type.toLowerCase().includes(search.toLowerCase()) ||
    e.description.toLowerCase().includes(search.toLowerCase())
  ) ?? []

  const columns = [
    { key: 'name', header: 'Experience', className: 'w-64', render: (e: Experience) => (
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
          <Mountain className="w-5 h-5 text-amber-600" />
        </div>
        <div className="min-w-0">
          <p className="font-medium truncate">{e.name}</p>
          {e.cottage && <p className="text-xs text-stone-400">at {e.cottage.name}</p>}
          {e.submittedBy && <p className="text-[10px] text-stone-400">submitted by {e.submittedBy?.email}</p>}
        </div>
      </div>
    )},
    { key: 'type', header: 'Type', className: 'w-36', render: (e: Experience) => <Badge value={e.type} /> },
    { key: 'price', header: 'Price', className: 'w-28', render: (e: Experience) => <span className="font-medium">ETB {e.price.toLocaleString()}</span> },
    { key: 'duration', header: 'Duration', className: 'w-24', render: (e: Experience) => <span className="text-stone-600">{e.duration ? `${e.duration} min` : '—'}</span> },
    { key: 'when', header: 'Schedule', className: 'w-40', render: (e: Experience) => (
      <span className="text-xs text-stone-500">
        {e.startTime && e.endTime ? `${e.startTime}–${e.endTime}` : '—'}
        {e.difficultyLevel ? ` · {e.difficultyLevel}` : ''}
      </span>
    )},
    { key: 'capacity', header: 'Capacity', className: 'w-20 text-center', render: (e: Experience) => <span className="text-stone-600">{e.capacity}</span> },
    { key: 'status', header: 'Status', className: 'w-36', render: (e: Experience) => {
      const status = e.publicationStatus ?? 'PUBLISHED'
      if (status === 'PUBLISHED') return <Badge value="PUBLISHED" />
      if (status === 'REJECTED') return <span title={e.rejectionReason ?? ''}><Badge value="REJECTED" /></span>
      return <Badge value="PENDING" />
    }},
    { key: 'actions', header: 'Actions', className: 'w-48', render: (e: Experience) => (
      <div className="flex items-center gap-2">
        <button onClick={() => setModal({ open: true, experience: e })} className="btn btn-secondary px-3 py-1.5 text-xs">Edit</button>
        <ConfirmDeleteButton onConfirm={() => remove(e.id)} label="Delete" />
      </div>
    )},
  ]

  return (
    <div className="animate-in">
      <PageHeader
        title="Experiences"
        subtitle="Manage guided activities and community experiences"
        action={
          <button onClick={() => setModal({ open: true, experience: emptyExperience() })} className="btn btn-primary">
            <Plus className="w-4 h-4" /> Add experience
          </button>
        }
      />

      {loading && <LoadingState message="Loading experiences…" />}
      {error && <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">{error}</div>}

      <Section>
        <SearchInput value={search} onChange={setSearch} placeholder="Search experiences by name, type, or description…" />
      </Section>

      <Section>
        <DataTable
          columns={columns}
          data={filtered}
          keyExtractor={(e) => e.id}
          emptyMessage="No experiences match your search"
          emptyIcon={<Mountain className="w-12 h-12 text-stone-300" />}
        />
      </Section>

      <Modal
        open={modal.open}
        onClose={() => setModal({ open: false, experience: null })}
        title={modal.experience?.id ? `Edit ${modal.experience.name}` : 'Add experience'}
        size="xl"
      >
        {modal.experience && (
          <ExperienceForm
            initial={modal.experience}
            cottages={cottages}
            onSaved={() => { setModal({ open: false, experience: null }); refresh() }}
            onCancel={() => setModal({ open: false, experience: null })}
          />
        )}
      </Modal>
    </div>
  )
}