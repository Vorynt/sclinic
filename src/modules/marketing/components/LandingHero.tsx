import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { routes } from "@/config/routes"
import { MockAppChrome } from "@/modules/marketing/components/mocks/MockAppChrome"
import { MockWeekAgenda } from "@/modules/marketing/components/mocks/MockWeekAgenda"
import { LANDING_COPY } from "@/modules/marketing/constants/landing-copy"

export function LandingHero() {
  const { hero, brand } = LANDING_COPY

  return (
    <section className="relative overflow-x-clip">
      <div className="mx-auto max-w-6xl px-4 pt-16 pb-10 sm:px-6 sm:pt-24 sm:pb-12 lg:px-8 lg:pt-28">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <p className="animate-landing-fade-up font-heading text-5xl font-semibold tracking-tight text-primary sm:text-6xl lg:text-[5rem] lg:leading-none">
            {brand}
          </p>
          <h1 className="animate-landing-fade-up-delayed mt-6 font-heading text-[1.7rem] leading-[1.12] font-semibold tracking-tight text-balance text-foreground sm:text-4xl sm:leading-[1.1] lg:text-[2.85rem]">
            {hero.headline}
          </h1>
          <p className="animate-landing-fade-up-late mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            {hero.supporting}
          </p>
          <div className="animate-landing-fade-up-late mt-9 flex flex-wrap items-center justify-center gap-3">
            <Button
              asChild
              size="lg"
              className="animate-landing-cta-glow min-w-48 shadow-[0_12px_40px_-12px_color-mix(in_oklch,var(--primary)_55%,transparent)] transition-transform duration-200 hover:-translate-y-0.5">
              <Link href={routes.signUp}>
                {hero.primaryCta}
                <ArrowRightIcon data-icon="inline-end" className="size-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="bg-background/70 backdrop-blur-sm">
              <Link href={routes.login}>{hero.secondaryCta}</Link>
            </Button>
          </div>
          <p className="animate-landing-fade-up-late mt-5 text-sm text-muted-foreground">
            {hero.trustNote}
          </p>
        </div>
      </div>

      <div className="animate-landing-fade-up-showcase relative w-full">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-[linear-gradient(to_bottom,transparent,color-mix(in_oklch,var(--primary)_10%,transparent))]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -inset-x-8 top-1/3 h-40 bg-[radial-gradient(ellipse_at_center,color-mix(in_oklch,var(--primary)_22%,transparent),transparent_70%)] blur-2xl"
        />

        <div className="mx-auto max-w-6xl px-0 sm:px-6 lg:px-8">
          <div className="animate-landing-float relative">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -inset-px rounded-none bg-[linear-gradient(135deg,color-mix(in_oklch,var(--primary)_35%,transparent),transparent_40%,color-mix(in_oklch,var(--chart-2)_30%,transparent))] opacity-70 sm:rounded-2xl"
            />
            <div className="relative overflow-hidden border-y border-border/70 bg-background shadow-[0_40px_100px_-36px_color-mix(in_oklch,var(--foreground)_40%,transparent),0_0_0_1px_color-mix(in_oklch,var(--primary)_12%,transparent)] sm:rounded-2xl sm:border">
              <MockAppChrome activeNav="Agenda" compact>
                <MockWeekAgenda />
              </MockAppChrome>
            </div>
          </div>
        </div>

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background to-transparent"
        />
      </div>
    </section>
  )
}
