import { prisma } from '@/lib/prisma'
import { randomBytes } from 'crypto'
import type { PaymentStatus } from '@prisma/client'
import type { Prisma } from '@prisma/client'

export type PaymentEntity =
  | { kind: 'booking'; record: { id: string; amount: Prisma.Decimal; paymentStatus: PaymentStatus | null } }
  | { kind: 'order'; record: { id: string; totalAmount: Prisma.Decimal; paymentStatus: PaymentStatus | null } }

export async function resolveCustomer(input: {
  email: string
  name?: string
  phone?: string
}) {
  return prisma.user.upsert({
    where: { email: input.email.toLowerCase() },
    update: {
      firstName: input.name || undefined,
      phoneNumber: input.phone || undefined,
      preferredLanguage: 'am',
    },
    create: {
      email: input.email.toLowerCase(),
      firstName: input.name || 'Guest',
      password: randomBytes(32).toString('hex'),
      role: 'TOURIST',
      preferredLanguage: 'am',
      phoneNumber: input.phone || null,
    },
  })
}

export async function findPaymentEntityByRef(
  txRef: string
): Promise<PaymentEntity | null> {
  const booking = await prisma.booking.findUnique({
    where: { paymentTxRef: txRef },
    select: { id: true, amount: true, paymentStatus: true },
  })
  if (booking) return { kind: 'booking', record: booking }

  const order = await prisma.order.findUnique({
    where: { paymentTxRef: txRef },
    select: { id: true, totalAmount: true, paymentStatus: true },
  })
  if (order) return { kind: 'order', record: order }

  return null
}

export function paymentAmount(entity: PaymentEntity): number {
  if (entity.kind === 'booking') return Number(entity.record.amount)
  return Number(entity.record.totalAmount)
}