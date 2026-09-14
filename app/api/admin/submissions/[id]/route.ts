import { adminOnly } from '@/lib/guards'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { PublicationStatus } from '@prisma/client'

const STATUSES = Object.values(PublicationStatus) as string[]

export async function PUT(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const guard = await adminOnly()
  if (!guard.ok) return guard.response

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const entity = typeof body.entity === 'string' ? body.entity.toUpperCase() : ''
  if (!['PRODUCT', 'EXPERIENCE'].includes(entity)) {
    return NextResponse.json({ error: 'entity must be PRODUCT or EXPERIENCE' }, { status: 400 })
  }
  const status = typeof body.status === 'string' ? body.status.toUpperCase() : ''
  if (!STATUSES.includes(status)) {
    return NextResponse.json({ error: `status must be one of: ${STATUSES.join(', ')}` }, { status: 400 })
  }
  const rejectionReason = typeof body.rejectionReason === 'string' ? body.rejectionReason.trim() : ''

  const { id } = await ctx.params

  const isProduct = entity === 'PRODUCT'
  const existing = isProduct
    ? await prisma.product.findUnique({ where: { id } })
    : await prisma.experience.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ error: 'Item not found' }, { status: 404 })

  const data = {
    publicationStatus: status as PublicationStatus,
    rejectionReason: status === 'REJECTED' ? rejectionReason : null,
    ...(status === 'PUBLISHED' ? { isActive: true } : {}),
  }

  const updated = isProduct
    ? await prisma.product.update({ where: { id }, data })
    : await prisma.experience.update({ where: { id }, data })

  return NextResponse.json({
    entity,
    id: updated.id,
    publicationStatus: updated.publicationStatus,
  })
}