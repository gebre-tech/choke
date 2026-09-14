import { adminOnly } from '../guard'
import { NextRequest, NextResponse } from 'next/server'
import { setSiteSettings } from '@/lib/site'

export async function PUT(req: NextRequest) {
  const guard = await adminOnly()
  if (!guard.ok) return guard.response

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const updates: Record<string, string> = {}
  for (const [key, value] of Object.entries(body)) {
    if (key !== 'logoUrl' && typeof value !== 'string') continue
    updates[key] = String(value ?? '').trim()
  }

  if ('logoUrl' in updates && updates.logoUrl) {
    const okScheme =
      updates.logoUrl.startsWith('/') ||
      /^https?:\/\//i.test(updates.logoUrl)
    if (!okScheme) {
      return NextResponse.json(
        { error: 'logoUrl must be a relative path or an http(s) URL' },
        { status: 400 }
      )
    }
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No valid settings provided' }, { status: 400 })
  }

  const settings = await setSiteSettings(updates)
  return NextResponse.json({ settings })
}