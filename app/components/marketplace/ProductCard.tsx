'use client'

import type { MarketProduct, MarketLink } from './types'
import { coverImage } from './types'
import { Leaf, PlayCircle, Globe, MapPin, Video, MessageSquare, ShoppingCart, Link as LinkIcon, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/design-system/Button'
import { generateId } from '@/lib/a11y'

const LINK_ICONS: Record<string, typeof LinkIcon> = {
  WEBSITE: Globe,
  BOOKING: MapPin,
  PURCHASE: ShoppingCart,
  LOCATION: MapPin,
  SOCIAL: MessageSquare,
  VIDEO: Video,
  OTHER: LinkIcon,
}

export default function ProductCard({
  product,
  onOpen,
}: {
  product: MarketProduct
  onOpen: () => void
}) {
  const cardId = generateId('product-card')
  const images = product.media.filter((m) => m.type === 'IMAGE')
  const cover = coverImage(product)
  const hover = images.length > 1 ? product.media.filter((m) => m.type === 'IMAGE')[1]?.url : undefined
  const hasVideo = product.media.some((m) => m.type === 'VIDEO')
  const low = product.stock <= product.minimumStock

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onOpen()
    }
  }

  return (
    <article
      id={cardId}
      className="group bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow p-4 flex flex-col gap-3"
    >
      <div className="relative aspect-[4/3] rounded-xl overflow-hidden">
        {cover ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={cover}
              alt={product.name}
              className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-0"
              loading="lazy"
            />
            {hover ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={hover}
                alt={`${product.name} — additional photo`}
                className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                loading="lazy"
              />
            ) : (
              <div className="absolute inset-0 bg-emerald-900 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true" />
            )}
          </>
        ) : hasVideo ? (
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-700 to-stone-800 flex items-center justify-center" aria-label="Video preview">
            <PlayCircle className="w-12 h-12 text-emerald-200" aria-hidden="true" />
          </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-100 to-teal-200 flex items-center justify-center text-emerald-800 font-semibold p-3 text-center" aria-hidden="true">
            {product.name}
          </div>
        )}
        {product.isOrganic && (
          <span className="absolute top-2 left-2 flex items-center gap-1 bg-white/90 backdrop-blur text-emerald-700 text-[10px] font-bold px-2 py-1 rounded-full" aria-label="Organic product">
            <Leaf className="w-3 h-3" aria-hidden="true" /> Organic
          </span>
        )}
        {low && (
          <span className="absolute top-2 right-2 bg-amber-500 text-white text-[10px] font-bold px-2 py-1 rounded-full" aria-live="polite">
            Only {product.stock} left
          </span>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-semibold line-clamp-1">{product.name}</h3>
          <p className="text-emerald-600 font-bold whitespace-nowrap" aria-label={`Price: ${product.price.toLocaleString()} ETB`}>ETB {product.price.toLocaleString()}</p>
        </div>
        <p className="text-xs text-stone-500 mt-0.5 line-clamp-1">
          {product.producerName} · {product.producerLocation}
          {product.weight ? ` · ${product.weight} kg` : ''}
        </p>
        {product.links && product.links.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2" aria-label="Product links">
            {product.links.slice(0, 3).map((link: MarketLink) => {
              const Icon = LINK_ICONS[link.type] || LinkIcon
              const isExternal = link.openInNewTab
              return (
                <a
                  key={link.id}
                  href={link.url}
                  target={isExternal ? '_blank' : '_self'}
                  rel={isExternal ? 'noopener noreferrer' : undefined}
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-medium rounded-full border border-emerald-200 hover:bg-emerald-100"
                  aria-label={link.description || link.title}
                  title={link.description || link.url}
                >
                  <Icon className="w-2.5 h-2.5" aria-hidden="true" />
                  {link.title}
                  {isExternal && <ExternalLink className="w-2.5 h-2.5" aria-hidden="true" />}
                </a>
              )
            })}
            {product.links.length > 3 && (
              <span className="text-[10px] text-stone-400 px-2" aria-label={`${product.links.length - 3} more links`}>+{product.links.length - 3} more</span>
            )}
          </div>
        )}
      </div>

      <button
        onClick={onOpen}
        onKeyDown={handleKeyDown}
        className="mt-auto w-full"
        aria-label={`View details for ${product.name}`}
      >
        <Button variant="outline" size="md" fullWidth>
          View product
        </Button>
      </button>
    </article>
  )
}