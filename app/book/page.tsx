import { prisma } from '@/lib/prisma'
import BookExperienceFlow from '@/components/BookExperienceFlow'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, CheckCircle2, ShieldCheck, Sparkles, Telescope, Trees } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function BookPage() {
  const cottages = await prisma.cottage.findMany({
    where: { isAvailable: true, availableUnits: { gt: 0 } },
    orderBy: { pricePerNight: 'asc' },
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
          sortOrder: true,
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
  })

  const experiences = await prisma.experience.findMany({
    where: { isActive: true, publicationStatus: 'PUBLISHED' },
    orderBy: { createdAt: 'asc' },
    include: {
      media: {
        where: { isActive: true, type: 'IMAGE' },
        orderBy: { sortOrder: 'asc' },
        select: { url: true },
      },
    },
  })

  const serialized = cottages.map((c) => ({
    id: c.id,
    name: c.name,
    description: c.description,
    pricePerNight: Number(c.pricePerNight),
    capacity: c.capacity,
    hasTelescope: c.hasTelescope,
    hasPrivateDeck: c.hasPrivateDeck,
    hasFireplace: c.hasFireplace,
    availableUnits: c.availableUnits,
    imageUrl: c.media.find((m) => m.type === 'IMAGE')?.url ?? undefined,
    media: c.media,
    links: c.links,
  }))

  const serializedExperiences = experiences.map((experience) => ({
    id: experience.id,
    name: experience.name,
    description: experience.description,
    type: experience.type,
    price: Number(experience.price),
    duration: experience.duration,
    capacity: experience.capacity,
    imageUrl: experience.media[0]?.url,
  }))

  return (
    <div className="min-h-screen overflow-hidden bg-stone-950 text-white">
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-20">
          <Image
            src="/choke-hero.jpg"
            alt="Choke Mountains at sunrise"
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
        </div>
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-stone-950/80 via-emerald-950/70 to-stone-950" />
        <div className="absolute -right-24 top-12 -z-10 h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl" />
        <div className="mx-auto max-w-7xl px-4 pb-16 pt-20 sm:px-6 lg:px-8 lg:pb-24 lg:pt-28">
          <div className="max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-200/30 bg-emerald-950/40 px-4 py-2 text-sm font-semibold text-emerald-100 backdrop-blur">
              <Sparkles className="h-4 w-4 text-amber-300" aria-hidden="true" />
              Your mountain escape starts here
            </div>
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-6xl">
              Wake up above the clouds.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-stone-200 sm:text-lg">
              Reserve a peaceful cottage in the Choke Mountains and make space for stargazing,
              slow mornings, and unforgettable Ethiopian hospitality.
            </p>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-emerald-50">
              <span className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-300" /> Flexible cottage choices</span>
              <span className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-emerald-300" /> Secure Chapa checkout</span>
              <span className="inline-flex items-center gap-2"><Trees className="h-4 w-4 text-emerald-300" /> Community-led stays</span>
            </div>
          </div>
        </div>
      </section>

      <section className="relative bg-gradient-to-b from-stone-950 via-emerald-950/30 to-stone-100 py-10 text-slate-800 sm:py-16">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.82fr_1.4fr] lg:px-8">
          <aside className="h-fit space-y-5 lg:sticky lg:top-24">
            <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/10 shadow-2xl backdrop-blur-sm">
              <div className="relative h-56">
                <Image
                  src="/choke-community.jpg"
                  alt="Community life in the Choke Mountains"
                  fill
                  className="object-cover"
                  sizes="(min-width: 1024px) 35vw, 100vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 to-transparent" />
                <div className="absolute bottom-5 left-5 right-5 text-white">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">Stay with purpose</p>
                  <p className="mt-1 text-xl font-bold">A warmer kind of tourism</p>
                </div>
              </div>
              <div className="space-y-4 p-5 text-stone-200">
                <p className="text-sm leading-6">
                  Every stay helps local hosts protect this landscape and share its stories with
                  visitors from around the world.
                </p>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="rounded-2xl bg-white/10 p-3">
                    <Telescope className="mb-2 h-5 w-5 text-amber-300" />
                    <strong className="block text-white">Night skies</strong>
                    <span>Clear mountain air</span>
                  </div>
                  <div className="rounded-2xl bg-white/10 p-3">
                    <Trees className="mb-2 h-5 w-5 text-emerald-300" />
                    <strong className="block text-white">Local roots</strong>
                    <span>Community hosted</span>
                  </div>
                </div>
              </div>
            </div>
            <Link href="/" className="group inline-flex items-center gap-2 px-1 text-sm font-semibold text-emerald-100 hover:text-white">
              Explore the lodge story
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </Link>
          </aside>

          <div>
            <div className="mb-5 text-white">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">Plan your stay</p>
              <h2 className="mt-2 text-3xl font-bold sm:text-4xl">Choose your view of the mountains.</h2>
              <p className="mt-3 max-w-2xl text-stone-300">
                Select your cottage, dates, and guests. We’ll calculate your stay and take you to
                secure Chapa payment when you’re ready.
              </p>
            </div>
            {serialized.length > 0 ? (
              <BookExperienceFlow cottages={serialized} experiences={serializedExperiences} />
            ) : (
              <div className="rounded-3xl bg-white p-8 text-center shadow-xl">
                <h2 className="text-xl font-bold">No cottages are available right now</h2>
                <p className="mt-2 text-stone-500">Please check back soon or contact the lodge for availability.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}