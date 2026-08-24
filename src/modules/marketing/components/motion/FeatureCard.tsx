"use client"

import { motion } from "motion/react"
import type { ReactNode } from "react"

import { LANDING_EASE } from "@/modules/marketing/components/motion/landing-ease"

type FeatureCardProps = {
  children: ReactNode
  className?: string
}

export function FeatureCard({ children, className }: FeatureCardProps) {
  return (
    <motion.article
      className={className}
      variants={{
        hidden: { opacity: 0, y: 18 },
        show: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.55, ease: LANDING_EASE },
        },
      }}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3, ease: LANDING_EASE }}
    >
      {children}
    </motion.article>
  )
}
