import { requireUser } from '@/lib/guards'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import {
  parseProductPayload,
  parseMediaUrls,
  replaceSubmissionMedia,
} from '@/lib/submissions'

export async function GET() {
  const guard = await requireUser()
  if (!guard.ok) return guard.response

  const products = await prisma.product.findMany({
    where: { submittedById: guard.session.userId },
    orderBy: { createdAt: 'desc' },
    include: {
      media: {
        orderBy: { sortOrder: 'asc' },
        select: { id: true, title: true, type: true, url: true, provider: true, videoId: true, caption: true, altText: true },
      },
    },
  })

  return NextResponse.json({
    products: products.map((p) => ({
      ...p,
      price: Number(p.price),
      weight: p.weight ? Number(p.weight) : null,
    })),
  })
}

export async function POST(req: NextRequest) {
  const guard = await requireUser()
  if (!guard.ok) return guard.response

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = parseProductPayload(body)
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 })

  const media = parseMediaUrls(body.media)
  if (!media.ok) return NextResponse.json({ error: media.error }, { status: 400 })

  const product = await prisma.product.create({
    data: {
      ...parsed.value,
      isActive: true,
      publicationStatus: 'PENDING',
      submittedById: guard.session.userId,
    },
  })

  await replaceSubmissionMedia('product', product.id, media.value)

  const withMedia = await prisma.product.findUnique({
    where: { id: product.id },
    include: {
      media: { orderBy: { sortOrder: 'asc' }, select: { id: true, title: true, type: true, url: true, provider: true, videoId: true, caption: true, altText: true } },
    },
  })

  return NextResponse.json(
    {
      product: {
        ...withMedia,
        price: Number(withMedia?.price),
        weight: withMedia?.weight ? Number(withMedia.weight) : null,
      },
    },
    { status: 201 }
  )
}