import { prisma } from '@/lib/prisma'
import { verifyPassword } from '@/lib/auth'
import { createSessionToken, SESSION_COOKIE } from '@/lib/session'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  const password = typeof body.password === 'string' ? body.password : ''

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
  }

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user || !(await verifyPassword(password, user.password))) {
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
  }

  const token = createSessionToken({
    userId: user.id,
    email: user.email,
    role: user.role,
    firstName: user.firstName,
  })

  const res = NextResponse.json({
    success: true,
    user: { id: user.id, email: user.email, role: user.role, firstName: user.firstName },
  })
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 7 * 24 * 60 * 60,
  })
  return res
}