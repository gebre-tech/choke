import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const media = await prisma.media.findMany({
    where: { isActive: true, scope: 'GALLERY' },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
  })
  return NextResponse.json({
    media: media.map((m) => ({
      id: m.id,
      title: m.title,
      type: m.type,
      url: m.url,
      provider: m.provider,
      videoId: m.videoId,
      caption: m.caption,
      altText: m.altText,
      mimeType: m.mimeType,
    })),
  })
}