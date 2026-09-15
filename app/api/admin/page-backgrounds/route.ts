import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/session'

export const dynamic = 'force-dynamic'

async function requireAdmin() {
  const session = await getServerSession()
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return session
}

export async function GET() {
  const session = await requireAdmin()
  if (session instanceof NextResponse) return session

  const backgrounds = await prisma.media.findMany({
    where: { isActive: true, scope: 'PAGE_BACKGROUND' },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
  })

  return NextResponse.json({ backgrounds })
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin()
  if (session instanceof NextResponse) return session

  const body = await req.json()
  const { title, url, type, provider, videoId, page, section, altText, caption, sortOrder } = body

  if (!title || !url || !type || !page) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const background = await prisma.media.create({
    data: {
      title,
      url,
      type,
      provider: provider ?? null,
      videoId: videoId ?? null,
      scope: 'PAGE_BACKGROUND',
      isActive: true,
      sortOrder: sortOrder ?? 0,
      altText: altText ?? null,
      caption: caption ?? null,
      page,
      section: section ?? null,
    },
  })

  return NextResponse.json({ background })
}

export async function PUT(req: NextRequest) {
  const session = await requireAdmin()
  if (session instanceof NextResponse) return session

  const body = await req.json()
  const { id, ...data } = body

  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  }

  const background = await prisma.media.update({
    where: { id },
    data: {
      title: data.title,
      url: data.url,
      type: data.type,
      provider: data.provider ?? null,
      videoId: data.videoId ?? null,
      isActive: data.isActive ?? true,
      sortOrder: data.sortOrder ?? 0,
      altText: data.altText ?? null,
      caption: data.caption ?? null,
      page: data.page,
      section: data.section ?? null,
    },
  })

  return NextResponse.json({ background })
}

export async function DELETE(req: NextRequest) {
  const session = await requireAdmin()
  if (session instanceof NextResponse) return session

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  }

  await prisma.media.delete({ where: { id } })
  return NextResponse.json({ success: true })
}