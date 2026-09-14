import { prisma } from '@/lib/prisma'
import { resolveCustomer } from '@/lib/payment-entities'
import { NextRequest, NextResponse } from 'next/server'
import { PaymentStatus } from '@prisma/client'

const MAX_ITEMS = 20
const MAX_QTY = 20

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const itemsRaw = Array.isArray(body.items) ? body.items : []
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  const name = typeof body.name === 'string' ? body.name.trim() : ''
  const phone = typeof body.phone === 'string' ? body.phone.trim() : undefined
  const shippingAddress =
    typeof body.shippingAddress === 'string' ? body.shippingAddress.trim() : undefined
  const shippingCity = typeof body.shippingCity === 'string' ? body.shippingCity.trim() : undefined
  const shippingRegion =
    typeof body.shippingRegion === 'string' ? body.shippingRegion.trim() : undefined

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'A valid email is required' }, { status: 400 })
  }
  if (itemsRaw.length === 0 || itemsRaw.length > MAX_ITEMS) {
    return NextResponse.json({ error: 'Your cart is empty or too large' }, { status: 400 })
  }

  type Line = { productId: string; quantity: number }
  const lines: Line[] = itemsRaw.map((it: unknown) => {
    const o = it as Record<string, unknown>
    return {
      productId: typeof o.productId === 'string' ? o.productId.trim() : '',
      quantity:
        typeof o.quantity === 'number' && Number.isInteger(o.quantity) && o.quantity > 0
          ? Math.min(o.quantity, MAX_QTY)
          : 0,
    }
  })

  if (lines.some((l) => !l.productId || l.quantity < 1)) {
    return NextResponse.json({ error: 'Invalid cart items' }, { status: 400 })
  }

  const productIds = [...new Set(lines.map((l) => l.productId))]
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
  })
  const productMap = new Map(products.map((p) => [p.id, p]))

  for (const l of lines) {
    const p = productMap.get(l.productId)
    if (!p || !p.isActive || p.publicationStatus !== 'PUBLISHED') {
      return NextResponse.json({ error: `Product no longer available` }, { status: 409 })
    }
    if (l.quantity > p.stock) {
      return NextResponse.json(
        { error: `Only ${p.stock} of "${p.name}" in stock` },
        { status: 409 }
      )
    }
  }

  const user = await resolveCustomer({ email, name, phone })

  const totalAmount = lines.reduce((sum, l) => {
    const p = productMap.get(l.productId)!
    return sum + Number(p.price) * l.quantity
  }, 0)

  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        userId: user.id,
        totalAmount,
        status: 'PENDING',
        paymentStatus: PaymentStatus.PENDING,
        shippingAddress,
        shippingCity,
        shippingRegion,
        items: {
          create: lines.map((l) => {
            const p = productMap.get(l.productId)!
            return {
              productId: p.id,
              quantity: l.quantity,
              priceAtTime: p.price,
              totalPrice: Number(p.price) * l.quantity,
            }
          }),
        },
      },
    })

    for (const l of lines) {
      await tx.product.update({
        where: { id: l.productId },
        data: { stock: { decrement: l.quantity } },
      })
    }

    return created
  })

  return NextResponse.json(
    {
      orderId: order.id,
      totalAmount,
      itemCount: lines.reduce((s, l) => s + l.quantity, 0),
    },
    { status: 201 }
  )
}