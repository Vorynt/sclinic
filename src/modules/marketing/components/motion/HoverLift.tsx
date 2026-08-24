"use client"

import { motion } from "motion/react"
import type { ReactNode } from "react"

import { LANDING_EASE } from "@/modules/marketing/components/motion/landing-ease"

type HoverLiftProps = {
  children: ReactNode
  className?: string
}

export function HoverLift({ children, className }: HoverLiftProps) {
  return (
    <motion.div
      className={className}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.35, ease: LANDING_EASE }}
    >
      {children}
    </motion.div>
  )
}
