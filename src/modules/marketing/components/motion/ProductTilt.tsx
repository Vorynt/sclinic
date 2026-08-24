"use client"

import { motion, useMotionValue, useSpring } from "motion/react"
import { useEffect, useState, type MouseEvent, type ReactNode } from "react"

type ProductTiltProps = {
  children: ReactNode
  className?: string
}

export function ProductTilt({ children, className }: ProductTiltProps) {
  const [reduce, setReduce] = useState(false)
  const rotateX = useMotionValue(0)
  const rotateY = useMotionValue(0)
  const springX = useSpring(rotateX, { stiffness: 180, damping: 22, mass: 0.4 })
  const springY = useSpring(rotateY, { stiffness: 180, damping: 22, mass: 0.4 })

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)")
    function sync() {
      setReduce(media.matches)
    }
    sync()
    media.addEventListener("change", sync)
    return () => media.removeEventListener("change", sync)
  }, [])

  function handleMove(event: MouseEvent<HTMLDivElement>) {
    if (reduce) return
    const rect = event.currentTarget.getBoundingClientRect()
    const px = (event.clientX - rect.left) / rect.width - 0.5
    const py = (event.clientY - rect.top) / rect.height - 0.5
    rotateX.set(py * -8)
    rotateY.set(px * 9)
  }

  function handleLeave() {
    rotateX.set(0)
    rotateY.set(0)
  }

  return (
    <motion.div
      className={className}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{
        transformPerspective: 1200,
        rotateX: springX,
        rotateY: springY,
      }}
    >
      {children}
    </motion.div>
  )
}
