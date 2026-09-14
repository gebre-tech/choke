'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import { adminApi, useAsyncData, Field, inputCls, Badge, Err } from '@/components/admin/ui'
import { Loader2 } from 'lucide-react'

type Booking = {
  id: string
  checkIn: string
  checkOut: string
  guestCount: number
  specialRequests: string | null
  amount: number
  paymentStatus: string
  status: string
  paymentTxRef: string | null
  cottage: { id: string; name: string }
  user: { id: string; email: string; firstName: string; lastName: string | null; phoneNumber: string | null }
}

const STATUSES = ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW']
const PAYMENT_STATUSES = ['PENDING', 'CONFIRMED', 'FAILED', 'REFUNDED', 'CANCELLED']

export default function AdminBookingsPage() {
  const { data, loading, error, refresh } = useAsyncData<{ bookings: Booking[] }>(() =>
    adminApi('/api/admin/bookings')
  )
  const [filter, setFilter] = useState('')
  const [busyId, setBusyId] = useState<string | null>(null)

  const update = async (id: string, body: Record<string, unknown>) => {
    setBusyId(id)
    try {
      await adminApi(`/api/admin/bookings/${id}`, { method: 'PATCH', body })
      toast.success('Booking updated')
      refresh()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Update failed')
    } finally {
      setBusyId(null)
    }
  }

  const bookings = data?.bookings.filter(
    (b) =>
      !filter ||
      (b.status ?? '').includes(filter) ||
      (b.paymentStatus ?? '').includes(filter)
  ) ?? []

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Bookings</h2>
        <select className={`${inputCls} w-64`} value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">All</option>
          <optgroup label="Status">
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </optgroup>
          <optgroup label="Payment">
            {PAYMENT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </optgroup>
        </select>
      </div>

      {loading && (
        <p className="flex items-center gap-2 text-stone-500">
          <Loader2 className="w-5 h-5 animate-spin" /> Loading…
        </p>
      )}
      {error && <Err message={error} />}

      {data && (
        <div className="bg-white rounded-2xl shadow overflow-x-auto">
          <table className="w-full text-sm min-w-[880px]">
            <thead className="bg-stone-50 text-left text-stone-500">
              <tr>
                <th className="px-4 py-2">Guest</th>
                <th className="px-4 py-2">Cottage</th>
                <th className="px-4 py-2">Dates</th>
                <th className="px-4 py-2">Guests</th>
                <th className="px-4 py-2">Amount</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Payment</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id} className="border-t align-top">
                  <td className="px-4 py-2">
                    <div className="font-medium">
                      {b.user.firstName} {b.user.lastName ?? ''}
                    </div>
                    <div className="text-xs text-stone-500">{b.user.email}</div>
                    {b.user.phoneNumber && <div className="text-xs text-stone-500">{b.user.phoneNumber}</div>}
                  </td>
                  <td className="px-4 py-2">{b.cottage.name}</td>
                  <td className="px-4 py-2 text-xs">
                    {new Date(b.checkIn).toLocaleDateString()} → {new Date(b.checkOut).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2">{b.guestCount}</td>
                  <td className="px-4 py-2">ETB {b.amount.toLocaleString()}
                    {b.paymentTxRef && <div className="text-[10px] text-stone-400">{b.paymentTxRef}</div>}
                  </td>
                  <td className="px-4 py-2">
                    <Badge value={b.status} />
                  </td>
                  <td className="px-4 py-2">
                    <Badge value={b.paymentStatus} />
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex flex-col gap-1">
                      <Field label="Status">
                        <select
                          className={inputCls}
                          value={b.status}
                          disabled={busyId === b.id}
                          onChange={(e) => update(b.id, { status: e.target.value })}
                        >
                          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </Field>
                      <Field label="Payment">
                        <select
                          className={inputCls}
                          value={b.paymentStatus}
                          disabled={busyId === b.id}
                          onChange={(e) => update(b.id, { paymentStatus: e.target.value })}
                        >
                          {PAYMENT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </Field>
                    </div>
                  </td>
                </tr>
              ))}
              {bookings.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-6 text-center text-stone-400">
                    No bookings found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}