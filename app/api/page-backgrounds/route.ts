import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const backgrounds = await prisma.media.findMany({
    where: { isActive: true, scope: 'PAGE_BACKGROUND' },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    select: {
      id: true,
      title: true,
      type: true,
      url: true,
      provider: true,
      videoId: true,
      altText: true,
      caption: true,
      sortOrder: true,
      page: true,
      section: true,
    },
  })

  return NextResponse.json({ backgrounds })
}