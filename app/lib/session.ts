import crypto from 'crypto'

export type SessionUser = {
  userId: string
  email: string
  role: string
  firstName: string
}

const SESSION_COOKIE = 'choke_session'
const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60 // 7 days

function secret(): string {
  const s = process.env.AUTH_SECRET
  if (!s) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('AUTH_SECRET must be set in production')
    }
    return 'dev-insecure-auth-secret'
  }
  return s
}

function b64url(input: string | Buffer): string {
  return Buffer.from(input).toString('base64url')
}

export function signPayload(payload: string): string {
  const sig = crypto.createHmac('sha256', secret()).update(payload).digest('base64url')
  return `${payload}.${sig}`
}

export function verifyPayload<T>(token: string): T | null {
  const lastDot = token.lastIndexOf('.')
  if (lastDot <= 0) return null
  const payload = token.slice(0, lastDot)
  const sig = token.slice(lastDot + 1)
  const expected = crypto.createHmac('sha256', secret()).update(payload).digest('base64url')
  const a = Buffer.from(sig)
  const b = Buffer.from(expected)
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null
  try {
    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as T & {
      exp?: number
    }
    if (parsed.exp && parsed.exp < Math.floor(Date.now() / 1000)) return null
    return parsed
  } catch {
    return null
  }
}

export function createSessionToken(user: SessionUser): string {
  const payload = b64url(
    JSON.stringify({
      userId: user.userId,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
    })
  )
  return signPayload(payload)
}

export function parseSessionToken(token: string | null | undefined): SessionUser | null {
  if (!token) return null
  const parsed = verifyPayload<SessionUser & { exp?: number }>(token)
  if (!parsed) return null
  return {
    userId: parsed.userId,
    email: parsed.email,
    role: parsed.role,
    firstName: parsed.firstName,
  }
}

export async function getServerSession(): Promise<SessionUser | null> {
  const { cookies } = await import('next/headers')
  const store = await cookies()
  return parseSessionToken(store.get(SESSION_COOKIE)?.value ?? null)
}

export { SESSION_COOKIE }