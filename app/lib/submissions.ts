import { prisma } from '@/lib/prisma'
import { classifyPublicMediaUrl, type PublicMediaUrl } from '@/lib/media-shared'
import { ProductCategory, ExperienceType } from '@prisma/client'

export const PRODUCT_CATEGORIES = Object.values(ProductCategory)
export const EXPERIENCE_TYPES = Object.values(ExperienceType)

export type ParseResult<T> = { ok: true; value: T } | { ok: false; error: string }

export function str(v: unknown): string {
  return typeof v === 'string' ? v.trim() : ''
}

export function num(v: unknown): number {
  return Number(v)
}

export function parseProductPayload(
  body: Record<string, unknown>
): ParseResult<{
  name: string
  description: string
  price: number
  category: ProductCategory
  stock: number
  producerName: string
  producerLocation: string
  isOrganic: boolean
  weight: number | null
}> {
  const name = str(body.name)
  if (!name) return { ok: false, error: 'name is required' }
  const price = num(body.price)
  if (!Number.isFinite(price) || price <= 0) {
    return { ok: false, error: 'price must be a positive number' }
  }
  const category = str(body.category)
  if (!PRODUCT_CATEGORIES.includes(category as ProductCategory)) {
    return { ok: false, error: `category must be one of: ${PRODUCT_CATEGORIES.join(', ')}` }
  }
  const stock = num(body.stock)
  if (!Number.isInteger(stock) || stock < 0) {
    return { ok: false, error: 'stock must be a non-negative integer' }
  }
  const weight = typeof body.weight === 'number' && Number.isFinite(body.weight) && body.weight > 0 ? body.weight : null
  return {
    ok: true,
    value: {
      name,
      description: str(body.description),
      price,
      category: category as ProductCategory,
      stock,
      producerName: str(body.producerName) || 'Taeme Abakidan Community',
      producerLocation: str(body.producerLocation) || 'Dega Damot, Ethiopia',
      isOrganic: body.isOrganic !== false,
      weight,
    },
  }
}

export async function parseExperiencePayload(
  body: Record<string, unknown>
): Promise<ParseResult<{
  name: string
  description: string
  type: ExperienceType
  price: number
  duration: number | null
  capacity: number
  startTime: string | null
  endTime: string | null
  cottageId: string | null
}>> {
  const name = str(body.name)
  if (!name) return { ok: false, error: 'name is required' }
  const price = num(body.price)
  if (!Number.isFinite(price) || price <= 0) {
    return { ok: false, error: 'price must be a positive number' }
  }
  const type = str(body.type)
  if (!EXPERIENCE_TYPES.includes(type as ExperienceType)) {
    return { ok: false, error: `type must be one of: ${EXPERIENCE_TYPES.join(', ')}` }
  }
  const duration = typeof body.duration === 'number' && Number.isFinite(body.duration) ? Number(body.duration) : null
  const capacity = num(body.capacity)
  if (!Number.isInteger(capacity) || capacity < 1) {
    return { ok: false, error: 'capacity must be a positive integer' }
  }
  const cottageId = str(body.cottageId) || null
  if (cottageId) {
    const cottage = await prisma.cottage.findUnique({ where: { id: cottageId }, select: { id: true } })
    if (!cottage) return { ok: false, error: 'cottage not found' }
  }
  return {
    ok: true,
    value: {
      name,
      description: str(body.description),
type: type as ExperienceType,
      price,
      duration,
      capacity,
      startTime: str(body.startTime) || null,
      endTime: str(body.endTime) || null,
      cottageId,
    },
  }
}

export type OkPublicMediaUrl = Extract<PublicMediaUrl, { ok: true }>

export function parseMediaUrls(
  raw: unknown
): ParseResult<OkPublicMediaUrl[]> {
  if (raw === undefined || raw === null) return { ok: true, value: [] }
  if (!Array.isArray(raw)) return { ok: false, error: 'media must be an array of URLs' }
  const results: OkPublicMediaUrl[] = []
  for (const item of raw) {
    if (typeof item !== 'string' || !item.trim()) continue
    const parsed = classifyPublicMediaUrl(item)
    if (!parsed.ok) return parsed
    results.push(parsed)
  }
  return { ok: true, value: results }
}

export async function replaceSubmissionMedia(
  entity: 'product' | 'experience',
  entityId: string,
  media: OkPublicMediaUrl[]
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const where =
      entity === 'product'
        ? { productId: entityId }
        : { experienceId: entityId }
    await tx.media.deleteMany({ where })
    for (const m of media) {
      const sortOrder = 0
      await tx.media.create({
        data: {
          title: titleForUrl(m.url, m.type),
          url: m.url,
          type: m.type,
          provider: m.type === 'VIDEO' ? m.provider : 'NONE',
          videoId: m.type === 'VIDEO' ? m.videoId : null,
          scope: entity === 'product' ? 'PRODUCT' : 'EXPERIENCE',
          sortOrder,
          ...(entity === 'product'
            ? { productId: entityId }
            : { experienceId: entityId }),
        },
      })
    }
  })
}

export function titleForUrl(url: string, type: string): string {
  if (type === 'VIDEO') {
    const clean = url.split('?')[0]
    const seg = clean.split('/').filter(Boolean).pop() ?? ''
    return seg ? decodeURIComponent(seg) : 'Video'
  }
  const clean = url.split('?')[0]
  const file = clean.split('/').pop() ?? ''
  const base = file.replace(/\.[a-z0-9]+$/i, '')
  return base ? decodeURIComponent(base) : 'Image'
}

export const linkTitles = (items: PublicMediaUrl[]) => ({
  images: items.filter((m) => m.ok && m.type === 'IMAGE').length,
  videos: items.filter((m) => m.ok && m.type === 'VIDEO').length,
})