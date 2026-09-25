'use client'

import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Compass, Sparkles } from 'lucide-react'

export default function MountainScene() {
  const reduceMotion = useReducedMotion()
  const [tilt, setTilt] = useState({ x: 0, y: 0 })

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

  return (
    <div className="mountain-scene" aria-label="A 3D panoramic view of Choke Mountain">
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
          <img src="/choke-hero.jpg" alt="" />
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
      </motion.div>
    </div>
  )
}
