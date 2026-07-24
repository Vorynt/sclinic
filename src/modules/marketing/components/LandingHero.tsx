import Link from "next/link"

import { Button } from "@/components/ui/button"
import { routes } from "@/config/routes"
import { MockAppChrome } from "@/modules/marketing/components/mocks/MockAppChrome"
import { MockWeekAgenda } from "@/modules/marketing/components/mocks/MockWeekAgenda"
import { LANDING_COPY } from "@/modules/marketing/constants/landing-copy"

export function LandingHero() {
  const { hero, brand } = LANDING_COPY

  return (
    <section className="relative overflow-x-clip pt-10 pb-16 sm:pt-16 sm:pb-24">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.2fr)] lg:items-center lg:gap-8 lg:px-8">
        <div className="animate-landing-fade-up flex max-w-xl flex-col gap-5">
          <h1 className="flex flex-col gap-3">
            <span className="font-heading text-5xl font-semibold tracking-tight text-primary sm:text-6xl lg:text-[4rem] lg:leading-none">
              {brand}
            </span>
            <span className="font-heading text-2xl font-semibold tracking-tight text-foreground sm:text-3xl lg:text-[2.35rem] lg:leading-[1.15]">
              {hero.headline}
            </span>
          </h1>
          <p className="max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg">
            {hero.supporting}
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Button
              asChild
              size="lg"
              className="transition-transform duration-200 hover:-translate-y-0.5">
              <Link href={routes.signUp}>{hero.primaryCta}</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href={routes.login}>{hero.secondaryCta}</Link>
            </Button>
          </div>
        </div>

        <div className="animate-landing-fade-up-delayed relative min-w-0 lg:-mr-8 xl:-mr-12">
          <div
            aria-hidden="true"
            className="absolute -inset-6 -z-10 rounded-[2rem] bg-[radial-gradient(ellipse_at_center,color-mix(in_oklch,var(--primary)_18%,transparent),transparent_70%)] blur-2xl"
          />
          <div className="origin-bottom rotate-[0.8deg] sm:rotate-[1.5deg]">
            <div className="animate-landing-float">
              <MockAppChrome activeNav="Agenda" compact>
                <MockWeekAgenda />
              </MockAppChrome>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
