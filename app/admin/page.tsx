'use client'

import Link from 'next/link'
import { adminApi, useAsyncData, StatCard, Badge } from '@/components/admin/ui'
import { Loader2, CalendarDays, Users } from 'lucide-react'

type Stats = {
  totalBookings: number
  confirmedBookings: number
  bookingRevenue: number
  totalOrders: number
  confirmedOrders: number
  orderRevenue: number
  lowStock: number
  productCount: number
  cottageCount: number
  experienceCount: number
  activeUsers: number
  occupancyPct30: number
  arrivalsToday: number
  departuresToday: number
  pendingBookings: number
  pendingOrders: number
}

type Recent = {
  id: string
  cottage: string
  email: string
  amount: number
  status: string
  paymentStatus: string
  createdAt: string
}

type Arrival = {
  id: string
  cottage: string
  email: string
  checkIn: string
  amount: number
}

export default function AdminDashboardPage() {
  const { data, loading, error } = useAsyncData<{
    stats: Stats
    recentBookings: Recent[]
    upcomingArrivals: Arrival[]
  }>(() => adminApi('/api/admin/stats'))

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-stone-500">
        <Loader2 className="w-5 h-5 animate-spin" /> Loading…
      </div>
    )
  }
  if (error || !data) {
    return <p className="text-red-600">Failed to load dashboard: {error}</p>
  }

  const s = data.stats

  return (
    <div className="space-y-8">
      <div className="grid md:grid-cols-4 gap-4">
        <StatCard label="Occupancy (next 30 days)" value={`${s.occupancyPct30}%`} sub="based on active bookings" />
        <StatCard label="Arriving today" value={String(s.arrivalsToday)} sub={`${s.departuresToday} departing today`} />
        <StatCard label="Confirmed bookings" value={String(s.confirmedBookings)} sub={`ETB ${s.bookingRevenue.toLocaleString()}`} />
        <StatCard label="Paid orders" value={String(s.confirmedOrders)} sub={`ETB ${s.orderRevenue.toLocaleString()}`} />
        <StatCard label="Total bookings" value={String(s.totalBookings)} sub={`${s.pendingBookings} waiting payment`} />
        <StatCard label="Total orders" value={String(s.totalOrders)} sub={`${s.pendingOrders} pending`} />
        <StatCard label="Revenue (all paid)" value={`ETB ${(s.bookingRevenue + s.orderRevenue).toLocaleString()}`} />
        <StatCard label="Products" value={String(s.productCount)} sub={`${s.lowStock} low on stock`} />
      </div>

      <div className="flex flex-wrap gap-3 text-sm">
        <Link href="/admin/calendar" className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-full font-semibold">
          <CalendarDays className="w-4 h-4" /> Booking calendar
        </Link>
        <Link href="/admin/guests" className="flex items-center gap-2 bg-white border border-stone-200 hover:bg-stone-50 px-4 py-2 rounded-full font-semibold">
          <Users className="w-4 h-4" /> Guest profiles
        </Link>
      </div>

      <section>
        <h2 className="text-lg font-bold mb-3">Upcoming arrivals</h2>
        {data.upcomingArrivals.length === 0 ? (
          <p className="text-stone-500">No upcoming arrivals booked yet.</p>
        ) : (
          <div className="bg-white rounded-2xl shadow overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-stone-50 text-left text-stone-500">
                <tr>
                  <th className="px-4 py-2">Arrives</th>
                  <th className="px-4 py-2">Cottage</th>
                  <th className="px-4 py-2">Guest</th>
                  <th className="px-4 py-2">Value</th>
                </tr>
              </thead>
              <tbody>
                {data.upcomingArrivals.map((b) => (
                  <tr key={b.id} className="border-t">
                    <td className="px-4 py-2">{b.checkIn.slice(0, 10)}</td>
                    <td className="px-4 py-2">{b.cottage}</td>
                    <td className="px-4 py-2">{b.email}</td>
                    <td className="px-4 py-2">ETB {b.amount.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section>
        <h2 className="text-lg font-bold mb-3">Recent bookings</h2>
        {data.recentBookings.length === 0 ? (
          <p className="text-stone-500">No bookings yet.</p>
        ) : (
          <div className="bg-white rounded-2xl shadow overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-stone-50 text-left text-stone-500">
                <tr>
                  <th className="px-4 py-2">Cottage</th>
                  <th className="px-4 py-2">Guest</th>
                  <th className="px-4 py-2">Amount</th>
                  <th className="px-4 py-2">Booking</th>
                  <th className="px-4 py-2">Payment</th>
                </tr>
              </thead>
              <tbody>
                {data.recentBookings.map((b) => (
                  <tr key={b.id} className="border-t">
                    <td className="px-4 py-2">{b.cottage}</td>
                    <td className="px-4 py-2">{b.email}</td>
                    <td className="px-4 py-2">ETB {b.amount.toLocaleString()}</td>
                    <td className="px-4 py-2"><Badge value={b.status} /></td>
                    <td className="px-4 py-2"><Badge value={b.paymentStatus} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}