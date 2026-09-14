import { adminOnly } from '@/lib/guards'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

const mediaSelect = {
  orderBy: { sortOrder: 'asc' as const },
  select: { id: true, title: true, type: true, url: true, provider: true, videoId: true, caption: true, altText: true },
}

export async function GET() {
  const guard = await adminOnly()
  if (!guard.ok) return guard.response

  const [products, experiences] = await Promise.all([
    prisma.product.findMany({
      where: { publicationStatus: { not: 'PUBLISHED' } },
      orderBy: { createdAt: 'desc' },
      include: {
        media: mediaSelect,
        submittedBy: { select: { email: true, firstName: true } },
      },
    }),
    prisma.experience.findMany({
      where: { publicationStatus: { not: 'PUBLISHED' } },
      orderBy: { createdAt: 'desc' },
      include: {
        media: mediaSelect,
        submittedBy: { select: { email: true, firstName: true } },
        cottage: { select: { name: true } },
      },
    }),
  ])

  return NextResponse.json({
    products: products.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      price: Number(p.price),
      category: p.category,
      publicationStatus: p.publicationStatus,
      rejectionReason: p.rejectionReason,
      createdAt: p.createdAt.toISOString(),
      submittedBy: p.submittedBy,
      media: p.media,
    })),
    experiences: experiences.map((e) => ({
      id: e.id,
      name: e.name,
      description: e.description,
      price: Number(e.price),
      type: e.type,
      cottageId: e.cottageId,
      cottage: e.cottage?.name ?? null,
      publicationStatus: e.publicationStatus,
      rejectionReason: e.rejectionReason,
      createdAt: e.createdAt.toISOString(),
      submittedBy: e.submittedBy,
      media: e.media,
    })),
  })
}