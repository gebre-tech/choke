import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { findPaymentEntityByRef, paymentAmount } from '@/lib/payment-entities'
import { chapa } from '@/lib/chapa'
import { PaymentStatus } from '@prisma/client'

export async function GET(
  req: Request,
  ctx: { params: Promise<{ ref: string }> }
) {
  try {
    const { ref } = await ctx.params

    if (!ref || typeof ref !== 'string') {
      return NextResponse.json({ error: 'Transaction reference is required' }, { status: 400 })
    }

    const entity = await findPaymentEntityByRef(ref)
    if (!entity) return NextResponse.json({ error: 'Payment not found' }, { status: 404 })

    const response = await chapa.get(`/transaction/verify/${ref}`)
    const data = response.data?.data ?? {}

    const isPaid = data.status === 'success' || data.charge_status === 'success'

    let paymentStatus: PaymentStatus = isPaid ? PaymentStatus.CONFIRMED : PaymentStatus.FAILED
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
          paymentStatus,
          paymentVerifiedAt: isPaid ? new Date() : null,
          paymentData: data,
        },
      })
    } else {
      await prisma.order.update({
        where: { id: entity.record.id },
        data: {
          paymentStatus,
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