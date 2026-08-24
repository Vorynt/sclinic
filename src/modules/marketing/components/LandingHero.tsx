import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { routes } from "@/config/routes"
import { LandingTrust } from "@/modules/marketing/components/LandingTrust"
import { MockAppChrome } from "@/modules/marketing/components/mocks/MockAppChrome"
import { MockWeekAgenda } from "@/modules/marketing/components/mocks/MockWeekAgenda"
import { ProductTilt } from "@/modules/marketing/components/motion/ProductTilt"
import { Reveal } from "@/modules/marketing/components/motion/Reveal"
import { LANDING_COPY } from "@/modules/marketing/constants/landing-copy"

export function LandingHero() {
  const { hero, brand } = LANDING_COPY

  return (
    <section className="relative overflow-x-clip">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 pt-16 pb-16 sm:px-6 sm:pt-20 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-16 lg:px-8 lg:pt-24 lg:pb-28">
        <div className="flex max-w-xl flex-col">
          <Reveal>
            <p className="font-heading text-sm font-semibold tracking-[0.22em] text-primary uppercase sm:text-base">
              {brand}
            </p>
          </Reveal>
          <Reveal delay={0.08}>
            <h1 className="mt-5 font-heading text-3xl leading-[1.12] font-semibold tracking-tight text-balance text-foreground sm:text-5xl sm:leading-[1.08] lg:text-[3.15rem]">
              {hero.headline}
            </h1>
          </Reveal>
          <Reveal delay={0.14}>
            <p className="mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg">
              {hero.supporting}
            </p>
          </Reveal>
          <Reveal delay={0.2}>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button
                asChild
                size="lg"
                className="min-w-48 shadow-[0_12px_40px_-12px_color-mix(in_oklch,var(--primary)_55%,transparent)] transition-transform duration-200 hover:-translate-y-0.5"
              >
                <Link href={routes.signUp}>
                  {hero.primaryCta}
                  <ArrowRightIcon data-icon="inline-end" className="size-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="bg-background/70 backdrop-blur-sm transition-transform duration-200 hover:-translate-y-0.5"
              >
                <Link href={routes.login}>{hero.secondaryCta}</Link>
              </Button>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">{hero.trustNote}</p>
          </Reveal>
          <LandingTrust className="mt-8" />
        </div>

        <Reveal delay={0.12} className="relative hidden min-w-0 lg:block">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -inset-10 rounded-[2.5rem] bg-[radial-gradient(ellipse_at_center,color-mix(in_oklch,var(--primary)_16%,transparent),transparent_68%)] blur-2xl"
          />
          <ProductTilt className="relative overflow-hidden rounded-2xl">
            <MockAppChrome activeNav="Agendamentos" compact>
              <MockWeekAgenda />
            </MockAppChrome>
          </ProductTilt>
        </Reveal>
      </div>

      <div className="relative lg:hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -inset-x-4 top-1/3 h-40 bg-[radial-gradient(ellipse_at_center,color-mix(in_oklch,var(--primary)_18%,transparent),transparent_70%)] blur-2xl"
        />
        <div className="mx-auto max-w-6xl px-0 sm:px-6">
          <MockAppChrome
            activeNav="Agendamentos"
            compact
            className="rounded-none border-x-0 sm:rounded-2xl sm:border"
          >
            <MockWeekAgenda />
          </MockAppChrome>
        </div>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-linear-to-t from-background to-transparent"
        />
      </div>
    </section>
  )
}
