import { adminOnly } from '../../guard'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { ProductCategory } from '@prisma/client'

const CATEGORIES = Object.values(ProductCategory)

type ProductPatch = {
  name?: string
  description?: string
  price?: number
  category?: ProductCategory
  stock?: number
  minimumStock?: number
  producerName?: string
  producerLocation?: string
  isOrganic?: boolean
  weight?: number | null
  isActive?: boolean
}

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const guard = await adminOnly()
  if (!guard.ok) return guard.response
  const { id } = await ctx.params

  const existing = await prisma.product.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ error: 'Product not found' }, { status: 404 })

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const data: ProductPatch = {}

  if (typeof body.name === 'string') {
    if (!body.name.trim()) return NextResponse.json({ error: 'name cannot be empty' }, { status: 400 })
    data.name = body.name.trim()
  }
  if (typeof body.description === 'string') data.description = body.description.trim()
  if (typeof body.producerName === 'string') data.producerName = body.producerName.trim()
  if (typeof body.producerLocation === 'string') data.producerLocation = body.producerLocation.trim()
  if (body.price !== undefined) {
    const v = Number(body.price)
    if (!Number.isFinite(v) || v <= 0) return NextResponse.json({ error: 'price must be positive' }, { status: 400 })
    data.price = v
  }
  if (body.stock !== undefined) {
    const v = Number(body.stock)
    if (!Number.isInteger(v) || v < 0) return NextResponse.json({ error: 'stock must be non-negative' }, { status: 400 })
    data.stock = v
  }
  if (body.minimumStock !== undefined) {
    const v = Number(body.minimumStock)
    if (!Number.isInteger(v) || v < 0) return NextResponse.json({ error: 'minimumStock must be non-negative' }, { status: 400 })
    data.minimumStock = v
  }
  if (typeof body.category === 'string') {
    if (!CATEGORIES.includes(body.category as ProductCategory)) {
      return NextResponse.json({ error: `category must be one of: ${CATEGORIES.join(', ')}` }, { status: 400 })
    }
    data.category = body.category as ProductCategory
  }
  if (typeof body.isOrganic === 'boolean') data.isOrganic = body.isOrganic
  if (typeof body.isActive === 'boolean') data.isActive = body.isActive
  if (body.weight !== undefined) {
    data.weight = body.weight === null || body.weight === '' ? null : Number(body.weight)
  }

  const product = await prisma.product.update({ where: { id }, data })
  return NextResponse.json({
    product: { ...product, price: Number(product.price), weight: product.weight ? Number(product.weight) : null },
  })
}

export async function DELETE(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const guard = await adminOnly()
  if (!guard.ok) return guard.response
  const { id } = await ctx.params

  const references = await prisma.orderItem.count({ where: { productId: id } })
  if (references > 0) {
    return NextResponse.json(
      { error: `Cannot delete: this product appears in ${references} order(s)` },
      { status: 409 }
    )
  }

  try {
    await prisma.product.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Product is referenced elsewhere and cannot be deleted' }, { status: 409 })
  }
}