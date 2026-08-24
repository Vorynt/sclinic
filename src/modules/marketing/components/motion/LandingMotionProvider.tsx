"use client"

import { MotionConfig } from "motion/react"
import type { ReactNode } from "react"

import { LANDING_EASE } from "@/modules/marketing/components/motion/landing-ease"

type LandingMotionProviderProps = {
  children: ReactNode
}

export function LandingMotionProvider({ children }: LandingMotionProviderProps) {
  return (
    <MotionConfig
      reducedMotion="user"
      transition={{ duration: 0.55, ease: LANDING_EASE }}
    >
      {children}
    </MotionConfig>
  )
}
