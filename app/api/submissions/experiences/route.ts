import { requireUser } from '@/lib/guards'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import {
  parseExperiencePayload,
  parseMediaUrls,
  replaceSubmissionMedia,
} from '@/lib/submissions'

export async function GET() {
  const guard = await requireUser()
  if (!guard.ok) return guard.response

  const experiences = await prisma.experience.findMany({
    where: { submittedById: guard.session.userId },
    orderBy: { createdAt: 'desc' },
    include: {
      media: {
        orderBy: { sortOrder: 'asc' },
        select: { id: true, title: true, type: true, url: true, provider: true, videoId: true, caption: true, altText: true },
      },
      cottage: { select: { id: true, name: true } },
    },
  })

  return NextResponse.json({
    experiences: experiences.map((e) => ({
      ...e,
      price: Number(e.price),
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

  const parsed = await parseExperiencePayload(body)
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 })

  const media = parseMediaUrls(body.media)
  if (!media.ok) return NextResponse.json({ error: media.error }, { status: 400 })

  const experience = await prisma.experience.create({
    data: {
      ...parsed.value,
      isActive: true,
      publicationStatus: 'PENDING',
      submittedById: guard.session.userId,
    },
  })

  await replaceSubmissionMedia('experience', experience.id, media.value)

  const withMedia = await prisma.experience.findUnique({
    where: { id: experience.id },
    include: {
      media: { orderBy: { sortOrder: 'asc' }, select: { id: true, title: true, type: true, url: true, provider: true, videoId: true, caption: true, altText: true } },
      cottage: { select: { id: true, name: true } },
    },
  })

  return NextResponse.json(
    { experience: { ...withMedia, price: Number(withMedia?.price) } },
    { status: 201 }
  )
}