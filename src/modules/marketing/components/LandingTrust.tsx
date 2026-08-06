import {
  CalendarBlankIcon,
  IdentificationBadgeIcon,
  ShieldCheckIcon,
  UsersThreeIcon,
} from "@phosphor-icons/react/dist/ssr"
import type { Icon } from "@phosphor-icons/react"

import { LANDING_COPY } from "@/modules/marketing/constants/landing-copy"

const TRUST_ICONS: Record<string, Icon> = {
  lgpd: ShieldCheckIcon,
  roles: IdentificationBadgeIcon,
  multi: UsersThreeIcon,
  "same-day": CalendarBlankIcon,
}

export function LandingTrust() {
  const { trust } = LANDING_COPY

  return (
    <section
      aria-label="Sinais de confiança"
      className="border-y border-border/50 bg-background/40 py-8 backdrop-blur-sm sm:py-10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6">
          {trust.items.map((item) => {
            const Icon = TRUST_ICONS[item.id] ?? ShieldCheckIcon
            return (
              <li
                key={item.id}
                className="flex items-center gap-2.5 text-sm text-muted-foreground sm:justify-center">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-md border border-border/70 bg-background/80 text-primary shadow-[0_1px_0_color-mix(in_oklch,var(--foreground)_4%,transparent)]">
                  <Icon className="size-4" weight="duotone" aria-hidden="true" />
                </span>
                <span className="leading-snug">{item.label}</span>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
