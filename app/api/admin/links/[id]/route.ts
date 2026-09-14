import { adminOnly } from '@/lib/guards'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

const linkInclude = {
  cottage: { select: { id: true, name: true } },
  experience: { select: { id: true, name: true } },
  product: { select: { id: true, name: true } },
}

const LINK_TYPES = ['WEBSITE', 'BOOKING', 'PURCHASE', 'LOCATION', 'SOCIAL', 'VIDEO', 'OTHER'] as const

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const guard = await adminOnly()
  if (!guard.ok) return guard.response

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { id } = await ctx.params
  const existing = await prisma.link.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ error: 'Link not found' }, { status: 404 })

  const data: Record<string, unknown> = {}

  if (typeof body.type === 'string') {
    const type = body.type.toUpperCase()
    if (!LINK_TYPES.includes(type as (typeof LINK_TYPES)[number])) {
      return NextResponse.json({ error: `type must be one of: ${LINK_TYPES.join(', ')}` }, { status: 400 })
    }
    data.type = type
  }

  if (typeof body.url === 'string') {
    const url = body.url.trim()
    if (!url) return NextResponse.json({ error: 'url cannot be empty' }, { status: 400 })
    try {
      new URL(url)
    } catch {
      return NextResponse.json({ error: 'url must be a valid URL' }, { status: 400 })
    }
    data.url = url
  }

  if (typeof body.title === 'string') {
    const title = body.title.trim()
    if (!title) return NextResponse.json({ error: 'title cannot be empty' }, { status: 400 })
    data.title = title
  }

  if (typeof body.description === 'string') {
    data.description = body.description.trim() || null
  }

  if (typeof body.openInNewTab === 'boolean') {
    data.openInNewTab = body.openInNewTab
  }

  if (typeof body.sortOrder === 'number') {
    data.sortOrder = body.sortOrder
  }

  if (typeof body.isActive === 'boolean') {
    data.isActive = body.isActive
  }

  // Handle re-attachment
  if (body.cottageId !== undefined || body.experienceId !== undefined || body.productId !== undefined) {
    const cottageId = typeof body.cottageId === 'string' ? body.cottageId : ''
    const experienceId = typeof body.experienceId === 'string' ? body.experienceId : ''
    const productId = typeof body.productId === 'string' ? body.productId : ''
    const ids = [cottageId, experienceId, productId].filter(Boolean)
    if (ids.length > 1) return NextResponse.json({ error: 'Link can be attached to only one item at a time' }, { status: 400 })
    data.cottageId = cottageId || null
    data.experienceId = experienceId || null
    data.productId = productId || null
  }

  const link = await prisma.link.update({
    where: { id },
    data,
    include: linkInclude,
  })

  return NextResponse.json({ link })
}

export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const guard = await adminOnly()
  if (!guard.ok) return guard.response

  const { id } = await ctx.params
  await prisma.link.delete({ where: { id } })
  return NextResponse.json({ success: true })
}