import {
  ClockIcon,
  FolderSimpleIcon,
  ShieldCheckIcon,
  UsersThreeIcon,
} from "@phosphor-icons/react/dist/ssr"
import type { Icon } from "@phosphor-icons/react"

import { LANDING_COPY } from "@/modules/marketing/constants/landing-copy"

const BENEFIT_ICONS: Record<string, Icon> = {
  time: ClockIcon,
  organization: FolderSimpleIcon,
  security: ShieldCheckIcon,
  team: UsersThreeIcon,
}

export function LandingBenefits() {
  const { benefits } = LANDING_COPY

  return (
    <section
      id={benefits.id}
      className="scroll-mt-20 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)] lg:gap-20">
          <div className="max-w-md lg:sticky lg:top-28 lg:self-start">
            <p className="text-sm font-medium tracking-[0.14em] text-primary uppercase">
              {benefits.eyebrow}
            </p>
            <h2 className="mt-3 font-heading text-3xl font-semibold tracking-tight text-balance text-foreground sm:text-4xl sm:leading-tight">
              {benefits.title}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              {benefits.supporting}
            </p>
          </div>

          <ol className="flex flex-col">
            {benefits.items.map((item, index) => {
              const Icon = BENEFIT_ICONS[item.id] ?? ClockIcon
              return (
                <li
                  key={item.id}
                  className="group relative grid gap-4 border-t border-border/70 py-8 first:border-t-0 first:pt-0 last:pb-0 sm:grid-cols-[auto_1fr] sm:gap-6">
                  <div className="flex items-center gap-3 sm:flex-col sm:items-start sm:gap-4">
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-border/70 bg-[linear-gradient(160deg,color-mix(in_oklch,var(--primary)_10%,var(--background)),var(--background))] text-primary shadow-[0_8px_24px_-16px_color-mix(in_oklch,var(--primary)_40%,transparent)] transition-transform duration-300 group-hover:-translate-y-0.5">
                      <Icon className="size-5" weight="duotone" aria-hidden="true" />
                    </span>
                    <span className="font-heading text-xs font-medium tracking-wide text-primary/70 tabular-nums sm:pl-0.5">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-heading text-xl font-semibold tracking-tight text-foreground transition-colors group-hover:text-primary">
                      {item.title}
                    </h3>
                    <p className="mt-2 max-w-lg text-sm leading-relaxed text-muted-foreground sm:text-base">
                      {item.description}
                    </p>
                  </div>
                </li>
              )
            })}
          </ol>
        </div>
      </div>
    </section>
  )
}
