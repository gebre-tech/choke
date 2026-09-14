import { adminOnly } from '../guard'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { ProductCategory } from '@prisma/client'

const CATEGORIES = Object.values(ProductCategory)

export async function GET(req: NextRequest) {
  const guard = await adminOnly()
  if (!guard.ok) return guard.response
  const products = await prisma.product.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: { select: { orderItems: true } },
      submittedBy: { select: { id: true, email: true } },
      media: {
        orderBy: { sortOrder: 'asc' },
        select: {
          id: true,
          title: true,
          type: true,
          url: true,
          provider: true,
          videoId: true,
          caption: true,
          altText: true,
          scope: true,
          sortOrder: true,
          isActive: true,
        },
      },
    },
  })
  return NextResponse.json({
    products: products.map((p) => ({
      ...p,
      price: Number(p.price),
      weight: p.weight ? Number(p.weight) : null,
      published: p.publicationStatus === 'PUBLISHED' && p.isActive,
    })),
  })
}

export async function POST(req: NextRequest) {
  const guard = await adminOnly()
  if (!guard.ok) return guard.response

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const name = typeof body.name === 'string' ? body.name.trim() : ''
  if (!name) return NextResponse.json({ error: 'name is required' }, { status: 400 })

  const price = Number(body.price)
  if (!Number.isFinite(price) || price <= 0) {
    return NextResponse.json({ error: 'price must be a positive number' }, { status: 400 })
  }

  const category = typeof body.category === 'string' ? body.category : ''
  if (!CATEGORIES.includes(category as ProductCategory)) {
    return NextResponse.json(
      { error: `category must be one of: ${CATEGORIES.join(', ')}` },
      { status: 400 }
    )
  }

  const stock = Number(body.stock)
  if (!Number.isInteger(stock) || stock < 0) {
    return NextResponse.json({ error: 'stock must be a non-negative integer' }, { status: 400 })
  }

  const product = await prisma.product.create({
    data: {
      name,
      description: typeof body.description === 'string' ? body.description.trim() : '',
      price,
      category: category as ProductCategory,
      stock,
      minimumStock: Math.max(0, Number(body.minimumStock) || 5),
      producerName:
        typeof body.producerName === 'string' ? body.producerName.trim() : 'Taeme Abakidan Community',
      producerLocation:
        typeof body.producerLocation === 'string' ? body.producerLocation.trim() : 'Dega Damot, Ethiopia',
      isOrganic: body.isOrganic !== false,
      weight: body.weight ? Number(body.weight) : null,
      isActive: body.isActive !== false,
    },
  })

  return NextResponse.json({ product: { ...product, price: Number(product.price), weight: product.weight ? Number(product.weight) : null } }, { status: 201 })
}