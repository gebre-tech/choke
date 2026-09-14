import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { chapa } from '@/lib/chapa'
import { PaymentStatus } from '@prisma/client'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const ENTITY_TYPES = ['booking', 'order'] as const
type EntityType = (typeof ENTITY_TYPES)[number]

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null) as Record<string, unknown> | null
    const { bookingId, entityType, entityId, email, name, phoneNumber } = body ?? {}

    const type: EntityType | null =
      entityType === 'booking' || entityType === 'order'
        ? entityType
        : typeof bookingId === 'string'
          ? 'booking'
          : null

    const id = typeof bookingId === 'string'
      ? bookingId
      : typeof entityId === 'string'
        ? entityId
        : ''

    if (!type) {
      return NextResponse.json(
        { error: 'entityType (booking or order) is required' },
        { status: 400 }
      )
    }
    if (!id) {
      return NextResponse.json({ error: 'entityId is required' }, { status: 400 })
    }
    if (!email || typeof email !== 'string' || !EMAIL_RE.test(email)) {
      return NextResponse.json({ error: 'A valid email is required' }, { status: 400 })
    }

    let amount: number
    let entity: { id: string; paymentStatus: PaymentStatus }
    if (type === 'booking') {
      const booking = await prisma.booking.findUnique({
        where: { id },
        select: { id: true, amount: true, paymentStatus: true },
      })
      if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
      entity = booking
      amount = Number(booking.amount)
    } else {
      const order = await prisma.order.findUnique({
        where: { id },
        select: { id: true, totalAmount: true, paymentStatus: true },
      })
      if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })
      entity = order
      amount = Number(order.totalAmount)
    }

    if (entity.paymentStatus === PaymentStatus.CONFIRMED) {
      return NextResponse.json({ error: 'Already paid' }, { status: 409 })
    }

    // Amount is always derived from the server-side record, never from the client.
    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
    }

    const txRef = `CHOKE-${Date.now()}-${entity.id.slice(-6)}`
    const appUrl = process.env.APP_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000'

    const response = await chapa.post('/transaction/initialize', {
      amount: amount.toFixed(2),
      currency: 'ETB',
      email,
      first_name: name || 'Guest',
      tx_ref: txRef,
      callback_url: `${appUrl}/api/payment/verify/${txRef}`,
      return_url: `${appUrl}/payment/success?ref=${txRef}`,
      ...(typeof phoneNumber === 'string' && phoneNumber ? { phone_number: phoneNumber } : {}),
    })

    const checkoutUrl = response.data?.data?.checkout_url
    if (!checkoutUrl) {
      throw new Error('Chapa did not return a checkout URL')
    }

    if (type === 'booking') {
      await prisma.booking.update({
        where: { id },
        data: { paymentTxRef: txRef, paymentStatus: PaymentStatus.PENDING },
      })
    } else {
      await prisma.order.update({
        where: { id },
        data: { paymentTxRef: txRef, paymentStatus: PaymentStatus.PENDING },
      })
    }

    return NextResponse.json({
      success: true,
      checkout_url: checkoutUrl,
      tx_ref: txRef,
      entityType: type,
    })
  } catch (error) {
    console.error('Payment initiation failed', error)
    return NextResponse.json({ error: 'Payment initiation failed' }, { status: 500 })
  }
}