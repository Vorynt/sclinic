import { ArrowRightIcon, PulseIcon } from "@phosphor-icons/react/dist/ssr"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { routes } from "@/config/routes"
import { LANDING_COPY } from "@/modules/marketing/constants/landing-copy"

export function LandingCta() {
  const { cta, brand } = LANDING_COPY

  return (
    <section className="border-t border-border/60 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-[oklch(0.22_0.03_245)] px-6 py-16 text-white shadow-[0_40px_100px_-48px_color-mix(in_oklch,var(--foreground)_55%,transparent)] sm:px-12 sm:py-24">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_18%_12%,color-mix(in_oklch,var(--primary)_42%,transparent),transparent_52%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_90%_88%,color-mix(in_oklch,var(--chart-3)_22%,transparent),transparent_48%)]" />
            <div
              className="absolute inset-0 opacity-[0.16]"
              style={{
                backgroundImage:
                  "linear-gradient(to right, rgb(255 255 255 / 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgb(255 255 255 / 0.1) 1px, transparent 1px)",
                backgroundSize: "48px 48px",
                maskImage:
                  "radial-gradient(ellipse at 50% 40%, black 18%, transparent 72%)",
              }}
            />
            <div className="animate-auth-orb absolute -top-24 right-0 size-72 rounded-full bg-primary/30 blur-3xl" />
            <div className="animate-auth-orb-alt absolute -bottom-28 left-8 size-64 rounded-full bg-chart-2/25 blur-3xl" />
          </div>

          <div className="relative mx-auto flex max-w-2xl flex-col items-center text-center">
            <span className="mb-6 flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-[0_0_0_1px_color-mix(in_oklch,var(--primary)_50%,transparent),0_12px_28px_-10px_var(--primary)]">
              <PulseIcon className="size-5" weight="bold" aria-hidden="true" />
            </span>
            <p className="font-heading text-sm font-medium tracking-[0.18em] text-white/45 uppercase">
              {brand}
            </p>
            <h2 className="mt-3 font-heading text-3xl font-semibold tracking-tight text-balance text-white sm:text-4xl lg:text-[2.85rem] lg:leading-tight">
              {cta.title}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-white/65 sm:text-lg">
              {cta.description}
            </p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <Button
                asChild
                size="lg"
                className="animate-landing-cta-glow min-w-52 shadow-[0_16px_40px_-12px_color-mix(in_oklch,var(--primary)_70%,transparent)] transition-transform duration-200 hover:-translate-y-0.5">
                <Link href={routes.signUp}>
                  {cta.primaryCta}
                  <ArrowRightIcon data-icon="inline-end" className="size-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white">
                <Link href={routes.login}>{cta.secondaryCta}</Link>
              </Button>
            </div>
            <p className="mt-5 text-sm text-white/45">{cta.footnote}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
