import { adminOnly } from '../guard'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { BookingStatus, PaymentStatus } from '@prisma/client'

const BOOKING_STATUSES = Object.values(BookingStatus)
const PAYMENT_STATUSES = Object.values(PaymentStatus)

export async function GET(req: NextRequest) {
  const guard = await adminOnly()
  if (!guard.ok) return guard.response

  const url = new URL(req.url)
  const status = url.searchParams.get('status')
  const paymentStatus = url.searchParams.get('paymentStatus')
  const cottageId = url.searchParams.get('cottageId')

  const where: Record<string, unknown> = {}
  if (status && BOOKING_STATUSES.includes(status as BookingStatus)) where.status = status
  if (paymentStatus && PAYMENT_STATUSES.includes(paymentStatus as PaymentStatus)) {
    where.paymentStatus = paymentStatus
  }
  if (cottageId) where.cottageId = cottageId

  const bookings = await prisma.booking.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      cottage: { select: { id: true, name: true } },
      user: { select: { id: true, email: true, firstName: true, lastName: true, phoneNumber: true } },
    },
  })

  return NextResponse.json({
    bookings: bookings.map((b) => ({
      ...b,
      amount: Number(b.amount),
      checkIn: b.checkIn.toISOString(),
      checkOut: b.checkOut.toISOString(),
      createdAt: b.createdAt.toISOString(),
    })),
  })
}