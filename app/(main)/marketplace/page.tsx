import { prisma } from '@/lib/prisma'
import MarketplaceClient from '@/components/marketplace/MarketplaceClient'
import type { MarketProduct } from '@/components/marketplace/types'

export const dynamic = 'force-dynamic'

export default async function MarketplacePage() {
  const [products, experiences, cottages] = await Promise.all([
    prisma.product.findMany({
      where: { isActive: true, publicationStatus: 'PUBLISHED', stock: { gt: 0 } },
      orderBy: { createdAt: 'asc' },
      include: {
        media: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
          select: {
            id: true,
            title: true,
            type: true,
            url: true,
            provider: true,
            videoId: true,
            caption: true,
            altText: true,
          },
        },
        links: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
          select: {
            id: true,
            type: true,
            title: true,
            url: true,
            description: true,
            openInNewTab: true,
          },
        },
      },
    }),
    prisma.experience.findMany({
      where: { isActive: true, publicationStatus: 'PUBLISHED' },
      orderBy: { createdAt: 'asc' },
      include: {
        media: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
          select: {
            id: true,
            title: true,
            type: true,
            url: true,
            provider: true,
            videoId: true,
            caption: true,
            altText: true,
          },
        },
        links: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
          select: {
            id: true,
            type: true,
            title: true,
            url: true,
            description: true,
            openInNewTab: true,
          },
        },
      },
    }),
    prisma.cottage.findMany({
      where: { isAvailable: true },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    }),
  ])

  const mapped: MarketProduct[] = products.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    price: Number(p.price),
    category: p.category,
    stock: p.stock,
    minimumStock: p.minimumStock,
    producerName: p.producerName,
    producerLocation: p.producerLocation,
    isOrganic: p.isOrganic,
    weight: p.weight ? Number(p.weight) : null,
    createdAt: p.createdAt.toISOString(),
    media: p.media,
    links: p.links,
  }))

  const experienceItems = experiences.map((e) => ({
    id: e.id,
    name: e.name,
    description: e.description,
    type: e.type,
    price: Number(e.price),
    media: e.media,
    links: e.links,
  }))

  const categories = [...new Set(products.map((p) => p.category))]

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Taeme Abakidan Marketplace</h1>
      <p className="text-gray-600 mb-8">
        Sustainably produced goods from the Dega Damot community. Every purchase supports
        the Taeme Abakidan producer cooperative. Click any product for photos, videos and details.
      </p>

      <MarketplaceClient
        products={mapped}
        categories={categories}
        experiences={experienceItems}
        cottages={cottages}
      />

      {mapped.length === 0 && (
        <p className="text-gray-500">Coming soon — new community products are on their way.</p>
      )}
    </div>
  )
}