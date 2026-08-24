"use client"

import { PulseIcon } from "@phosphor-icons/react"
import { LayoutGroup, motion, useScroll } from "motion/react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { routes } from "@/config/routes"
import { cn } from "@/lib/utils"
import { LANDING_EASE } from "@/modules/marketing/components/motion/landing-ease"
import {
  useActiveSection,
  useNavScrolled,
} from "@/modules/marketing/components/motion/useLandingScroll"
import { LANDING_COPY } from "@/modules/marketing/constants/landing-copy"

const LANDING_SECTION_IDS = [
  LANDING_COPY.benefits.id,
  LANDING_COPY.features.id,
  LANDING_COPY.showcase.id,
] as const

const NAV_LINKS = [
  { href: `#${LANDING_COPY.benefits.id}`, id: LANDING_COPY.benefits.id, label: LANDING_COPY.nav.benefits },
  { href: `#${LANDING_COPY.features.id}`, id: LANDING_COPY.features.id, label: LANDING_COPY.nav.features },
  { href: `#${LANDING_COPY.showcase.id}`, id: LANDING_COPY.showcase.id, label: LANDING_COPY.nav.product },
] as const

export function LandingNav() {
  const scrolled = useNavScrolled()
  const activeId = useActiveSection(LANDING_SECTION_IDS)
  const { scrollYProgress } = useScroll()

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b backdrop-blur-xl transition-[background-color,border-color,box-shadow] duration-300",
        scrolled
          ? "border-border/70 bg-background/90 shadow-[0_8px_28px_-18px_color-mix(in_oklch,var(--foreground)_28%,transparent)]"
          : "border-transparent bg-background/55 supports-backdrop-filter:bg-background/40",
      )}
    >
      <div className="relative mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          href={routes.landing}
          className="group inline-flex items-center gap-2.5"
        >
          <span className="relative flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-[0_0_0_1px_color-mix(in_oklch,var(--primary)_40%,transparent),0_10px_24px_-8px_var(--primary)] transition-transform duration-300 group-hover:scale-105">
            <PulseIcon className="size-4" weight="bold" aria-hidden="true" />
          </span>
          <span className="font-heading text-lg font-semibold tracking-tight text-foreground">
            {LANDING_COPY.brand}
          </span>
        </Link>

        <LayoutGroup id="landing-nav">
          <nav className="hidden items-center rounded-full border border-border/60 bg-background/60 p-1 text-sm md:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.id}
                href={link.href}
                className={cn(
                  "relative rounded-full px-3.5 py-1.5 transition-colors duration-200",
                  activeId === link.id
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {activeId === link.id ? (
                  <motion.span
                    layoutId="landing-nav-pill"
                    className="absolute inset-0 rounded-full bg-accent shadow-[inset_0_0_0_1px_color-mix(in_oklch,var(--border)_80%,transparent)]"
                    transition={{ duration: 0.35, ease: LANDING_EASE }}
                  />
                ) : null}
                <span className="relative z-10">{link.label}</span>
              </Link>
            ))}
          </nav>
        </LayoutGroup>

        <div className="flex items-center gap-2">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="hidden sm:inline-flex"
          >
            <Link href={routes.login}>{LANDING_COPY.nav.login}</Link>
          </Button>
          <Button
            asChild
            size="sm"
            className="shadow-[0_8px_24px_-10px_color-mix(in_oklch,var(--primary)_50%,transparent)] transition-transform duration-200 hover:-translate-y-0.5"
          >
            <Link href={routes.signUp}>{LANDING_COPY.nav.signUp}</Link>
          </Button>
        </div>
      </div>
      <motion.div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-0.5 origin-left bg-primary"
        style={{ scaleX: scrollYProgress }}
      />
    </header>
  )
}
