import { adminOnly } from '../../guard'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { existsSync, unlinkSync } from 'fs'
import { isLocalUpload } from '@/lib/media-shared'

const mediaInclude = {
  cottage: { select: { id: true, name: true } },
  experience: { select: { id: true, name: true } },
  product: { select: { id: true, name: true } },
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const guard = await adminOnly()
  if (!guard.ok) return guard.response

  const { id } = await ctx.params
  const existing = await prisma.media.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ error: 'Media not found' }, { status: 404 })

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const SCOPES = ['GALLERY', 'COTTAGE', 'EXPERIENCE', 'PRODUCT']
  const scope = typeof body.scope === 'string' ? body.scope.toUpperCase() : undefined
  if (scope && !SCOPES.includes(scope)) {
    return NextResponse.json({ error: 'Invalid scope' }, { status: 400 })
  }
  const type = typeof body.type === 'string' ? body.type.toUpperCase() : undefined
  if (type && !['IMAGE', 'VIDEO', 'AUDIO'].includes(type)) {
    return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
  }

  const attach = (key: 'cottageId' | 'experienceId' | 'productId') =>
    body[key] !== undefined ? (body[key] === null || body[key] === '' ? null : String(body[key])) : undefined

  const cottageId = attach('cottageId')
  const experienceId = attach('experienceId')
  const productId = attach('productId')
  const anyAttach = cottageId !== undefined || experienceId !== undefined || productId !== undefined
  const derivedScope = anyAttach
    ? cottageId
      ? 'COTTAGE'
      : experienceId
        ? 'EXPERIENCE'
        : productId
          ? 'PRODUCT'
          : 'GALLERY'
    : undefined

  const media = await prisma.media.update({
    where: { id },
    data: {
      title: typeof body.title === 'string' && body.title.trim() ? body.title.trim() : undefined,
      caption: typeof body.caption === 'string' ? body.caption.trim() : undefined,
      altText: typeof body.altText === 'string' ? body.altText.trim() : undefined,
      isActive: typeof body.isActive === 'boolean' ? body.isActive : undefined,
      sortOrder: Number.isFinite(Number(body.sortOrder)) ? Number(body.sortOrder) : undefined,
      type: (type as 'IMAGE' | 'VIDEO' | 'AUDIO') ?? undefined,
      scope: derivedScope as 'GALLERY' | 'COTTAGE' | 'EXPERIENCE' | 'PRODUCT' | undefined,
      cottageId: anyAttach ? (cottageId ?? null) : undefined,
      experienceId: anyAttach ? (experienceId ?? null) : undefined,
      productId: anyAttach ? (productId ?? null) : undefined,
    },
    include: mediaInclude,
  })

  return NextResponse.json({ media })
}

export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const guard = await adminOnly()
  if (!guard.ok) return guard.response

  const { id } = await ctx.params
  const existing = await prisma.media.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ error: 'Media not found' }, { status: 404 })

  await prisma.media.delete({ where: { id } })

  if (isLocalUpload(existing.url)) {
    const filePath = `${process.cwd()}\\public${existing.url.replace(/\//g, '\\')}`
    try {
      if (existing.fileName && existsSync(filePath)) unlinkSync(filePath)
    } catch {
      // orphan file cleanup is best-effort
    }
  }

  return NextResponse.json({ success: true })
}