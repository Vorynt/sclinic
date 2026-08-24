import type { Icon } from "@phosphor-icons/react"
import {
  CalendarBlankIcon,
  CurrencyCircleDollarIcon,
  StethoscopeIcon,
  UsersIcon,
} from "@phosphor-icons/react/dist/ssr"

import { cn } from "@/lib/utils"
import { FeatureCard } from "@/modules/marketing/components/motion/FeatureCard"
import {
  Reveal,
  RevealStagger,
} from "@/modules/marketing/components/motion/Reveal"
import { LANDING_COPY } from "@/modules/marketing/constants/landing-copy"

const FEATURE_ICONS: Record<string, Icon> = {
  agenda: CalendarBlankIcon,
  patients: UsersIcon,
  attendance: StethoscopeIcon,
  billing: CurrencyCircleDollarIcon,
}

const FEATURE_SPAN: Record<string, string> = {
  agenda: "lg:col-span-2",
  billing: "lg:col-span-2",
}

export function LandingFeatures() {
  const { features } = LANDING_COPY

  return (
    <section id={features.id} className="scroll-mt-20 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Reveal className="max-w-2xl">
          <p className="text-sm font-medium tracking-[0.14em] text-primary uppercase">
            {features.eyebrow}
          </p>
          <h2 className="mt-3 font-heading text-3xl font-semibold tracking-tight text-balance text-foreground sm:text-4xl">
            {features.title}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            {features.supporting}
          </p>
        </Reveal>

        <RevealStagger className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
          {features.items.map((item, index) => {
            const Icon = FEATURE_ICONS[item.id] ?? CalendarBlankIcon
            const featured = item.id === "agenda" || item.id === "billing"

            return (
              <FeatureCard
                key={item.id}
                className={cn(
                  "group relative flex min-h-56 flex-col justify-between gap-6 overflow-hidden rounded-2xl border border-border/70 bg-background p-7 shadow-[0_1px_0_color-mix(in_oklch,var(--foreground)_4%,transparent)] sm:p-8",
                  FEATURE_SPAN[item.id],
                )}
              >
                <span
                  aria-hidden="true"
                  className="absolute inset-y-0 left-0 w-0 bg-primary transition-[width] duration-300 group-hover:w-0.5"
                />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -top-20 -right-16 size-44 rounded-full bg-primary/0 blur-3xl transition-colors duration-500 group-hover:bg-primary/10"
                />

                <div className="relative flex items-start justify-between gap-4">
                  <span className="flex size-11 items-center justify-center rounded-xl border border-border/60 bg-background text-primary shadow-sm transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:border-primary/25">
                    <Icon className="size-5" weight="duotone" aria-hidden="true" />
                  </span>
                  <span className="rounded-full border border-primary/20 bg-primary/8 px-2.5 py-1 text-[0.7rem] font-medium tracking-wide text-primary uppercase">
                    {item.highlight}
                  </span>
                </div>

                <div className="relative flex items-end justify-between gap-6">
                  <div className={cn("min-w-0", featured && "max-w-md")}>
                    <h3 className="font-heading text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                      {item.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
                      {item.description}
                    </p>
                  </div>
                  <span className="hidden font-heading text-5xl font-semibold tabular-nums text-primary/10 transition-colors duration-300 group-hover:text-primary/25 sm:block sm:text-6xl">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>
              </FeatureCard>
            )
          })}
        </RevealStagger>
      </div>
    </section>
  )
}
