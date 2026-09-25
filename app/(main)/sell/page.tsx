import { prisma } from '@/lib/prisma'
import SellersClient from '@/components/sell/SellersClient'

export const dynamic = 'force-dynamic'

export default async function SellPage() {
  const cottages = await prisma.cottage.findMany({
    where: { isAvailable: true },
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  })

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <h1 className="text-3xl font-bold mb-2">Sell with Choke Mountains</h1>
      <p className="text-gray-600 mb-8">
        Producers and guides across the Choke Mountains Ecovillage can list products and experiences.
        Add photos via image links and share YouTube/Vimeo videos — an admin reviews and publishes
        your listing before it goes live.
      </p>
      <SellersClient cottages={cottages} />
    </div>
  )
}