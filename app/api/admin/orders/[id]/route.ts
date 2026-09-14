import { adminOnly } from '../../guard'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { OrderStatus, PaymentStatus } from '@prisma/client'

const ORDER_STATUSES = Object.values(OrderStatus)
const PAYMENT_STATUSES = Object.values(PaymentStatus)

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const guard = await adminOnly()
  if (!guard.ok) return guard.response
  const { id } = await ctx.params

  const existing = await prisma.order.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ error: 'Order not found' }, { status: 404 })

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const data: {
    status?: OrderStatus
    paymentStatus?: PaymentStatus
    paymentVerifiedAt?: Date
    deliveredAt?: Date | null
  } = {}

  if (body.status !== undefined) {
    if (typeof body.status !== 'string' || !ORDER_STATUSES.includes(body.status as OrderStatus)) {
      return NextResponse.json(
        { error: `status must be one of: ${ORDER_STATUSES.join(', ')}` },
        { status: 400 }
      )
    }
    data.status = body.status as OrderStatus
    if (body.status === OrderStatus.DELIVERED) data.deliveredAt = new Date()
  }

  if (body.paymentStatus !== undefined) {
    if (
      typeof body.paymentStatus !== 'string' ||
      !PAYMENT_STATUSES.includes(body.paymentStatus as PaymentStatus)
    ) {
      return NextResponse.json(
        { error: `paymentStatus must be one of: ${PAYMENT_STATUSES.join(', ')}` },
        { status: 400 }
      )
    }
    data.paymentStatus = body.paymentStatus as PaymentStatus
    if (body.paymentStatus === PaymentStatus.CONFIRMED) {
      data.paymentVerifiedAt = new Date()
    }
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: 'Nothing to update' }, { status: 400 })
  }

  const order = await prisma.order.update({ where: { id }, data })
  return NextResponse.json({ order: { ...order, totalAmount: Number(order.totalAmount) } })
}