import { adminOnly } from '../guard'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  const guard = await adminOnly()
  if (!guard.ok) return guard.response

  const users = await prisma.user.findMany({
    where: { role: { not: 'ADMIN' } },
    include: {
      bookings: {
        select: { checkIn: true, status: true, paymentStatus: true, amount: true },
      },
      orders: {
        select: { createdAt: true, paymentStatus: true, totalAmount: true },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 500,
  })

  const guests = users.map((u) => {
    const confirmedBookings = u.bookings.filter((b) => b.paymentStatus === 'CONFIRMED')
    const confirmedOrders = u.orders.filter((o) => o.paymentStatus === 'CONFIRMED')
    const bookingSpend = confirmedBookings.reduce((s, b) => s + Number(b.amount), 0)
    const orderSpend = confirmedOrders.reduce((s, o) => s + Number(o.totalAmount), 0)
    const checkIns = u.bookings.map((b) => b.checkIn)
    return {
      id: u.id,
      email: u.email,
      firstName: u.firstName,
      lastName: u.lastName,
      phone: u.phoneNumber,
      country: u.country,
      city: u.city,
      role: u.role,
      createdAt: u.createdAt.toISOString(),
      bookingCount: u.bookings.length,
      confirmedBookingCount: confirmedBookings.length,
      bookingSpend: bookingSpend.toFixed(2),
      orderCount: u.orders.length,
      orderSpend: orderSpend.toFixed(2),
      totalSpend: (bookingSpend + orderSpend).toFixed(2),
      lastCheckIn: checkIns.length ? new Date(Math.max(...checkIns.map((d) => d.getTime()))).toISOString() : null,
    }
  })

  const totals = {
    guests: guests.length,
    totalSpend: guests.reduce((s, g) => s + Number(g.totalSpend), 0).toFixed(2),
    confirmedBookings: guests.reduce((s, g) => s + g.confirmedBookingCount, 0),
  }

  return NextResponse.json({ totals, guests })
}