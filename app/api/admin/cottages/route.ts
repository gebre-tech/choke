import { adminOnly } from '../guard'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const guard = await adminOnly()
  if (!guard.ok) return guard.response
  const cottages = await prisma.cottage.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { bookings: true } } },
  })
  return NextResponse.json({
    cottages: cottages.map((c) => ({ ...c, pricePerNight: Number(c.pricePerNight) })),
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

  const pricePerNight = Number(body.pricePerNight)
  if (!Number.isFinite(pricePerNight) || pricePerNight <= 0) {
    return NextResponse.json({ error: 'pricePerNight must be a positive number' }, { status: 400 })
  }

  const totalUnits = Number(body.totalUnits)
  if (!Number.isInteger(totalUnits) || totalUnits < 1) {
    return NextResponse.json({ error: 'totalUnits must be a positive integer' }, { status: 400 })
  }

  let availableUnits = Number(body.availableUnits)
  if (!Number.isInteger(availableUnits) || availableUnits < 0) availableUnits = totalUnits
  if (availableUnits > totalUnits) availableUnits = totalUnits

  const cottage = await prisma.cottage.create({
    data: {
      name,
      description: typeof body.description === 'string' ? body.description.trim() : '',
      pricePerNight,
      capacity: Math.max(1, Number(body.capacity) || 1),
      bedrooms: Math.max(0, Number(body.bedrooms) || 1),
      beds: Math.max(0, Number(body.beds) || 1),
      bathrooms: Math.max(0, Number(body.bathrooms) || 1),
      hasTelescope: Boolean(body.hasTelescope),
      hasFireplace: Boolean(body.hasFireplace),
      hasPrivateDeck: Boolean(body.hasPrivateDeck),
      hasKitchenette: Boolean(body.hasKitchenette),
      hasHeatedFloors: Boolean(body.hasHeatedFloors),
      hasWifi: Boolean(body.hasWifi),
      isAvailable: body.isAvailable !== false,
      totalUnits,
      availableUnits,
      altitude: body.altitude ? Number(body.altitude) : null,
      viewDescription:
        typeof body.viewDescription === 'string' ? body.viewDescription.trim() : null,
    },
  })

  return NextResponse.json({ cottage: { ...cottage, pricePerNight: Number(cottage.pricePerNight) } }, { status: 201 })
}