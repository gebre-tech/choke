'use client'

import { useState } from 'react'
import { adminApi, useAsyncData } from '@/components/admin/ui'
import { Loader2, Search } from 'lucide-react'

type Guest = {
  id: string
  email: string
  firstName: string
  lastName: string | null
  phone: string | null
  country: string | null
  city: string | null
  role: string
  createdAt: string
  bookingCount: number
  confirmedBookingCount: number
  bookingSpend: string
  orderCount: number
  orderSpend: string
  totalSpend: string
  lastCheckIn: string | null
}

type GuestsData = {
  totals: { guests: number; totalSpend: string; confirmedBookings: number }
  guests: Guest[]
}

export default function AdminGuestsPage() {
  const { data, loading, error } = useAsyncData<GuestsData>(() => adminApi('/api/admin/guests'))
  const [q, setQ] = useState('')

  if (loading) {
    return (
      <p className="flex items-center gap-2 text-stone-500">
        <Loader2 className="w-5 h-5 animate-spin" /> Loading…
      </p>
    )
  }
  if (error) return <p className="text-red-600">{error}</p>
  if (!data) return null

  const term = q.trim().toLowerCase()
  const guests = data.guests.filter(
    (g) =>
      !term ||
      [g.email, g.firstName, g.lastName, g.phone, g.country, g.city]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(term))
  )

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 className="text-2xl font-bold">Guest Profiles</h2>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search guests…"
            className="border border-stone-300 rounded-xl pl-9 pr-3 py-2 text-sm w-56 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl shadow p-5">
          <p className="text-sm text-stone-500">Registered guests</p>
          <p className="text-2xl font-bold mt-1">{data.totals.guests}</p>
        </div>
        <div className="bg-white rounded-2xl shadow p-5">
          <p className="text-sm text-stone-500">Confirmed bookings</p>
          <p className="text-2xl font-bold mt-1">{data.totals.confirmedBookings}</p>
        </div>
        <div className="bg-white rounded-2xl shadow p-5">
          <p className="text-sm text-stone-500">Total confirmed value</p>
          <p className="text-2xl font-bold mt-1">ETB {Number(data.totals.totalSpend).toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow overflow-x-auto">
        <table className="w-full text-sm border-collapse min-w-[860px]">
          <thead>
            <tr className="bg-stone-50 text-left text-stone-500">
              <th className="px-4 py-2.5">Guest</th>
              <th className="px-4 py-2.5">Contact</th>
              <th className="px-4 py-2.5">Location</th>
              <th className="px-4 py-2.5">Bookings</th>
              <th className="px-4 py-2.5">Orders</th>
              <th className="px-4 py-2.5">All-time spend</th>
              <th className="px-4 py-2.5">Last stay</th>
            </tr>
          </thead>
          <tbody>
            {guests.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-stone-400">
                  No guests match “{q}”.
                </td>
              </tr>
            )}
            {guests.map((g) => (
              <tr key={g.id} className="border-t border-stone-100 hover:bg-stone-50">
                <td className="px-4 py-2.5">
                  <p className="font-medium">{g.firstName} {g.lastName ?? ''}</p>
                  <p className="text-xs text-stone-400">{g.role === 'TOURIST' ? 'Guest' : g.role}</p>
                </td>
                <td className="px-4 py-2.5">
                  <p className="text-stone-600">{g.email}</p>
                  {g.phone && <p className="text-xs text-stone-400">{g.phone}</p>}
                </td>
                <td className="px-4 py-2.5 text-stone-600">
                  {[g.city, g.country].filter(Boolean).join(', ') || '—'}
                </td>
                <td className="px-4 py-2.5">
                  <p className="font-medium">{g.bookingCount}</p>
                  <p className="text-xs text-emerald-600">{g.confirmedBookingCount} confirmed</p>
                </td>
                <td className="px-4 py-2.5">{g.orderCount}</td>
                <td className="px-4 py-2.5">
                  <p className="font-semibold">ETB {Number(g.totalSpend).toLocaleString()}</p>
                  <p className="text-xs text-stone-400">ETB {Number(g.bookingSpend).toLocaleString()} stays</p>
                </td>
                <td className="px-4 py-2.5 text-stone-600">
                  {g.lastCheckIn ? g.lastCheckIn.slice(0, 10) : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}