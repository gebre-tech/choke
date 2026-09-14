import { adminOnly } from '../guard'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { BookingStatus, OrderStatus, PaymentStatus } from '@prisma/client'

export async function GET() {
  const guard = await adminOnly()
  if (!guard.ok) return guard.response

  const DAY = 86400000
  const now = new Date()
  const t0 = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())
  const todayStart = new Date(t0)
  const tomorrowStart = new Date(t0 + DAY)
  const occupancyEnd = new Date(now.getTime() + 30 * DAY)

  const [totalBookings, confirmedBookings, bookingRevenue, totalOrders, confirmedOrders, orderRevenue, lowStock, productCount, cottageCount, experienceCount, activeUsers, recentBookings, cottageUnits, occupancyBookings, arrivalsToday, departuresToday, upcomingArrivals] =
    await Promise.all([
      prisma.booking.count(),
      prisma.booking.count({ where: { paymentStatus: PaymentStatus.CONFIRMED } }),
      prisma.booking.aggregate({
        where: { paymentStatus: PaymentStatus.CONFIRMED },
        _sum: { amount: true },
      }),
      prisma.order.count(),
      prisma.order.count({ where: { paymentStatus: PaymentStatus.CONFIRMED } }),
      prisma.order.aggregate({
        where: { paymentStatus: PaymentStatus.CONFIRMED },
        _sum: { totalAmount: true },
      }),
      prisma.product.count({ where: { stock: { lte: prisma.product.fields.minimumStock } } }),
      prisma.product.count(),
      prisma.cottage.count(),
      prisma.experience.count(),
      prisma.user.count({ where: { role: { in: ['TOURIST', 'INVESTOR'] } } }),
      prisma.booking.findMany({
        orderBy: { createdAt: 'desc' },
        take: 8,
        include: {
          cottage: { select: { name: true } },
          user: { select: { email: true } },
        },
      }),
      prisma.cottage.aggregate({ _sum: { totalUnits: true } }),
      prisma.booking.findMany({
        where: {
          status: { in: [BookingStatus.PENDING, BookingStatus.CONFIRMED, BookingStatus.COMPLETED] },
          checkIn: { lt: occupancyEnd },
          checkOut: { gt: now },
        },
        select: { checkIn: true, checkOut: true },
      }),
      prisma.booking.count({
        where: {
          status: { in: [BookingStatus.PENDING, BookingStatus.CONFIRMED] },
          checkIn: { gte: todayStart, lt: tomorrowStart },
        },
      }),
      prisma.booking.count({
        where: {
          status: { in: [BookingStatus.CONFIRMED, BookingStatus.COMPLETED] },
          checkOut: { gte: todayStart, lt: tomorrowStart },
        },
      }),
      prisma.booking.findMany({
        where: {
          status: { in: [BookingStatus.PENDING, BookingStatus.CONFIRMED] },
          checkIn: { gte: tomorrowStart },
        },
        orderBy: { checkIn: 'asc' },
        take: 5,
        include: {
          cottage: { select: { name: true } },
          user: { select: { email: true } },
        },
      }),
    ])

  const totalUnits = cottageUnits._sum.totalUnits ?? cottageCount
  let bookedRoomDays = 0
  for (const b of occupancyBookings) {
    const overlapStart = Math.max(b.checkIn.getTime(), now.getTime())
    const overlapEnd = Math.min(b.checkOut.getTime(), occupancyEnd.getTime())
    if (overlapEnd > overlapStart) bookedRoomDays += (overlapEnd - overlapStart) / DAY
  }
  const occupancyPct30 = totalUnits > 0
    ? Math.min(100, Math.round((bookedRoomDays / (totalUnits * 30)) * 1000) / 10)
    : 0

  return NextResponse.json({
    stats: {
      totalBookings,
      confirmedBookings,
      bookingRevenue: Number(bookingRevenue._sum.amount ?? 0),
      totalOrders,
      confirmedOrders,
      orderRevenue: Number(orderRevenue._sum.totalAmount ?? 0),
      lowStock,
      productCount,
      cottageCount,
      experienceCount,
      activeUsers,
      occupancyPct30,
      arrivalsToday,
      departuresToday,
      pendingBookings: await prisma.booking.count({
        where: { status: BookingStatus.PENDING, paymentStatus: PaymentStatus.PENDING },
      }),
      pendingOrders: await prisma.order.count({
        where: { status: OrderStatus.PENDING },
      }),
    },
    recentBookings: recentBookings.map((b) => ({
      id: b.id,
      cottage: b.cottage?.name ?? 'Unknown',
      email: b.user?.email ?? 'Unknown',
      amount: Number(b.amount),
      status: b.status,
      paymentStatus: b.paymentStatus,
      createdAt: b.createdAt.toISOString(),
    })),
    upcomingArrivals: upcomingArrivals.map((b) => ({
      id: b.id,
      cottage: b.cottage?.name ?? 'Unknown',
      email: b.user?.email ?? 'Unknown',
      checkIn: b.checkIn.toISOString(),
      amount: Number(b.amount),
    })),
  })
}