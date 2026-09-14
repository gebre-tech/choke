import { adminOnly } from '../guard'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { OrderStatus, PaymentStatus } from '@prisma/client'

const ORDER_STATUSES = Object.values(OrderStatus)
const PAYMENT_STATUSES = Object.values(PaymentStatus)

export async function GET(req: NextRequest) {
  const guard = await adminOnly()
  if (!guard.ok) return guard.response

  const url = new URL(req.url)
  const status = url.searchParams.get('status')
  const paymentStatus = url.searchParams.get('paymentStatus')

  const where: Record<string, unknown> = {}
  if (status && ORDER_STATUSES.includes(status as OrderStatus)) where.status = status
  if (paymentStatus && PAYMENT_STATUSES.includes(paymentStatus as PaymentStatus)) {
    where.paymentStatus = paymentStatus
  }

  const orders = await prisma.order.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { id: true, email: true, firstName: true, lastName: true } },
      items: {
        include: { product: { select: { id: true, name: true } } },
      },
    },
  })

  return NextResponse.json({
    orders: orders.map((o) => ({
      ...o,
      totalAmount: Number(o.totalAmount),
      createdAt: o.createdAt.toISOString(),
      items: o.items.map((it) => ({
        id: it.id,
        productId: it.productId,
        productName: it.product?.name ?? 'Unknown product',
        quantity: it.quantity,
        totalPrice: Number(it.totalPrice),
      })),
    })),
  })
}