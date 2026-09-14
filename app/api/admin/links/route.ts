import { adminOnly } from '@/lib/guards'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

const linkInclude = {
  cottage: { select: { id: true, name: true } },
  experience: { select: { id: true, name: true } },
  product: { select: { id: true, name: true } },
}

const LINK_TYPES = ['WEBSITE', 'BOOKING', 'PURCHASE', 'LOCATION', 'SOCIAL', 'VIDEO', 'OTHER'] as const

export async function GET(req: NextRequest) {
  const guard = await adminOnly()
  if (!guard.ok) return guard.response

  const { searchParams } = new URL(req.url)
  const cottageId = searchParams.get('cottageId')
  const experienceId = searchParams.get('experienceId')
  const productId = searchParams.get('productId')

  const where: Record<string, unknown> = {}
  if (cottageId) where.cottageId = cottageId
  if (experienceId) where.experienceId = experienceId
  if (productId) where.productId = productId

  const links = await prisma.link.findMany({
    where,
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    include: linkInclude,
  })

  return NextResponse.json({ links })
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

  const type = typeof body.type === 'string' ? body.type.toUpperCase() : ''
  if (!LINK_TYPES.includes(type as (typeof LINK_TYPES)[number])) {
    return NextResponse.json({ error: `type must be one of: ${LINK_TYPES.join(', ')}` }, { status: 400 })
  }

  const url = typeof body.url === 'string' ? body.url.trim() : ''
  if (!url) return NextResponse.json({ error: 'url is required' }, { status: 400 })
  try {
    new URL(url)
  } catch {
    return NextResponse.json({ error: 'url must be a valid URL' }, { status: 400 })
  }

  const title = typeof body.title === 'string' ? body.title.trim() : ''
  if (!title) return NextResponse.json({ error: 'title is required' }, { status: 400 })

  const description = typeof body.description === 'string' ? body.description.trim() : null
  const openInNewTab = body.openInNewTab !== false

  const attachment = pickAttachment(body)
  if ('error' in attachment) {
    return NextResponse.json({ error: attachment.error }, { status: 400 })
  }

  const link = await prisma.link.create({
    data: {
      type: type as (typeof LINK_TYPES)[number],
      title,
      url,
      description,
      openInNewTab,
      cottageId: attachment.cottageId ?? null,
      experienceId: attachment.experienceId ?? null,
      productId: attachment.productId ?? null,
    },
    include: linkInclude,
  })

  return NextResponse.json({ link }, { status: 201 })
}

function pickAttachment(
  body: Record<string, unknown>
): { error: string } | { cottageId?: string; experienceId?: string; productId?: string } {
  const cottageId = typeof body.cottageId === 'string' ? body.cottageId : ''
  const experienceId = typeof body.experienceId === 'string' ? body.experienceId : ''
  const productId = typeof body.productId === 'string' ? body.productId : ''
  const ids = [cottageId, experienceId, productId].filter(Boolean)
  if (ids.length > 1) return { error: 'Link can be attached to only one item at a time' }
  if (cottageId) return { cottageId }
  if (experienceId) return { experienceId }
  if (productId) return { productId }
  return {}
}