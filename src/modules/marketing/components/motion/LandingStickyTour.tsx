"use client"

import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
} from "motion/react"
import { useRef, useState, type ReactNode } from "react"

import { cn } from "@/lib/utils"
import { HoverLift } from "@/modules/marketing/components/motion/HoverLift"
import { LANDING_EASE } from "@/modules/marketing/components/motion/landing-ease"
import { LANDING_COPY } from "@/modules/marketing/constants/landing-copy"

type ShowcaseSection = (typeof LANDING_COPY.showcase.sections)[number]

type LandingStickyTourProps = {
  steps: Array<{
    id: ShowcaseSection["id"]
    title: string
    description: string
    mock: ReactNode
  }>
}

export function LandingStickyTour({ steps }: LandingStickyTourProps) {
  const stepsRef = useRef<HTMLDivElement>(null)
  const lockScrollSync = useRef(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const { scrollYProgress } = useScroll({
    target: stepsRef,
    offset: ["start 0.45", "end 0.45"],
  })

  useMotionValueEvent(scrollYProgress, "change", (progress) => {
    if (lockScrollSync.current) return
    const next = Math.min(
      steps.length - 1,
      Math.max(0, Math.floor(progress * steps.length)),
    )
    setActiveIndex((current) => (current === next ? current : next))
  })

  function goToStep(index: number) {
    const container = stepsRef.current
    if (container == null) return

    lockScrollSync.current = true
    setActiveIndex(index)

    const marker = window.innerHeight * 0.45
    const containerTop = container.getBoundingClientRect().top + window.scrollY
    const progress = (index + 0.5) / steps.length
    const top = containerTop + progress * container.offsetHeight - marker
    window.scrollTo({ top, behavior: "smooth" })

    window.setTimeout(() => {
      lockScrollSync.current = false
    }, 700)
  }

  const activeStep = steps[activeIndex] ?? steps[0]
  if (activeStep == null) return null

  return (
    <div className="mt-14 hidden lg:grid lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)] lg:items-start lg:gap-12">
      <div ref={stepsRef} className="flex flex-col">
        {steps.map((step, index) => {
          const isActive = activeIndex === index
          return (
            <button
              key={step.id}
              type="button"
              onClick={() => goToStep(index)}
              className={cn(
                "relative min-h-[38vh] rounded-2xl px-5 py-8 text-left",
                isActive ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {isActive ? (
                <motion.span
                  layoutId="showcase-step-active"
                  className="absolute inset-0 rounded-2xl border border-primary/20 bg-primary/4 shadow-[0_16px_40px_-28px_color-mix(in_oklch,var(--primary)_35%,transparent)]"
                  transition={{ duration: 0.35, ease: LANDING_EASE }}
                />
              ) : (
                <span className="absolute inset-0 rounded-2xl transition-colors duration-300 hover:bg-muted/40" />
              )}
              <div className="relative flex h-full flex-col justify-center">
                <span
                  className={cn(
                    "font-heading text-xs font-medium tracking-[0.16em] uppercase tabular-nums transition-colors",
                    isActive ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-3 font-heading text-xl font-semibold tracking-tight text-balance sm:text-[1.45rem] sm:leading-tight">
                  {step.title}
                </h3>
                <AnimatePresence initial={false}>
                  {isActive ? (
                    <motion.p
                      key={step.id}
                      initial={{ opacity: 0, height: 0, marginTop: 0 }}
                      animate={{ opacity: 1, height: "auto", marginTop: 12 }}
                      exit={{ opacity: 0, height: 0, marginTop: 0 }}
                      transition={{ duration: 0.3, ease: LANDING_EASE }}
                      className="max-w-md overflow-hidden text-sm leading-relaxed text-muted-foreground"
                    >
                      {step.description}
                    </motion.p>
                  ) : null}
                </AnimatePresence>
              </div>
            </button>
          )
        })}
      </div>

      <div className="sticky top-28 self-start pt-2">
        <div className="mb-4 flex items-center gap-2">
          {steps.map((step, index) => (
            <button
              key={`${step.id}-progress`}
              type="button"
              aria-label={step.title}
              onClick={() => goToStep(index)}
              className="group relative h-4 flex-1"
            >
              <span
                className={cn(
                  "absolute inset-x-0 top-1.5 h-1 rounded-full transition-colors duration-300",
                  index <= activeIndex
                    ? "bg-primary"
                    : "bg-border group-hover:bg-muted-foreground/35",
                )}
              />
            </button>
          ))}
        </div>
        <HoverLift>
          <div className="relative">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -inset-8 rounded-[2rem] bg-[radial-gradient(ellipse_at_center,color-mix(in_oklch,var(--primary)_14%,transparent),transparent_68%)] blur-xl"
            />
            <div className="relative min-h-112">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStep.id}
                  initial={{ opacity: 0, y: 14, scale: 0.985 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.985 }}
                  transition={{ duration: 0.4, ease: LANDING_EASE }}
                >
                  {activeStep.mock}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </HoverLift>
      </div>
    </div>
  )
}
