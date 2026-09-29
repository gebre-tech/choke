import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { findPaymentEntityByRef, paymentAmount } from '@/lib/payment-entities'
import { chapa } from '@/lib/chapa'
import { BookingStatus, PaymentStatus } from '@prisma/client'

const DEFAULT_RENDER_API_URL = 'https://choke.onrender.com'

export async function GET(
  req: Request,
  ctx: { params: Promise<{ ref: string }> }
) {
  try {
    const { ref } = await ctx.params

    if (!ref || typeof ref !== 'string') {
      return NextResponse.json({ error: 'Transaction reference is required' }, { status: 400 })
    }

    // The local frontend creates orders on Render, so its return page must ask
    // Render to verify and update that same order. On Render itself, use the
    // local database and Chapa client as usual.
    if (!process.env.RENDER_EXTERNAL_URL) {
      const apiUrl = (process.env.RENDER_API_URL || DEFAULT_RENDER_API_URL).replace(/\/+$/, '')
      const remoteResponse = await fetch(
        `${apiUrl}/api/payment/verify/${encodeURIComponent(ref)}`,
        { cache: 'no-store', signal: AbortSignal.timeout(30_000) }
      )
      const remoteData = await remoteResponse.json().catch(() => ({}))
      return NextResponse.json(remoteData, { status: remoteResponse.status })
    }

    const entity = await findPaymentEntityByRef(ref)
    if (!entity) return NextResponse.json({ error: 'Payment not found' }, { status: 404 })

    const response = await chapa.get(`/transaction/verify/${ref}`)
    const data = response.data?.data ?? {}

    const providerStatus = String(data.status ?? data.charge_status ?? '').toLowerCase()
    const isPaid = providerStatus === 'success' || providerStatus === 'completed'
    const isFailed = ['failed', 'cancelled', 'canceled', 'expired'].includes(providerStatus)

    let paymentStatus: PaymentStatus = isPaid
      ? PaymentStatus.CONFIRMED
      : isFailed
        ? PaymentStatus.FAILED
        : PaymentStatus.PENDING
    const paidAmount = Number(data.amount)
    if (isPaid) {
      if (
        !Number.isFinite(paidAmount) ||
        Math.abs(paidAmount - paymentAmount(entity)) > 0.01
      ) {
        console.error(
          `Amount mismatch for tx ${ref}: expected ${paymentAmount(entity)}, received ${paidAmount}`
        )
        paymentStatus = PaymentStatus.FAILED
      }
    }

    if (entity.kind === 'booking') {
      await prisma.booking.update({
        where: { id: entity.record.id },
        data: {
          paymentStatus: entity.record.paymentStatus === PaymentStatus.CONFIRMED
            ? PaymentStatus.CONFIRMED
            : paymentStatus,
          paymentVerifiedAt: isPaid ? new Date() : null,
          paymentData: data,
          ...(isPaid ? { status: BookingStatus.CONFIRMED } : {}),
        },
      })
    } else {
      await prisma.order.update({
        where: { id: entity.record.id },
        data: {
          paymentStatus: entity.record.paymentStatus === PaymentStatus.CONFIRMED
            ? PaymentStatus.CONFIRMED
            : paymentStatus,
          paymentVerifiedAt: isPaid ? new Date() : null,
          paymentData: data,
        },
      })
    }

    return NextResponse.json({
      success: true,
      status: paymentStatus,
      entityType: entity.kind,
    })
  } catch (error) {
    console.error('Payment verification failed', error)
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 })
  }
}
