'use client'

import { useEffect, useState } from 'react'
import { useCartStore } from '@/store/cart'
import type { MarketProduct, MarketLink } from './types'
import { coverImage, toCartProduct } from './types'
import { MediaThumb, MediaPlayer } from '@/components/media/MediaViewer'
import { ChevronLeft, ChevronRight, Leaf, Loader2, X, ExternalLink, Video, Globe, MapPin, ShoppingCart, MessageSquare, Link as LinkIcon } from 'lucide-react'

const CATEGORY_LABELS: Record<string, string> = {
  FOOD: 'Food', DAIRY: 'Milk & dairy', RESTAURANT: 'Restaurant', GUEST_HOUSE: 'Guest house',
  MART: 'Mart', APPAREL: 'Choke apparel',
}

const LINK_ICONS: Record<string, typeof LinkIcon> = {
  WEBSITE: Globe,
  BOOKING: MapPin,
  PURCHASE: ShoppingCart,
  LOCATION: MapPin,
  SOCIAL: MessageSquare,
  VIDEO: Video,
  OTHER: LinkIcon,
}

export default function QuickView({
  product,
  onClose,
}: {
  product: MarketProduct
  onClose: () => void
}) {
  const { addItem, isItemInCart, getItemQuantity } = useCartStore()
  const [index, setIndex] = useState(0)
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)

  const media = product.media
  const main = media[index]
  const inCart = isItemInCart(product.id)
  const inCartQty = getItemQuantity(product.id)
  const remaining = Math.max(0, product.stock - inCartQty)
  const cap = Math.min(remaining || product.stock, product.stock)
  const low = product.stock <= product.minimumStock

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') setIndex((i) => (i - 1 + media.length) % media.length)
      if (e.key === 'ArrowRight') setIndex((i) => (i + 1) % media.length)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, media.length])

  const add = () => {
    addItem({ ...toCartProduct(product), quantity: qty })
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <div
      className="fixed inset-0 z-[70] bg-black/70 flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-4xl my-8 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3 border-b border-stone-100">
          <h3 className="font-bold text-lg line-clamp-1">{product.name}</h3>
          <button onClick={onClose} className="text-stone-500 hover:text-stone-800 shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-6 p-5">
          {media.length > 0 ? (
            <div>
              <div className="relative rounded-xl overflow-hidden bg-stone-100">
                <MediaPlayer media={main} />
                {media.length > 1 && (
                  <>
                    <button
                      onClick={() => setIndex((index - 1 + media.length) % media.length)}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setIndex((index + 1) % media.length)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>
              {media.length > 1 && (
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {media.map((m, i) => (
                    <button
                      key={m.id}
                      onClick={() => setIndex(i)}
                      className={`aspect-video rounded-lg overflow-hidden border-2 ${i === index ? 'border-emerald-500' : 'border-transparent opacity-70 hover:opacity-100'}`}
                    >
                      <MediaThumb media={m} />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="aspect-[4/3] rounded-xl bg-gradient-to-br from-emerald-100 to-teal-200 flex items-center justify-center text-emerald-800 font-semibold">
              {product.name}
            </div>
          )}

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold text-emerald-600">
                ETB {product.price.toLocaleString()}
              </p>
              <div className="flex items-center gap-2 text-xs">
                {product.isOrganic && (
                  <span className="flex items-center gap-1 bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-semibold">
                    <Leaf className="w-3 h-3" /> Organic
                  </span>
                )}
                {low ? (
                  <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-semibold">
                    Only {product.stock} left
                  </span>
                ) : (
                  <span className="bg-stone-100 text-stone-600 px-2 py-1 rounded-full">
                    {product.stock} available
                  </span>
                )}
              </div>
            </div>

            <div className="text-xs text-stone-500">
              <span className="font-semibold text-emerald-700">{CATEGORY_LABELS[product.category] ?? product.category}</span>
              {' · '}
              {product.producerName} · {product.producerLocation}
              {product.weight ? ` · ${product.weight} kg` : ''}
            </div>

            {product.description && (
              <p className="text-sm text-stone-600">{product.description}</p>
            )}

            {product.links && product.links.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-stone-100">
                <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide">Links</p>
                <div className="flex flex-wrap gap-2">
                  {product.links.map((link: MarketLink) => {
                    const Icon = LINK_ICONS[link.type] || LinkIcon
                    return (
                      <a
                        key={link.id}
                        href={link.url}
                        target={link.openInNewTab ? '_blank' : '_self'}
                        rel={link.openInNewTab ? 'noopener noreferrer' : undefined}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full border border-emerald-200 hover:bg-emerald-100"
                        title={link.description || link.url}
                      >
                        <Icon className="w-3 h-3" />
                        {link.title}
                      </a>
                    )
                  })}
                </div>
              </div>
            )}

            {media.filter((m) => m.type === 'VIDEO').length > 0 && (
              <p className="text-xs text-stone-400">
                Includes a video so you can see exactly what you&apos;re buying.
              </p>
            )}

            <div className="mt-auto space-y-2 pt-2">
              {inCart && (
                <p className="text-xs text-emerald-700">In your cart: {inCartQty}</p>
              )}
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-stone-300 rounded-full">
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    disabled={qty <= 1 || cap <= 0}
                    className="w-9 h-9 flex items-center justify-center text-lg text-stone-500 disabled:opacity-30"
                  >
                    −
                  </button>
                  <span className="w-8 text-center font-semibold">{qty}</span>
                  <button
                    onClick={() => setQty((q) => Math.min(cap, q + 1))}
                    disabled={qty >= cap || cap <= 0}
                    className="w-9 h-9 flex items-center justify-center text-lg text-stone-500 disabled:opacity-30"
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={add}
                  disabled={cap <= 0}
                  className={`flex-1 py-2.5 rounded-full font-semibold transition-colors ${
                    cap <= 0
                      ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                      : added
                        ? 'bg-emerald-600 text-white'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  }`}
                >
                  {cap <= 0 ? 'Sold out' : added ? '✓ Added to cart' : 'Add to cart'}
                </button>
              </div>
              {remaining > 0 && inCartQty > 0 && (
                <p className="text-xs text-stone-400">You can add {remaining} more.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}