"use client"

import { motion } from "motion/react"
import type { ReactNode } from "react"

import { LANDING_EASE } from "@/modules/marketing/components/motion/landing-ease"

type RevealProps = {
  children: ReactNode
  className?: string
  delay?: number
}

export function Reveal({ children, className, delay = 0 }: RevealProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.55, delay, ease: LANDING_EASE }}
    >
      {children}
    </motion.div>
  )
}

type RevealStaggerProps = {
  children: ReactNode
  className?: string
  stagger?: number
}

export function RevealStagger({
  children,
  className,
  stagger = 0.08,
}: RevealStaggerProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
      variants={{
        hidden: {},
        show: {
          transition: { staggerChildren: stagger },
        },
      }}
    >
      {children}
    </motion.div>
  )
}

type RevealItemProps = {
  children: ReactNode
  className?: string
}

export function RevealItem({ children, className }: RevealItemProps) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 16 },
        show: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.55, ease: LANDING_EASE },
        },
      }}
    >
      {children}
    </motion.div>
  )
}
