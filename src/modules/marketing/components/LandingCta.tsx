import { ArrowRightIcon, PulseIcon } from "@phosphor-icons/react/dist/ssr"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { routes } from "@/config/routes"
import { Reveal } from "@/modules/marketing/components/motion/Reveal"
import { LANDING_COPY } from "@/modules/marketing/constants/landing-copy"

export function LandingCta() {
  const { cta, brand } = LANDING_COPY

  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="grid overflow-hidden rounded-[1.75rem] border border-border/70 bg-background shadow-[0_24px_80px_-48px_color-mix(in_oklch,var(--foreground)_28%,transparent)] lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
            <div className="flex flex-col justify-center px-6 py-12 sm:px-12 sm:py-16 lg:px-16 lg:py-20">
              <p className="font-heading text-sm font-medium tracking-[0.18em] text-primary uppercase">
                {brand}
              </p>
              <h2 className="mt-3 font-heading text-3xl font-semibold tracking-tight text-balance text-foreground sm:text-4xl lg:text-[2.65rem] lg:leading-tight">
                {cta.title}
              </h2>
              <p className="mt-4 max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">
                {cta.description}
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Button
                  asChild
                  size="lg"
                  className="min-w-52 shadow-[0_16px_40px_-12px_color-mix(in_oklch,var(--primary)_55%,transparent)] transition-transform duration-200 hover:-translate-y-0.5"
                >
                  <Link href={routes.signUp}>
                    {cta.primaryCta}
                    <ArrowRightIcon data-icon="inline-end" className="size-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="transition-transform duration-200 hover:-translate-y-0.5"
                >
                  <Link href={routes.login}>{cta.secondaryCta}</Link>
                </Button>
              </div>
            </div>

            <div className="relative flex flex-col justify-between gap-10 border-t border-border/60 bg-[linear-gradient(165deg,color-mix(in_oklch,var(--primary)_9%,var(--background)),var(--background)_58%)] px-6 py-12 sm:px-12 sm:py-16 lg:border-t-0 lg:border-l lg:px-12 lg:py-20">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_80%_0%,color-mix(in_oklch,var(--primary)_16%,transparent),transparent_58%)]"
              />
              <span className="relative flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-[0_12px_28px_-10px_var(--primary)]">
                <PulseIcon className="size-5" weight="bold" aria-hidden="true" />
              </span>
              <p className="relative font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                {brand}
              </p>
              <p className="relative max-w-xs text-sm leading-relaxed text-muted-foreground">
                {cta.footnote}
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
