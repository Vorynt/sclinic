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
      <div className="mx-auto max-w-6xl px-4 pt-14 pb-8 sm:px-6 sm:pt-20 sm:pb-10 lg:px-8">
        <div className="animate-landing-fade-up mx-auto flex max-w-3xl flex-col items-center text-center">
          <p className="font-heading text-5xl font-semibold tracking-tight text-primary sm:text-6xl lg:text-[4.5rem] lg:leading-none">
            {brand}
          </p>
          <h1 className="mt-5 font-heading text-[1.65rem] leading-[1.15] font-semibold tracking-tight text-foreground sm:text-4xl sm:leading-[1.12] lg:text-[2.75rem]">
            {hero.headline}
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            {hero.supporting}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button
              asChild
              size="lg"
              className="min-w-44 transition-transform duration-200 hover:-translate-y-0.5">
              <Link href={routes.signUp}>{hero.primaryCta}</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href={routes.login}>{hero.secondaryCta}</Link>
            </Button>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">{hero.trustNote}</p>
        </div>
      </div>

      <div className="animate-landing-fade-up-delayed relative w-full">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[linear-gradient(to_bottom,transparent,color-mix(in_oklch,var(--primary)_8%,transparent))]"
        />
        <div className="mx-auto max-w-6xl px-0 sm:px-6 lg:px-8">
          <div className="animate-landing-float relative overflow-hidden border-y border-border/60 bg-background shadow-[0_32px_80px_-40px_color-mix(in_oklch,var(--foreground)_35%,transparent)] sm:rounded-2xl sm:border">
            <MockAppChrome activeNav="Agenda" compact>
              <MockWeekAgenda />
            </MockAppChrome>
          </div>
        </div>
      </div>
    </section>
  )
}
