import { adminOnly } from '../../guard'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { ExperienceType } from '@prisma/client'

const TYPES = Object.values(ExperienceType)

type ExperiencePatch = {
  name?: string
  description?: string
  type?: ExperienceType
  price?: number
  duration?: number | null
  capacity?: number
  startTime?: string | null
  endTime?: string | null
  difficultyLevel?: string | null
  ageRequirement?: number
  includedItems?: string[]
  isActive?: boolean
  maxBookingsPerDay?: number | null
  cottageId?: string | null
}

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const guard = await adminOnly()
  if (!guard.ok) return guard.response
  const { id } = await ctx.params

  const existing = await prisma.experience.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ error: 'Experience not found' }, { status: 404 })

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const data: ExperiencePatch = {}

  if (typeof body.name === 'string') {
    if (!body.name.trim()) return NextResponse.json({ error: 'name cannot be empty' }, { status: 400 })
    data.name = body.name.trim()
  }
  if (typeof body.description === 'string') data.description = body.description.trim()
  if (typeof body.difficultyLevel === 'string') data.difficultyLevel = body.difficultyLevel.trim() || null
  if (typeof body.startTime === 'string') data.startTime = body.startTime || null
  if (typeof body.endTime === 'string') data.endTime = body.endTime || null
  if (typeof body.type === 'string') {
    if (!TYPES.includes(body.type as ExperienceType)) {
      return NextResponse.json({ error: `type must be one of: ${TYPES.join(', ')}` }, { status: 400 })
    }
    data.type = body.type as ExperienceType
  }
  if (body.price !== undefined) {
    const v = Number(body.price)
    if (!Number.isFinite(v) || v <= 0) return NextResponse.json({ error: 'price must be positive' }, { status: 400 })
    data.price = v
  }
  if (body.duration !== undefined) {
    data.duration = body.duration === null || body.duration === '' ? null : Math.max(1, Number(body.duration))
  }
  if (body.capacity !== undefined) {
    const v = Number(body.capacity)
    if (!Number.isInteger(v) || v < 1) return NextResponse.json({ error: 'capacity must be positive' }, { status: 400 })
    data.capacity = v
  }
  if (body.ageRequirement !== undefined) data.ageRequirement = Math.max(0, Number(body.ageRequirement) || 0)
  if (typeof body.isActive === 'boolean') data.isActive = body.isActive
  if (body.includedItems !== undefined) {
    data.includedItems =
      typeof body.includedItems === 'string'
        ? body.includedItems.split(/\n|,/).map((s) => s.trim()).filter(Boolean)
        : Array.isArray(body.includedItems)
          ? body.includedItems.filter((s): s is string => typeof s === 'string' && s.trim().length > 0).map((s) => s.trim())
          : []
  }
  if (body.maxBookingsPerDay !== undefined) {
    data.maxBookingsPerDay =
      body.maxBookingsPerDay === null || body.maxBookingsPerDay === '' ? null : Math.max(1, Number(body.maxBookingsPerDay))
  }
  if (body.cottageId !== undefined) {
    if (body.cottageId === null || body.cottageId === '') {
      data.cottageId = null
    } else if (typeof body.cottageId === 'string') {
      const cottage = await prisma.cottage.findUnique({ where: { id: body.cottageId } })
      if (!cottage) return NextResponse.json({ error: 'Cottage not found' }, { status: 400 })
      data.cottageId = body.cottageId
    }
  }

  const experience = await prisma.experience.update({ where: { id }, data })
  return NextResponse.json({ experience: { ...experience, price: Number(experience.price) } })
}

export async function DELETE(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const guard = await adminOnly()
  if (!guard.ok) return guard.response
  const { id } = await ctx.params

  const references = await prisma.booking.count({ where: { experienceId: id } })
  if (references > 0) {
    return NextResponse.json(
      { error: `Cannot delete: this experience has ${references} booking(s)` },
      { status: 409 }
    )
  }

  try {
    await prisma.experience.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Experience is referenced elsewhere and cannot be deleted' }, { status: 409 })
  }
}