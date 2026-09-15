'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { embedSrc, type GalleryMedia, detectMediaTypeFromUrl } from '@/lib/media-shared'

const MotionDiv = dynamic(() => import('framer-motion').then(m => m.motion.div), {
  ssr: false,
  loading: () => <div className="absolute inset-0" />
})

const MotionImg = dynamic(() => import('framer-motion').then(m => m.motion.img), {
  ssr: false,
  loading: () => <div className="absolute inset-0" />
})

const MotionVideo = dynamic(() => import('framer-motion').then(m => m.motion.video), {
  ssr: false,
  loading: () => <div className="absolute inset-0" />
})

export interface BackgroundMedia extends GalleryMedia {
  page: string
  section: string | null
  isActive: boolean
  sortOrder: number
}

interface MultimediaBackgroundProps {
  page: string
  section?: string
  className?: string
  fallback?: React.ReactNode
  overlay?: boolean
  parallax?: boolean
  animation?: 'fade' | 'slide' | 'zoom' | 'kenburns'
  duration?: number
  delay?: number
}

function getBestBackground(media: BackgroundMedia[], page: string, section?: string): BackgroundMedia | null {
  const filtered = media.filter(m => m.page === page && m.section === (section ?? null) && m.isActive)
  if (filtered.length === 0) return null
  return filtered.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))[0]
}

function KenBurnsWrapper({ children, duration = 20000, className = '' }: { children: React.ReactNode; duration?: number; className?: string }) {
  return (
    <MotionDiv
      className={className}
      initial={{ scale: 1 }}
      animate={{ scale: 1.15 }}
      transition={{ duration: duration / 1000, ease: 'linear', repeat: Infinity, repeatType: 'reverse' }}
      style={{ willChange: 'transform' }}
    >
      {children}
    </MotionDiv>
  )
}

function ParallaxWrapper({ children, speed = 0.3, className = '' }: { children: React.ReactNode; speed?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      if (!ref.current) return
      const rect = ref.current.getBoundingClientRect()
      const scrolled = window.scrollY
      const rate = scrolled * speed
      ref.current.style.transform = `translate3d(0, ${rate}px, 0)`
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [speed])

  return <div ref={ref} className={className}>{children}</div>
}

export function MultimediaBackground({
  page,
  section,
  className = '',
  fallback,
  overlay = true,
  parallax = false,
  animation = 'kenburns',
  duration = 20000,
  delay = 0,
}: MultimediaBackgroundProps) {
  const [backgrounds, setBackgrounds] = useState<BackgroundMedia[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  const fetchBackgrounds = useCallback(async () => {
    try {
      const res = await fetch('/api/page-backgrounds')
      if (!res.ok) throw new Error('Failed to fetch backgrounds')
      const data = await res.json()
      setBackgrounds(data.backgrounds || [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load')
    } finally {
      setLoading(false)
      setMounted(true)
    }
  }, [])

  useEffect(() => {
    fetchBackgrounds()
  }, [fetchBackgrounds])

  const background = getBestBackground(backgrounds, page, section)

  if (loading || !mounted) {
    return (
      <div className={`absolute inset-0 bg-gradient-to-br from-emerald-900 via-teal-800 to-stone-900 ${className}`} aria-hidden="true">
        {fallback}
      </div>
    )
  }

  if (error || !background) {
    return (
      <div className={`absolute inset-0 bg-gradient-to-br from-emerald-900 via-teal-800 to-stone-900 ${className}`} aria-hidden="true">
        {fallback}
      </div>
    )
  }

  const embed = embedSrc(background)
  const isVideo = background.type === 'VIDEO' || !!embed
  const isExternalVideo = !!embed
  const isLocalVideo = background.type === 'VIDEO' && !embed

  const renderBackground = () => {
    const baseStyles = 'absolute inset-0 w-full h-full object-cover'

    if (isExternalVideo) {
      return (
        <div className="absolute inset-0" aria-hidden="true">
          <iframe
            src={embed!}
            title={background.title}
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            loading="lazy"
          />
        </div>
      )
    }

    if (isLocalVideo) {
      return (
        <MotionVideo
          src={background.url}
          autoPlay
          muted
          loop
          playsInline
          className={baseStyles}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay }}
          style={{ willChange: 'opacity' }}
        />
      )
    }

    // Image background
    if (animation === 'kenburns') {
      return (
        <KenBurnsWrapper duration={duration} className="absolute inset-0 overflow-hidden">
          <MotionImg
            src={background.url}
            alt={background.altText ?? background.title}
            className={baseStyles}
            loading="lazy"
            initial={{ opacity: 0, scale: 1 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay }}
          />
        </KenBurnsWrapper>
      )
    }

    if (animation === 'zoom') {
      return (
        <MotionImg
          src={background.url}
          alt={background.altText ?? background.title}
          className={baseStyles}
          loading="lazy"
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, delay, ease: 'easeOut' }}
        />
      )
    }

    if (animation === 'slide') {
      return (
        <MotionImg
          src={background.url}
          alt={background.altText ?? background.title}
          className={baseStyles}
          loading="lazy"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay, ease: 'easeOut' }}
        />
      )
    }

    // Default fade
    return (
      <MotionImg
        src={background.url}
        alt={background.altText ?? background.title}
        className={baseStyles}
        loading="lazy"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay }}
      />
    )
  }

  const content = (
    <>
      {parallax ? (
        <ParallaxWrapper speed={0.2}>{renderBackground()}</ParallaxWrapper>
      ) : (
        renderBackground()
      )}
      {overlay && (
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/50" aria-hidden="true" />
      )}
      {background.caption && (
        <div className="absolute bottom-4 left-4 right-4 px-4 text-white text-sm opacity-90" aria-hidden="true">
          {background.caption}
        </div>
      )}
    </>
  )

  return (
    <div className={`relative overflow-hidden ${className}`} role="img" aria-label={background.altText ?? background.title}>
      {content}
    </div>
  )
}

export function SectionBackground({
  page,
  section,
  children,
  className = '',
  overlay = true,
  ...props
}: {
  page: string
  section: string
  children: React.ReactNode
  className?: string
  overlay?: boolean
} & Omit<MultimediaBackgroundProps, 'page' | 'section' | 'fallback'>) {
  return (
    <div className={`relative ${className}`}>
      <MultimediaBackground page={page} section={section} overlay={overlay} {...props} />
      <div className="relative z-10">{children}</div>
    </div>
  )
}

export function PageBackgroundWrapper({
  page,
  children,
  className = '',
}: {
  page: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={className}>
      <MultimediaBackground page={page} section="hero" animation="kenburns" duration={25000} />
      <div className="relative z-10">{children}</div>
    </div>
  )
}