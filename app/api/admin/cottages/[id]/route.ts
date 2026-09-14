import { adminOnly } from '../../guard'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

function num(v: unknown): number | undefined {
  const n = Number(v)
  return Number.isFinite(n) ? n : undefined
}

type CottagePatch = {
  name?: string
  description?: string
  pricePerNight?: number
  capacity?: number
  bedrooms?: number
  beds?: number
  bathrooms?: number
  hasTelescope?: boolean
  hasFireplace?: boolean
  hasPrivateDeck?: boolean
  hasKitchenette?: boolean
  hasHeatedFloors?: boolean
  hasWifi?: boolean
  isAvailable?: boolean
  totalUnits?: number
  availableUnits?: number
  altitude?: number | null
  viewDescription?: string | null
}

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const guard = await adminOnly()
  if (!guard.ok) return guard.response
  const { id } = await ctx.params

  const existing = await prisma.cottage.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ error: 'Cottage not found' }, { status: 404 })

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const data: CottagePatch = {}

  if (typeof body.name === 'string') {
    if (!body.name.trim()) return NextResponse.json({ error: 'name cannot be empty' }, { status: 400 })
    data.name = body.name.trim()
  }
  if (typeof body.description === 'string') data.description = body.description.trim()
  if (body.pricePerNight !== undefined) {
    const v = num(body.pricePerNight)
    if (!v || v <= 0) return NextResponse.json({ error: 'pricePerNight must be positive' }, { status: 400 })
    data.pricePerNight = v
  }
  for (const k of ['capacity', 'bedrooms', 'beds', 'bathrooms'] as const) {
    if (body[k] !== undefined) data[k] = Math.max(0, Number(body[k]) || 0)
  }
  for (const k of [
    'hasTelescope', 'hasFireplace', 'hasPrivateDeck', 'hasKitchenette',
    'hasHeatedFloors', 'hasWifi', 'isAvailable',
  ] as const) {
    if (typeof body[k] === 'boolean') data[k] = body[k]
  }
  if (body.totalUnits !== undefined) {
    const v = num(body.totalUnits)
    if (!v || v < 1) return NextResponse.json({ error: 'totalUnits must be positive' }, { status: 400 })
    data.totalUnits = Math.floor(v)
  }
  if (body.availableUnits !== undefined) {
    const v = num(body.availableUnits)
    const cap = Number(data.totalUnits ?? existing.totalUnits)
    data.availableUnits = Math.max(0, Math.min(Math.floor(v ?? 0), cap))
  }
  if (body.altitude !== undefined) {
    data.altitude = body.altitude === null || body.altitude === '' ? null : Math.floor(num(body.altitude) ?? 0)
  }
  if (typeof body.viewDescription === 'string') data.viewDescription = body.viewDescription.trim()

  const cottage = await prisma.cottage.update({ where: { id }, data })
  return NextResponse.json({ cottage: { ...cottage, pricePerNight: Number(cottage.pricePerNight) } })
}

export async function DELETE(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const guard = await adminOnly()
  if (!guard.ok) return guard.response
  const { id } = await ctx.params

  const bookings = await prisma.booking.count({ where: { cottageId: id } })
  if (bookings > 0) {
    return NextResponse.json(
      { error: `Cannot delete: this cottage has ${bookings} booking(s) in the system` },
      { status: 409 }
    )
  }

  try {
    await prisma.cottage.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Cottage is referenced elsewhere and cannot be deleted' }, { status: 409 })
  }
}