import { adminOnly } from '../guard'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const guard = await adminOnly()
  if (!guard.ok) return guard.response

  const month = req.nextUrl.searchParams.get('month') ?? ''
  const m = month.match(/^(\d{4})-(\d{2})$/)
  const now = new Date()
  const year = m ? Number(m[1]) : now.getFullYear()
  const monthIndex = m ? Number(m[2]) - 1 : now.getMonth()

  const start = new Date(Date.UTC(year, monthIndex, 1))
  const end = new Date(Date.UTC(year, monthIndex + 1, 1))

  const [cottages, bookings] = await Promise.all([
    prisma.cottage.findMany({
      select: { id: true, name: true, totalUnits: true, availableUnits: true },
      orderBy: { name: 'asc' },
    }),
    prisma.booking.findMany({
      where: {
        checkIn: { lt: end },
        checkOut: { gt: start },
        status: { in: ['PENDING', 'CONFIRMED', 'COMPLETED'] },
      },
      select: {
        id: true,
        checkIn: true,
        checkOut: true,
        guestCount: true,
        status: true,
        paymentStatus: true,
        cottageId: true,
        user: { select: { email: true, firstName: true } },
      },
      orderBy: { checkIn: 'asc' },
    }),
  ])

  return NextResponse.json({
    calendar: {
      year,
      monthIndex,
      daysInMonth: new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate(),
      firstWeekday: new Date(Date.UTC(year, monthIndex, 1)).getUTCDay(),
    },
    cottages,
    bookings: bookings.map((b) => ({
      id: b.id,
      checkIn: b.checkIn.toISOString(),
      checkOut: b.checkOut.toISOString(),
      guestCount: b.guestCount,
      status: b.status,
      paymentStatus: b.paymentStatus,
      cottageId: b.cottageId,
      guest: b.user ? `${b.user.firstName} <${b.user.email}>` : 'Guest',
    })),
  })
}