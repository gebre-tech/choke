'use client'

import { useState } from 'react'
import { MediaThumb, MediaViewer } from './MediaViewer'
import type { GalleryMedia } from '@/lib/media-shared'

export default function Gallery({ media }: { media: GalleryMedia[] }) {
  const [active, setActive] = useState<GalleryMedia | null>(null)

  if (media.length === 0) {
    return (
      <p className="text-stone-500">
        Media coming soon — stay tuned for photos, videos and sounds from the mountain.
      </p>
    )
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {media.map((m) => (
          <button
            key={m.id}
            onClick={() => setActive(m)}
            className="group text-left bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="aspect-square">
              <MediaThumb media={m} className="transition-transform group-hover:scale-105" />
            </div>
            <div className="p-3">
              <p className="text-sm font-semibold line-clamp-1">{m.title}</p>
              {m.caption && <p className="text-xs text-stone-400 line-clamp-1">{m.caption}</p>}
            </div>
          </button>
        ))}
      </div>
      <MediaViewer media={active} onClose={() => setActive(null)} />
    </>
  )
}