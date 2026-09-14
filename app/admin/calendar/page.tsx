'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { adminApi, useAsyncData, Badge } from '@/components/admin/ui'
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'

type BookingRow = {
  id: string
  checkIn: string
  checkOut: string
  guestCount: number
  status: string
  paymentStatus: string
  cottageId: string
  guest: string
}

type CottageRow = { id: string; name: string; totalUnits: number; availableUnits: number }

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const dayKey = (iso: string) => iso.slice(0, 10)

export default function AdminCalendarPage() {
  const [now] = useState(() => new Date())
  const [year, setYear] = useState(now.getFullYear())
  const [monthIndex, setMonthIndex] = useState(now.getMonth())

  const ym = `${year}-${String(monthIndex + 1).padStart(2, '0')}`
  const { data, loading, error } = useAsyncData<{
    calendar: { year: number; monthIndex: number; daysInMonth: number; firstWeekday: number }
    cottages: CottageRow[]
    bookings: BookingRow[]
  }>(() => adminApi(`/api/admin/calendar?month=${ym}`), [ym])

  const shift = (d: number) => {
    const d2 = new Date(year, monthIndex + d, 1)
    setYear(d2.getFullYear())
    setMonthIndex(d2.getMonth())
  }

  const goToday = () => {
    setYear(now.getFullYear())
    setMonthIndex(now.getMonth())
  }

  const dayOf = useCallback(
    (day: number) =>
      `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
    [year, monthIndex]
  )

  const cells = useMemo(() => {
    if (!data) return new Map<number, BookingRow[]>()
    const map = new Map<number, BookingRow[]>()
    for (const b of data.bookings) {
      for (let d = 1; d <= data.calendar.daysInMonth; d++) {
        const dk = dayOf(d)
        if (dk >= dayKey(b.checkIn) && dk < dayKey(b.checkOut)) {
          const arr = map.get(d) ?? []
          arr.push(b)
          map.set(d, arr)
        }
      }
    }
    return map
  }, [data, dayOf])

  if (loading) {
    return (
      <p className="flex items-center gap-2 text-stone-500">
        <Loader2 className="w-5 h-5 animate-spin" /> Loading…
      </p>
    )
  }
  if (error) return <p className="text-red-600">{error}</p>
  if (!data) return null

  const daysInMonth = data.calendar.daysInMonth
  const todayKey = dayOf(now.getDate())

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold">Booking Calendar</h2>
          <button onClick={goToday} className="text-xs px-2.5 py-1.5 rounded-lg border border-stone-200 hover:bg-stone-50">
            Today
          </button>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => shift(-1)} className="p-2 rounded-full border border-stone-200 hover:bg-stone-50">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-semibold min-w-[110px] text-center">
            {MONTHS[monthIndex]} {year}
          </span>
          <button onClick={() => shift(1)} className="p-2 rounded-full border border-stone-200 hover:bg-stone-50">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-3 text-xs">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-emerald-500" /> Confirmed</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-teal-500" /> Completed</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-amber-400" /> Pending payment</span>
      </div>

      <div className="bg-white rounded-2xl shadow overflow-x-auto">
        <table className="w-full text-xs border-collapse" style={{ minWidth: daysInMonth * 22 + 140 }}>
          <thead>
            <tr>
              <th className="sticky left-0 bg-stone-50 text-left px-3 py-2 border-b border-r border-stone-200 z-10">
                Cottage
              </th>
              {Array.from({ length: daysInMonth }, (_, i) => {
                const d = new Date(year, monthIndex, i + 1)
                const isToday = dayOf(i + 1) === todayKey
                return (
                  <th
                    key={i}
                    className={`px-0 py-2 text-center border-b border-stone-100 ${isToday ? 'bg-emerald-50 text-emerald-700' : 'text-stone-400'}`}
                  >
                    {WEEKDAYS[d.getDay()]}
                    <div className="text-[10px] font-normal">{i + 1}</div>
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {data.cottages.map((c) => (
              <tr key={c.id}>
                <td className="sticky left-0 bg-white px-3 py-1.5 border-r border-stone-200 z-10 font-medium whitespace-nowrap">
                  {c.name}
                </td>
                {Array.from({ length: daysInMonth }, (_, d) => {
                  const items = cells.get(d + 1)?.filter((b) => b.cottageId === c.id) ?? []
                  const isToday = dayOf(d + 1) === todayKey
                  const isPast = dayOf(d + 1) < todayKey
                  const confirmed = items.some((b) => b.status === 'CONFIRMED' || b.status === 'COMPLETED')
                  const pending = items.some((b) => b.status === 'PENDING')
                  const color = confirmed ? 'bg-emerald-500' : pending ? 'bg-amber-400' : null
                  const tooltip = items
                    .map((b) => `${b.guest} · ${b.guestCount}p ${b.status} / ${b.paymentStatus}`)
                    .join('\n')
                  return (
                    <td
                      key={d}
                      title={items.length ? tooltip : undefined}
                      className={`px-0 py-1.5 text-center border-r border-stone-100 ${isToday ? 'bg-emerald-50' : ''} ${isPast && !items.length ? 'bg-stone-50/60' : ''}`}
                    >
                      <span
                        className={`inline-block w-full max-w-[18px] mx-auto rounded ${color ?? 'bg-transparent'} ${items.length > 1 ? 'h-4' : 'h-3'}`}
                      />
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 bg-white rounded-2xl shadow p-4">
        <h3 className="font-bold mb-2">
          Bookings in {MONTHS[monthIndex]} {year}
        </h3>
        {data.bookings.length === 0 ? (
          <p className="text-stone-400 text-sm">No bookings this month.</p>
        ) : (
          <div className="space-y-2">
            {data.bookings.map((b) => (
              <div key={b.id} className="flex flex-wrap items-center gap-3 text-sm border-b border-stone-100 pb-2 last:border-0">
                <span className="font-medium">{dayKey(b.checkIn)} → {dayKey(b.checkOut)}</span>
                <span>{data.cottages.find((c) => c.id === b.cottageId)?.name}</span>
                <span className="text-stone-500">{b.guest}</span>
                <Badge value={b.status} />
                <Badge value={b.paymentStatus} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}