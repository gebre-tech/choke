import { adminOnly } from '../guard'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { ExperienceType } from '@prisma/client'

const TYPES = Object.values(ExperienceType)

export async function GET(req: NextRequest) {
  const guard = await adminOnly()
  if (!guard.ok) return guard.response
  const experiences = await prisma.experience.findMany({
    orderBy: { name: 'asc' },
    include: {
      cottage: { select: { id: true, name: true } },
      submittedBy: { select: { id: true, email: true } },
    },
  })
  return NextResponse.json({
    experiences: experiences.map((e) => ({
      ...e,
      price: Number(e.price),
      published: e.publicationStatus === 'PUBLISHED' && e.isActive,
    })),
  })
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

  const name = typeof body.name === 'string' ? body.name.trim() : ''
  if (!name) return NextResponse.json({ error: 'name is required' }, { status: 400 })

  const type = typeof body.type === 'string' ? body.type : ''
  if (!TYPES.includes(type as ExperienceType)) {
    return NextResponse.json({ error: `type must be one of: ${TYPES.join(', ')}` }, { status: 400 })
  }

  const price = Number(body.price)
  if (!Number.isFinite(price) || price <= 0) {
    return NextResponse.json({ error: 'price must be a positive number' }, { status: 400 })
  }

  let cottageId: string | null | undefined
  if (typeof body.cottageId === 'string' && body.cottageId) {
    const cottage = await prisma.cottage.findUnique({ where: { id: body.cottageId } })
    if (!cottage) return NextResponse.json({ error: 'Cottage not found' }, { status: 400 })
    cottageId = body.cottageId
  }

  const includedItems =
    typeof body.includedItems === 'string'
      ? body.includedItems.split(/\n|,/).map((s) => s.trim()).filter(Boolean)
      : Array.isArray(body.includedItems)
        ? body.includedItems.filter((s): s is string => typeof s === 'string' && s.trim().length > 0).map((s) => s.trim())
        : []

  const experience = await prisma.experience.create({
    data: {
      name,
      description: typeof body.description === 'string' ? body.description.trim() : '',
      type: type as ExperienceType,
      price,
      duration: body.duration ? Math.max(1, Number(body.duration)) : null,
      capacity: Math.max(1, Number(body.capacity) || 10),
      startTime: typeof body.startTime === 'string' && body.startTime ? body.startTime : null,
      endTime: typeof body.endTime === 'string' && body.endTime ? body.endTime : null,
      difficultyLevel:
        typeof body.difficultyLevel === 'string' && body.difficultyLevel ? body.difficultyLevel : null,
      ageRequirement: body.ageRequirement !== undefined ? Math.max(0, Number(body.ageRequirement) || 0) : 0,
      includedItems,
      isActive: body.isActive !== false,
      maxBookingsPerDay: body.maxBookingsPerDay ? Math.max(1, Number(body.maxBookingsPerDay)) : null,
      cottageId: cottageId ?? null,
    },
  })

  return NextResponse.json({ experience: { ...experience, price: Number(experience.price) } }, { status: 201 })
}