'use client'

import { useCallback, useState } from 'react'
import toast from 'react-hot-toast'
import {
  adminApi,
  useAsyncData,
  Badge,
  PageHeader,
  Section,
  LoadingState,
  EmptyState,
} from '@/components/admin/ui'
import { Loader2, CheckCircle, XCircle, Package, MapPin } from 'lucide-react'

type QueueItem = {
  id: string
  name: string
  description: string | null
  price: number
  category?: string
  type?: string
  cottage?: string | null
  publicationStatus: string
  rejectionReason: string | null
  createdAt: string
  submittedBy: { email: string; firstName: string | null } | null
  media: {
    id: string
    url: string
    type: string
    provider: string | null
    videoId: string | null
    title: string
  }[]
}

type Queue = { products: QueueItem[]; experiences: QueueItem[] }

function ItemCard({
  item,
  entity,
  onDecide,
  busy,
}: {
  item: QueueItem
  entity: string
  onDecide: (id: string, status: 'PUBLISHED' | 'REJECTED') => void
  busy: string
}) {
  const cover = item.media[0]
  const isBusy = busy === `${entity}-${item.id}`

  return (
    <div className="card p-4 transition-all hover:shadow-md">
      <div className="flex flex-wrap gap-4 items-start">
        <div className="w-16 h-16 rounded-lg overflow-hidden bg-stone-100 shrink-0 flex-shrink-0">
          {cover ? (
            cover.type === 'VIDEO' ? (
              <div className="w-full h-full flex items-center justify-center bg-stone-100">
                <span className="text-sm font-medium text-stone-500">▶ {cover.provider || 'Video'}</span>
              </div>
            ) : (
              <img src={cover.url} alt={cover.title} className="w-full h-full object-cover" />
            )
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-stone-300 text-xs">No media</span>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 mb-2">
            <h3 className="font-semibold text-stone-900 truncate flex-1">{item.name}</h3>
            <Badge value={item.publicationStatus === 'REJECTED' ? 'REJECTED' : 'PENDING'} />
          </div>
          {item.category || item.type ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-stone-100 text-stone-600 mb-2">
              {item.category ?? item.type}
            </span>
          ) : null}
          <p className="text-sm text-stone-500 line-clamp-2 mb-2">{item.description}</p>
          <div className="flex flex-wrap items-center gap-3 text-[11px] text-stone-400">
            <span>ETB {item.price.toLocaleString()}</span>
            {item.cottage && <span>at {item.cottage}</span>}
            <span>{item.media.length} media</span>
            <span>{item.submittedBy?.email || 'unknown'}</span>
            <span>{new Date(item.createdAt).toLocaleDateString()}</span>
          </div>
          {item.publicationStatus === 'REJECTED' && item.rejectionReason && (
            <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
              <XCircle className="w-3.5 h-3.5" /> Reason: {item.rejectionReason}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onDecide(item.id, 'PUBLISHED')}
            disabled={isBusy}
            className="btn btn-primary px-3 py-1.5 text-sm"
          >
            {isBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
            Approve
          </button>
          <button
            onClick={() => onDecide(item.id, 'REJECTED')}
            disabled={isBusy}
            className="btn btn-danger px-3 py-1.5 text-sm"
          >
            {isBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
            Reject
          </button>
        </div>
      </div>
    </div>
  )
}

function SectionCard({ title, items, kind, empty, onDecide, busy }: {
  title: string
  items: QueueItem[]
  kind: 'products' | 'experiences'
  empty: string
  onDecide: (kind: 'products' | 'experiences', id: string, status: 'PUBLISHED' | 'REJECTED') => void
  busy: string
}) {
  const Icon = kind === 'products' ? Package : MapPin
  return (
    <Section title={title}>
      {items.length === 0 ? (
        <EmptyState
          icon={<Icon className="w-12 h-12 text-stone-300" />}
          title="No submissions"
          description={empty}
        />
      ) : (
        <div className="space-y-3">
          {items.map((i) => (
            <ItemCard
              key={`${kind}-${i.id}`}
              item={i}
              entity={kind === 'products' ? 'PRODUCT' : 'EXPERIENCE'}
              onDecide={(id, s) => onDecide(kind, id, s)}
              busy={busy}
            />
          ))}
        </div>
      )}
    </Section>
  )
}

export default function AdminSubmissionsPage() {
  const { data, loading, error, refresh } = useAsyncData<Queue>(() =>
    adminApi('/api/admin/submissions')
  )
  const [busy, setBusy] = useState('')

  const decide = useCallback(
    async (entity: 'PRODUCT' | 'EXPERIENCE', id: string, status: 'PUBLISHED' | 'REJECTED') => {
      const rejectionReason =
        status === 'REJECTED' ? (window.prompt('Reason for rejection (optional)') ?? '').trim() : ''
      setBusy(`${entity}-${id}`)
      try {
        await adminApi(`/api/admin/submissions/${id}`, {
          method: 'PUT',
          body: { entity, status, rejectionReason },
        })
        toast.success(status === 'PUBLISHED' ? 'Published' : 'Rejected')
        refresh()
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Action failed')
      } finally {
        setBusy('')
      }
    },
    [refresh]
  )

  const decideAny = useCallback(
    async (kind: 'products' | 'experiences', id: string, status: 'PUBLISHED' | 'REJECTED') => {
      await decide(kind === 'products' ? 'PRODUCT' : 'EXPERIENCE', id, status)
    },
    [decide]
  )

  const totalPending = (data?.products.length ?? 0) + (data?.experiences.length ?? 0)

  return (
    <div className="animate-in">
      <PageHeader
        title="Submissions"
        subtitle={totalPending > 0 ? `${totalPending} item${totalPending !== 1 ? 's' : ''} awaiting review` : 'All caught up! No pending submissions'}
        action={
          <button onClick={refresh} className="btn btn-secondary">
            <Loader2 className="w-4 h-4" /> Refresh
          </button>
        }
      />

      {loading && <LoadingState message="Loading submissions…" />}
      {error && <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">{error}</div>}

      {data && (
        <>
          <SectionCard
            title="Product Submissions"
            items={data.products}
            kind="products"
            empty="No product submissions waiting."
            onDecide={decideAny}
            busy={busy}
          />
          <SectionCard
            title="Experience Submissions"
            items={data.experiences}
            kind="experiences"
            empty="No experience submissions waiting."
            onDecide={decideAny}
            busy={busy}
          />
        </>
      )}
    </div>
  )
}