'use client'

import { X, Play, Music2, Film } from 'lucide-react'
import { embedSrc, type GalleryMedia } from '@/lib/media-shared'

export function MediaThumb({ media, className = '' }: { media: GalleryMedia; className?: string }) {
  const embed = embedSrc(media)
  const showImage = media.type === 'IMAGE' || (embed === null && /\.(jpe?g|png|webp|gif|svg|avif)(\?|$)/i.test(media.url))
  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`}>
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={media.url} alt={media.altText ?? media.title} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-emerald-600 via-teal-700 to-stone-800 flex items-center justify-center">
          {media.type === 'AUDIO' ? (
            <Music2 className="w-10 h-10 text-emerald-200" />
          ) : (
            <Film className="w-10 h-10 text-emerald-200" />
          )}
        </div>
      )}
      {media.type !== 'IMAGE' && (
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="w-12 h-12 rounded-full bg-black/40 backdrop-blur flex items-center justify-center">
            <Play className="w-6 h-6 text-white fill-white" />
          </span>
        </span>
      )}
    </div>
  )
}

export function MediaPlayer({ media }: { media: GalleryMedia }) {
  const embed = embedSrc(media)
  if (embed) {
    return (
      <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black">
        <iframe
          src={embed}
          title={media.title}
          className="absolute inset-0 w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    )
  }
  if (media.type === 'IMAGE') {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={media.url} alt={media.altText ?? media.title} className="w-full rounded-xl max-h-[70vh] object-contain" />
  }
  if (media.type === 'VIDEO') {
    return (
      <video src={media.url} controls autoPlay className="w-full rounded-xl max-h-[70vh] bg-black" />
    )
  }
  return (
    <div className="rounded-xl bg-gradient-to-br from-emerald-600 to-stone-800 p-6 flex flex-col items-center gap-4">
      <Music2 className="w-16 h-16 text-emerald-200" />
      <audio src={media.url} controls autoPlay className="w-full" />
    </div>
  )
}

export function MediaViewer({ media, onClose }: { media: GalleryMedia | null; onClose: () => void }) {
  if (!media) return null
  return (
    <div
      className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-3xl p-4 md:p-6 my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-lg font-bold">{media.title}</h3>
            {media.caption && <p className="text-sm text-stone-500">{media.caption}</p>}
          </div>
          <button onClick={onClose} className="text-stone-500 hover:text-stone-800 shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>
        <MediaPlayer media={media} />
      </div>
    </div>
  )
}