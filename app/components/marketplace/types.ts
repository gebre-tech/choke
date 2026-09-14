import type { GalleryMedia } from '@/lib/media-shared'

export type MarketLink = {
  id: string
  type: string
  title: string
  url: string
  description: string | null
  openInNewTab: boolean
}

export type MarketProduct = {
  id: string
  name: string
  description: string
  price: number
  category: string
  stock: number
  minimumStock: number
  producerName: string
  producerLocation: string
  isOrganic: boolean
  weight: number | null
  createdAt: string
  media: GalleryMedia[]
  links: MarketLink[]
}

export function coverImage(p: MarketProduct): string | undefined {
  return p.media.find((m) => m.type === 'IMAGE' && /\.(jpe?g|png|webp|gif|svg|avif)(\?|$)/i.test(m.url))?.url
}

export function toCartProduct(p: MarketProduct) {
  return {
    id: p.id,
    productId: p.id,
    name: p.name,
    price: p.price,
    category: p.category,
    imageUrl: coverImage(p) ?? undefined,
    maxStock: p.stock,
  }
}