import { adminOnly } from '../guard'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import {
  classifyExternalUrl,
  detectMediaTypeFromUrl,
  isUrlReachableUrl,
  type MediaType,
  type MediaScope,
} from '@/lib/media-shared'

const mediaInclude = {
  cottage: { select: { id: true, name: true } },
  experience: { select: { id: true, name: true } },
  product: { select: { id: true, name: true } },
}

const SCOPES = ['GALLERY', 'COTTAGE', 'EXPERIENCE', 'PRODUCT', 'PAGE_BACKGROUND'] as const

export async function GET(req: NextRequest) {
  const guard = await adminOnly()
  if (!guard.ok) return guard.response
  const media = await prisma.media.findMany({
    orderBy: [{ scope: 'asc' }, { sortOrder: 'asc' }, { createdAt: 'desc' }],
    include: mediaInclude,
  })
  return NextResponse.json({ media })
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

  const url = typeof body.url === 'string' ? body.url.trim() : ''
  if (!url) return NextResponse.json({ error: 'url is required' }, { status: 400 })
  if (!isUrlReachableUrl(url) && !url.startsWith('/uploads/')) {
    return NextResponse.json(
      { error: 'url must be an http(s) link or an uploaded file' },
      { status: 400 }
    )
  }

  let type = typeof body.type === 'string' ? (body.type.toUpperCase() as MediaType) : ''
  if (type && !['IMAGE', 'VIDEO', 'AUDIO'].includes(type)) {
    return NextResponse.json({ error: 'type must be IMAGE, VIDEO or AUDIO' }, { status: 400 })
  }
  if (!type) type = detectMediaTypeFromUrl(url) ?? ''
  if (!type) {
    return NextResponse.json(
      { error: 'Could not detect media type — set image/video/audio' },
      { status: 400 }
    )
  }

  const rawScope = typeof body.scope === 'string' ? (body.scope.toUpperCase() as MediaScope) : 'GALLERY'
  if (!SCOPES.includes(rawScope)) {
    return NextResponse.json({ error: 'scope must be one of: GALLERY, COTTAGE, EXPERIENCE, PRODUCT' }, { status: 400 })
  }

  const attachment = pickAttachment(body)
  if ('error' in attachment) {
    return NextResponse.json({ error: attachment.error }, { status: 400 })
  }

  const external = classifyExternalUrl(url)

  const media = await prisma.media.create({
    data: {
      title: typeof body.title === 'string' && body.title.trim() ? body.title.trim() : url.split('/').pop() ?? 'Untitled',
      url,
      type: type as MediaType,
      provider: external?.provider ?? 'NONE',
      videoId: external?.videoId ?? null,
      scope: attachment.scope ?? rawScope,
      caption: typeof body.caption === 'string' ? body.caption.trim() : null,
      altText: typeof body.altText === 'string' ? body.altText.trim() : null,
      cottageId: attachment.cottageId ?? null,
      experienceId: attachment.experienceId ?? null,
      productId: attachment.productId ?? null,
    },
    include: mediaInclude,
  })

  return NextResponse.json({ media }, { status: 201 })
}

function pickAttachment(
  body: Record<string, unknown>
): { error: string } | { scope?: MediaScope; cottageId?: string; experienceId?: string; productId?: string; pageId?: string; section?: string } {
  const cottageId = typeof body.cottageId === 'string' ? body.cottageId : ''
  const experienceId = typeof body.experienceId === 'string' ? body.experienceId : ''
  const productId = typeof body.productId === 'string' ? body.productId : ''
  const pageId = typeof body.page === 'string' ? body.page : ''
  const section = typeof body.section === 'string' ? body.section : ''
  const ids = [cottageId, experienceId, productId].filter(Boolean)
  if (ids.length > 1) return { error: 'Media can be attached to only one item at a time' }
  if (cottageId) return { scope: 'COTTAGE', cottageId }
  if (experienceId) return { scope: 'EXPERIENCE', experienceId }
  if (productId) return { scope: 'PRODUCT', productId }
  if (pageId) return { scope: 'PAGE_BACKGROUND', pageId, section }
  return {}
}