import Link from "next/link"

import { Button } from "@/components/ui/button"
import { routes } from "@/config/routes"
import { LANDING_COPY } from "@/modules/marketing/constants/landing-copy"

export function LandingCta() {
  const { cta } = LANDING_COPY

  return (
    <section className="border-t border-border/60 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[1.75rem] border border-primary/25 bg-[linear-gradient(135deg,color-mix(in_oklch,var(--primary)_12%,var(--background)),var(--background)_55%,color-mix(in_oklch,var(--chart-2)_10%,var(--background)))] px-6 py-14 sm:px-12 sm:py-20">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 right-0 size-72 rounded-full bg-primary/15 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-28 left-8 size-64 rounded-full bg-chart-2/20 blur-3xl"
          />

          <div className="relative mx-auto max-w-2xl text-center">
            <h2 className="font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-[2.75rem] lg:leading-tight">
              {cta.title}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
              {cta.description}
            </p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <Button
                asChild
                size="lg"
                className="min-w-48 transition-transform duration-200 hover:-translate-y-0.5">
                <Link href={routes.signUp}>{cta.primaryCta}</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href={routes.login}>{cta.secondaryCta}</Link>
              </Button>
            </div>
            <p className="mt-5 text-sm text-muted-foreground">{cta.footnote}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
