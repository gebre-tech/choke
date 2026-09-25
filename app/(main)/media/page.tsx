import { prisma } from '@/lib/prisma'
import Gallery from '@/components/media/Gallery'
import type { GalleryMedia } from '@/lib/media-shared'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowDown, Camera, Mountain, Play } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function MediaPage() {
  const media = await prisma.media.findMany({
    where: { isActive: true, scope: 'GALLERY' },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
  })

  const items: GalleryMedia[] = media.map((m) => ({
    id: m.id,
    title: m.title,
    type: m.type,
    url: m.url,
    provider: m.provider,
    videoId: m.videoId,
    caption: m.caption,
    altText: m.altText,
    mimeType: m.mimeType,
  }))

  return (
    <div className="min-h-screen bg-stone-50">
      <section className="relative overflow-hidden bg-stone-950 text-white">
        <Image src="/choke-trekking.jpg" alt="Walking through Choke Mountains" fill priority className="object-cover opacity-50" sizes="100vw" />
        <div className="absolute inset-0 bg-gradient-to-r from-stone-950 via-stone-950/70 to-emerald-950/30" />
        <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-24 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-emerald-200 backdrop-blur"><Camera className="h-4 w-4" /> Field notes from Choke</p>
            <h1 className="mt-6 text-5xl font-black tracking-tight sm:text-7xl">See the mountain<br /><span className="text-emerald-300">in motion.</span></h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-stone-200">Photos, films, and field recordings from the lodge—the night sky, the falcons, the community, and the highland trails.</p>
            <a href="#gallery" className="mt-8 inline-flex items-center gap-2 rounded-full bg-emerald-500 px-5 py-3 text-sm font-bold hover:bg-emerald-400">Explore the gallery <ArrowDown className="h-4 w-4" /></a>
          </div>
        </div>
      </section>
      <section id="gallery" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">A living archive</p>
            <h2 className="mt-2 text-3xl font-black text-stone-900">Stories from the highlands</h2>
          </div>
          <Link href="/book" className="inline-flex items-center gap-2 text-sm font-bold text-emerald-700 hover:text-emerald-500"><Mountain className="h-4 w-4" /> Visit in person</Link>
        </div>
        <Gallery media={items} />
      </section>
    </div>
  )
}