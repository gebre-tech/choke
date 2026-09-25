'use client'

import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Compass, Sparkles } from 'lucide-react'

export default function MountainScene() {
  const reduceMotion = useReducedMotion()
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const [activeImage, setActiveImage] = useState(0)
  const images = [
    { src: '/choke-hero.jpg', label: 'Summit light' },
    { src: '/choke-trekking.jpg', label: 'Highland trails' },
    { src: '/choke-community.jpg', label: 'Community roots' },
  ]

  useEffect(() => {
    if (reduceMotion) return
    const handleMove = (event: MouseEvent) => {
      setTilt({
        x: (event.clientX / window.innerWidth - 0.5) * 8,
        y: (event.clientY / window.innerHeight - 0.5) * -6,
      })
    }
    window.addEventListener('mousemove', handleMove, { passive: true })
    return () => window.removeEventListener('mousemove', handleMove)
  }, [reduceMotion])

  useEffect(() => {
    if (reduceMotion) return
    const timer = window.setInterval(() => {
      setActiveImage((current) => (current + 1) % images.length)
    }, 7000)
    return () => window.clearInterval(timer)
  }, [images.length, reduceMotion])

  return (
    <div className="mountain-scene" aria-label="A 3D panoramic view of Choke Mountain">
      <div className="mountain-scene__stars" aria-hidden="true">
        {Array.from({ length: 12 }, (_, index) => <span key={index} />)}
      </div>
      <motion.div
        className="mountain-scene__halo"
        animate={reduceMotion ? undefined : { rotate: 360 }}
        transition={{ duration: 32, repeat: Infinity, ease: 'linear' }}
      />
      <motion.div
        className="mountain-scene__frame"
        animate={reduceMotion ? undefined : { rotateX: tilt.y, rotateY: tilt.x }}
        transition={{ type: 'spring', stiffness: 80, damping: 18 }}
      >
        <div className="mountain-scene__image">
          {images.map((image, index) => (
            <img
              key={image.src}
              src={image.src}
              alt=""
              className={index === activeImage ? 'is-active' : ''}
            />
          ))}
          <div className="mountain-scene__glow" />
        </div>
        <div className="mountain-scene__ridge mountain-scene__ridge--back" />
        <div className="mountain-scene__ridge mountain-scene__ridge--front" />
        <div className="mountain-scene__badge mountain-scene__badge--top">
          <Compass className="h-4 w-4" />
          4,070 m altitude
        </div>
        <div className="mountain-scene__badge mountain-scene__badge--bottom">
          <Sparkles className="h-4 w-4 text-amber-300" />
          Slow travel, big skies
        </div>
        <div className="mountain-scene__caption">
          <span>{images[activeImage].label}</span>
          <div className="mountain-scene__dots" role="tablist" aria-label="Mountain views">
            {images.map((image, index) => (
              <button
                key={image.src}
                type="button"
                role="tab"
                aria-selected={index === activeImage}
                aria-label={`Show ${image.label}`}
                onClick={() => setActiveImage(index)}
                className={index === activeImage ? 'is-active' : ''}
              />
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
