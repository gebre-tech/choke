import { prisma } from '@/lib/prisma'
import MarketplaceClient from '@/components/marketplace/MarketplaceClient'
import type { MarketProduct } from '@/components/marketplace/types'
import { SectionBackground } from '@/components/ui/MultimediaBackground'
import Link from 'next/link'
import { ArrowDown, ArrowUpRight, Leaf, ShoppingBag } from 'lucide-react'

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
      <SectionBackground page="marketplace" section="hero" className="overflow-hidden py-20" overlay animation="kenburns" duration={30000}>
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid items-center gap-10 lg:grid-cols-[1fr_0.8fr]">
            <div>
              <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-emerald-200 backdrop-blur"><Leaf className="h-4 w-4" /> Good things grow here</p>
              <h1 className="text-4xl font-black tracking-tight text-white md:text-6xl">The Choke <span className="text-emerald-300">mountain market.</span></h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-white/85">
                Sustainably produced goods, meals, stays, and stories from the Dega Damot community.
                Every purchase keeps value close to home.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <a href="#products" className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-400">Browse the collection <ArrowDown className="h-4 w-4" /></a>
                <Link href="/sell" className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm font-bold text-white hover:bg-white/20">Share your product <ArrowUpRight className="h-4 w-4" /></Link>
              </div>
            </div>
            <div className="marketplace-orbit" aria-hidden="true">
              {['/choke-hero.jpg', '/choke-community.jpg', '/choke-trekking.jpg'].map((src, index) => (
                <div key={src} className={`marketplace-orbit__card marketplace-orbit__card--${index + 1}`}><img src={src} alt="" /></div>
              ))}
              <div className="marketplace-orbit__core"><ShoppingBag className="h-7 w-7 text-emerald-300" /><span>Local finds</span></div>
            </div>
          </div>
        </div>
      </SectionBackground>

      <SectionBackground page="marketplace" section="products" className="bg-stone-50 py-12" overlay={false}>
        <div className="container mx-auto px-4">
          <div id="products" className="scroll-mt-24" />
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