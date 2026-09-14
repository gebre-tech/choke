import { NextResponse } from 'next/server'
import { getSiteSettings } from '@/lib/site'

export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json({ settings: await getSiteSettings() })
}