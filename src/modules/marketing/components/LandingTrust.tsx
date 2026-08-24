import {
  CalendarBlankIcon,
  IdentificationBadgeIcon,
  ShieldCheckIcon,
  UsersThreeIcon,
} from "@phosphor-icons/react/dist/ssr"
import type { Icon } from "@phosphor-icons/react"

import { cn } from "@/lib/utils"
import {
  RevealItem,
  RevealStagger,
} from "@/modules/marketing/components/motion/Reveal"
import { LANDING_COPY } from "@/modules/marketing/constants/landing-copy"

const TRUST_ICONS: Record<string, Icon> = {
  lgpd: ShieldCheckIcon,
  roles: IdentificationBadgeIcon,
  multi: UsersThreeIcon,
  "same-day": CalendarBlankIcon,
}

type LandingTrustProps = {
  className?: string
}

export function LandingTrust({ className }: LandingTrustProps) {
  const { trust } = LANDING_COPY

  return (
    <RevealStagger
      className={cn("flex flex-wrap gap-2", className)}
      stagger={0.05}
    >
      {trust.items.map((item) => {
        const Icon = TRUST_ICONS[item.id] ?? ShieldCheckIcon
        return (
          <RevealItem key={item.id}>
            <div className="group inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/80 px-3 py-1.5 text-sm text-muted-foreground shadow-[0_1px_0_color-mix(in_oklch,var(--foreground)_4%,transparent)] transition-[border-color,background-color,color,transform] duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:bg-background hover:text-foreground">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/8 text-primary transition-colors duration-300 group-hover:bg-primary/12">
                <Icon className="size-3.5" weight="duotone" aria-hidden="true" />
              </span>
              <span className="leading-none">{item.label}</span>
            </div>
          </RevealItem>
        )
      })}
    </RevealStagger>
  )
}
