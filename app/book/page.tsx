import { prisma } from '@/lib/prisma'
import BookExperienceFlow from '@/components/BookExperienceFlow'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, CheckCircle2, ShieldCheck, Sparkles, Trees } from 'lucide-react'
import { artworkFor, COTTAGE_ARTWORK, EXPERIENCE_ARTWORK } from '@/lib/listing-artwork'

export const dynamic = 'force-dynamic'

export default async function BookPage({
  searchParams,
}: {
  searchParams: Promise<{ cottage?: string | string[]; experience?: string | string[] }>
}) {
  const params = await searchParams
  const requestedCottageId = Array.isArray(params.cottage) ? params.cottage[0] : params.cottage
  const requestedExperienceId = Array.isArray(params.experience) ? params.experience[0] : params.experience
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
    imageUrl: c.media.find((m) => m.type === 'IMAGE')?.url ?? artworkFor(c.name, COTTAGE_ARTWORK),
    media: c.media.some((m) => m.type === 'IMAGE') || !artworkFor(c.name, COTTAGE_ARTWORK)
      ? c.media
      : [{
          id: `artwork-${c.id}`,
          title: c.name,
          type: 'IMAGE',
          url: artworkFor(c.name, COTTAGE_ARTWORK)!,
          provider: 'LOCAL',
          videoId: null,
          caption: 'Illustrative reference photo — this image does not show the listed cottage.',
          altText: `${c.name} representative reference photo`,
          sortOrder: 0,
        }, ...c.media],
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
    imageUrl: experience.media[0]?.url ?? artworkFor(experience.name, EXPERIENCE_ARTWORK),
  }))
  const initialCottageId = serialized.some((cottage) => cottage.id === requestedCottageId)
    ? requestedCottageId
    : undefined
  const initialExperienceId = serializedExperiences.some((experience) => experience.id === requestedExperienceId)
    ? requestedExperienceId
    : undefined

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
              Find your place in the Choke Mountains, then make it yours with quiet mornings,
              clear night skies, and warm Ethiopian hospitality.
            </p>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-emerald-50">
              <span className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-300" /> Flexible cottage choices</span>
              <span className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-emerald-300" /> Secure Chapa checkout</span>
              <span className="inline-flex items-center gap-2"><Trees className="h-4 w-4 text-emerald-300" /> Community-led stays</span>
            </div>
            <Link
              href="#cottages"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-emerald-400 px-5 py-3 text-sm font-bold text-stone-950 shadow-lg shadow-emerald-950/20 transition hover:bg-emerald-300"
            >
              Browse cottages <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <section id="cottages" className="relative scroll-mt-8 bg-gradient-to-b from-stone-950 via-emerald-950/30 to-stone-100 py-10 text-slate-800 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-7 text-white sm:mb-9">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">Plan your stay</p>
            <h2 className="mt-2 text-3xl font-bold sm:text-4xl">Choose your mountain hideaway.</h2>
            <p className="mt-3 max-w-2xl text-stone-300">
              Browse cottages on the left and optional experiences on the right. Pick what suits
              you, then add your dates and guests.
            </p>
          </div>
          {serialized.length > 0 ? (
            <BookExperienceFlow
              cottages={serialized}
              experiences={serializedExperiences}
              initialCottageId={initialCottageId}
              initialExperienceId={initialExperienceId}
            />
          ) : (
            <div className="rounded-3xl bg-white p-8 text-center shadow-xl">
              <h2 className="text-xl font-bold">No cottages are available right now</h2>
              <p className="mt-2 text-stone-600">Please check back soon or contact the lodge for availability.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
