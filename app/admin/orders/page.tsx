'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import { adminApi, useAsyncData, Field, inputCls, Badge, Err } from '@/components/admin/ui'
import { Loader2 } from 'lucide-react'

type OrderItem = { id: string; productName: string; quantity: number; totalPrice: number }

type Order = {
  id: string
  totalAmount: number
  status: string
  paymentStatus: string
  paymentTxRef: string | null
  shippingCity: string | null
  shippingRegion: string | null
  createdAt: string
  user: { id: string; email: string; firstName: string; lastName: string | null }
  items: OrderItem[]
}

const STATUSES = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']
const PAYMENT_STATUSES = ['PENDING', 'CONFIRMED', 'FAILED', 'REFUNDED', 'CANCELLED']

export default function AdminOrdersPage() {
  const { data, loading, error, refresh } = useAsyncData<{ orders: Order[] }>(() =>
    adminApi('/api/admin/orders')
  )
  const [filter, setFilter] = useState('')
  const [busyId, setBusyId] = useState<string | null>(null)

  const update = async (id: string, body: Record<string, unknown>) => {
    setBusyId(id)
    try {
      await adminApi(`/api/admin/orders/${id}`, { method: 'PATCH', body })
      toast.success('Order updated')
      refresh()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Update failed')
    } finally {
      setBusyId(null)
    }
  }

  const orders = data?.orders.filter(
    (o) => !filter || (o.status ?? '').includes(filter) || (o.paymentStatus ?? '').includes(filter)
  ) ?? []

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Orders</h2>
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
                <th className="px-4 py-2">Customer</th>
                <th className="px-4 py-2">Items</th>
                <th className="px-4 py-2">Total</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Payment</th>
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-t align-top">
                  <td className="px-4 py-2">
                    <div className="font-medium">
                      {o.user.firstName} {o.user.lastName ?? ''}
                    </div>
                    <div className="text-xs text-stone-500">{o.user.email}</div>
                    {o.shippingCity && (
                      <div className="text-xs text-stone-500">{o.shippingCity}{o.shippingRegion ? `, ${o.shippingRegion}` : ''}</div>
                    )}
                  </td>
                  <td className="px-4 py-2">
                    <ul className="text-xs space-y-0.5">
                      {o.items.map((it) => (
                        <li key={it.id}>
                          {it.productName} × {it.quantity}
                          <span className="text-stone-400"> — ETB {it.totalPrice.toLocaleString()}</span>
                        </li>
                      ))}
                    </ul>
                    {o.paymentTxRef && <div className="text-[10px] text-stone-400 mt-1">{o.paymentTxRef}</div>}
                  </td>
                  <td className="px-4 py-2 font-semibold">ETB {o.totalAmount.toLocaleString()}</td>
                  <td className="px-4 py-2"><Badge value={o.status} /></td>
                  <td className="px-4 py-2"><Badge value={o.paymentStatus} /></td>
                  <td className="px-4 py-2 text-xs">{new Date(o.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-2">
                    <div className="flex flex-col gap-1">
                      <Field label="Status">
                        <select
                          className={inputCls}
                          value={o.status}
                          disabled={busyId === o.id}
                          onChange={(e) => update(o.id, { status: e.target.value })}
                        >
                          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </Field>
                      <Field label="Payment">
                        <select
                          className={inputCls}
                          value={o.paymentStatus}
                          disabled={busyId === o.id}
                          onChange={(e) => update(o.id, { paymentStatus: e.target.value })}
                        >
                          {PAYMENT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </Field>
                    </div>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-stone-400">
                    No orders found.
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