import { prisma } from '@/lib/prisma'
import { SectionBackground } from '@/components/ui/MultimediaBackground'
import { BookingSteps } from '@/components/BookingStepsClient'

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

  return (
    <>
      {/* Hero with Multimedia Background */}
      <SectionBackground page="booking" section="hero" className="py-16" overlay animation="kenburns" duration={30000}>
        <div className="container mx-auto px-4 py-16 relative z-10 max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 animate-fade-in">Book your stay</h1>
          <p className="text-white/90 text-lg animate-slide-up" style={{ animationDelay: '200ms' }}>
            Choose a cottage and dates — you'll pay securely via Chapa (Telebirr, CBE Birr or bank card).
          </p>
        </div>
      </SectionBackground>

      {/* Booking Form Section */}
      <section className="relative py-16 bg-white">
        <SectionBackground page="booking" section="form" animation="zoom" duration={20000} overlay={false}>
          <div className="container mx-auto px-4 py-12 max-w-3xl relative z-10">
            <BookingSteps cottages={serialized} />
          </div>
        </SectionBackground>
      </section>
    </>
  )
}