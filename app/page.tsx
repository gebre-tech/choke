import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { SectionBackground } from '@/components/ui/MultimediaBackground'
import MountainScene from '@/components/ui/MountainScene'
import { ArrowDown, ArrowRight, ArrowUpRight, Bed, Coffee, Leaf, Mountain, Search, Star, Users } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const [cottages, experiences, products] = await Promise.all([
    prisma.cottage.findMany({
      where: { isAvailable: true, availableUnits: { gt: 0 } },
      orderBy: { pricePerNight: 'asc' },
      take: 4,
      select: {
        id: true,
        name: true,
        description: true,
        pricePerNight: true,
        capacity: true,
        media: {
          where: { isActive: true, type: 'IMAGE' },
          orderBy: { sortOrder: 'asc' },
          take: 1,
          select: { url: true, altText: true },
        },
      },
    }),
    prisma.experience.findMany({
      where: { isActive: true, publicationStatus: 'PUBLISHED' },
      orderBy: { createdAt: 'asc' },
      take: 4,
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        media: {
          where: { isActive: true, type: 'IMAGE' },
          orderBy: { sortOrder: 'asc' },
          take: 1,
          select: { url: true, altText: true },
        },
      },
    }),
    prisma.product.findMany({
      where: { isActive: true, publicationStatus: 'PUBLISHED', stock: { gt: 0 } },
      orderBy: { createdAt: 'desc' },
      take: 4,
      select: {
        id: true,
        name: true,
        price: true,
        producerName: true,
        media: {
          where: { isActive: true, type: 'IMAGE' },
          orderBy: { sortOrder: 'asc' },
          take: 1,
          select: { url: true, altText: true },
        },
      },
    }),
  ])

  return (
    <>
      <SectionBackground page="home" section="hero" className="flex min-h-[calc(100svh-4rem)] items-center py-14 sm:py-20" overlay parallax animation="kenburns" duration={25000}>
        <div className="homepage-ambient" aria-hidden="true">
          <div className="homepage-ambient__moon" />
          <div className="homepage-ambient__grid" />
          <span className="homepage-ambient__particle homepage-ambient__particle--one" />
          <span className="homepage-ambient__particle homepage-ambient__particle--two" />
          <span className="homepage-ambient__particle homepage-ambient__particle--three" />
        </div>
        <div className="container mx-auto relative z-10 w-full px-4">
          <div className="grid items-center gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
            <div className="max-w-2xl">
              <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-emerald-200 backdrop-blur">
                <Leaf className="h-4 w-4" aria-hidden="true" /> The highland, reimagined
              </p>
              <h1 className="text-4xl font-black leading-[0.98] tracking-tight text-white sm:text-5xl md:text-7xl">
                Come for the view.
                <span className="mt-2 block text-emerald-300">Stay for the feeling.</span>
              </h1>
              <p className="mt-6 max-w-xl text-base leading-7 text-stone-200 sm:text-lg sm:leading-8">
                A highland retreat in Ethiopia&apos;s Choke Mountains — a quiet base for mountain air,
                community stories, and unforgettable horizons.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
                <Link href="/book" className="btn-primary inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 py-3">
                  Plan your stay <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <Link href="/marketplace" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/25 bg-white/10 px-6 py-3 text-white backdrop-blur transition hover:bg-white/20">
                  Shop local
                </Link>
              </div>
              <div className="mt-8 flex flex-col gap-3 text-sm text-white/75 sm:mt-10 sm:flex-row sm:flex-wrap sm:gap-6">
                <span className="flex items-center gap-2"><Mountain className="h-4 w-4 text-emerald-300" aria-hidden="true" /> Panoramic summit views</span>
                <span className="flex items-center gap-2"><Users className="h-4 w-4 text-emerald-300" aria-hidden="true" /> Community-led stays</span>
              </div>
            </div>
            <div className="mx-auto w-full max-w-2xl lg:max-w-none">
              <MountainScene />
            </div>
          </div>
          <a href="#discover" className="absolute bottom-5 left-1/2 hidden -translate-x-1/2 items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/70 transition hover:text-white md:flex">
            Discover Choke <ArrowDown className="h-4 w-4 animate-bounce" aria-hidden="true" />
          </a>
        </div>
      </SectionBackground>

      <section id="discover" className="scroll-mt-20 bg-stone-950 py-5 text-white sm:py-7">
        <div className="container mx-auto grid gap-3 px-4 sm:grid-cols-3 sm:gap-4">
          {[
            { value: String(cottages.length), label: 'featured stays', icon: Bed },
            { value: String(experiences.length), label: 'featured experiences', icon: Star },
            { value: String(products.length), label: 'featured local products', icon: Leaf },
          ].map(({ value, label, icon: Icon }) => (
            <div key={label} className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur sm:p-5">
              <span className="rounded-xl bg-emerald-400/10 p-3 text-emerald-300"><Icon className="h-5 w-5" aria-hidden="true" /></span>
              <div>
                <p className="text-2xl font-black text-emerald-300">{value}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.12em] text-stone-400">{label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <SectionBackground page="home" section="cottages" className="py-14 sm:py-20" overlay={false}>
        <section className="container mx-auto px-4" id="stay" aria-labelledby="stays-heading">
          <div className="mb-8 flex flex-col gap-3 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">Rest above the everyday</p>
              <h2 id="stays-heading" className="mt-2 text-3xl font-bold text-stone-900 sm:text-4xl">Find your mountain stay</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600 sm:text-base">Explore currently available cottages and choose the right place to slow down.</p>
            </div>
            <Link href="/book" className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-800">
              View all stays <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
          {cottages.length ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {cottages.map((cottage) => (
                <article key={cottage.id} className="group overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-xl">
                  <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-emerald-100 to-stone-200">
                    {cottage.media[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={cottage.media[0].url} alt={cottage.media[0].altText || cottage.name} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                    ) : <div className="flex h-full items-center justify-center text-emerald-700"><Bed className="h-12 w-12" aria-hidden="true" /></div>}
                    <span className="absolute bottom-3 left-3 rounded-full bg-stone-950/75 px-3 py-1 text-xs font-semibold text-white backdrop-blur">Up to {cottage.capacity} guests</span>
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-stone-900">{cottage.name}</h3>
                    <p className="mt-2 min-h-10 text-sm leading-5 text-stone-600 line-clamp-2">{cottage.description}</p>
                    <div className="mt-4 flex items-end justify-between gap-3">
                      <p><span className="text-lg font-bold text-emerald-700">ETB {Number(cottage.pricePerNight).toLocaleString()}</span><span className="text-xs text-stone-500"> / night</span></p>
                      <Link href="/book" className="inline-flex min-h-10 items-center gap-1 rounded-full bg-emerald-50 px-4 text-xs font-bold text-emerald-800 transition group-hover:bg-emerald-700 group-hover:text-white">
                        Choose <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-stone-200 bg-white p-8 text-center">
              <Bed className="mx-auto h-8 w-8 text-stone-400" aria-hidden="true" />
              <p className="mt-3 font-semibold text-stone-800">No cottages are available to book right now.</p>
              <p className="mt-1 text-sm text-stone-500">Please check back soon for new availability.</p>
            </div>
          )}
        </section>
      </SectionBackground>

      <SectionBackground page="home" section="experiences" className="bg-stone-950 py-14 text-white sm:py-20" overlay={false}>
        <section className="container mx-auto px-4" aria-labelledby="experiences-heading">
          <div className="mb-8 flex items-end justify-between gap-4 sm:mb-10">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-400">Make the mountain yours</p>
              <h2 id="experiences-heading" className="mt-2 text-3xl font-bold sm:text-4xl">Local experiences</h2>
            </div>
            <Link href="/book" className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-300 hover:text-white">Add to your stay <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></Link>
          </div>
          {experiences.length ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {experiences.map((experience) => (
                <article key={experience.id} className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.06]">
                  <div className="relative aspect-[16/10] bg-gradient-to-br from-emerald-900 to-stone-800">
                    {experience.media[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={experience.media[0].url} alt={experience.media[0].altText || experience.name} loading="lazy" className="h-full w-full object-cover" />
                    ) : <div className="flex h-full items-center justify-center text-emerald-300"><Coffee className="h-10 w-10" aria-hidden="true" /></div>}
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold">{experience.name}</h3>
                    <p className="mt-2 min-h-10 text-sm leading-5 text-stone-300 line-clamp-2">{experience.description}</p>
                    <p className="mt-4 font-semibold text-emerald-300">From ETB {Number(experience.price).toLocaleString()}</p>
                  </div>
                </article>
              ))}
            </div>
          ) : <p className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 text-sm text-stone-300">New community experiences are being prepared. Check back soon.</p>}
        </section>
      </SectionBackground>

      <SectionBackground page="home" section="marketplace-preview" className="py-14 sm:py-20" overlay={false}>
        <section className="container mx-auto px-4" aria-labelledby="marketplace-heading">
          <div className="mb-8 flex flex-col gap-3 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">Take a little Choke home</p>
              <h2 id="marketplace-heading" className="mt-2 text-3xl font-bold text-stone-900 sm:text-4xl">Made and shared locally</h2>
            </div>
            <Link href="/marketplace" className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-800">Visit the marketplace <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
          </div>
          {products.length ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {products.map((product) => (
                <Link key={product.id} href="/marketplace" className="group flex min-w-0 items-center gap-4 rounded-2xl border border-stone-200 bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-emerald-100 to-stone-200">
                    {product.media[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={product.media[0].url} alt={product.media[0].altText || product.name} loading="lazy" className="h-full w-full object-cover" />
                    ) : <div className="flex h-full items-center justify-center text-emerald-700"><Leaf className="h-7 w-7" aria-hidden="true" /></div>}
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate font-semibold text-stone-900">{product.name}</h3>
                    <p className="mt-1 truncate text-xs text-stone-500">From {product.producerName}</p>
                    <p className="mt-2 text-sm font-bold text-emerald-700">ETB {Number(product.price).toLocaleString()}</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-stone-200 bg-white p-8 text-center">
              <Search className="mx-auto h-8 w-8 text-stone-400" aria-hidden="true" />
              <p className="mt-3 font-semibold text-stone-800">The community marketplace is growing.</p>
              <Link href="/marketplace" className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-emerald-700">Explore listings <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
            </div>
          )}
        </section>
      </SectionBackground>
    </>
  )
}
