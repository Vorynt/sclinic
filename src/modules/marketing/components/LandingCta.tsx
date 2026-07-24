import Link from "next/link";

import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";
import { LANDING_COPY } from "@/modules/marketing/constants/landing-copy";

export function LandingCta() {
  const { cta } = LANDING_COPY;

  return (
    <section className="border-t border-border/60 py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl border border-primary/50 bg-background shadow-lg px-6 py-12 sm:px-10 sm:py-16">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,color-mix(in_oklch,var(--primary)_16%,transparent),transparent_55%)]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,color-mix(in_oklch,var(--chart-2)_14%,transparent),transparent_50%)]"
          />

          <div className="relative max-w-xl">
            <h2 className="font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {cta.title}
            </h2>
            <p className="mt-3 text-base text-muted-foreground sm:text-lg">
              {cta.description}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button
                asChild
                size="lg"
                className="transition-transform duration-200 hover:-translate-y-0.5">
                <Link href={routes.signUp}>{cta.primaryCta}</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href={routes.login}>{cta.secondaryCta}</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
