import { requireUser } from '@/lib/guards'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import {
  parseExperiencePayload,
  parseMediaUrls,
  replaceSubmissionMedia,
} from '@/lib/submissions'

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const guard = await requireUser()
  if (!guard.ok) return guard.response

  const { id } = await ctx.params
  const existing = await prisma.experience.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ error: 'Experience not found' }, { status: 404 })
  if (existing.submittedById !== guard.session.userId) {
    return NextResponse.json({ error: 'You can only edit your own submissions' }, { status: 403 })
  }
  if (existing.publicationStatus !== 'PENDING') {
    return NextResponse.json(
      { error: 'This listing has already been reviewed by an admin' },
      { status: 400 }
    )
  }

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = await parseExperiencePayload(body)
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 })
  let media: import('@/lib/submissions').ParseResult<import('@/lib/submissions').OkPublicMediaUrl[]> | null = null
  if (Array.isArray(body.media)) {
    media = parseMediaUrls(body.media)
    if (!media.ok) return NextResponse.json({ error: media.error }, { status: 400 })
  }

  const experience = await prisma.experience.update({
    where: { id },
    data: parsed.value,
  })
  if (media) await replaceSubmissionMedia('experience', id, media.value)

  const withMedia = await prisma.experience.findUnique({
    where: { id },
    include: {
      media: { orderBy: { sortOrder: 'asc' }, select: { id: true, title: true, type: true, url: true, provider: true, videoId: true, caption: true, altText: true } },
      cottage: { select: { id: true, name: true } },
    },
  })

  return NextResponse.json({ experience: { ...withMedia, price: Number(withMedia?.price) } })
}

export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const guard = await requireUser()
  if (!guard.ok) return guard.response

  const { id } = await ctx.params
  const existing = await prisma.experience.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ error: 'Experience not found' }, { status: 404 })
  if (existing.submittedById !== guard.session.userId) {
    return NextResponse.json({ error: 'You can only delete your own submissions' }, { status: 403 })
  }
  if (existing.publicationStatus !== 'PENDING') {
    return NextResponse.json(
      { error: 'This listing has already been reviewed by an admin' },
      { status: 400 }
    )
  }

  await prisma.experience.delete({ where: { id } })
  return NextResponse.json({ success: true })
}