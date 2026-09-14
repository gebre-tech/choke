import { prisma } from '@/lib/prisma'
import BookingForm from '@/components/BookingForm'

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
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-emerald-900 to-stone-800 text-white">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-4xl font-bold mb-2">Book your stay</h1>
        <p className="text-stone-300 mb-8">
          Choose a cottage and dates — you'll pay securely via Chapa (Telebirr, CBE Birr or
          bank card).
        </p>
        <BookingForm cottages={serialized} />
      </div>
    </div>
  )
}