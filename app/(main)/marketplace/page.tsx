import { prisma } from '@/lib/prisma'
import MarketplaceClient from '@/components/marketplace/MarketplaceClient'
import type { MarketProduct } from '@/components/marketplace/types'
import { SectionBackground } from '@/components/ui/MultimediaBackground'

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
    <>
      {/* Hero with Multimedia Background */}
      <SectionBackground page="marketplace" section="hero" className="py-16" overlay animation="kenburns" duration={30000}>
        <div className="container mx-auto px-4 relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 animate-fade-in">Taeme Abakidan Marketplace</h1>
          <p className="text-white/90 text-lg max-w-2xl animate-slide-up" style={{ animationDelay: '200ms' }}>
            Sustainably produced goods from the Dega Damot community. Every purchase supports
            the Taeme Abakidan producer cooperative.
          </p>
        </div>
      </SectionBackground>

      <SectionBackground page="marketplace" section="products" className="py-12 bg-stone-50" overlay={false}>
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2 animate-fade-in">Browse the community collection</h2>
            <p className="text-stone-600 animate-slide-up" style={{ animationDelay: '100ms' }}>
              Filter by category, price, or organic products. Open any listing for details and add it to your cart.
            </p>
          </div>
          <MarketplaceClient
            products={mapped}
            categories={categories}
            experiences={experienceItems}
            cottages={cottages}
          />

          {mapped.length === 0 && (
            <p className="text-gray-500 animate-fade-in">Coming soon — new community products are on their way.</p>
          )}
        </div>
      </SectionBackground>
    </>
  )
}