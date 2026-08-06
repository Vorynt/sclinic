import {
  CalendarBlankIcon,
  CurrencyCircleDollarIcon,
  StethoscopeIcon,
  UsersIcon,
} from "@phosphor-icons/react/dist/ssr"
import type { Icon } from "@phosphor-icons/react"

import { LANDING_COPY } from "@/modules/marketing/constants/landing-copy"

const FEATURE_ICONS: Record<string, Icon> = {
  agenda: CalendarBlankIcon,
  patients: UsersIcon,
  attendance: StethoscopeIcon,
  billing: CurrencyCircleDollarIcon,
}

export function LandingFeatures() {
  const { features } = LANDING_COPY

  return (
    <section
      id={features.id}
      className="scroll-mt-20 border-t border-border/60 bg-[linear-gradient(180deg,color-mix(in_oklch,var(--primary)_5%,var(--background)),var(--background)_48%)] py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-medium tracking-[0.14em] text-primary uppercase">
            {features.eyebrow}
          </p>
          <h2 className="mt-3 font-heading text-3xl font-semibold tracking-tight text-balance text-foreground sm:text-4xl">
            {features.title}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            {features.supporting}
          </p>
        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:gap-5">
          {features.items.map((item, index) => {
            const Icon = FEATURE_ICONS[item.id] ?? CalendarBlankIcon
            const featured = index === 0

            return (
              <article
                key={item.id}
                className={
                  featured
                    ? "group relative flex flex-col gap-5 overflow-hidden rounded-2xl border border-primary/20 bg-[linear-gradient(145deg,color-mix(in_oklch,var(--primary)_9%,var(--background)),var(--background)_55%)] p-7 sm:col-span-2 sm:flex-row sm:items-end sm:justify-between sm:gap-10 sm:p-9"
                    : "group relative flex flex-col gap-5 overflow-hidden rounded-2xl border border-border/70 bg-background/80 p-7 backdrop-blur-sm sm:p-8"
                }>
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -top-16 -right-12 size-40 rounded-full bg-primary/8 blur-3xl transition-opacity duration-500 group-hover:opacity-100 sm:opacity-70"
                />

                <div className="relative flex min-w-0 flex-1 flex-col gap-4">
                  <div className="flex items-center justify-between gap-4">
                    <span className="flex size-11 items-center justify-center rounded-xl border border-border/60 bg-background/90 text-primary shadow-sm">
                      <Icon className="size-5" weight="duotone" aria-hidden="true" />
                    </span>
                    <span className="rounded-full border border-primary/20 bg-primary/8 px-2.5 py-1 text-[0.7rem] font-medium tracking-wide text-primary uppercase">
                      {item.highlight}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-heading text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                      {item.title}
                    </h3>
                    <p
                      className={
                        featured
                          ? "mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base"
                          : "mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground sm:text-base"
                      }>
                      {item.description}
                    </p>
                  </div>
                </div>

                <span className="relative font-heading text-5xl font-semibold tabular-nums text-primary/10 transition-colors duration-300 group-hover:text-primary/20 sm:text-6xl">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
