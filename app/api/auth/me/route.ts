import { parseSessionToken } from '@/lib/session'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const token = req.cookies.get('choke_session')?.value ?? null
  const session = parseSessionToken(token)
  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 200 })
  }
  return NextResponse.json({
    authenticated: true,
    user: {
      id: session.userId,
      email: session.email,
      role: session.role,
      firstName: session.firstName,
    },
  })
}