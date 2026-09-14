import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'
import { createSessionToken, SESSION_COOKIE } from '@/lib/session'
import { NextRequest, NextResponse } from 'next/server'
import { UserRole } from '@prisma/client'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  const password = typeof body.password === 'string' ? body.password : ''
  const firstName = typeof body.firstName === 'string' ? body.firstName.trim() : ''
  const lastName = typeof body.lastName === 'string' ? body.lastName.trim() : undefined

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'Enter a valid email' }, { status: 400 })
  }
  if (password.length < 8) {
    return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
  }
  if (!firstName) {
    return NextResponse.json({ error: 'First name is required' }, { status: 400 })
  }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 })
  }

  const user = await prisma.user.create({
    data: {
      email,
      firstName,
      lastName: lastName || null,
      password: await hashPassword(password),
      role: UserRole.TOURIST,
      preferredLanguage: 'am',
    },
  })

  const token = createSessionToken({
    userId: user.id,
    email: user.email,
    role: user.role,
    firstName: user.firstName,
  })

  const res = NextResponse.json(
    { success: true, user: { id: user.id, email: user.email, role: user.role, firstName: user.firstName } },
    { status: 201 }
  )
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 7 * 24 * 60 * 60,
  })
  return res
}