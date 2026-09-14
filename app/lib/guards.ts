import { getServerSession, type SessionUser } from '@/lib/session'
import { NextResponse } from 'next/server'

export type GuardResult =
  | { ok: true; session: SessionUser }
  | { ok: false; response: Response }

export async function requireUser(): Promise<GuardResult> {
  const session = await getServerSession()
  if (!session) {
    return { ok: false, response: NextResponse.json({ error: 'Not authenticated' }, { status: 401 }) }
  }
  return { ok: true, session }
}

export async function requireAdmin(): Promise<GuardResult> {
  const user = await requireUser()
  if (!user.ok) return user
  if (user.session.role !== 'ADMIN') {
    return { ok: false, response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  }
  return user
}

export const adminOnly = requireAdmin