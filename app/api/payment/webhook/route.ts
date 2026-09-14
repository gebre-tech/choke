import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { prisma } from '@/lib/prisma'
import { findPaymentEntityByRef } from '@/lib/payment-entities'
import { BookingStatus, PaymentStatus } from '@prisma/client'

const SUCCESS_MARKERS = ['success', 'completed', 'complete']

export async function POST(req: Request) {
  const rawBody = await req.text()
  const signature =
    req.headers.get('x-chapa-signature') ?? req.headers.get('chapa-signature') ?? null
  const secret = process.env.CHAPA_WEBHOOK_SECRET || process.env.CHAPA_SECRET_KEY

  if (!secret) {
    console.error('Webhook secret is not configured')
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 })
  }

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature header' }, { status: 401 })
  }

  const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex')
  if (signature !== expected) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  try {
    const event = JSON.parse(rawBody)
    const data = event?.data && typeof event.data === 'object' ? event.data : event ?? {}
    const eventName = typeof event?.event === 'string' ? event.event : ''

    const txRef = typeof data.tx_ref === 'string' ? data.tx_ref : null
    if (!txRef) {
      return NextResponse.json({ error: 'Missing transaction reference' }, { status: 400 })
    }

    const status = typeof data.status === 'string' ? data.status : ''
    const isPaid =
      SUCCESS_MARKERS.includes(status.toLowerCase()) ||
      SUCCESS_MARKERS.includes(String(data.charge_status ?? '').toLowerCase()) ||
      eventName === 'charge.success'

    const entity = await findPaymentEntityByRef(txRef)

    await prisma.paymentLog.create({
      data: {
        bookingId: entity?.kind === 'booking' ? entity.record.id : null,
        orderId: entity?.kind === 'order' ? entity.record.id : null,
        txRef,
        status: isPaid ? PaymentStatus.CONFIRMED : (status || 'RECEIVED'),
        webhookData: event,
      },
    })

    if (isPaid) {
      if (!entity) {
        console.error(`Webhook for unknown tx_ref: ${txRef}`)
        return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
      }

      if (entity.kind === 'booking') {
        if (entity.record.paymentStatus !== PaymentStatus.CONFIRMED) {
          await prisma.booking.update({
            where: { id: entity.record.id },
            data: {
              paymentStatus: PaymentStatus.CONFIRMED,
              paymentVerifiedAt: new Date(),
              paymentWebhookData: event,
              status: BookingStatus.CONFIRMED,
            },
          })
        }
      } else {
        if (entity.record.paymentStatus !== PaymentStatus.CONFIRMED) {
          await prisma.order.update({
            where: { id: entity.record.id },
            data: {
              paymentStatus: PaymentStatus.CONFIRMED,
              paymentVerifiedAt: new Date(),
              paymentWebhookData: event,
            },
          })
        }
      }
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Webhook processing failed', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}