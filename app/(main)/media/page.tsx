import { prisma } from '@/lib/prisma'
import Gallery from '@/components/media/Gallery'
import type { GalleryMedia } from '@/lib/media-shared'

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
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-stone-50 to-emerald-50">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-2">Choke Panoramic Gallery</h1>
        <p className="text-stone-600 mb-8">
          Photos, films and field recordings from the lodge — the night sky, the falcons,
          the community and the mountain at 4,700 m.
        </p>
        <Gallery media={items} />
      </div>
    </div>
  )
}