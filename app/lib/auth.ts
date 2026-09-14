import crypto from 'crypto'

const SCRYPT_PARAMS = { N: 16384, r: 8, p: 1 } as const
const KEYLEN = 64

function scryptHash(password: string, salt: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, KEYLEN, SCRYPT_PARAMS, (err, result) =>
      err ? reject(err) : resolve(result)
    )
  })
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16)
  const hash = await scryptHash(password, salt)
  return `scrypt$${salt.toString('hex')}$${hash.toString('hex')}`
}

export async function verifyPassword(
  password: string,
  stored: string
): Promise<boolean> {
  const parts = stored.split('$')
  if (parts.length !== 3 || parts[0] !== 'scrypt') return false
  const salt = Buffer.from(parts[1], 'hex')
  const expected = Buffer.from(parts[2], 'hex')
  const hash = await scryptHash(password, salt)
  return hash.length === expected.length && crypto.timingSafeEqual(hash, expected)
}