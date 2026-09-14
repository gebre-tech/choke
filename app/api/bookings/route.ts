import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import { BookingStatus, PaymentStatus } from '@prisma/client'

const MAX_NIGHTS = 30
const MAX_GUESTS = 6

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const cottageId = typeof body.cottageId === 'string' ? body.cottageId.trim() : ''
  const checkInRaw = typeof body.checkIn === 'string' ? body.checkIn : ''
  const checkOutRaw = typeof body.checkOut === 'string' ? body.checkOut : ''
  const guestCount = typeof body.guestCount === 'number' ? Math.floor(body.guestCount) : 1
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  const name =
    typeof body.name === 'string' ? body.name.trim() : ''
  const phone =
    typeof body.phone === 'string' ? body.phone.trim() : undefined
  const specialRequests =
    typeof body.specialRequests === 'string' ? body.specialRequests.trim() : undefined

  if (!cottageId) {
    return NextResponse.json({ error: 'cottageId is required' }, { status: 400 })
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'A valid email is required' }, { status: 400 })
  }
  if (guestCount < 1 || guestCount > MAX_GUESTS) {
    return NextResponse.json(
      { error: `guestCount must be between 1 and ${MAX_GUESTS}` },
      { status: 400 }
    )
  }

  const checkIn = new Date(`${checkInRaw}T12:00:00.000Z`)
  const checkOut = new Date(`${checkOutRaw}T12:00:00.000Z`)
  if (Number.isNaN(checkIn.getTime()) || Number.isNaN(checkOut.getTime())) {
    return NextResponse.json({ error: 'Invalid check-in/check-out dates' }, { status: 400 })
  }

  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)
  const checkInStart = new Date(checkInRaw + 'T00:00:00.000Z')
  if (checkInStart < today) {
    return NextResponse.json({ error: 'Check-in cannot be in the past' }, { status: 400 })
  }

  const nights = Math.round((checkOut.getTime() - checkIn.getTime()) / 86400000)
  if (nights < 1) {
    return NextResponse.json({ error: 'Check-out must be after check-in' }, { status: 400 })
  }
  if (nights > MAX_NIGHTS) {
    return NextResponse.json(
      { error: `Maximum stay is ${MAX_NIGHTS} nights` },
      { status: 400 }
    )
  }

  const cottage = await prisma.cottage.findUnique({ where: { id: cottageId } })
  if (!cottage) {
    return NextResponse.json({ error: 'Cottage not found' }, { status: 404 })
  }
  if (!cottage.isAvailable || cottage.availableUnits <= 0) {
    return NextResponse.json({ error: 'This cottage is currently unavailable' }, { status: 409 })
  }
  if (guestCount > cottage.capacity) {
    return NextResponse.json(
      { error: `This cottage sleeps up to ${cottage.capacity} guests` },
      { status: 400 }
    )
  }

  const overlapping = await prisma.booking.count({
    where: {
      cottageId,
      status: { not: BookingStatus.CANCELLED },
      paymentStatus: { in: [PaymentStatus.PENDING, PaymentStatus.CONFIRMED] },
      checkIn: { lt: checkOut },
      checkOut: { gt: checkIn },
    },
  })
  if (overlapping >= cottage.availableUnits) {
    return NextResponse.json(
      { error: 'Cottage is fully booked for those dates — try different dates or another cottage' },
      { status: 409 }
    )
  }

  const amount = Number(cottage.pricePerNight) * nights

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      firstName: name || undefined,
      phoneNumber: phone ?? undefined,
      preferredLanguage: 'am',
    },
    create: {
      email,
      firstName: name || 'Guest',
      lastName: null,
      phoneNumber: phone ?? null,
      password: randomBytes(32).toString('hex'),
      role: 'TOURIST',
      preferredLanguage: 'am',
    },
  })

  const booking = await prisma.booking.create({
    data: {
      userId: user.id,
      cottageId,
      checkIn,
      checkOut,
      guestCount,
      specialRequests: specialRequests || null,
      amount,
      paymentStatus: PaymentStatus.PENDING,
      status: BookingStatus.PENDING,
    },
  })

  return NextResponse.json(
    {
      bookingId: booking.id,
      cottage: cottage.name,
      nights,
      amount,
      checkIn: checkInRaw,
      checkOut: checkOutRaw,
    },
    { status: 201 }
  )
}